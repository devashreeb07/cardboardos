from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.supplier import PriceHistory, Supplier
from models.production import ProductionRun
from sqlalchemy import func
from datetime import date, timedelta
import math

reorder_bp = Blueprint('reorder', __name__)


def calculate_reorder_predictions():
    """
    Calculates material usage rate from production runs
    and predicts when reorder is needed.
    """

    # Average scrap kg per day over last 30 days
    thirty_days_ago = date.today() - timedelta(days=30)

    daily_usage = db.session.query(
        ProductionRun.run_date,
        func.sum(ProductionRun.scrap_kg).label('total_scrap'),
        func.sum(ProductionRun.quantity_produced).label('total_produced')
    ).filter(ProductionRun.run_date >= thirty_days_ago)\
     .group_by(ProductionRun.run_date)\
     .all()

    if not daily_usage:
        return []

    # Average daily material consumption
    # Rough estimate: each box uses ~0.4kg of kraft paper on average
    avg_daily_produced = sum(r.total_produced for r in daily_usage) / len(daily_usage)
    avg_material_per_day = round(avg_daily_produced * 0.4 / 1000, 2)  # in tons

    # Get suppliers and their materials
    suppliers = Supplier.query.all()

    # Get latest prices
    latest_prices = {}
    prices = PriceHistory.query.order_by(PriceHistory.recorded_date.desc()).all()
    for p in prices:
        if p.material_type not in latest_prices:
            latest_prices[p.material_type] = p.price_per_ton

    # Standard stock assumptions (in tons)
    # In a real system this would come from an inventory table
    STANDARD_STOCK = {
        'Kraft Paper':    50.0,
        'Recycled Fibre': 30.0,
        'Virgin Pulp':    20.0,
    }

    REORDER_POINT = {
        'Kraft Paper':    10.0,  # reorder when 10 tons left
        'Recycled Fibre': 8.0,
        'Virgin Pulp':    5.0,
    }

    REORDER_QUANTITY = {
        'Kraft Paper':    40.0,
        'Recycled Fibre': 25.0,
        'Virgin Pulp':    15.0,
    }

    predictions = []

    # Group suppliers by material type
    material_suppliers = {}
    for s in suppliers:
        mat = s.material_type
        if mat not in material_suppliers:
            material_suppliers[mat] = []
        material_suppliers[mat].append(s)

    for material, stock in STANDARD_STOCK.items():
        usage_per_day = avg_material_per_day if material == 'Kraft Paper' else avg_material_per_day * 0.3
        if usage_per_day <= 0:
            usage_per_day = 0.5  # default fallback

        days_remaining = math.floor(stock / usage_per_day)
        reorder_date   = date.today() + timedelta(days=max(0, days_remaining - 7))
        stockout_date  = date.today() + timedelta(days=days_remaining)

        # Urgency level
        if days_remaining <= 7:
            urgency = 'critical'
        elif days_remaining <= 14:
            urgency = 'high'
        elif days_remaining <= 30:
            urgency = 'medium'
        else:
            urgency = 'low'

        # Best supplier for this material
        mat_suppliers = material_suppliers.get(material, [])
        best_supplier = None
        if mat_suppliers:
            best_supplier = max(mat_suppliers, key=lambda s: s.reliability_score or 0)

        # Cost to reorder
        price     = latest_prices.get(material, 40000)
        qty       = REORDER_QUANTITY[material]
        reorder_cost = round(price * qty, 2)

        predictions.append({
            'material':          material,
            'current_stock_tons': stock,
            'usage_per_day_tons': round(usage_per_day, 3),
            'days_remaining':    days_remaining,
            'reorder_date':      reorder_date.isoformat(),
            'stockout_date':     stockout_date.isoformat(),
            'urgency':           urgency,
            'reorder_quantity':  qty,
            'reorder_cost':      reorder_cost,
            'price_per_ton':     price,
            'best_supplier':     best_supplier.name if best_supplier else 'No supplier',
            'supplier_reliability': best_supplier.reliability_score if best_supplier else 0,
        })

    # Sort by urgency
    urgency_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    predictions.sort(key=lambda x: urgency_order.get(x['urgency'], 4))

    return predictions


@reorder_bp.route('/predictions', methods=['GET'])
@jwt_required()
def get_predictions():
    try:
        predictions = calculate_reorder_predictions()

        # Summary
        critical = sum(1 for p in predictions if p['urgency'] == 'critical')
        high     = sum(1 for p in predictions if p['urgency'] == 'high')
        total_reorder_cost = sum(p['reorder_cost'] for p in predictions)

        # Insights
        insights = []
        for p in predictions:
            if p['urgency'] == 'critical':
                insights.append({
                    'icon':    '🚨',
                    'type':    'critical',
                    'title':   f"{p['material']} critically low!",
                    'message': f"Only {p['days_remaining']} days of stock remaining. "
                              f"Stockout expected on {p['stockout_date']}. "
                              f"Order {p['reorder_quantity']} tons from {p['best_supplier']} immediately."
                })
            elif p['urgency'] == 'high':
                insights.append({
                    'icon':    '⚠️',
                    'type':    'high',
                    'title':   f"{p['material']} — reorder soon",
                    'message': f"{p['days_remaining']} days remaining. "
                              f"Recommended reorder date: {p['reorder_date']}. "
                              f"Best supplier: {p['best_supplier']} "
                              f"({p['supplier_reliability']}% reliability)."
                })

        if not insights:
            insights.append({
                'icon':    '✅',
                'type':    'good',
                'title':   'All materials have sufficient stock',
                'message': 'No immediate reorders needed. '
                          'Continue monitoring usage rates.'
            })

        return jsonify({
            'predictions':        predictions,
            'critical_count':     critical,
            'high_count':         high,
            'total_reorder_cost': total_reorder_cost,
            'insights':           insights,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@reorder_bp.route('/summary', methods=['GET'])
@jwt_required()
def reorder_summary():
    try:
        predictions = calculate_reorder_predictions()
        critical = sum(1 for p in predictions if p['urgency'] == 'critical')
        high     = sum(1 for p in predictions if p['urgency'] == 'high')
        return jsonify({
            'critical': critical,
            'high':     high,
            'total':    len(predictions)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500