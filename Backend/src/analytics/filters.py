from __future__ import annotations

import pandas as pd


class DataFilter:
    """Apply search and column-based filters to a DataFrame."""

    def __init__(self, df: pd.DataFrame) -> None:
        if df is None or df.empty:
            raise ValueError(
                "Cannot filter an empty dataset."
            )

        self.df = df.copy()

    def global_search(
        self,
        search_text: str,
    ) -> pd.DataFrame:
        """
        Search for text across all columns.

        The search is case-insensitive.
        """

        if not search_text.strip():
            return self.df.copy()

        search_text = search_text.strip()

        mask = self.df.astype(str).apply(
            lambda column: column.str.contains(
                search_text,
                case=False,
                na=False,
                regex=False,
            )
        )

        row_mask = mask.any(axis=1)

        return self.df.loc[row_mask].copy()

    def categorical_filter(
        self,
        column: str,
        values: list,
    ) -> pd.DataFrame:
        """Filter a categorical column by selected values."""

        if column not in self.df.columns:
            raise ValueError(
                f"Column '{column}' does not exist."
            )

        if not values:
            return self.df.copy()

        return self.df[
            self.df[column].isin(values)
        ].copy()

    def numeric_filter(
        self,
        column: str,
        operator: str,
        value: float,
    ) -> pd.DataFrame:
        """Apply a numeric comparison filter."""

        if column not in self.df.columns:
            raise ValueError(
                f"Column '{column}' does not exist."
            )

        series = self.df[column]

        if not pd.api.types.is_numeric_dtype(series):
            raise ValueError(
                f"Column '{column}' is not numerical."
            )

        if operator == ">":
            mask = series > value

        elif operator == ">=":
            mask = series >= value

        elif operator == "<":
            mask = series < value

        elif operator == "<=":
            mask = series <= value

        elif operator == "==":
            mask = series == value

        elif operator == "!=":
            mask = series != value

        else:
            raise ValueError(
                f"Unsupported operator: {operator}"
            )

        return self.df.loc[mask].copy()