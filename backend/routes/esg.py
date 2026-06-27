from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models.esg import ESGLog
from datetime import date

esg_bp = Blueprint('esg', __name__)


@esg_bp.route('/', methods=['GET'])
@jwt_required()
def get_logs():
    logs = ESGLog.query.order_by(ESGLog.log_date.desc()).all()
    return jsonify([{
        'id':               l.id,
        'log_date':         l.log_date.isoformat() if l.log_date else None,
        'energy_kwh':       l.energy_kwh,
        'water_litres':     l.water_litres,
        'recycled_percent': l.recycled_percent,
    } for l in logs]), 200


@esg_bp.route('/', methods=['POST'])
@jwt_required()
def create_log():
    data = request.get_json()
    required = ['energy_kwh', 'water_litres', 'recycled_percent']
    for field in required:
        if data.get(field) is None:
            return jsonify({'error': f'{field} is required'}), 400

    log = ESGLog(
        log_date=date.today(),
        energy_kwh=data['energy_kwh'],
        water_litres=data['water_litres'],
        recycled_percent=data['recycled_percent'],
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({'message': 'ESG log created', 'id': log.id}), 201


@esg_bp.route('/summary', methods=['GET'])
@jwt_required()
def esg_summary():
    logs = ESGLog.query.all()
    if not logs:
        return jsonify({'total_logs': 0}), 200

    return jsonify({
        'total_logs':           len(logs),
        'avg_energy_kwh':       round(sum(l.energy_kwh for l in logs) / len(logs), 2),
        'avg_water_litres':     round(sum(l.water_litres for l in logs) / len(logs), 2),
        'avg_recycled_percent': round(sum(l.recycled_percent for l in logs) / len(logs), 2),
    }), 200