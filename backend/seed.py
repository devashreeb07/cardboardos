from app import app
from extensions import db, bcrypt
from models.user import User
from models.order import Order
from models.production import ProductionRun
from models.supplier import Supplier, PriceHistory
from models.shift import Shift
from models.esg import ESGLog
from datetime import date, timedelta
import random

CLIENTS = [
    'Amazon India', 'Flipkart Logistics', 'Reliance Retail',
    'Big Basket', 'Swiggy Instamart', 'Meesho Fulfillment',
    'Nykaa Warehousing', 'Tata Cliq', 'Myntra Logistics', 'DMart'
]
BOX_TYPES = [
    'Corrugated 3-ply', 'Corrugated 5-ply',
    'Die-cut box', 'Mailer box'
]
MACHINES  = ['Corrugator-1', 'Corrugator-2', 'Die-Cutter-1']
OPERATORS = ['Ravi Kumar', 'Suresh Babu', 'Anitha M', 'Vijay R', 'Deepa S']
SHIFTS    = ['morning', 'evening', 'night']
LINES     = ['Line A', 'Line B', 'Line C']

SHIFT_TIMES = {
    'morning': ('06:00', '14:00'),
    'evening': ('14:00', '22:00'),
    'night':   ('22:00', '06:00'),
}

with app.app_context():

    # ── Clear all tables using exact names from your DB ──────────────
    print('🗑️  Clearing all tables...')
    db.session.execute(db.text('DELETE FROM esg_logs'))
    db.session.execute(db.text('DELETE FROM shifts'))
    db.session.execute(db.text('DELETE FROM price_history'))
    db.session.execute(db.text('DELETE FROM suppliers'))
    db.session.execute(db.text('DELETE FROM production_run'))
    db.session.execute(db.text('DELETE FROM "order"'))
    db.session.execute(db.text('DELETE FROM users'))
    db.session.commit()
    print('✅ All tables cleared')

    # ── Admin user ───────────────────────────────────────────────────
    admin = User(
        name='Admin User',
        email='admin@cardboardos.com',
        password_hash=bcrypt.generate_password_hash('test1234').decode('utf-8'),
        role='admin'
    )
    db.session.add(admin)
    db.session.commit()
    print('✅ Admin user created')

    # ── Orders — 6 months of history ────────────────────────────────
    statuses       = ['pending', 'in_production', 'dispatched', 'delivered']
    status_weights = [0.15, 0.15, 0.20, 0.50]

    for i in range(120):
        created = date.today() - timedelta(days=random.randint(0, 180))
        order = Order(
            client_name=random.choice(CLIENTS),
            box_type=random.choice(BOX_TYPES),
            quantity=random.randint(500, 8000),
            status=random.choices(statuses, weights=status_weights)[0],
            due_date=created + timedelta(days=random.randint(5, 25)),
        )
        db.session.add(order)
    db.session.commit()
    print('✅ Orders seeded')

    # ── Production runs — 90 days, multiple runs per day ────────────
    for i in range(90):
        run_date = date.today() - timedelta(days=90 - i)
        for _ in range(random.randint(2, 4)):
            machine  = random.choice(MACHINES)
            shift    = random.choice(SHIFTS)
            base_scrap       = 15 if machine == 'Corrugator-1' else \
                               25 if machine == 'Corrugator-2' else 20
            scrap_multiplier = 1.4 if shift == 'night' else 1.0
            run = ProductionRun(
                machine_name=machine,
                operator_name=random.choice(OPERATORS),
                shift_type=shift,
                quantity_produced=random.randint(800, 2500),
                scrap_kg=round(
                    random.uniform(base_scrap * 0.7, base_scrap * 1.3)
                    * scrap_multiplier, 2
                ),
                run_date=run_date
            )
            db.session.add(run)
    db.session.commit()
    print('✅ Production runs seeded')

    # ── Suppliers ────────────────────────────────────────────────────
    suppliers_data = [
        ('Kraft Paper India',    'Kraft Paper',    42000, 91.5),
        ('EcoFibre Suppliers',   'Recycled Fibre', 28000, 84.2),
        ('National Paper Mills', 'Kraft Paper',    43500, 78.9),
        ('GreenBox Materials',   'Recycled Fibre', 29500, 88.0),
        ('Premium Pulp Ltd',     'Kraft Paper',    45000, 95.1),
    ]
    for name, material, price, reliability in suppliers_data:
        supplier = Supplier(
            name=name,
            material_type=material,
            price_per_ton=price,
            reliability_score=reliability,
            last_delivery_date=date.today() - timedelta(days=random.randint(1, 10))
        )
        db.session.add(supplier)
    db.session.commit()
    print('✅ Suppliers seeded')

    # ── Price history — 90 days with realistic upward trend ──────────
    base_price = 41000
    for i in range(90):
        price_date = date.today() - timedelta(days=90 - i)
        trend      = i * 15
        noise      = random.uniform(-800, 800)
        price = PriceHistory(
            material_type='Kraft Paper',
            price_per_ton=round(base_price + trend + noise, 2),
            recorded_date=price_date
        )
        db.session.add(price)
    db.session.commit()
    print('✅ Price history seeded')

    # ── Shifts — spread across next 14 days ─────────────────────────
    for i in range(30):
        shift_date = date.today() + timedelta(days=random.randint(-7, 14))
        stype      = random.choice(SHIFTS)
        shift = Shift(
            operator_name=random.choice(OPERATORS),
            shift_date=shift_date,
            shift_type=stype,
            assigned_line=random.choice(LINES),
            start_time=SHIFT_TIMES[stype][0],
            end_time=SHIFT_TIMES[stype][1],
        )
        db.session.add(shift)
    db.session.commit()
    print('✅ Shifts seeded')

    # ── ESG logs — 90 days with improvement trend ────────────────────
    for i in range(90):
        log_date      = date.today() - timedelta(days=90 - i)
        recycled_base = 45 + (i * 0.25)
        esg = ESGLog(
            log_date=log_date,
            energy_kwh=round(random.uniform(900, 1400), 2),
            water_litres=round(random.uniform(2500, 4500), 2),
            recycled_percent=round(
                min(75, recycled_base + random.uniform(-3, 3)), 2
            ),
        )
        db.session.add(esg)
    db.session.commit()
    print('✅ ESG logs seeded')

    # ── Final summary ─────────────────────────────────────────────────
    print('\n📊 Final seed summary:')
    print(f'   Users:           {User.query.count()}')
    print(f'   Orders:          {Order.query.count()}')
    print(f'   Production runs: {ProductionRun.query.count()}')
    print(f'   Suppliers:       {Supplier.query.count()}')
    print(f'   Price records:   {PriceHistory.query.count()}')
    print(f'   Shifts:          {Shift.query.count()}')
    print(f'   ESG logs:        {ESGLog.query.count()}')
    print('\n🎉 Seed complete! Login: admin@cardboardos.com / test1234')