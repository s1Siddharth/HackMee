from __future__ import annotations

import pandas as pd
from sklearn.ensemble import IsolationForest


class AnomalyDetector:
    """Detect anomalies using IQR and Isolation Forest."""

    MAX_ANALYSIS_ROWS = 100_000

    def __init__(self, df: pd.DataFrame) -> None:

        if df is None or df.empty:
            raise ValueError(
                "Cannot perform anomaly detection "
                "on an empty dataset."
            )

        self.df = df.copy()

        self.numeric_columns = (
            self.df
            .select_dtypes(include="number")
            .columns
            .tolist()
        )

    # ============================================================
    # IQR ANOMALY DETECTION
    # ============================================================

    def detect_iqr(self) -> tuple[pd.DataFrame, dict]:

        result = self.df.copy()

        # Always create these columns.
        # This prevents KeyError later.
        result["iqr_outlier_count"] = 0
        result["iqr_anomaly"] = False

        if not self.numeric_columns:

            return result, {
                "method": "IQR",
                "anomaly_count": 0,
                "anomaly_percentage": 0.0,
                "analyzed_rows": len(result),
            }

        for column in self.numeric_columns:

            series = pd.to_numeric(
                result[column],
                errors="coerce",
            )

            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)

            iqr = q3 - q1

            # Skip unusable columns
            if pd.isna(iqr) or iqr == 0:
                continue

            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr

            mask = (
                (series < lower_bound)
                | (series > upper_bound)
            )

            mask = mask.fillna(False)

            result.loc[
                mask.index,
                "iqr_outlier_count",
            ] += mask.astype(int)

        result["iqr_anomaly"] = (
            result["iqr_outlier_count"] > 0
        )

        anomaly_count = int(
            result["iqr_anomaly"].sum()
        )

        summary = {
            "method": "IQR",
            "anomaly_count": anomaly_count,
            "anomaly_percentage": round(
                anomaly_count
                / len(result)
                * 100,
                2,
            ),
            "analyzed_rows": len(result),
        }

        return result, summary

    # ============================================================
    # ISOLATION FOREST
    # ============================================================

    def detect_isolation_forest(
        self,
    ) -> tuple[pd.DataFrame, dict]:

        result = self.df.copy()

        result["isolation_anomaly"] = False
        result["isolation_score"] = 0.0

        if not self.numeric_columns:

            return result, {
                "method": "Isolation Forest",
                "anomaly_count": 0,
                "anomaly_percentage": 0.0,
                "analyzed_rows": 0,
            }

        data = result[
            self.numeric_columns
        ].copy()

        # Convert everything to numeric
        for column in data.columns:

            data[column] = pd.to_numeric(
                data[column],
                errors="coerce",
            )

        # Replace infinite values
        data = data.replace(
            [float("inf"), float("-inf")],
            pd.NA,
        )

        # Median imputation
        for column in data.columns:

            median = data[column].median()

            if pd.isna(median):
                median = 0

            data[column] = data[column].fillna(
                median
            )

        # --------------------------------------------------------
        # Optimize large datasets
        # --------------------------------------------------------

        if len(data) > self.MAX_ANALYSIS_ROWS:

            sampled_data = data.sample(
                n=self.MAX_ANALYSIS_ROWS,
                random_state=42,
            )

        else:

            sampled_data = data

        # --------------------------------------------------------
        # Isolation Forest
        # --------------------------------------------------------

        model = IsolationForest(
            n_estimators=100,
            contamination="auto",
            random_state=42,
            n_jobs=-1,
        )

        model.fit(sampled_data)

        predictions = model.predict(
            sampled_data
        )

        scores = (
            -model.decision_function(
                sampled_data
            )
        )

        result.loc[
            sampled_data.index,
            "isolation_anomaly",
        ] = (
            predictions == -1
        )

        result.loc[
            sampled_data.index,
            "isolation_score",
        ] = scores

        anomaly_count = int(
            (predictions == -1).sum()
        )

        analyzed_rows = len(
            sampled_data
        )

        summary = {
            "method": "Isolation Forest",
            "anomaly_count": anomaly_count,
            "anomaly_percentage": round(
                anomaly_count
                / analyzed_rows
                * 100,
                2,
            ),
            "analyzed_rows": analyzed_rows,
            "total_rows": len(result),
        }

        return result, summary

    # ============================================================
    # COMBINED ANALYSIS
    # ============================================================

    def analyze(
        self,
    ) -> tuple[pd.DataFrame, dict]:

        iqr_df, iqr_summary = (
            self.detect_iqr()
        )

        forest_df, forest_summary = (
            self.detect_isolation_forest()
        )

        result = self.df.copy()

        # IQR results
        result["iqr_outlier_count"] = (
            iqr_df["iqr_outlier_count"]
        )

        result["iqr_anomaly"] = (
            iqr_df["iqr_anomaly"]
        )

        # Isolation Forest results
        result["isolation_anomaly"] = (
            forest_df["isolation_anomaly"]
        )

        result["isolation_score"] = (
            forest_df["isolation_score"]
        )

        # --------------------------------------------------------
        # Combined anomaly score
        # --------------------------------------------------------

        result["anomaly_methods"] = (
            result["iqr_anomaly"].astype(int)
            +
            result["isolation_anomaly"].astype(int)
        )

        result["anomaly"] = (
            result["anomaly_methods"] > 0
        )

        total_anomalies = int(
            result["anomaly"].sum()
        )

        summary = {
            "total_rows": len(result),

            "iqr": iqr_summary,

            "isolation_forest": forest_summary,

            "combined_anomalies": (
                total_anomalies
            ),

            "combined_anomaly_percentage": round(
                total_anomalies
                / len(result)
                * 100,
                2,
            ),
        }

        return result, summary