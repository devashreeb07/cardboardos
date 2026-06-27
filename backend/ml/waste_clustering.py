import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from models.production import ProductionRun


def run_waste_clustering(app):
    """
    Clusters production runs into Low/Medium/High waste groups.
    Returns insights about which machine+shift combinations
    are the worst offenders.
    """
    with app.app_context():
        runs = ProductionRun.query.all()

        if len(runs) < 10:
            return {'error': 'Not enough production data for clustering. Need at least 10 runs.'}

        # Build dataframe
        records = []
        for r in runs:
            records.append({
                'id':               r.id,
                'machine_name':     r.machine_name,
                'operator_name':    r.operator_name,
                'shift_type':       r.shift_type,
                'quantity_produced':r.quantity_produced,
                'scrap_kg':         r.scrap_kg,
                'scrap_rate':       round(r.scrap_kg / r.quantity_produced * 100, 4)
                                    if r.quantity_produced > 0 else 0,
            })

        df = pd.DataFrame(records)

        # Features for clustering
        features = df[['scrap_kg', 'scrap_rate', 'quantity_produced']].copy()

        # Normalize features
        scaler = StandardScaler()
        scaled = scaler.fit_transform(features)

        # KMeans with 3 clusters — Low / Medium / High waste
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        df['cluster'] = kmeans.fit_predict(scaled)

        # Label clusters by average scrap — lowest = 0 (Low), highest = 2 (High)
        cluster_means = df.groupby('cluster')['scrap_kg'].mean().sort_values()
        label_map = {
            cluster_means.index[0]: 'Low',
            cluster_means.index[1]: 'Medium',
            cluster_means.index[2]: 'High',
        }
        df['waste_level'] = df['cluster'].map(label_map)

        # Overall stats per waste level
        level_stats = []
        for level in ['Low', 'Medium', 'High']:
            subset = df[df['waste_level'] == level]
            level_stats.append({
                'level':        level,
                'count':        len(subset),
                'avg_scrap_kg': round(subset['scrap_kg'].mean(), 2),
                'avg_scrap_rate': round(subset['scrap_rate'].mean(), 4),
                'color':        '#10b981' if level == 'Low' else '#f59e0b' if level == 'Medium' else '#ef4444'
            })

        # Machine + shift combination analysis
        combo = df.groupby(['machine_name', 'shift_type']).agg(
            avg_scrap=('scrap_kg',   'mean'),
            total_scrap=('scrap_kg', 'sum'),
            run_count=('id',         'count'),
            avg_rate=('scrap_rate',  'mean')
        ).reset_index()

        combo = combo.sort_values('avg_scrap', ascending=False)

        # Overall average for comparison
        overall_avg = round(df['scrap_kg'].mean(), 2)

        combo_list = []
        for _, row in combo.iterrows():
            pct_vs_avg = round(((row['avg_scrap'] - overall_avg) / overall_avg) * 100, 1)
            combo_list.append({
                'machine':      row['machine_name'],
                'shift':        row['shift_type'],
                'avg_scrap':    round(row['avg_scrap'], 2),
                'total_scrap':  round(row['total_scrap'], 2),
                'run_count':    int(row['run_count']),
                'avg_rate':     round(row['avg_rate'], 4),
                'pct_vs_avg':   pct_vs_avg,
                'status':       'high'   if pct_vs_avg > 15
                                else 'low' if pct_vs_avg < -15
                                else 'normal'
            })

        # Operator analysis
        operator = df.groupby('operator_name').agg(
            avg_scrap=('scrap_kg',  'mean'),
            total_scrap=('scrap_kg','sum'),
            run_count=('id',        'count')
        ).reset_index().sort_values('avg_scrap', ascending=False)

        operator_list = [{
            'operator':    row['operator_name'],
            'avg_scrap':   round(row['avg_scrap'], 2),
            'total_scrap': round(row['total_scrap'], 2),
            'run_count':   int(row['run_count']),
            'pct_vs_avg':  round(((row['avg_scrap'] - overall_avg) / overall_avg) * 100, 1)
        } for _, row in operator.iterrows()]

        # Generate plain-English insights
        insights = []
        worst_combo = combo_list[0] if combo_list else None
        best_combo  = combo_list[-1] if combo_list else None

        if worst_combo and worst_combo['pct_vs_avg'] > 10:
            insights.append({
                'type':    'warning',
                'icon':    '⚠️',
                'title':   f"{worst_combo['machine']} on {worst_combo['shift']} shift",
                'message': f"Produces {worst_combo['pct_vs_avg']}% more scrap than average "
                           f"({worst_combo['avg_scrap']} kg/run vs {overall_avg} kg overall avg). "
                           f"Recommend machine inspection and operator review."
            })

        if best_combo and best_combo['pct_vs_avg'] < -10:
            insights.append({
                'type':    'success',
                'icon':    '✅',
                'title':   f"{best_combo['machine']} on {best_combo['shift']} shift",
                'message': f"Best performer — {abs(best_combo['pct_vs_avg'])}% below average scrap "
                           f"({best_combo['avg_scrap']} kg/run). Use this combination as benchmark."
            })

        high_waste_runs = df[df['waste_level'] == 'High']
        if len(high_waste_runs) > 0:
            pct_high = round(len(high_waste_runs) / len(df) * 100, 1)
            insights.append({
                'type':    'info',
                'icon':    '📊',
                'title':   f"{pct_high}% of runs are high-waste",
                'message': f"{len(high_waste_runs)} out of {len(df)} production runs fall in the "
                           f"high-waste cluster (avg {round(high_waste_runs['scrap_kg'].mean(), 2)} kg/run). "
                           f"Targeting these runs could reduce total scrap significantly."
            })

        # Per-run cluster labels (for table display)
        run_labels = df[['id', 'waste_level', 'scrap_rate']].to_dict('records')

        return {
            'overall_avg_scrap': overall_avg,
            'total_runs':        len(df),
            'level_stats':       level_stats,
            'combo_analysis':    combo_list,
            'operator_analysis': operator_list,
            'insights':          insights,
            'run_labels':        run_labels,
        }