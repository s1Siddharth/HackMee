from __future__ import annotations

import pandas as pd
import numpy as np


class InsightAnalyzer:
    """Extract statistical evidence for AI-generated insights."""

    def __init__(self, df: pd.DataFrame) -> None:

        if df is None or df.empty:
            raise ValueError(
                "Cannot analyze an empty dataset."
            )

        self.df = df.copy()

    # ==========================================================
    # NUMERICAL SUMMARY
    # ==========================================================

    def numerical_summary(self) -> list[dict]:
        """Generate summaries for numerical columns."""

        numeric_columns = (
            self.df
            .select_dtypes(include="number")
            .columns
            .tolist()
        )

        results = []

        for column in numeric_columns:

            series = self.df[column].dropna()

            if series.empty:
                continue

            results.append(
                {
                    "column": column,
                    "mean": round(
                        float(series.mean()),
                        3,
                    ),
                    "median": round(
                        float(series.median()),
                        3,
                    ),
                    "minimum": round(
                        float(series.min()),
                        3,
                    ),
                    "maximum": round(
                        float(series.max()),
                        3,
                    ),
                    "std": round(
                        float(series.std()),
                        3,
                    ),
                    "skewness": round(
                        float(series.skew()),
                        3,
                    ),
                }
            )

        return results

    # ==========================================================
    # CATEGORICAL ANALYSIS
    # ==========================================================

    def categorical_summary(self) -> list[dict]:
        """Find dominant categories."""

        categorical_columns = (
            self.df
            .select_dtypes(
                include=[
                    "object",
                    "category",
                    "bool",
                ]
            )
            .columns
            .tolist()
        )

        results = []

        for column in categorical_columns:

            value_counts = (
                self.df[column]
                .value_counts(
                    dropna=True
                )
            )

            if value_counts.empty:
                continue

            top_value = value_counts.index[0]

            top_count = int(
                value_counts.iloc[0]
            )

            percentage = (
                top_count
                / len(self.df)
                * 100
            )

            results.append(
                {
                    "column": column,
                    "unique_values": int(
                        self.df[column]
                        .nunique()
                    ),
                    "top_value": str(
                        top_value
                    ),
                    "top_count": top_count,
                    "top_percentage": round(
                        percentage,
                        2,
                    ),
                }
            )

        return results

    # ==========================================================
    # CORRELATION ANALYSIS
    # ==========================================================

    def correlation_summary(
        self,
        threshold: float = 0.5,
    ) -> list[dict]:
        """Find strong numerical correlations."""

        numeric_df = (
            self.df
            .select_dtypes(
                include="number"
            )
        )

        if numeric_df.shape[1] < 2:
            return []

        correlation = numeric_df.corr()

        results = []

        columns = correlation.columns

        for i in range(len(columns)):

            for j in range(i + 1, len(columns)):

                column_a = columns[i]
                column_b = columns[j]

                value = correlation.loc[
                    column_a,
                    column_b,
                ]

                if pd.isna(value):
                    continue

                if abs(value) >= threshold:

                    results.append(
                        {
                            "column_a": column_a,
                            "column_b": column_b,
                            "correlation": round(
                                float(value),
                                3,
                            ),
                            "relationship": (
                                "positive"
                                if value > 0
                                else "negative"
                            ),
                        }
                    )

        results.sort(
            key=lambda item: abs(
                item["correlation"]
            ),
            reverse=True,
        )

        return results

    # ==========================================================
    # OUTLIER ANALYSIS
    # ==========================================================

    def outlier_summary(self) -> list[dict]:
        """Detect potential outliers using the IQR method."""

        numeric_columns = (
            self.df
            .select_dtypes(include="number")
            .columns
        )

        results = []

        for column in numeric_columns:

            series = self.df[column].dropna()

            if series.empty:
                continue

            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)

            iqr = q3 - q1

            if iqr == 0:
                continue

            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr

            outliers = series[
                (series < lower_bound)
                | (series > upper_bound)
            ]

            if len(outliers) == 0:
                continue

            results.append(
                {
                    "column": column,
                    "outlier_count": int(
                        len(outliers)
                    ),
                    "outlier_percentage": round(
                        len(outliers)
                        / len(series)
                        * 100,
                        2,
                    ),
                    "lower_bound": round(
                        float(lower_bound),
                        3,
                    ),
                    "upper_bound": round(
                        float(upper_bound),
                        3,
                    ),
                }
            )

        return results

    # ==========================================================
    # DATASET EVIDENCE
    # ==========================================================

    def generate_evidence(self) -> dict:
        """Generate a structured evidence package."""

        return {
            "dataset": {
                "rows": int(
                    self.df.shape[0]
                ),
                "columns": int(
                    self.df.shape[1]
                ),
            },
            "numerical_summary": (
                self.numerical_summary()
            ),
            "categorical_summary": (
                self.categorical_summary()
            ),
            "correlations": (
                self.correlation_summary()
            ),
            "outliers": (
                self.outlier_summary()
            ),
        }