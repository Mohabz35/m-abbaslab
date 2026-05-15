# Economic Forecasting Model
## Section 5: Statistical Validation & Accuracy Assessment

---

### 5.1 Validation Philosophy
Validation is treated as a **scientific process**, not just a metric. Accuracy claims (e.g., 95%) must be metric-specific and time-horizon-specific.

### 5.2 Evaluation Metrics
- **RMSE** (Root Mean Squared Error)
- **MAE** (Mean Absolute Error)
- **MAPE** (Mean Absolute Percentage Error)
- **R² Score**

---

### 5.3 Backtesting Strategy
The system uses **rolling-origin backtesting**.
1. Train on historical data until time $T$.
2. Predict future window $[T+1, T+H]$.
3. Slide forward to $T+1$ and repeat.

### 5.4 Confidence Intervals
Prediction uncertainty is estimated using:
- Residual analysis
- Monte Carlo dropout
- Quantile regression
Confidence bands are included in all outputs.
