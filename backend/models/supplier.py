from extensions import db
from datetime import datetime

class Supplier(db.Model):
    __tablename__ = 'suppliers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    material_type = db.Column(db.String(100), nullable=False)  # kraft paper, recycled fibre
    price_per_ton = db.Column(db.Float, nullable=False)
    reliability_score = db.Column(db.Float, default=5.0)  # out of 10
    last_delivery_date = db.Column(db.Date, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'material_type': self.material_type,
            'price_per_ton': self.price_per_ton,
            'reliability_score': self.reliability_score,
            'last_delivery_date': self.last_delivery_date.isoformat() if self.last_delivery_date else None
        }


class PriceHistory(db.Model):
    __tablename__ = 'price_history'

    id = db.Column(db.Integer, primary_key=True)
    material_type = db.Column(db.String(100), nullable=False)
    price_per_ton = db.Column(db.Float, nullable=False)
    recorded_date = db.Column(db.Date, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'material_type': self.material_type,
            'price_per_ton': self.price_per_ton,
            'recorded_date': self.recorded_date.isoformat()
        }