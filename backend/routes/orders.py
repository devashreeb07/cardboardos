from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Order
from datetime import datetime

orders_bp = Blueprint('orders', __name__)


# GET all orders
@orders_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    result = []
    for order in orders:
        result.append({
            'id': order.id,
            'client_name': order.client_name,
            'box_type': order.box_type,
            'quantity': order.quantity,
            'status': order.status,
            'due_date': order.due_date.isoformat() if order.due_date else None,
            'created_at': order.created_at.isoformat()
        })
    return jsonify(result), 200


# GET single order by ID
@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify({
        'id': order.id,
        'client_name': order.client_name,
        'box_type': order.box_type,
        'quantity': order.quantity,
        'status': order.status,
        'due_date': order.due_date.isoformat() if order.due_date else None,
        'created_at': order.created_at.isoformat()
    }), 200


# POST create new order
@orders_bp.route('/', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()

    # Validate required fields
    if not data.get('client_name') or not data.get('quantity'):
        return jsonify({'error': 'client_name and quantity are required'}), 400

    if not isinstance(data['quantity'], int) or data['quantity'] <= 0:
        return jsonify({'error': 'quantity must be a positive integer'}), 400

    new_order = Order(
        client_name=data['client_name'],
        box_type=data.get('box_type', 'Standard Box'),
        quantity=data['quantity'],
        status='pending',
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data.get('due_date') else None
    )
    db.session.add(new_order)
    db.session.commit()

    return jsonify({
        'message': 'Order created successfully',
        'order_id': new_order.id
    }), 201


# PATCH update order status
@orders_bp.route('/<int:order_id>/status', methods=['PATCH'])
@jwt_required()
def update_order_status(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    data = request.get_json()
    new_status = data.get('status')

    # Define allowed status transitions
    allowed_transitions = {
        'pending':       ['in_production'],
        'in_production': ['dispatched'],
        'dispatched':    ['delivered'],
        'delivered':     []
    }

    if new_status not in allowed_transitions.get(order.status, []):
        return jsonify({
            'error': f"Cannot move from '{order.status}' to '{new_status}'",
            'allowed': allowed_transitions.get(order.status, [])
        }), 400

    order.status = new_status
    db.session.commit()

    return jsonify({
        'message': 'Status updated',
        'order_id': order.id,
        'new_status': order.status
    }), 200


# DELETE an order
@orders_bp.route('/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    if order.status != 'pending':
        return jsonify({'error': 'Only pending orders can be deleted'}), 400

    db.session.delete(order)
    db.session.commit()

    return jsonify({'message': 'Order deleted successfully'}), 200


# GET dashboard summary counts
@orders_bp.route('/summary', methods=['GET'])
@jwt_required()
def order_summary():
    total = Order.query.count()
    pending = Order.query.filter_by(status='pending').count()
    in_production = Order.query.filter_by(status='in_production').count()
    dispatched = Order.query.filter_by(status='dispatched').count()
    delivered = Order.query.filter_by(status='delivered').count()

    return jsonify({
        'total': total,
        'pending': pending,
        'in_production': in_production,
        'dispatched': dispatched,
        'delivered': delivered
    }), 200