# Economic Forecasting Model
## Section 4: Machine Learning Model Design & Implementation

---

### 4.1 Problem Formulation
Economic forecasting is modeled as a **supervised time-series regression problem**.
- **Input**: Multivariate time-series sequence.
- **Output**: Forecasted value(s) over a defined horizon.

### 4.2 Model Selection
- **Baseline**: ARIMA / SARIMA, Linear Regression.
- **Production**: LSTM (Long Short-Term Memory), GRU (Gated Recurrent Units), Transformers.

---

### 4.3 Architecture: LSTM
LSTM is preferred for macroeconomic data due to its stability on lower-frequency series.
1. Input layer (time window × features).
2. 1–3 stacked LSTM layers.
3. Dropout for regularization.
4. Dense output layer.

---

### 4.4 Training Strategy
- Chronological train/validation/test split.
- No shuffling of time-series data.
- Loss: MSE (Mean Squared Error) or MAE (Mean Absolute Error).
- Optimizer: Adam.
