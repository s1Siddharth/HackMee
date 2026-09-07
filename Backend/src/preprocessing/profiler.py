from __future__ import annotations

import pandas as pd
import numpy as np


class DataProfiler:
    """Generate statistical and quality information for a dataset."""

    def __init__(self, df: pd.DataFrame) -> None:
        if df is None or df.empty:
            raise ValueError("Cannot profile an empty dataset.")

        self.df = df.copy()

    def get_basic_metrics(self) -> dict:
        """Return high-level dataset metrics."""

        total_cells = self.df.shape[0] * self.df.shape[1]

        missing_cells = int(self.df.isna().sum().sum())

        duplicate_rows = int(self.df.duplicated().sum())

        return {
            "rows": self.df.shape[0],
            "columns": self.df.shape[1],
            "missing_cells": missing_cells,
            "missing_percentage": (
                missing_cells / total_cells * 100
                if total_cells > 0
                else 0
            ),
            "duplicate_rows": duplicate_rows,
            "duplicate_percentage": (
                duplicate_rows / len(self.df) * 100
                if len(self.df) > 0
                else 0
            ),
        }

    def get_column_types(self) -> dict:
        """Classify columns into numerical, categorical and date types."""

        numeric_columns = self.df.select_dtypes(
            include=np.number
        ).columns.tolist()

        datetime_columns = self.df.select_dtypes(
            include=["datetime", "datetimetz"]
        ).columns.tolist()

        categorical_columns = self.df.select_dtypes(
            include=["object", "category", "bool"]
        ).columns.tolist()

        return {
            "numeric": numeric_columns,
            "categorical": categorical_columns,
            "datetime": datetime_columns,
        }

    def get_column_profile(self) -> pd.DataFrame:
        """Generate column-level profiling information."""

        records = []

        for column in self.df.columns:

            series = self.df[column]

            missing_count = int(series.isna().sum())

            unique_count = int(series.nunique(dropna=True))

            missing_percentage = (
                missing_count / len(series) * 100
                if len(series) > 0
                else 0
            )

            records.append(
                {
                    "Column": column,
                    "Data Type": str(series.dtype),
                    "Missing": missing_count,
                    "Missing %": round(
                        missing_percentage, 2
                    ),
                    "Unique Values": unique_count,
                    "Unique %": round(
                        unique_count / len(series) * 100,
                        2,
                    ),
                    "Constant": unique_count <= 1,
                }
            )

        return pd.DataFrame(records)

    def get_numeric_summary(self) -> pd.DataFrame:
        """Return descriptive statistics for numerical columns."""

        numeric_df = self.df.select_dtypes(
            include=np.number
        )

        if numeric_df.empty:
            return pd.DataFrame()

        summary = numeric_df.describe().T

        summary["median"] = numeric_df.median()

        summary["missing"] = numeric_df.isna().sum()

        summary["skewness"] = numeric_df.skew()

        summary = summary.reset_index()

        summary = summary.rename(
            columns={"index": "Column"}
        )

        return summary.round(3)

    def get_constant_columns(self) -> list[str]:
        """Find columns containing only one unique value."""

        return [
            column
            for column in self.df.columns
            if self.df[column].nunique(dropna=True) <= 1
        ]

    def get_high_cardinality_columns(
        self,
        threshold: float = 0.95,
    ) -> list[str]:
        """
        Identify columns where the percentage of unique values
        exceeds the specified threshold.
        """

        high_cardinality = []

        for column in self.df.columns:

            unique_ratio = (
                self.df[column].nunique(dropna=True)
                / len(self.df)
            )

            if unique_ratio >= threshold:
                high_cardinality.append(column)

        return high_cardinality

    def calculate_quality_score(self) -> float:
        """
        Calculate an interpretable data-quality score.

        The score starts at 100 and applies penalties for:
        - Missing values
        - Duplicate records
        - Constant columns
        """

        metrics = self.get_basic_metrics()

        score = 100.0

        # Missing-value penalty
        score -= min(
            metrics["missing_percentage"] * 0.5,
            25,
        )

        # Duplicate penalty
        score -= min(
            metrics["duplicate_percentage"] * 0.5,
            20,
        )

        # Constant-column penalty
        constant_count = len(
            self.get_constant_columns()
        )

        if self.df.shape[1] > 0:
            constant_ratio = (
                constant_count / self.df.shape[1]
            )

            score -= min(
                constant_ratio * 20,
                10,
            )

        return round(
            max(score, 0),
            2,
        )