import streamlit as st
from src.ingestion.loader import DatasetLoader
from src.preprocessing.profiler import DataProfiler
from src.preprocessing.cleaner import DataCleaner
from src.visualization.charts import ChartEngine
from src.visualization.recommendations import (VisualizationRecommender,)
from src.analytics.filters import DataFilter
from src.ai.insight_analyzer import InsightAnalyzer
from src.ai.llm import GroqLLM
from src.ai.prompt_builder import InsightPromptBuilder
from src.analytics.anomaly_detector import (AnomalyDetector,)
from streamlit_float import float_init
from src.ai.chat_assistant import stream_chat

st.set_page_config(
    page_title="AI Data Analyst",
    page_icon="📊",
    layout="wide",
)

float_init()


def main() -> None:
    """Run the AI Data Analyst dashboard."""

    # Initialize session state
    if "cleaned_df" not in st.session_state:
        st.session_state["cleaned_df"] = None

    if "cleaning_report" not in st.session_state:
        st.session_state["cleaning_report"] = None

    if "cleaning_comparison" not in st.session_state:
        st.session_state["cleaning_comparison"] = None

    if "uploaded_filename" not in st.session_state:
        st.session_state["uploaded_filename"] = None

    if "ai_insights" not in st.session_state:
        st.session_state["ai_insights"] = None

    st.title("📊 AI Data Analyst")
    st.caption(
        "Upload a dataset to begin intelligent data analysis."
    )

    st.sidebar.header("Dataset")

    uploaded_file = st.sidebar.file_uploader(
        "Upload your dataset",
        type=["csv", "xlsx", "json"],
        help="Supported formats: CSV, Excel, and JSON.",
    )

    # ============================================================
    # AI CONFIGURATION
    # ============================================================

    st.sidebar.divider()

    st.sidebar.header("🤖 AI Configuration")

    ai_provider = st.sidebar.selectbox(
        "AI Provider",
        ["Groq"],
    )

    user_api_key = st.sidebar.text_input(
        "Groq API Key",
        type="password",
        placeholder="gsk_...",
        help=(
            "Your API key is used for this session "
            "to generate AI insights."
        ),
    )

    st.sidebar.caption(
        "🔒 API keys are not displayed after entry."
    )

    if st.sidebar.button(
        "🔌 Test Connection",
        use_container_width=True,
    ):

        if not user_api_key.strip():

            st.sidebar.warning(
                "Enter your Groq API key first."
            )

        else:

            try:

                test_llm = GroqLLM(
                    api_key=user_api_key.strip()
                )

                with st.spinner(
                    "Testing Groq connection..."
                ):

                    test_response = test_llm.generate(
                        "Reply with exactly: CONNECTION_OK"
                    )

                if "CONNECTION_OK" in test_response:

                    st.sidebar.success(
                        "✅ Groq connection successful."
                    )

                else:

                    st.sidebar.success(
                        "✅ Groq API responded successfully."
                    )

            except Exception as exc:

                st.sidebar.error(
                    # "❌ Connection failed. "
                    # "Check your API key and try again."
                    f"❌ Groq connection failed: {exc}"
                )

    if uploaded_file is None:
        st.info(
            "Upload a CSV, Excel, or JSON dataset from the sidebar "
            "to start."
        )

        st.markdown(
            """
            ### What this platform will eventually do

            - 🧹 Clean and preprocess data
            - 📊 Analyze datasets
            - 📈 Generate visualizations
            - 🔍 Detect patterns and anomalies
            - 🤖 Generate AI-powered insights
            - 💡 Provide business recommendations
            - 💬 Answer questions about your data
            - 📄 Generate analytical reports
            """
        )

        return

    try:
        df = DatasetLoader.load(uploaded_file)

    except ValueError as exc:
        st.error(str(exc))
        return

    st.success(
        f"Successfully loaded **{uploaded_file.name}**"
    )

    profiler = DataProfiler(df)
    metrics = profiler.get_basic_metrics()
    column_types = profiler.get_column_types()
    quality_score = profiler.calculate_quality_score()

    # Dataset metrics
    st.subheader("Dataset Health")

    col1, col2, col3, col4, col5 = st.columns(5)

    with col1:
        st.metric(
            "Rows",
            f"{metrics['rows']:,}",
        )

    with col2:
        st.metric(
            "Columns",
            f"{metrics['columns']:,}",
        )

    with col3:
        st.metric(
            "Missing",
            f"{metrics['missing_percentage']:.2f}%",
        )

    with col4:
        st.metric(
            "Duplicates",
            f"{metrics['duplicate_percentage']:.2f}%",
        )

    with col5:
        st.metric(
            "Quality Score",
            f"{quality_score}/100",
        )

    # Dataset preview
    st.subheader("Dataset Preview")
    st.dataframe(
        df.head(100),
        use_container_width=True,
        height=400,
    )

    st.subheader("🔍 Data Quality Report")
    profile_df = profiler.get_column_profile()
    st.dataframe(
        profile_df,
        use_container_width=True,
        hide_index=True,
    )
    st.subheader("📊 Numerical Statistics")
    numeric_summary = profiler.get_numeric_summary()
    if numeric_summary.empty:
    
        st.info(
            "No numerical columns were detected."
        )
    else:
    
        st.dataframe(
            numeric_summary,
            use_container_width=True,
            hide_index=True,
        )        
    st.subheader("⚠️ Data Quality Alerts")
    
    constant_columns = (
        profiler.get_constant_columns()
    )
    
    high_cardinality_columns = (
        profiler.get_high_cardinality_columns()
    )
    
    if metrics["missing_percentage"] > 0:
    
        st.warning(
            f"Missing values detected: "
            f"{metrics['missing_percentage']:.2f}% "
            f"of all cells."
        )
    
    if metrics["duplicate_percentage"] > 0:
    
        st.warning(
            f"{metrics['duplicate_rows']:,} "
            f"duplicate rows detected."
        )
    
    if constant_columns:
    
        st.warning(
            "Constant columns detected: "
            + ", ".join(constant_columns)
        )
    
    if high_cardinality_columns:
    
        st.info(
            "High-cardinality columns: "
            + ", ".join(high_cardinality_columns)
        )
    
    if (
        metrics["missing_percentage"] == 0
        and metrics["duplicate_percentage"] == 0
        and not constant_columns
    ):
    
        st.success(
            "No major structural data-quality issues detected."
        )
        

    # column classification
    st.subheader("Column Classification")

    type_col1, type_col2, type_col3 = st.columns(3)

    with type_col1:
        st.metric(
            "Numeric Columns",
            len(column_types["numeric"]),
        )

    with type_col2:
        st.metric(
            "Categorical Columns",
            len(column_types["categorical"]),
        )

    with type_col3:
        st.metric(
            "Date Columns",
            len(column_types["datetime"]),
        )

    # Basic information
    st.subheader("Dataset Information")

    info_col1, info_col2 = st.columns(2)

    with info_col1:
        st.markdown("### Columns")

        column_data = {
            "Column": df.columns,
            "Data Type": [
                str(dtype) for dtype in df.dtypes
            ],
        }

        st.dataframe(
            column_data,
            use_container_width=True,
            hide_index=True,
        )

    with info_col2:
        st.markdown("### Missing Values")

        missing_data = (
            df.isna()
            .sum()
            .reset_index()
        )

        missing_data.columns = [
            "Column",
            "Missing Values",
        ]

        missing_data["Missing %"] = (
            missing_data["Missing Values"]
            / len(df)
            * 100
        ).round(2)

        st.dataframe(
            missing_data,
            use_container_width=True,
            hide_index=True,
        )

    cleaner = DataCleaner(df)
    # ============================================================
    # DATA CLEANING
    # ============================================================

    st.divider()

    st.subheader("🧹 Data Cleaning")

    st.write(
        "Apply automated preprocessing operations to create "
        "an analysis-ready dataset."
    )

    # ------------------------------------------------------------
    # Reset cleaning state when a new dataset is uploaded
    # ------------------------------------------------------------

    current_file = uploaded_file.name

    if (
        st.session_state["uploaded_filename"]
        != current_file
    ):

        st.session_state["uploaded_filename"] = current_file

        st.session_state["cleaned_df"] = None

        st.session_state["cleaning_report"] = None

        st.session_state["cleaning_comparison"] = None

        st.session_state["ai_insights"] = None

    # ------------------------------------------------------------
    # Cleaning controls
    # ------------------------------------------------------------

    clean_col1, clean_col2 = st.columns(2)

    with clean_col1:

        remove_duplicates = st.checkbox(
            "Remove duplicate rows",
            value=True,
            key="remove_duplicates",
        )

        standardize_names = st.checkbox(
            "Standardize column names",
            value=True,
            key="standardize_names",
        )

        convert_dates = st.checkbox(
            "Detect and convert date columns",
            value=True,
            key="convert_dates",
        )

    with clean_col2:

        fill_missing = st.checkbox(
            "Fill missing values",
            value=True,
            key="fill_missing",
        )

        remove_constants = st.checkbox(
            "Remove constant columns",
            value=True,
            key="remove_constants",
        )

    # ------------------------------------------------------------
    # Run cleaning pipeline
    # ------------------------------------------------------------

    if st.button(
        "🧹 Clean Dataset",
        type="primary",
    ):

        try:

            cleaner = DataCleaner(df)

            cleaned_df = cleaner.clean(
                remove_duplicates=remove_duplicates,
                standardize_names=standardize_names,
                convert_dates=convert_dates,
                fill_missing=fill_missing,
                remove_constants=remove_constants,
            )

            st.session_state["cleaned_df"] = cleaned_df

            st.session_state["cleaning_report"] = (
                cleaner.get_cleaning_report()
            )

            st.session_state["cleaning_comparison"] = (
                cleaner.get_comparison()
            )

            st.success(
                "Dataset cleaning completed successfully."
            )

        except Exception as exc:

            st.error(
                f"Cleaning failed: {exc}"
            )

    # ============================================================
    # CLEANING RESULTS
    # ============================================================

    if st.session_state["cleaned_df"] is not None:

        cleaned_df = (
            st.session_state["cleaned_df"]
        )

        comparison = (
            st.session_state[
                "cleaning_comparison"
            ]
        )

        cleaning_report = (
            st.session_state[
                "cleaning_report"
            ]
        )

        # --------------------------------------------------------
        # Before vs After
        # --------------------------------------------------------

        st.subheader("📊 Before vs After")

        col1, col2, col3, col4 = st.columns(4)

        with col1:

            row_change = (
                comparison["cleaned_rows"]
                - comparison["original_rows"]
            )

            st.metric(
                "Rows",
                f"{comparison['cleaned_rows']:,}",
                delta=row_change,
            )

        with col2:

            column_change = (
                comparison["cleaned_columns"]
                - comparison["original_columns"]
            )

            st.metric(
                "Columns",
                f"{comparison['cleaned_columns']:,}",
                delta=column_change,
            )

        with col3:

            missing_change = (
                comparison["original_missing"]
                - comparison["cleaned_missing"]
            )

            st.metric(
                "Missing Values",
                f"{comparison['cleaned_missing']:,}",
                delta=missing_change,
            )

        with col4:

            duplicate_change = (
                comparison["original_duplicates"]
                - comparison["cleaned_duplicates"]
            )

            st.metric(
                "Duplicates",
                f"{comparison['cleaned_duplicates']:,}",
                delta=duplicate_change,
            )

        # --------------------------------------------------------
        # Cleaning Operations
        # --------------------------------------------------------

        st.subheader("📋 Cleaning Operations")

        if cleaning_report.empty:

            st.info(
                "No cleaning operations were required."
            )

        else:

            st.dataframe(
                cleaning_report,
                use_container_width=True,
                hide_index=True,
            )

        # --------------------------------------------------------
        # Cleaned Dataset
        # --------------------------------------------------------

        st.subheader("✨ Cleaned Dataset")

        st.dataframe(
            cleaned_df.head(100),
            use_container_width=True,
            height=400,
        )

        # ============================================================
        # SEARCH & FILTER
        # ============================================================

        st.divider()

        st.subheader("🔎 Search & Filter")

        st.write(
            "Search and filter the cleaned dataset to explore "
            "specific subsets of records."
        )

        filter_engine = DataFilter(
            st.session_state["cleaned_df"]
        )

        filtered_df = (
            st.session_state["cleaned_df"].copy()
        )

        search_text = st.text_input(
            "🔍 Search across all columns",
            placeholder="Example: Chennai, Laptop, Customer123...",
        )

        if search_text.strip():
        
            filtered_df = (
                DataFilter(filtered_df)
                .global_search(search_text)
            )

        categorical_columns = (
            filtered_df
            .select_dtypes(
                include=["object", "category", "bool"]
            )
            .columns
            .tolist()
        )

        if categorical_columns:
        
            st.markdown("### Categorical Filters")

            selected_category = st.selectbox(
                "Select categorical column",
                ["None"] + categorical_columns,
                key="filter_category_column",
            )

            if selected_category != "None":
            
                unique_values = (
                    filtered_df[selected_category]
                    .dropna()
                    .unique()
                    .tolist()
                )

                selected_values = st.multiselect(
                    f"Select {selected_category} values",
                    unique_values,
                    key="filter_category_values",
                )

                if selected_values:
                
                    filtered_df = (
                        DataFilter(filtered_df)
                        .categorical_filter(
                            selected_category,
                            selected_values,
                        )
                    )

        numeric_columns = (
            filtered_df
            .select_dtypes(include="number")
            .columns
            .tolist()
        )

        if numeric_columns:
        
            st.markdown("### Numeric Filters")

            numeric_column = st.selectbox(
                "Select numerical column",
                ["None"] + numeric_columns,
                key="filter_numeric_column",
            )

            if numeric_column != "None":
            
                operator = st.selectbox(
                    "Condition",
                    [
                        ">",
                        ">=",
                        "<",
                        "<=",
                        "==",
                        "!=",
                    ],
                    key="filter_operator",
                )

                min_value = float(
                    filtered_df[numeric_column].min()
                )

                max_value = float(
                    filtered_df[numeric_column].max()
                )

                filter_value = st.number_input(
                    "Value",
                    value=min_value,
                    key="filter_numeric_value",
                )

                if st.button(
                    "Apply Numeric Filter",
                    key="apply_numeric_filter",
                ):

                    try:
                    
                        filtered_df = (
                            DataFilter(filtered_df)
                            .numeric_filter(
                                numeric_column,
                                operator,
                                filter_value,
                            )
                        )

                        st.session_state[
                            "filtered_df"
                        ] = filtered_df

                    except ValueError as exc:
                    
                        st.error(str(exc))

        st.subheader("📊 Filtered Dataset")

        st.metric(
            "Matching Records",
            f"{len(filtered_df):,}",
        )

        st.dataframe(
            filtered_df.head(100),
            use_container_width=True,
            height=400,
        )
        if len(filtered_df) == 0:
        
            st.warning(
                "No records match the current filters."
            )

        else:
        
            st.success(
                f"{len(filtered_df):,} records match "
                "the current filters."
            )
        st.subheader("📈 Filtered Dataset Summary")

        summary_col1, summary_col2, summary_col3 = (
            st.columns(3)
        )

        with summary_col1:
        
            st.metric(
                "Records",
                f"{len(filtered_df):,}",
            )

        with summary_col2:
        
            st.metric(
                "Columns",
                f"{filtered_df.shape[1]:,}",
            )

        with summary_col3:
        
            st.metric(
                "Missing Values",
                f"{int(filtered_df.isna().sum().sum()):,}",
            )

        # ============================================================
        # ADVANCED ANOMALY DETECTION
        # ============================================================

        if st.session_state["cleaned_df"] is not None:
        
            st.divider()

            st.subheader("🚨 Anomaly Detection")

            anomaly_df = filtered_df.copy()

            if anomaly_df.empty:
            
                st.warning(
                    "No records available for anomaly analysis."
                )

            else:
            
                try:
                
                    detector = AnomalyDetector(
                        anomaly_df
                    )

                    with st.spinner(
                        "Detecting unusual patterns..."
                    ):

                        anomaly_results, anomaly_summary = (
                            detector.analyze()
                        )

                    # ------------------------------------------------
                    # Metrics
                    # ------------------------------------------------

                    metric1, metric2, metric3, metric4 = (
                        st.columns(4)
                    )

                    with metric1:
                    
                        st.metric(
                            "Records Analyzed",
                            f"{anomaly_summary['total_rows']:,}",
                        )

                    with metric2:
                    
                        st.metric(
                            "IQR Outliers",
                            f"{anomaly_summary['iqr']['anomaly_count']:,}",
                        )

                    with metric3:
                    
                        st.metric(
                            "ML Anomalies",
                            f"{anomaly_summary['isolation_forest']['anomaly_count']:,}",
                        )

                    with metric4:
                    
                        st.metric(
                            "Combined Anomalies",
                            (
                                f"{anomaly_summary['combined_anomalies']:,}"
                            ),
                        )

                    # ------------------------------------------------
                    # Anomaly percentage
                    # ------------------------------------------------

                    st.info(
                        f"Combined anomaly rate: "
                        f"**{anomaly_summary['combined_anomaly_percentage']:.2f}%**"
                    )

                    # ------------------------------------------------
                    # Display anomalies
                    # ------------------------------------------------

                    anomalies = anomaly_results[
                        anomaly_results["anomaly"]
                    ].copy()

                    st.subheader(
                        "🔎 Detected Anomalies"
                    )

                    if anomalies.empty:
                    
                        st.success(
                            "No significant anomalies detected."
                        )

                    else:
                    
                        st.dataframe(
                            anomalies.head(100),
                            use_container_width=True,
                            height=400,
                        )

                except Exception as exc:
                
                    st.error(
                        f"Anomaly detection failed: {exc}"
                    )


        # ============================================================
        # VISUAL ANALYTICS
        # ============================================================

        if st.session_state["cleaned_df"] is not None:
        
            analysis_df = filtered_df

            st.divider()

            st.subheader("📈 Visual Analytics")

            st.write(
                "Explore relationships, distributions, trends, "
                "and patterns in your cleaned dataset."
            )

            chart_engine = ChartEngine(
                analysis_df
            )

            recommender = VisualizationRecommender(
                analysis_df
            )
            st.subheader(
                "💡 Recommended Visualizations"
            )

            recommendations = (
                recommender.recommend()
            )

            if recommendations:

                for recommendation in recommendations:

                    with st.expander(
                        recommendation["chart"]
                    ):

                        st.write(
                            recommendation["reason"]
                        )

            else:

                st.info(
                    "No automatic visualization "
                    "recommendations available."
                )

            st.caption(
                f"Dataset contains {len(analysis_df):,} records. "
                f"Visualizations automatically optimize large datasets "
                f"for interactive performance."
            )

            st.subheader("📊 Chart Explorer")

            chart_type = st.selectbox(
                "Select visualization",
                [
                    "Bar Chart",
                    "Line Chart",
                    "Scatter Plot",
                    "Histogram",
                    "Pie / Donut Chart",
                    "Box Plot",
                    "Correlation Heatmap",
                ],
            )

            all_columns = analysis_df.columns.tolist()

            numeric_columns = (
                analysis_df
                .select_dtypes(include="number")
                .columns
                .tolist()
            )

            categorical_columns = (
                analysis_df
                .select_dtypes(
                    include=["object", "category", "bool"]
                )
                .columns
                .tolist()
            )

            datetime_columns = (
                analysis_df
                .select_dtypes(
                    include=["datetime", "datetimetz"]
                )
                .columns
                .tolist()
            )
            if chart_type == "Bar Chart":
            
                if not categorical_columns:
                    st.warning(
                        "A bar chart requires a categorical column."
                    )

                elif not numeric_columns:
                    st.warning(
                        "A bar chart requires a numerical column."
                    )

                else:
                
                    col1, col2 = st.columns(2)

                    with col1:
                    
                        x_column = st.selectbox(
                            "Category",
                            categorical_columns,
                        )

                    with col2:
                    
                        y_column = st.selectbox(
                            "Value",
                            numeric_columns,
                        )

                    figure = chart_engine.bar_chart(
                        x=x_column,
                        y=y_column,
                    )

                    st.plotly_chart(
                        figure,
                        use_container_width=True,
                    )
            elif chart_type == "Line Chart":
            
                x_options = (
                    datetime_columns
                    if datetime_columns
                    else all_columns
                )

                if not numeric_columns:
                
                    st.warning(
                        "A line chart requires a numerical column."
                    )

                else:
                
                    col1, col2 = st.columns(2)

                    with col1:
                    
                        x_column = st.selectbox(
                            "X-axis",
                            x_options,
                        )

                    with col2:
                    
                        y_column = st.selectbox(
                            "Y-axis",
                            numeric_columns,
                        )

                    figure = chart_engine.line_chart(
                        x=x_column,
                        y=y_column,
                    )

                    st.plotly_chart(
                        figure,
                        use_container_width=True,
                    )
            elif chart_type == "Scatter Plot":
            
                if len(numeric_columns) < 2:
                
                    st.warning(
                        "A scatter plot requires at least "
                        "two numerical columns."
                    )

                else:
                
                    col1, col2 = st.columns(2)

                    with col1:
                    
                        x_column = st.selectbox(
                            "X-axis",
                            numeric_columns,
                        )

                    with col2:
                    
                        y_column = st.selectbox(
                            "Y-axis",
                            numeric_columns,
                            index=min(
                                1,
                                len(numeric_columns) - 1,
                            ),
                        )

                    figure = chart_engine.scatter_chart(
                        x=x_column,
                        y=y_column,
                    )

                    st.plotly_chart(
                        figure,
                        use_container_width=True,
                    )

            elif chart_type == "Histogram":
            
                if not numeric_columns:
                
                    st.warning(
                        "A histogram requires a numerical column."
                    )

                else:
                
                    column = st.selectbox(
                        "Column",
                        numeric_columns,
                    )

                    figure = chart_engine.histogram(
                        column
                    )

                    st.plotly_chart(
                        figure,
                        use_container_width=True,
                    )

            elif chart_type == "Pie / Donut Chart":
            
                if not categorical_columns:
                
                    st.warning(
                        "A pie chart requires a categorical column."
                    )

                elif not numeric_columns:
                
                    st.warning(
                        "A pie chart requires a numerical column."
                    )

                else:
                
                    col1, col2 = st.columns(2)

                    with col1:
                    
                        category_column = st.selectbox(
                            "Category",
                            categorical_columns,
                        )

                    with col2:
                    
                        value_column = st.selectbox(
                            "Value",
                            numeric_columns,
                        )

                    figure = chart_engine.pie_chart(
                        names=category_column,
                        values=value_column,
                    )

                    st.plotly_chart(
                        figure,
                        use_container_width=True,
                    )
            elif chart_type == "Box Plot":
            
                if not numeric_columns:
                
                    st.warning(
                        "A box plot requires a numerical column."
                    )

                else:
                
                    y_column = st.selectbox(
                        "Numerical Column",
                        numeric_columns,
                    )

                    x_column = None

                    if categorical_columns:
                    
                        use_category = st.checkbox(
                            "Group by category",
                            value=True,
                        )

                        if use_category:
                        
                            x_column = st.selectbox(
                                "Category",
                                categorical_columns,
                            )

                    figure = chart_engine.box_plot(
                        x=x_column,
                        y=y_column,
                    )

                    st.plotly_chart(
                        figure,
                        use_container_width=True,
                    )
            elif chart_type == "Correlation Heatmap":
            
                if len(numeric_columns) < 2:
                
                    st.warning(
                        "At least two numerical columns "
                                "are required."
                            )
        
                else:
                
                    figure = (
                        chart_engine
                        .correlation_heatmap()
                    )

                    st.plotly_chart(
                        figure,
                        use_container_width=True,
                    )

        # ============================================================
        # AI INSIGHT ENGINE
        # ============================================================
        
        if st.session_state["cleaned_df"] is not None:
        
            st.divider()
        
            st.subheader("🤖 AI Insight Engine")
        
            analysis_df = (
                st.session_state["cleaned_df"]
            )
        
            try:
            
                # --------------------------------------------------------
                # Generate analytical evidence
                # --------------------------------------------------------
        
                analyzer = InsightAnalyzer(
                    analysis_df
                )
        
                evidence = (
                    analyzer.generate_evidence()
                )
        
                st.success(
                    "Analytical evidence generated successfully."
                )
        
                # --------------------------------------------------------
                # AI Insight Generation
                # --------------------------------------------------------
        
                st.subheader("🤖 AI-Powered Insights")
        
                if st.button(
                    "✨ Generate AI Insights",
                    type="primary",
                    key="generate_ai_insights",
                ):
        
                    try:
                    
                        prompt = (
                            InsightPromptBuilder
                            .build(evidence)
                        )
        
                        if not user_api_key.strip():
                        
                            st.warning(
                                "Enter your Groq API key in the sidebar "
                                "before generating AI insights."
                            )

                        else:
                        
                            try:
                            
                                prompt = (
                                    InsightPromptBuilder
                                    .build(evidence)
                                )

                                llm = GroqLLM(
                                    api_key=user_api_key.strip()
                                )

                                with st.spinner(
                                    "Analyzing dataset evidence..."
                                ):

                                    ai_response = llm.generate(
                                        prompt
                                    )

                                st.session_state[
                                    "ai_insights"
                                ] = ai_response

                                st.success(
                                    "AI insights generated successfully."
                                )

                            except Exception as exc:
                            
                                st.error(
                                    f"AI insight generation failed: {exc}"
                                )

                    except Exception as exc:
                    
                        st.error(
                            f"AI insight generation failed: {exc}"
                        )
        
                # --------------------------------------------------------
                # Display previously generated AI response
                # --------------------------------------------------------
        
                if st.session_state.get(
                    "ai_insights"
                ):
        
                    st.markdown(
                        "### 💡 AI Analysis"
                    )
        
                    st.markdown(
                        st.session_state[
                            "ai_insights"
                        ]
                    )
        
                # --------------------------------------------------------
                # Analytical Evidence
                # --------------------------------------------------------
        
                st.subheader(
                    "📊 Analytical Evidence"
                )
        
                with st.expander(
                    "Numerical Analysis"
                ):
        
                    st.json(
                        evidence[
                            "numerical_summary"
                        ]
                    )
        
                with st.expander(
                    "Categorical Analysis"
                ):
        
                    st.json(
                        evidence[
                            "categorical_summary"
                        ]
                    )
        
                with st.expander(
                    "Strong Correlations"
                ):
        
                    if evidence["correlations"]:
                    
                        st.json(
                            evidence[
                                "correlations"
                            ]
                        )
        
                    else:
                    
                        st.info(
                            "No strong correlations detected."
                        )
        
                with st.expander(
                    "Potential Outliers"
                ):
        
                    if evidence["outliers"]:
                    
                        st.json(
                            evidence[
                                "outliers"
                            ]
                        )
        
                    else:
                    
                        st.info(
                            "No significant outliers detected."
                        )
        
            except Exception as exc:
            
                st.error(
                    f"Insight analysis failed: {exc}"
                )
        
        # --------------------------------------------------------
        # Download
        # --------------------------------------------------------

        csv_data = (
            cleaned_df
            .to_csv(index=False)
            .encode("utf-8")
        )

        st.download_button(
            label="⬇️ Download Cleaned Dataset",
            data=csv_data,
            file_name="cleaned_dataset.csv",
            mime="text/csv",
        )

    # ============================================================
    # FLOATING AI CHAT ASSISTANT (bottom-left)
    # ============================================================
    if "chat_history" not in st.session_state:
        st.session_state["chat_history"] = []
    if "chat_open" not in st.session_state:
        st.session_state["chat_open"] = False

    chat_container = st.container()
    with chat_container:
        if st.button("💬 Assistant" if not st.session_state["chat_open"] else "✖ Close"):
            st.session_state["chat_open"] = not st.session_state["chat_open"]
            st.rerun()

        if st.session_state["chat_open"]:
            with st.container(border=True, height=420):
                st.markdown("**AI Assistant**")

                for msg in st.session_state["chat_history"]:
                    with st.chat_message(msg["role"]):
                        st.write(msg["content"])

                user_msg = st.chat_input("Ask something...", key="floating_chat_input")

                if user_msg:
                    st.session_state["chat_history"].append(
                        {"role": "user", "content": user_msg}
                    )
                    with st.chat_message("user"):
                        st.write(user_msg)

                    with st.chat_message("assistant"):
                        st.caption("Thinking...")
                        thinking_box = st.empty()
                        answer_box = st.empty()

                        active_key = user_api_key or None
                        if not active_key:
                            answer_box.write(
                                "Enter your Groq API key in the sidebar first."
                            )
                        else:
                            full_text = ""
                            for token in stream_chat(active_key, user_msg):
                                full_text += token
                                think_start = full_text.find("<thinking>")
                                think_end = full_text.find("</thinking>")

                                if think_start != -1 and think_end == -1:
                                    thinking_box.markdown(
                                        f"_{full_text[think_start + 10:]}_"
                                    )
                                elif think_end != -1:
                                    thinking_box.markdown(
                                        f"_{full_text[think_start + 10:think_end]}_"
                                    )
                                    answer_box.markdown(
                                        full_text[think_end + 11:].strip()
                                    )

                            final_answer = (
                                full_text.split("</thinking>")[-1].strip()
                                if "</thinking>" in full_text
                                else full_text
                            )
                            st.session_state["chat_history"].append(
                                {"role": "assistant", "content": final_answer}
                            )

    chat_container.float(
        "position: fixed; bottom: 20px; left: 20px; width: 380px; "
        "z-index: 999;"
    )

if __name__ == "__main__":
    main()