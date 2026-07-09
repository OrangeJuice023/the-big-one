"""Train quantile loss models (P10 / P50 / P90) on historical earthquake losses.

Model: LightGBM with objective='quantile' at alpha = 0.1, 0.5, 0.9.
Baseline: ordinary least squares on [magnitude] — the models must beat this
on the temporal holdout or something is wrong.

Run:  python -m src.train        (from the model/ directory)
Writes: models/lgbm_q{10,50,90}.txt and models/metrics.json
"""

from __future__ import annotations

import json
from pathlib import Path

import lightgbm as lgb
import numpy as np
import pandas as pd

DATA = Path(__file__).resolve().parents[1] / "data" / "processed" / "training_events.csv"
MODELS = Path(__file__).resolve().parents[1] / "models"

FEATURES = ["magnitude", "depth_km", "max_intensity", "year"]
TARGET = "log10_loss"
QUANTILES = {0.1: "q10", 0.5: "q50", 0.9: "q90"}
HOLDOUT_YEAR = 2010  # temporal split: train < 2010, test >= 2010

PARAMS = dict(
    objective="quantile",
    metric="quantile",
    learning_rate=0.05,
    num_leaves=15,          # small: we have ~1-3k rows, keep it regularized
    min_data_in_leaf=25,
    feature_fraction=0.9,
    bagging_fraction=0.8,
    bagging_freq=1,
    verbosity=-1,
    seed=42,
)


def pinball(y: np.ndarray, pred: np.ndarray, alpha: float) -> float:
    diff = y - pred
    return float(np.mean(np.maximum(alpha * diff, (alpha - 1) * diff)))


def main() -> None:
    df = pd.read_csv(DATA)
    train = df[df["year"] < HOLDOUT_YEAR]
    test = df[df["year"] >= HOLDOUT_YEAR]
    print(f"train: {len(train)} events (<{HOLDOUT_YEAR}), test: {len(test)} events")

    X_tr, y_tr = train[FEATURES], train[TARGET]
    X_te, y_te = test[FEATURES], test[TARGET]

    MODELS.mkdir(exist_ok=True)
    metrics: dict = {"holdout_year": HOLDOUT_YEAR, "n_train": len(train), "n_test": len(test)}

    # Baseline: OLS on magnitude only (median proxy).
    slope, intercept = np.polyfit(train["magnitude"], y_tr, 1)
    base_pred = slope * test["magnitude"] + intercept
    metrics["baseline_ols_magnitude"] = {
        "mae_log10": float(np.mean(np.abs(y_te - base_pred))),
        "pinball_50": pinball(y_te.values, base_pred.values, 0.5),
    }

    preds = {}
    for alpha, tag in QUANTILES.items():
        booster = lgb.train(
            {**PARAMS, "alpha": alpha},
            lgb.Dataset(X_tr, label=y_tr),
            num_boost_round=400,
            valid_sets=[lgb.Dataset(X_te, label=y_te)],
            callbacks=[lgb.early_stopping(50, verbose=False)],
        )
        booster.save_model(str(MODELS / f"lgbm_{tag}.txt"))
        p = booster.predict(X_te)
        preds[alpha] = p
        metrics[f"lgbm_{tag}"] = {
            "pinball": pinball(y_te.values, p, alpha),
            "best_iteration": booster.best_iteration,
        }

    metrics["lgbm_q50"]["mae_log10"] = float(np.mean(np.abs(y_te.values - preds[0.5])))
    coverage = float(np.mean((y_te.values >= preds[0.1]) & (y_te.values <= preds[0.9])))
    metrics["p10_p90_empirical_coverage"] = coverage  # want roughly 0.8

    with open(MODELS / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print(json.dumps(metrics, indent=2))

    if metrics["lgbm_q50"]["mae_log10"] >= metrics["baseline_ols_magnitude"]["mae_log10"]:
        print("\nWARNING: LightGBM did not beat the magnitude-only baseline. "
              "Investigate features/cleaning before using these models.")


if __name__ == "__main__":
    main()
