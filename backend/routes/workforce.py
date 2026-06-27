from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Shift
from datetime import date

workforce_bp = Blueprint('workforce', __name__)


@workforce_bp.route('/', methods=['GET'])
@jwt_required()
def get_shifts():
    shifts = Shift.query.order_by(Shift.shift_date.desc()).all()
    return jsonify([{
        'id': s.id,
        'operator_name': s.operator_name,
        'shift_type': s.shift_type,
        'assigned_line': s.assigned_line,   # ← was line_assigned
        'shift_date': s.shift_date.isoformat() if s.shift_date else None,
        'start_time': s.start_time,
        'end_time': s.end_time,
    } for s in shifts]), 200


@workforce_bp.route('/', methods=['POST'])
@jwt_required()
def create_shift():
    data = request.get_json()
    required = ['operator_name', 'shift_type', 'shift_date', 'assigned_line']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    shift = Shift(
        operator_name=data['operator_name'],
        shift_type=data['shift_type'],
        assigned_line=data['assigned_line'],    # ← was line_assigned
        shift_date=date.fromisoformat(data['shift_date']),
        start_time=data.get('start_time', '08:00'),
        end_time=data.get('end_time', '16:00'),
    )
    db.session.add(shift)
    db.session.commit()
    return jsonify({'message': 'Shift created', 'id': shift.id}), 201


@workforce_bp.route('/summary', methods=['GET'])
@jwt_required()
def workforce_summary():
    all_shifts = Shift.query.all()
    today_shifts = Shift.query.filter_by(shift_date=date.today()).all()

    by_type = {'morning': 0, 'evening': 0, 'night': 0}
    for s in all_shifts:
        if s.shift_type in by_type:
            by_type[s.shift_type] += 1

    return jsonify({
        'total_shifts': len(all_shifts),
        'today_shifts': len(today_shifts),
        'by_shift_type': by_type
    }), 200