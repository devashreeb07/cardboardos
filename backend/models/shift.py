from extensions import db

class Shift(db.Model):
    __tablename__ = 'shifts'

    id = db.Column(db.Integer, primary_key=True)
    operator_name = db.Column(db.String(100), nullable=False)
    shift_date = db.Column(db.Date, nullable=False)
    shift_type = db.Column(db.String(20), nullable=False)  # morning, evening, night
    assigned_line = db.Column(db.String(50), nullable=False)
    start_time = db.Column(db.String(10), nullable=False)  # e.g. "08:00"
    end_time = db.Column(db.String(10), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'operator_name': self.operator_name,
            'shift_date': self.shift_date.isoformat(),
            'shift_type': self.shift_type,
            'assigned_line': self.assigned_line,
            'start_time': self.start_time,
            'end_time': self.end_time
        }