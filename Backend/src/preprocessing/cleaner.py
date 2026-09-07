from __future__ import annotations

import pandas as pd
import numpy as np


class DataCleaner:
    """Clean and preprocess a Pandas DataFrame."""

    def __init__(self, df: pd.DataFrame) -> None:
        if df is None or df.empty:
            raise ValueError("Cannot clean an empty dataset.")

        self.original_df = df.copy()
        self.df = df.copy()

        self.operations: list[dict] = []

    def _record_operation(
        self,
        operation: str,
        affected_rows: int = 0,
        affected_columns: int = 0,
        description: str = "",
    ) -> None:
        """Record a cleaning operation."""

        self.operations.append(
            {
                "Operation": operation,
                "Affected Rows": affected_rows,
                "Affected Columns": affected_columns,
                "Description": description,
            }
        )

    def remove_duplicate_rows(self) -> None:
        """Remove completely duplicated rows."""

        before = len(self.df)

        self.df = self.df.drop_duplicates()

        removed = before - len(self.df)

        if removed > 0:
            self._record_operation(
                operation="Duplicate Removal",
                affected_rows=removed,
                description=(
                    f"Removed {removed:,} duplicate rows."
                ),
            )

    def standardize_column_names(self) -> None:
        """Standardize column names."""

        old_columns = self.df.columns.tolist()

        new_columns = (
            self.df.columns
            .str.strip()
            .str.lower()
            .str.replace(" ", "_", regex=False)
            .str.replace(r"[^\w]+", "_", regex=True)
            .str.replace(r"_+", "_", regex=True)
            .str.strip("_")
        )

        self.df.columns = new_columns

        changed = sum(
            old != new
            for old, new in zip(
                old_columns,
                new_columns,
            )
        )

        if changed > 0:
            self._record_operation(
                operation="Column Name Standardization",
                affected_columns=changed,
                description=(
                    f"Standardized {changed} column names."
                ),
            )

    def convert_object_dates(self) -> None:
        """
        Detect object columns that predominantly contain dates
        and safely convert them to timezone-aware UTC datetimes.
    
        A column is converted only when at least 90% of its
        non-null values can be interpreted as dates.
        """
    
        converted_columns = []
    
        object_columns = self.df.select_dtypes(
            include=["object"]
        ).columns
    
        for column in object_columns:
        
            series = self.df[column]
    
            # Ignore completely empty columns
            non_null = series.dropna()
    
            if non_null.empty:
                continue
            
            try:
                converted = pd.to_datetime(
                    series,
                    errors="coerce",
                    utc=True,
                )
    
            except (ValueError, TypeError, OverflowError):
                # If Pandas cannot interpret the column as dates,
                # leave the original column unchanged.
                continue
            
            valid_ratio = (
                converted.notna().sum()
                / non_null.shape[0]
            )
    
            # Only convert when the majority of values
            # genuinely look like dates.
            if valid_ratio >= 0.90:
            
                self.df[column] = converted
    
                converted_columns.append(column)
    
        if converted_columns:
        
            self._record_operation(
                operation="Date Conversion",
                affected_columns=len(
                    converted_columns
                ),
                description=(
                    "Converted detected date columns to "
                    "UTC datetime: "
                    + ", ".join(converted_columns)
                ),
            )

    def fill_missing_values(
        self,
        numeric_strategy: str = "median",
        categorical_strategy: str = "mode",
    ) -> None:
        """
        Fill missing values.

        Numeric columns:
            median by default.

        Categorical columns:
            mode by default.
        """

        missing_before = int(
            self.df.isna().sum().sum()
        )

        if missing_before == 0:
            return

        numeric_columns = self.df.select_dtypes(
            include=np.number
        ).columns

        categorical_columns = self.df.select_dtypes(
            include=["object", "category", "bool"]
        ).columns

        # Numeric columns
        for column in numeric_columns:

            if self.df[column].isna().sum() == 0:
                continue

            if numeric_strategy == "median":
                value = self.df[column].median()

            elif numeric_strategy == "mean":
                value = self.df[column].mean()

            else:
                raise ValueError(
                    "Unsupported numeric strategy."
                )

            self.df[column] = (
                self.df[column].fillna(value)
            )

        # Categorical columns
        for column in categorical_columns:

            if self.df[column].isna().sum() == 0:
                continue

            if categorical_strategy == "mode":

                modes = self.df[column].mode()

                if not modes.empty:
                    value = modes.iloc[0]

                    self.df[column] = (
                        self.df[column].fillna(value)
                    )

        missing_after = int(
            self.df.isna().sum().sum()
        )

        filled = missing_before - missing_after

        if filled > 0:
            self._record_operation(
                operation="Missing Value Imputation",
                affected_rows=filled,
                description=(
                    f"Filled {filled:,} missing values."
                ),
            )

    def remove_constant_columns(self) -> None:
        """Remove columns containing one unique value."""

        constant_columns = [
            column
            for column in self.df.columns
            if self.df[column].nunique(
                dropna=True
            ) <= 1
        ]

        if not constant_columns:
            return

        self.df = self.df.drop(
            columns=constant_columns
        )

        self._record_operation(
            operation="Constant Column Removal",
            affected_columns=len(constant_columns),
            description=(
                "Removed constant columns: "
                + ", ".join(constant_columns)
            ),
        )

    def clean(
        self,
        remove_duplicates: bool = True,
        standardize_names: bool = True,
        convert_dates: bool = True,
        fill_missing: bool = True,
        remove_constants: bool = True,
    ) -> pd.DataFrame:
        """Run the complete cleaning pipeline."""

        if standardize_names:
            self.standardize_column_names()

        if remove_duplicates:
            self.remove_duplicate_rows()

        if convert_dates:
            self.convert_object_dates()

        if fill_missing:
            self.fill_missing_values()

        if remove_constants:
            self.remove_constant_columns()

        return self.df.copy()

    def get_cleaning_report(self) -> pd.DataFrame:
        """Return the cleaning operation log."""

        if not self.operations:
            return pd.DataFrame(
                columns=[
                    "Operation",
                    "Affected Rows",
                    "Affected Columns",
                    "Description",
                ]
            )

        return pd.DataFrame(
            self.operations
        )

    def get_comparison(self) -> dict:
        """Compare original and cleaned datasets."""

        original_missing = int(
            self.original_df.isna().sum().sum()
        )

        cleaned_missing = int(
            self.df.isna().sum().sum()
        )

        original_duplicates = int(
            self.original_df.duplicated().sum()
        )

        cleaned_duplicates = int(
            self.df.duplicated().sum()
        )

        return {
            "original_rows": len(
                self.original_df
            ),
            "cleaned_rows": len(self.df),
            "original_columns": len(
                self.original_df.columns
            ),
            "cleaned_columns": len(
                self.df.columns
            ),
            "original_missing": original_missing,
            "cleaned_missing": cleaned_missing,
            "original_duplicates": original_duplicates,
            "cleaned_duplicates": cleaned_duplicates,
        }