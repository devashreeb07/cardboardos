from extensions import db
from datetime import datetime

class ESGLog(db.Model):
    __tablename__ = 'esg_logs'

    id = db.Column(db.Integer, primary_key=True)
    log_date = db.Column(db.Date, default=datetime.utcnow)
    energy_kwh = db.Column(db.Float, nullable=False)
    water_litres = db.Column(db.Float, nullable=False)
    recycled_percent = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'log_date': self.log_date.isoformat(),
            'energy_kwh': self.energy_kwh,
            'water_litres': self.water_litres,
            'recycled_percent': self.recycled_percent
        }