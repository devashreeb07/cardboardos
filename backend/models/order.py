from extensions import db
from datetime import datetime, timezone


class Order(db.Model):
    __tablename__ = 'order'
    __table_args__ = {'extend_existing': True}

    id             = db.Column(db.Integer, primary_key=True)
    client_name    = db.Column(db.String(150), nullable=False)
    customer_email = db.Column(db.String(120), nullable=True)
    box_type       = db.Column(db.String(100), nullable=False)
    quantity       = db.Column(db.Integer, nullable=False)
    status         = db.Column(db.String(50), default='pending')
    due_date       = db.Column(db.Date, nullable=True)
    created_at     = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id':             self.id,
            'client_name':    self.client_name,
            'customer_email': self.customer_email,
            'box_type':       self.box_type,
            'quantity':       self.quantity,
            'status':         self.status,
            'due_date':       self.due_date.isoformat() if self.due_date else None,
            'created_at':     self.created_at.isoformat() if self.created_at else None,
        }