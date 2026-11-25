import pandas as pd


class CropPreprocessor:

    FEATURES = [
        "N",
        "P",
        "K",
        "temperature",
        "humidity",
        "ph",
        "rainfall",
    ]

    @staticmethod
    def preprocess(
        nitrogen: float,
        phosphorus: float,
        potassium: float,
        temperature: float,
        humidity: float,
        ph: float,
        rainfall: float,
    ) -> pd.DataFrame:
        return pd.DataFrame(
            [[
                nitrogen,
                phosphorus,
                potassium,
                temperature,
                humidity,
                ph,
                rainfall,
            ]],
            columns=CropPreprocessor.FEATURES,
        )
