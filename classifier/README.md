## Classifier Service

Production-ready Flask API that predicts task priority and status using a trained sklearn model with intelligent keyword-based heuristics as fallback.

### Features

- **ML Model**: Trained on 100+ realistic examples covering all priority/status combinations
- **Confidence Scoring**: Returns confidence scores for both model and heuristic predictions
- **Smart Fallback**: Automatically switches between ML model and heuristics
- **Weighted Heuristics**: Enhanced keyword matching with confidence scoring
- **Robust Error Handling**: Comprehensive validation and error recovery
- **Training Validation**: Model training includes accuracy metrics and validation splits

### Setup

```bash
cd classifier
python -m venv .venv
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### Train the Model

```bash
python train.py
```

This will:
- Train on 100+ realistic examples
- Show accuracy metrics and classification reports
- Save `model/classifier.pkl` with metadata
- Suppress warnings for clean output

The API automatically falls back to `heuristics.py` if the model file is missing or invalid.

### Run the Service

```bash
python app.py
```

The Flask app listens on `http://localhost:5000` (configurable via `PORT` env var).

### API Endpoints

#### POST /predict
Classify a task description.

**Request:**
```json
{
  "description": "Server is down, urgent fix needed"
}
```

**Response:**
```json
{
  "priority": "high",
  "status": "progress",
  "source": "model",
  "confidence": 0.87,
  "priority_confidence": 0.89,
  "status_confidence": 0.85
}
```

**Sources:**
- `model`: ML model prediction
- `heuristic`: Keyword-based fallback
- `error-fallback`: Error recovery fallback

#### GET /health
Check service health and model status.

**Response:**
```json
{
  "status": "ok",
  "modelLoaded": true,
  "modelPath": "/path/to/model/classifier.pkl"
}
```

#### GET /
API information and available endpoints.

### Predict Manually

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"description":"Server is down, urgent"}'
```

### Environment Variables

- `PORT`: Flask server port (default: 5000)
- `FLASK_ENV`: Flask environment (development/production)

### Model Training Details

The training pipeline:
- Uses 80/20 train/test split with stratification
- TF-IDF vectorization with n-grams (1-2)
- Logistic Regression with multinomial classification
- Reports accuracy and classification metrics
- Validates all training examples

### Heuristics Fallback

When the ML model is unavailable, the service uses intelligent keyword matching:
- Weighted keyword rules with confidence scoring
- Priority-specific and status-specific keyword detection
- Handles edge cases and empty inputs gracefully
- Returns confidence scores for transparency


