from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import ProductionRun
from sqlalchemy import func

waste_bp = Blueprint('waste', __name__)


@waste_bp.route('/summary', methods=['GET'])
@jwt_required()
def waste_summary():
    runs = ProductionRun.query.all()

    total_scrap    = round(sum(r.scrap_kg for r in runs), 2)
    total_produced = sum(r.quantity_produced for r in runs)
    avg_scrap      = round(total_scrap / len(runs), 2) if runs else 0

    # Scrap by machine
    machine_data = db.session.query(
        ProductionRun.machine_name,
        func.sum(ProductionRun.scrap_kg).label('total_scrap'),
        func.count(ProductionRun.id).label('run_count')
    ).group_by(ProductionRun.machine_name).all()

    by_machine = [{
        'machine':     row.machine_name,
        'total_scrap': round(row.total_scrap, 2),
        'run_count':   row.run_count,
        'avg_scrap':   round(row.total_scrap / row.run_count, 2)
    } for row in machine_data]

    # Scrap by shift type
    shift_data = db.session.query(
        ProductionRun.shift_type,
        func.sum(ProductionRun.scrap_kg).label('total_scrap'),
        func.count(ProductionRun.id).label('run_count')
    ).group_by(ProductionRun.shift_type).all()

    by_shift = [{
        'shift':       row.shift_type,
        'total_scrap': round(row.total_scrap, 2),
        'avg_scrap':   round(row.total_scrap / row.run_count, 2)
    } for row in shift_data]

    # Top 5 worst runs by scrap
    worst_runs = ProductionRun.query\
                              .order_by(ProductionRun.scrap_kg.desc())\
                              .limit(5).all()

    top_waste = [{
        'id':           r.id,
        'machine':      r.machine_name,
        'operator':     r.operator_name,
        'shift':        r.shift_type,
        'scrap_kg':     r.scrap_kg,
        'run_date':     r.run_date.isoformat() if r.run_date else None
    } for r in worst_runs]

    return jsonify({
        'total_scrap_kg':    total_scrap,
        'total_produced':    total_produced,
        'avg_scrap_per_run': avg_scrap,
        'by_machine':        by_machine,
        'by_shift':          by_shift,
        'top_waste_runs':    top_waste,
    }), 200


@waste_bp.route('/trend', methods=['GET'])
@jwt_required()
def waste_trend():
    # Daily scrap for last 30 days
    trend = db.session.query(
        ProductionRun.run_date,
        func.sum(ProductionRun.scrap_kg).label('total_scrap'),
        func.sum(ProductionRun.quantity_produced).label('total_produced')
    ).group_by(ProductionRun.run_date)\
     .order_by(ProductionRun.run_date.asc())\
     .limit(30).all()

    return jsonify([{
        'date':           row.run_date.isoformat(),
        'scrap_kg':       round(row.total_scrap, 2),
        'quantity_produced': int(row.total_produced),
        'waste_percent':  round((row.total_scrap / (row.total_produced * 0.5)) * 100, 2)
    } for row in trend]), 200