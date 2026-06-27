import pandas as pd
from prophet import Prophet
from models.production import ProductionRun


def run_demand_forecast(app):
    """
    Loads production run history from DB, trains a Prophet model,
    and returns 30-day demand forecast as a list of dicts.
    """
    with app.app_context():
        runs = ProductionRun.query.all()

        if len(runs) < 10:
            return {'error': 'Not enough production data to forecast. Need at least 10 runs.'}

        # Build daily quantity produced dataframe
        # Prophet needs columns: ds (date) and y (value)
        records = []
        for r in runs:
            if r.run_date:
                records.append({
                    'ds': r.run_date,
                    'y':  r.quantity_produced
                })

        df = pd.DataFrame(records)

        # Group by date — sum quantities per day
        df = df.groupby('ds').agg({'y': 'sum'}).reset_index()
        df['ds'] = pd.to_datetime(df['ds'])
        df = df.sort_values('ds')

        if len(df) < 5:
            return {'error': 'Not enough daily data points to forecast.'}

        # Train Prophet model
        model = Prophet(
            yearly_seasonality=False,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.05
        )
        model.fit(df)

        # Forecast next 30 days
        future   = model.make_future_dataframe(periods=30)
        forecast = model.predict(future)

        last_actual_date = df['ds'].max()

        result_historical = []
        result_forecast   = []

        for _, row in forecast.iterrows():
            point = {
                'date':      row['ds'].strftime('%Y-%m-%d'),
                'predicted': max(0, round(row['yhat'], 0)),
                'lower':     max(0, round(row['yhat_lower'], 0)),
                'upper':     max(0, round(row['yhat_upper'], 0)),
            }
            if row['ds'] <= last_actual_date:
                actual_row = df[df['ds'] == row['ds']]
                point['actual'] = int(actual_row['y'].values[0]) if len(actual_row) else None
                result_historical.append(point)
            else:
                result_forecast.append(point)

        return {
            'historical': result_historical[-30:],
            'forecast':   result_forecast,
            'summary': {
                'avg_predicted_daily': round(
                    sum(p['predicted'] for p in result_forecast) / len(result_forecast), 0
                ),
                'peak_day':   max(result_forecast, key=lambda x: x['predicted'])['date'],
                'peak_value': max(result_forecast, key=lambda x: x['predicted'])['predicted'],
            }
        }