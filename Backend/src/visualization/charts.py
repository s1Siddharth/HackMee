from __future__ import annotations
from functools import lru_cache
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


class ChartEngine:
    """Generate optimized interactive Plotly charts."""

    MAX_RAW_POINTS = 10_000
    MAX_CATEGORIES = 30

    def __init__(self, df: pd.DataFrame) -> None:
        if df is None or df.empty:
            raise ValueError(
                "Cannot visualize an empty dataset."
            )

        self.df = df.copy()

    # ==========================================================
    # DATA OPTIMIZATION
    # ==========================================================

    def _sample_dataframe(
        self,
        df: pd.DataFrame,
        max_points: int | None = None,
    ) -> pd.DataFrame:
        """
        Reduce the number of rows used for visualization.

        The original dataframe is never modified.
        """

        if max_points is None:
            max_points = self.MAX_RAW_POINTS

        if len(df) <= max_points:
            return df

        return df.sample(
            n=max_points,
            random_state=42,
        )

    def _aggregate_categories(
        self,
        category_column: str,
        value_column: str,
        max_categories: int | None = None,
    ) -> pd.DataFrame:
        """
        Aggregate numerical values by category.

        Only the top categories are retained for visualization.
        """

        if max_categories is None:
            max_categories = self.MAX_CATEGORIES

        aggregated = (
            self.df
            .groupby(
                category_column,
                dropna=False,
            )[value_column]
            .sum()
            .reset_index()
            .sort_values(
                value_column,
                ascending=False,
            )
        )

        return aggregated.head(max_categories)

    # ==========================================================
    # BAR CHART
    # ==========================================================

    def bar_chart(
        self,
        x: str,
        y: str,
        color: str | None = None,
    ) -> go.Figure:
        """Create an aggregated bar chart."""

        data = self._aggregate_categories(
            category_column=x,
            value_column=y,
        )

        return px.bar(
            data,
            x=x,
            y=y,
            color=color if color in data.columns else None,
            title=f"{y} by {x}",
            template="plotly_white",
        )

    # ==========================================================
    # LINE CHART
    # ==========================================================

    def line_chart(
        self,
        x: str,
        y: str,
        color: str | None = None,
    ) -> go.Figure:
        """Create an optimized line chart."""

        data = self.df.copy()

        # If there are too many points, aggregate by the
        # selected x-axis value.
        if len(data) > self.MAX_RAW_POINTS:

            if pd.api.types.is_datetime64_any_dtype(
                data[x]
            ):

                data["_period"] = (
                    data[x]
                    .dt.to_period("M")
                    .dt.to_timestamp()
                )

                data = (
                    data.groupby(
                        "_period",
                        dropna=False,
                    )[y]
                    .sum()
                    .reset_index()
                )

                data = data.rename(
                    columns={
                        "_period": x
                    }
                )

            else:

                data = (
                    data.groupby(
                        x,
                        dropna=False,
                    )[y]
                    .sum()
                    .reset_index()
                )

        data = data.sort_values(by=x)

        return px.line(
            data,
            x=x,
            y=y,
            color=color if color in data.columns else None,
            title=f"{y} Trend",
            markers=True,
            template="plotly_white",
        )

    # ==========================================================
    # SCATTER PLOT
    # ==========================================================

    def scatter_chart(
        self,
        x: str,
        y: str,
        color: str | None = None,
        size: str | None = None,
    ) -> go.Figure:
        """Create a sampled scatter plot."""

        data = self._sample_dataframe(
            self.df
        )

        return px.scatter(
            data,
            x=x,
            y=y,
            color=color if color in data.columns else None,
            size=size if size in data.columns else None,
            title=f"{y} vs {x}",
            template="plotly_white",
        )

    # ==========================================================
    # HISTOGRAM
    # ==========================================================

    def histogram(
        self,
        column: str,
        color: str | None = None,
    ) -> go.Figure:
        """Create a sampled histogram."""

        data = self._sample_dataframe(
            self.df
        )

        return px.histogram(
            data,
            x=column,
            color=color if color in data.columns else None,
            title=f"Distribution of {column}",
            template="plotly_white",
        )

    # ==========================================================
    # PIE / DONUT
    # ==========================================================

    def pie_chart(
        self,
        names: str,
        values: str,
    ) -> go.Figure:
        """Create an aggregated donut chart."""

        data = self._aggregate_categories(
            category_column=names,
            value_column=values,
            max_categories=10,
        )

        return px.pie(
            data,
            names=names,
            values=values,
            title=f"{values} by {names}",
            hole=0.4,
            template="plotly_white",
        )

    # ==========================================================
    # BOX PLOT
    # ==========================================================

    def box_plot(
        self,
        x: str | None,
        y: str,
        color: str | None = None,
    ) -> go.Figure:
        """Create a sampled box plot."""

        data = self._sample_dataframe(
            self.df
        )

        return px.box(
            data,
            x=x,
            y=y,
            color=color if color in data.columns else None,
            title=f"Distribution of {y}",
            template="plotly_white",
        )

    # ==========================================================
    # CORRELATION HEATMAP
    # ==========================================================

    def correlation_heatmap(self) -> go.Figure:
        """Create a correlation heatmap."""

        numeric_df = self.df.select_dtypes(
            include="number"
        )

        if numeric_df.shape[1] < 2:
            raise ValueError(
                "At least two numerical columns "
                "are required for a correlation heatmap."
            )

        correlation = numeric_df.corr()

        return px.imshow(
            correlation,
            text_auto=".2f",
            aspect="auto",
            title="Correlation Heatmap",
            template="plotly_white",
        )