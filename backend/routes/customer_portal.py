from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required, get_jwt_identity, get_jwt, create_access_token
)
from extensions import db, bcrypt
from models.user import User
from models.order import Order
from datetime import date, datetime

customer_portal_bp = Blueprint('customer_portal', __name__)


# ── Customer Registration ─────────────────────────────────────────
@customer_portal_bp.route('/register', methods=['POST'])
def customer_register():
    data = request.get_json()
    required = ['name', 'email', 'password', 'company_name']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
        role='customer',
        company_name=data.get('company_name'),
        phone=data.get('phone'),
        address=data.get('address'),
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully'}), 201


# ── Customer Login ────────────────────────────────────────────────
@customer_portal_bp.route('/login', methods=['POST'])
def customer_login():
    data = request.get_json()
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    # ← Block admin/manager/operator from customer portal
    if user.role != 'customer':
        return jsonify({'error': 'Please use the Admin Portal to login'}), 403

    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            'role':         user.role,
            'name':         user.name,
            'company_name': user.company_name,
            'email':        user.email,
        }
    )
    return jsonify({
        'access_token': token,
        'user':         user.to_dict()
    }), 200


# ── Customer Dashboard ────────────────────────────────────────────
@customer_portal_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def customer_dashboard():
    claims = get_jwt()
    if claims.get('role') != 'customer':
        return jsonify({'error': 'Access denied'}), 403

    email = claims.get('email')
    orders = Order.query.filter_by(customer_email=email).all()

    total    = len(orders)
    pending  = sum(1 for o in orders if o.status == 'pending')
    in_prod  = sum(1 for o in orders if o.status == 'in_production')
    dispatch = sum(1 for o in orders if o.status == 'dispatched')
    delivered= sum(1 for o in orders if o.status == 'delivered')
    total_qty= sum(o.quantity for o in orders)

    # Recent 5 orders
    recent = sorted(orders, key=lambda o: o.created_at or datetime.min, reverse=True)[:5]

    return jsonify({
        'summary': {
            'total_orders':    total,
            'pending':         pending,
            'in_production':   in_prod,
            'dispatched':      dispatch,
            'delivered':       delivered,
            'total_quantity':  total_qty,
        },
        'recent_orders': [{
            'id':          o.id,
            'box_type':    o.box_type,
            'quantity':    o.quantity,
            'status':      o.status,
            'due_date':    o.due_date.isoformat() if o.due_date else None,
            'created_at':  o.created_at.isoformat() if o.created_at else None,
        } for o in recent]
    }), 200


# ── Get Customer Orders ───────────────────────────────────────────
@customer_portal_bp.route('/orders', methods=['GET'])
@jwt_required()
def customer_orders():
    claims = get_jwt()
    if claims.get('role') != 'customer':
        return jsonify({'error': 'Access denied'}), 403

    email  = claims.get('email')
    orders = Order.query.filter_by(customer_email=email)\
                        .order_by(Order.created_at.desc()).all()

    return jsonify([{
        'id':         o.id,
        'box_type':   o.box_type,
        'quantity':   o.quantity,
        'status':     o.status,
        'due_date':   o.due_date.isoformat() if o.due_date else None,
        'created_at': o.created_at.isoformat() if o.created_at else None,
    } for o in orders]), 200


# ── Place New Order ───────────────────────────────────────────────
@customer_portal_bp.route('/orders', methods=['POST'])
@jwt_required()
def place_order():
    claims = get_jwt()
    if claims.get('role') != 'customer':
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    if not data.get('box_type') or not data.get('quantity'):
        return jsonify({'error': 'box_type and quantity are required'}), 400

    email = claims.get('email')
    name  = claims.get('name')

    order = Order(
        client_name=name,
        customer_email=email,
        box_type=data['box_type'],
        quantity=int(data['quantity']),
        status='pending',
        due_date=date.fromisoformat(data['due_date']) if data.get('due_date') else None,
    )
    db.session.add(order)
    db.session.commit()

    return jsonify({
        'message':  'Order placed successfully',
        'order_id': order.id
    }), 201


# ── Get Customer Profile ──────────────────────────────────────────
@customer_portal_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    claims = get_jwt()
    if claims.get('role') != 'customer':
        return jsonify({'error': 'Access denied'}), 403

    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict()), 200


# ── Update Customer Profile ───────────────────────────────────────
@customer_portal_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    claims = get_jwt()
    if claims.get('role') != 'customer':
        return jsonify({'error': 'Access denied'}), 403

    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if data.get('name'):         user.name         = data['name']
    if data.get('phone'):        user.phone        = data['phone']
    if data.get('address'):      user.address      = data['address']
    if data.get('company_name'): user.company_name = data['company_name']

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()}), 200


# ── Order History with Timeline ───────────────────────────────────
@customer_portal_bp.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order_detail(order_id):
    claims = get_jwt()
    if claims.get('role') != 'customer':
        return jsonify({'error': 'Access denied'}), 403

    email = claims.get('email')
    order = Order.query.filter_by(id=order_id, customer_email=email).first()

    if not order:
        return jsonify({'error': 'Order not found'}), 404

    # Build status timeline
    all_statuses = ['pending', 'in_production', 'dispatched', 'delivered']
    current_idx  = all_statuses.index(order.status) if order.status in all_statuses else 0

    timeline = [{
        'status':    s,
        'label':     s.replace('_', ' ').title(),
        'completed': i <= current_idx,
        'current':   i == current_idx,
    } for i, s in enumerate(all_statuses)]

    return jsonify({
        'id':         order.id,
        'box_type':   order.box_type,
        'quantity':   order.quantity,
        'status':     order.status,
        'due_date':   order.due_date.isoformat() if order.due_date else None,
        'created_at': order.created_at.isoformat() if order.created_at else None,
        'timeline':   timeline,
    }), 200
