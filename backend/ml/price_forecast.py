import pandas as pd
from prophet import Prophet
from models.supplier import PriceHistory


def run_price_forecast(app):
    """
    Loads Kraft Paper price history from DB,
    trains a Prophet model, returns 14-day price forecast.
    """
    with app.app_context():
        prices = PriceHistory.query\
                             .filter_by(material_type='Kraft Paper')\
                             .order_by(PriceHistory.recorded_date.asc())\
                             .all()

        if len(prices) < 10:
            return {'error': 'Not enough price history to forecast. Need at least 10 records.'}

        # Build dataframe for Prophet
        df = pd.DataFrame([{
            'ds': pd.to_datetime(p.recorded_date),
            'y':  p.price_per_ton
        } for p in prices])

        # Train Prophet model
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale=0.1
        )
        model.fit(df)

        # Forecast next 14 days
        future   = model.make_future_dataframe(periods=14)
        forecast = model.predict(future)

        last_actual_date = df['ds'].max()

        historical = []
        future_prices = []

        for _, row in forecast.iterrows():
            point = {
                'date':      row['ds'].strftime('%Y-%m-%d'),
                'predicted': round(row['yhat'], 2),
                'lower':     round(row['yhat_lower'], 2),
                'upper':     round(row['yhat_upper'], 2),
            }
            if row['ds'] <= last_actual_date:
                actual_row = df[df['ds'] == row['ds']]
                point['actual'] = float(actual_row['y'].values[0]) if len(actual_row) else None
                historical.append(point)
            else:
                future_prices.append(point)

        current_price = prices[-1].price_per_ton
        avg_forecast  = round(
            sum(p['predicted'] for p in future_prices) / len(future_prices), 2
        ) if future_prices else current_price

        trend = 'rising' if avg_forecast > current_price else 'falling'
        change_pct = round(((avg_forecast - current_price) / current_price) * 100, 1)

        return {
            'historical':    historical[-30:],
            'forecast':      future_prices,
            'current_price': current_price,
            'avg_forecast':  avg_forecast,
            'trend':         trend,
            'change_pct':    change_pct,
            'recommendation': (
                'Buy now — prices expected to rise' if trend == 'rising'
                else 'Wait to buy — prices expected to fall'
            )
        }