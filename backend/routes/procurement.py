from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Supplier, PriceHistory
from datetime import date

procurement_bp = Blueprint('procurement', __name__)


@procurement_bp.route('/suppliers', methods=['GET'])
@jwt_required()
def get_suppliers():
    suppliers = Supplier.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'material_type': s.material_type,
        'price_per_ton': s.price_per_ton,
        'reliability_score': s.reliability_score,
        'last_delivery_date': s.last_delivery_date.isoformat() if s.last_delivery_date else None
    } for s in suppliers]), 200


@procurement_bp.route('/suppliers', methods=['POST'])
@jwt_required()
def create_supplier():
    data = request.get_json()
    if not data.get('name') or not data.get('material_type'):
        return jsonify({'error': 'name and material_type are required'}), 400

    supplier = Supplier(
        name=data['name'],
        material_type=data['material_type'],
        price_per_ton=data.get('price_per_ton', 0),
        reliability_score=data.get('reliability_score', 0),
    )
    db.session.add(supplier)
    db.session.commit()
    return jsonify({'message': 'Supplier added', 'id': supplier.id}), 201


@procurement_bp.route('/prices', methods=['GET'])
@jwt_required()
def get_prices():
    prices = PriceHistory.query.order_by(PriceHistory.recorded_date.desc()).limit(30).all()
    return jsonify([{
        'id': p.id,
        'material_type': p.material_type,
        'price_per_ton': p.price_per_ton,
        'recorded_date': p.recorded_date.isoformat() if p.recorded_date else None
    } for p in prices]), 200


@procurement_bp.route('/prices', methods=['POST'])
@jwt_required()
def add_price():
    data = request.get_json()
    if not data.get('material_type') or not data.get('price_per_ton'):
        return jsonify({'error': 'material_type and price_per_ton are required'}), 400

    price = PriceHistory(
        material_type=data['material_type'],
        price_per_ton=data['price_per_ton'],
        recorded_date=date.today()
    )
    db.session.add(price)
    db.session.commit()
    return jsonify({'message': 'Price recorded'}), 201


@procurement_bp.route('/summary', methods=['GET'])
@jwt_required()
def procurement_summary():
    suppliers = Supplier.query.all()
    avg_reliability = (
        round(sum(s.reliability_score for s in suppliers) / len(suppliers), 1)
        if suppliers else 0
    )
    latest_prices = {}
    prices = PriceHistory.query.order_by(PriceHistory.recorded_date.desc()).all()
    for p in prices:
        if p.material_type not in latest_prices:
            latest_prices[p.material_type] = p.price_per_ton

    return jsonify({
        'total_suppliers': len(suppliers),
        'avg_reliability': avg_reliability,
        'latest_prices': latest_prices
    }), 200