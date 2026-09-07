from pathlib import Path

import pandas as pd


SUPPORTED_EXTENSIONS = {".csv", ".xlsx", ".json"}


class DatasetLoader:
    """Load supported dataset formats into a Pandas DataFrame."""

    @staticmethod
    def _get_filename(file) -> str:
        if hasattr(file, "name"):
            return file.name
        elif isinstance(file, (str, Path)):
            return Path(file).name
        return "uploaded_file"

    @staticmethod
    def validate_file(file) -> None:
        """Validate that the uploaded file uses a supported format."""
        if file is None:
            raise ValueError("No file was uploaded.")

        filename = DatasetLoader._get_filename(file)
        extension = Path(filename).suffix.lower()

        if extension not in SUPPORTED_EXTENSIONS:
            supported = ", ".join(sorted(SUPPORTED_EXTENSIONS))
            raise ValueError(
                f"Unsupported file format: {extension}. "
                f"Supported formats: {supported}"
            )

    @staticmethod
    def load(file) -> pd.DataFrame:
        """Load the uploaded file into a DataFrame."""
        DatasetLoader.validate_file(file)

        filename = DatasetLoader._get_filename(file)
        extension = Path(filename).suffix.lower()

        try:
            if extension == ".csv":
                try:
                    df = pd.read_csv(file)
                except UnicodeDecodeError:
                    if hasattr(file, "seek"):
                        file.seek(0)
                    df = pd.read_csv(file, encoding="latin1")

            elif extension == ".xlsx":
                df = pd.read_excel(file)

            elif extension == ".json":
                df = pd.read_json(file)

            else:
                raise ValueError(f"Unsupported file format: {extension}")

        except Exception as exc:
            raise ValueError(
                f"Unable to read the dataset: {exc}"
            ) from exc

        if df.empty:
            raise ValueError("The uploaded dataset is empty.")

        return df