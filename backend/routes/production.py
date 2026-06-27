from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import ProductionRun
from datetime import datetime, date

production_bp = Blueprint('production', __name__)


# GET all production runs
@production_bp.route('/', methods=['GET'])
@jwt_required()
def get_production_runs():
    runs = ProductionRun.query.order_by(ProductionRun.run_date.desc()).all()
    result = []
    for run in runs:
        result.append({
            'id': run.id,
            'order_id': run.order_id,
            'machine_name': run.machine_name,
            'quantity_produced': run.quantity_produced,
            'scrap_kg': run.scrap_kg,
            'shift_type': run.shift_type,
            'operator_name': run.operator_name,
            'run_date': run.run_date.isoformat() if run.run_date else None
        })
    return jsonify(result), 200


# POST log a new production run
@production_bp.route('/', methods=['POST'])
@jwt_required()
def create_production_run():
    data = request.get_json()

    # Validate required fields
    required = ['machine_name', 'quantity_produced', 'shift_type', 'operator_name']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    if data['quantity_produced'] <= 0:
        return jsonify({'error': 'quantity_produced must be greater than 0'}), 400

    new_run = ProductionRun(
        order_id=data.get('order_id'),
        machine_name=data['machine_name'],
        quantity_produced=data['quantity_produced'],
        scrap_kg=data.get('scrap_kg', 0.0),
        shift_type=data['shift_type'],
        operator_name=data['operator_name'],
        run_date=date.today()
    )
    db.session.add(new_run)
    db.session.commit()

    return jsonify({
        'message': 'Production run logged successfully',
        'run_id': new_run.id
    }), 201


# GET production summary — total produced, total scrap, runs today
@production_bp.route('/summary', methods=['GET'])
@jwt_required()
def production_summary():
    all_runs = ProductionRun.query.all()

    total_produced = sum(r.quantity_produced for r in all_runs)
    total_scrap = round(sum(r.scrap_kg for r in all_runs), 2)

    today_runs = ProductionRun.query.filter_by(run_date=date.today()).all()
    produced_today = sum(r.quantity_produced for r in today_runs)

    # Scrap by machine — for Pareto chart later
    machine_scrap = {}
    for run in all_runs:
        machine_scrap[run.machine_name] = round(
            machine_scrap.get(run.machine_name, 0) + run.scrap_kg, 2
        )

    return jsonify({
        'total_produced': total_produced,
        'total_scrap_kg': total_scrap,
        'produced_today': produced_today,
        'runs_today': len(today_runs),
        'scrap_by_machine': machine_scrap
    }), 200


# GET weekly production — for bar chart on dashboard
@production_bp.route('/weekly', methods=['GET'])
@jwt_required()
def weekly_production():
    from sqlalchemy import func
    weekly = db.session.query(
        ProductionRun.run_date,
        func.sum(ProductionRun.quantity_produced).label('total'),
        func.sum(ProductionRun.scrap_kg).label('scrap')
    ).group_by(ProductionRun.run_date)\
     .order_by(ProductionRun.run_date.desc())\
     .limit(7).all()

    result = [
        {
            'date': row.run_date.isoformat(),
            'quantity_produced': int(row.total),
            'scrap_kg': round(float(row.scrap), 2)
        }
        for row in weekly
    ]
    return jsonify(result), 200