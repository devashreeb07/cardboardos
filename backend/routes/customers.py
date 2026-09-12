from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.order import Order
from sqlalchemy import func

customers_bp = Blueprint('customers', __name__)


@customers_bp.route('/analytics', methods=['GET'])
@jwt_required()
def customer_analytics():

    # Total orders and quantity per client
    client_data = db.session.query(
        Order.client_name,
        func.count(Order.id).label('total_orders'),
        func.sum(Order.quantity).label('total_quantity'),
        func.avg(Order.quantity).label('avg_order_size'),
    ).group_by(Order.client_name)\
     .order_by(func.count(Order.id).desc())\
     .all()

    # Most popular box type per client
    box_preference = db.session.query(
        Order.client_name,
        Order.box_type,
        func.count(Order.id).label('count')
    ).group_by(Order.client_name, Order.box_type)\
     .order_by(func.count(Order.id).desc())\
     .all()

    # Build box preference map
    box_pref_map = {}
    for row in box_preference:
        if row.client_name not in box_pref_map:
            box_pref_map[row.client_name] = row.box_type

    # Delivered vs total for loyalty score
    delivered_data = db.session.query(
        Order.client_name,
        func.count(Order.id).label('delivered_count')
    ).filter(Order.status == 'delivered')\
     .group_by(Order.client_name)\
     .all()

    delivered_map = {row.client_name: row.delivered_count for row in delivered_data}

    # Overall average for comparison
    total_orders = db.session.query(func.count(Order.id)).scalar() or 1
    total_clients = len(client_data)
    avg_orders_per_client = round(total_orders / total_clients, 1) if total_clients > 0 else 0

    # Build final result
    result = []
    for row in client_data:
        total = row.total_orders
        delivered = delivered_map.get(row.client_name, 0)
        loyalty_score = round((delivered / total) * 100, 1) if total > 0 else 0

        # Segment clients
        if total >= avg_orders_per_client * 1.5:
            segment = 'VIP'
        elif total >= avg_orders_per_client:
            segment = 'Regular'
        else:
            segment = 'Occasional'

        result.append({
            'client_name':     row.client_name,
            'total_orders':    total,
            'total_quantity':  int(row.total_quantity or 0),
            'avg_order_size':  round(float(row.avg_order_size or 0), 0),
            'preferred_box':   box_pref_map.get(row.client_name, 'N/A'),
            'delivered_count': delivered,
            'loyalty_score':   loyalty_score,
            'segment':         segment,
        })

    # Top 3 insights
    insights = []
    if result:
        top_client = result[0]
        insights.append({
            'icon':    '🏆',
            'title':   f"{top_client['client_name']} is your top client",
            'message': f"{top_client['total_orders']} orders placed, "
                      f"{top_client['total_quantity']:,} total boxes ordered."
        })

        vip_count = sum(1 for r in result if r['segment'] == 'VIP')
        if vip_count > 0:
            insights.append({
                'icon':    '⭐',
                'title':   f"{vip_count} VIP client{'s' if vip_count > 1 else ''}",
                'message': f"These clients order {int(avg_orders_per_client * 1.5)}+ "
                          f"orders on average. Prioritize their deliveries."
            })

        low_loyalty = [r for r in result if r['loyalty_score'] < 50 and r['total_orders'] > 2]
        if low_loyalty:
            insights.append({
                'icon':    '⚠️',
                'title':   f"{low_loyalty[0]['client_name']} has low delivery rate",
                'message': f"Only {low_loyalty[0]['loyalty_score']}% of their orders "
                          f"have been delivered. Check pending orders."
            })

    return jsonify({
        'clients':              result,
        'total_clients':        total_clients,
        'avg_orders_per_client': avg_orders_per_client,
        'insights':             insights,
        'segments': {
            'vip':        sum(1 for r in result if r['segment'] == 'VIP'),
            'regular':    sum(1 for r in result if r['segment'] == 'Regular'),
            'occasional': sum(1 for r in result if r['segment'] == 'Occasional'),
        }
    }), 200


@customers_bp.route('/top', methods=['GET'])
@jwt_required()
def top_customers():
    # Simple top 5 by order count — for dashboard widget
    top = db.session.query(
        Order.client_name,
        func.count(Order.id).label('orders'),
        func.sum(Order.quantity).label('quantity')
    ).group_by(Order.client_name)\
     .order_by(func.count(Order.id).desc())\
     .limit(5).all()

    return jsonify([{
        'client_name': row.client_name,
        'orders':      row.orders,
        'quantity':    int(row.quantity or 0)
    } for row in top]), 200