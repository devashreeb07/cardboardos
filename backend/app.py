from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt, bcrypt
from routes.auth import auth_bp
from routes.orders import orders_bp
from routes.production import production_bp
from routes.workforce import workforce_bp
from routes.procurement import procurement_bp
from routes.logistics import logistics_bp
from routes.pricing import pricing_bp
from routes.waste import waste_bp
from routes.ai import ai_bp
from routes.esg import esg_bp
from routes.boxoptimizer import boxoptimizer_bp
import os

app = Flask(__name__)

import os
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:YOUR_PASSWORD@localhost:5432/cardboardos_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'cardboardos-secret-key-2024'

db.init_app(app)
jwt.init_app(app)
bcrypt.init_app(app)
CORS(app)


# Register blueprints
#app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(auth_bp,       url_prefix='/api/auth')
app.register_blueprint(orders_bp,     url_prefix='/api/orders')
app.register_blueprint(production_bp, url_prefix='/api/production')
app.register_blueprint(workforce_bp, url_prefix='/api/workforce')
app.register_blueprint(procurement_bp, url_prefix='/api/procurement')
app.register_blueprint(logistics_bp, url_prefix='/api/logistics')
app.register_blueprint(pricing_bp, url_prefix='/api/pricing')
app.register_blueprint(waste_bp, url_prefix='/api/waste')
app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(esg_bp, url_prefix='/api/esg')
app.register_blueprint(boxoptimizer_bp, url_prefix='/api/boxoptimizer')

@app.route('/')
def home():
    return jsonify({'message': 'CardboardOS API is running!'})
@app.route('/api/health')
def health():
    return jsonify({
        'status':   'ok',
        'app':      'CardboardOS',
        'version':  '1.0.0',
        'modules':  [
            'auth', 'orders', 'production', 'workforce',
            'procurement', 'logistics', 'pricing', 'waste', 'esg', 'ai'
        ]
    })

if __name__ == '__main__':
    with app.app_context():
        # Import all models here so SQLAlchemy knows about every table
        # before create_all() runs — order matters, parent tables first
        from models.user import User
        from models.order import Order
        from models.production import ProductionRun
        from models.supplier import Supplier, PriceHistory
        from models.shift import Shift
        from models.esg import ESGLog

        db.create_all()
    app.run(debug=True, port=5000)
