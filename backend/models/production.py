
from extensions import db
from datetime import datetime, timezone

class ProductionRun(db.Model):
    __tablename__ = 'production_run'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=True)
    machine_name = db.Column(db.String(100), nullable=False)
    quantity_produced = db.Column(db.Integer, nullable=False)
    scrap_kg = db.Column(db.Float, default=0.0)
    shift_type = db.Column(db.String(20))
    operator_name = db.Column(db.String(100))
    run_date = db.Column(db.Date, default=lambda: datetime.now(timezone.utc).date())

    def to_dict(self):
        return {
            'id': self.id,
            'machine_name': self.machine_name,
            'operator_name': self.operator_name,
            'shift_type': self.shift_type,
            'quantity_produced': self.quantity_produced,
            'scrap_kg': self.scrap_kg,
            'run_date': self.run_date.isoformat() if self.run_date else None
        }