from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
import traceback

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/demand-forecast', methods=['GET'])
@jwt_required()
def demand_forecast():
    try:
        from flask import current_app
        from ml.demand_forecast import run_demand_forecast
        result = run_demand_forecast(current_app._get_current_object())
        if 'error' in result:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/price-forecast', methods=['GET'])
@jwt_required()
def price_forecast():
    try:
        from flask import current_app
        from ml.price_forecast import run_price_forecast
        result = run_price_forecast(current_app._get_current_object())
        if 'error' in result:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    
@ai_bp.route('/waste-clustering', methods=['GET'])
@jwt_required()
def waste_clustering():
    try:
        from flask import current_app
        from ml.waste_clustering import run_waste_clustering
        result = run_waste_clustering(current_app._get_current_object())
        if 'error' in result:
            return jsonify(result), 400
        return jsonify(result), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500