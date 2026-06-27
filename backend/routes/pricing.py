from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import PriceHistory

pricing_bp = Blueprint('pricing', __name__)

# Material cost per box by type (kg of material per box)
MATERIAL_USAGE = {
    'Corrugated 3-ply': 0.35,
    'Corrugated 5-ply': 0.55,
    'Die-cut box':      0.40,
    'Mailer box':       0.25,
}

MACHINE_COST_PER_BOX = 2.5   # Rs per box (machine + electricity)
LABOUR_COST_PER_BOX  = 1.2   # Rs per box
DEFAULT_MARGIN       = 0.25  # 25% margin


@pricing_bp.route('/quote', methods=['POST'])
@jwt_required()
def generate_quote():
    data = request.get_json()

    box_type = data.get('box_type')
    quantity = data.get('quantity')
    margin   = data.get('margin', DEFAULT_MARGIN)

    if not box_type or not quantity:
        return jsonify({'error': 'box_type and quantity are required'}), 400

    if box_type not in MATERIAL_USAGE:
        return jsonify({'error': f'Unknown box type. Choose from: {list(MATERIAL_USAGE.keys())}'}), 400

    # Get latest material price from DB
    latest_price = PriceHistory.query.filter_by(material_type='Kraft Paper')\
                                     .order_by(PriceHistory.recorded_date.desc())\
                                     .first()

    material_price_per_ton = latest_price.price_per_ton if latest_price else 42000
    material_price_per_kg  = material_price_per_ton / 1000

    # Cost calculation
    material_kg_per_box  = MATERIAL_USAGE[box_type]
    material_cost_per_box = material_kg_per_box * material_price_per_kg
    total_cost_per_box   = material_cost_per_box + MACHINE_COST_PER_BOX + LABOUR_COST_PER_BOX
    price_per_box        = round(total_cost_per_box * (1 + margin), 2)
    total_quote          = round(price_per_box * quantity, 2)
    total_cost           = round(total_cost_per_box * quantity, 2)
    total_profit         = round(total_quote - total_cost, 2)

    return jsonify({
        'box_type':              box_type,
        'quantity':              quantity,
        'material_price_per_ton': material_price_per_ton,
        'material_cost_per_box': round(material_cost_per_box, 2),
        'machine_cost_per_box':  MACHINE_COST_PER_BOX,
        'labour_cost_per_box':   LABOUR_COST_PER_BOX,
        'total_cost_per_box':    round(total_cost_per_box, 2),
        'margin_percent':        int(margin * 100),
        'price_per_box':         price_per_box,
        'total_quote':           total_quote,
        'total_cost':            total_cost,
        'total_profit':          total_profit,
    }), 200


@pricing_bp.route('/history', methods=['GET'])
@jwt_required()
def price_history():
    prices = PriceHistory.query\
                         .order_by(PriceHistory.recorded_date.desc())\
                         .limit(10).all()
    return jsonify([{
        'material_type': p.material_type,
        'price_per_ton': p.price_per_ton,
        'recorded_date': p.recorded_date.isoformat()
    } for p in prices]), 200