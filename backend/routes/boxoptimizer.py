from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import math

boxoptimizer_bp = Blueprint('boxoptimizer', __name__)

# Standard cardboard sheet sizes (cm)
SHEET_SIZES = {
    'Small (120 × 80 cm)':   {'width': 120, 'height': 80},
    'Medium (180 × 120 cm)': {'width': 180, 'height': 120},
    'Large (240 × 120 cm)':  {'width': 240, 'height': 120},
    'XLarge (300 × 150 cm)': {'width': 300, 'height': 150},
}


def calculate_nesting(box_w, box_h, sheet_w, sheet_h, margin=1):
    """
    Calculate optimal nesting of boxes on a sheet.
    Tries both orientations and picks the better one.
    margin = gap between boxes in cm
    """
    # Orientation 1: box as-is
    cols_1 = int(sheet_w / (box_w + margin))
    rows_1 = int(sheet_h / (box_h + margin))
    count_1 = cols_1 * rows_1

    # Orientation 2: box rotated 90 degrees
    cols_2 = int(sheet_w / (box_h + margin))
    rows_2 = int(sheet_h / (box_w + margin))
    count_2 = cols_2 * rows_2

    # Pick better orientation
    if count_1 >= count_2:
        cols, rows, count = cols_1, rows_1, count_1
        placed_w, placed_h = box_w, box_h
        rotated = False
    else:
        cols, rows, count = cols_2, rows_2, count_2
        placed_w, placed_h = box_h, box_w
        rotated = True

    # Generate box positions for visualisation
    positions = []
    for r in range(rows):
        for c in range(cols):
            positions.append({
                'x': c * (placed_w + margin),
                'y': r * (placed_h + margin),
                'w': placed_w,
                'h': placed_h,
            })

    used_area  = count * box_w * box_h
    sheet_area = sheet_w * sheet_h
    utilization = round((used_area / sheet_area) * 100, 1)

    return {
        'boxes_per_sheet': count,
        'cols':            cols,
        'rows':            rows,
        'rotated':         rotated,
        'utilization_pct': utilization,
        'waste_pct':       round(100 - utilization, 1),
        'positions':       positions,
        'placed_w':        placed_w,
        'placed_h':        placed_h,
    }


@boxoptimizer_bp.route('/optimize', methods=['POST'])
@jwt_required()
def optimize():
    data = request.get_json()

    # Validate inputs
    required = ['box_width', 'box_height', 'quantity', 'sheet_size']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    box_w    = float(data['box_width'])
    box_h    = float(data['box_height'])
    quantity = int(data['quantity'])
    sheet_key = data['sheet_size']

    if sheet_key not in SHEET_SIZES:
        return jsonify({'error': f'Invalid sheet size. Choose from: {list(SHEET_SIZES.keys())}'}), 400

    if box_w <= 0 or box_h <= 0 or quantity <= 0:
        return jsonify({'error': 'Dimensions and quantity must be positive'}), 400

    sheet = SHEET_SIZES[sheet_key]
    sheet_w = sheet['width']
    sheet_h = sheet['height']

    if box_w > sheet_w or box_h > sheet_h:
        return jsonify({'error': 'Box is larger than the sheet'}), 400

    # Run nesting algorithm
    result = calculate_nesting(box_w, box_h, sheet_w, sheet_h)

    if result['boxes_per_sheet'] == 0:
        return jsonify({'error': 'Box does not fit on selected sheet size'}), 400

    # Calculate sheets needed
    sheets_needed    = math.ceil(quantity / result['boxes_per_sheet'])
    total_box_area   = quantity * box_w * box_h
    total_sheet_area = sheets_needed * sheet_w * sheet_h
    total_waste_area = round(total_sheet_area - total_box_area, 2)

    return jsonify({
        'box_width':        box_w,
        'box_height':       box_h,
        'sheet_size':       sheet_key,
        'sheet_width':      sheet_w,
        'sheet_height':     sheet_h,
        'quantity':         quantity,
        'boxes_per_sheet':  result['boxes_per_sheet'],
        'cols':             result['cols'],
        'rows':             result['rows'],
        'rotated':          result['rotated'],
        'utilization_pct':  result['utilization_pct'],
        'waste_pct':        result['waste_pct'],
        'sheets_needed':    sheets_needed,
        'total_box_area':   round(total_box_area, 2),
        'total_sheet_area': round(total_sheet_area, 2),
        'total_waste_area': total_waste_area,
        'positions':        result['positions'][:50],  # max 50 for visualisation
    }), 200


@boxoptimizer_bp.route('/sheet-sizes', methods=['GET'])
@jwt_required()
def get_sheet_sizes():
    return jsonify(list(SHEET_SIZES.keys())), 200