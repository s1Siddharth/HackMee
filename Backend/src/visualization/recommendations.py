from __future__ import annotations

import pandas as pd


class VisualizationRecommender:
    """Recommend useful charts based on dataset structure."""

    def __init__(self, df: pd.DataFrame) -> None:
        self.df = df

    def recommend(self) -> list[dict]:
        """Generate visualization recommendations."""

        recommendations = []

        numeric_columns = (
            self.df
            .select_dtypes(include="number")
            .columns
            .tolist()
        )

        categorical_columns = (
            self.df
            .select_dtypes(
                include=["object", "category", "bool"]
            )
            .columns
            .tolist()
        )

        datetime_columns = (
            self.df
            .select_dtypes(
                include=["datetime", "datetimetz"]
            )
            .columns
            .tolist()
        )

        # Correlation
        if len(numeric_columns) >= 2:

            recommendations.append(
                {
                    "chart": "Correlation Heatmap",
                    "reason": (
                        "Multiple numerical columns "
                        "were detected."
                    ),
                }
            )

        # Numerical distributions
        for column in numeric_columns[:3]:

            recommendations.append(
                {
                    "chart": f"Distribution of {column}",
                    "reason": (
                        f"{column} is numerical and "
                        "its distribution can reveal "
                        "spread and unusual values."
                    ),
                }
            )

        # Categorical + numerical
        if categorical_columns and numeric_columns:

            category = categorical_columns[0]
            value = numeric_columns[0]

            recommendations.append(
                {
                    "chart": f"{value} by {category}",
                    "reason": (
                        "A categorical and numerical "
                        "column were detected, making "
                        "a comparison useful."
                    ),
                }
            )

        # Time series
        if datetime_columns and numeric_columns:

            date_column = datetime_columns[0]
            value_column = numeric_columns[0]

            recommendations.append(
                {
                    "chart": (
                        f"{value_column} over "
                        f"{date_column}"
                    ),
                    "reason": (
                        "A date column and numerical "
                        "measure were detected, so "
                        "a trend analysis is appropriate."
                    ),
                }
            )

        # Scatter
        if len(numeric_columns) >= 2:

            recommendations.append(
                {
                    "chart": (
                        f"{numeric_columns[0]} vs "
                        f"{numeric_columns[1]}"
                    ),
                    "reason": (
                        "Two numerical variables can "
                        "be analyzed for relationships."
                    ),
                }
            )

        return recommendations