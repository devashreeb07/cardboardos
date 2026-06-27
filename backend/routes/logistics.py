from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Order

logistics_bp = Blueprint('logistics', __name__)


@logistics_bp.route('/summary', methods=['GET'])
@jwt_required()
def logistics_summary():
    total      = Order.query.count()
    pending    = Order.query.filter_by(status='pending').count()
    in_prod    = Order.query.filter_by(status='in_production').count()
    dispatched = Order.query.filter_by(status='dispatched').count()
    delivered  = Order.query.filter_by(status='delivered').count()

    return jsonify({
        'total':         total,
        'pending':       pending,
        'in_production': in_prod,
        'dispatched':    dispatched,
        'delivered':     delivered,
    }), 200


@logistics_bp.route('/active', methods=['GET'])
@jwt_required()
def active_orders():
    # Orders that are in transit — dispatched but not yet delivered
    orders = Order.query.filter(
        Order.status.in_(['in_production', 'dispatched'])
    ).order_by(Order.due_date.asc()).all()

    return jsonify([{
        'id':          o.id,
        'client_name': o.client_name,
        'box_type':    o.box_type,
        'quantity':    o.quantity,
        'status':      o.status,
        'due_date':    o.due_date.isoformat() if o.due_date else None,
        'created_at':  o.created_at.isoformat(),
    } for o in orders]), 200


@logistics_bp.route('/delivered', methods=['GET'])
@jwt_required()
def delivered_orders():
    orders = Order.query.filter_by(status='delivered')\
                        .order_by(Order.created_at.desc()).all()
    return jsonify([{
        'id':          o.id,
        'client_name': o.client_name,
        'box_type':    o.box_type,
        'quantity':    o.quantity,
        'due_date':    o.due_date.isoformat() if o.due_date else None,
    } for o in orders]), 200