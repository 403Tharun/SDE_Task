import os
import warnings
from pathlib import Path

from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]
from flask import Flask, jsonify, request  # pyright: ignore[reportMissingImports]
from flask_cors import CORS  # pyright: ignore[reportMissingImports]
import joblib  # pyright: ignore[reportMissingImports]
import numpy as np  # pyright: ignore[reportMissingImports]

from heuristics import heuristic_predict

# Suppress warnings
warnings.filterwarnings('ignore')

BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "model" / "classifier.pkl"

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


def load_model():
    """Load the trained model with validation."""
    if not MODEL_PATH.exists():
        app.logger.warning("Model file not found at %s, using heuristics only.", MODEL_PATH)
        return None
    
    try:
        model = joblib.load(MODEL_PATH)
        
        # Validate model structure
        if not isinstance(model, dict):
            app.logger.error("Invalid model structure: expected dict, got %s", type(model))
            return None
        
        if "priority" not in model or "status" not in model:
            app.logger.error("Invalid model structure: missing 'priority' or 'status' keys")
            return None
        
        # Test model with a simple prediction
        try:
            test_text = "test"
            _ = model["priority"].predict([test_text])
            _ = model["status"].predict([test_text])
        except Exception as test_exc:
            app.logger.error("Model validation failed: %s", test_exc)
            return None
        
        app.logger.info("✓ Loaded classifier model successfully from %s", MODEL_PATH)
        return model
        
    except Exception as exc:
        app.logger.error("Failed to load model: %s", exc, exc_info=True)
        return None


MODEL = load_model()


def get_prediction_confidence(model_pipeline, text: str):
    """Calculate prediction confidence using predict_proba."""
    try:
        # Get probability distribution
        proba = model_pipeline.predict_proba([text])[0]
        # Confidence is the maximum probability
        confidence = float(np.max(proba))
        return round(confidence, 2)
    except Exception:
        # Fallback confidence if predict_proba fails
        return 0.7


def predict_with_model(text: str):
    """Predict using ML model with fallback to heuristics."""
    if not MODEL:
        return heuristic_predict(text)
    
    try:
        # Validate input
        if not text or not isinstance(text, str) or len(text.strip()) == 0:
            app.logger.warning("Invalid input text, using heuristics")
            return heuristic_predict(text)
        
        text = text.strip()
        
        # Get predictions
        priority = MODEL["priority"].predict([text])[0]
        status = MODEL["status"].predict([text])[0]
        
        # Validate predictions
        valid_priorities = {'high', 'medium', 'low'}
        valid_statuses = {'todo', 'progress', 'done'}
        
        if priority not in valid_priorities:
            app.logger.warning("Invalid priority prediction: %s, using heuristics", priority)
            return heuristic_predict(text)
        
        if status not in valid_statuses:
            app.logger.warning("Invalid status prediction: %s, using heuristics", status)
            return heuristic_predict(text)
        
        # Calculate confidence scores
        priority_confidence = get_prediction_confidence(MODEL["priority"], text)
        status_confidence = get_prediction_confidence(MODEL["status"], text)
        overall_confidence = round((priority_confidence + status_confidence) / 2, 2)
        
        return {
            "priority": priority,
            "status": status,
            "source": "model",
            "confidence": overall_confidence,
            "priority_confidence": priority_confidence,
            "status_confidence": status_confidence
        }
        
    except Exception as exc:
        app.logger.error("Model prediction failed: %s", exc, exc_info=True)
        # Fallback to heuristics
        return heuristic_predict(text)


@app.post("/predict")
def predict():
    """Predict task priority and status from description."""
    try:
        # Parse request body
        if not request.is_json:
            return jsonify({
                "error": "Content-Type must be application/json",
                "message": "Invalid request format"
            }), 400
        
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({
                "error": "Invalid JSON in request body",
                "message": "Could not parse JSON"
            }), 400
        
        description = data.get("description", "")
        
        # Validate description
        if not description:
            return jsonify({
                "error": "Missing required field",
                "message": "description is required"
            }), 400
        
        if not isinstance(description, str):
            return jsonify({
                "error": "Invalid field type",
                "message": "description must be a string"
            }), 400
        
        if len(description.strip()) == 0:
            return jsonify({
                "error": "Empty description",
                "message": "description cannot be empty"
            }), 400

        # Get prediction
        result = predict_with_model(description.strip())
        
        # Ensure result has required fields with defaults
        result.setdefault("priority", "medium")
        result.setdefault("status", "todo")
        result.setdefault("source", "heuristic")
        result.setdefault("confidence", 0.5)
        
        # Validate result values
        valid_priorities = {'high', 'medium', 'low'}
        valid_statuses = {'todo', 'progress', 'done'}
        
        if result["priority"] not in valid_priorities:
            app.logger.warning("Invalid priority in result: %s, defaulting to medium", result["priority"])
            result["priority"] = "medium"
        
        if result["status"] not in valid_statuses:
            app.logger.warning("Invalid status in result: %s, defaulting to todo", result["status"])
            result["status"] = "todo"
        
        # Ensure confidence is a number
        if not isinstance(result.get("confidence"), (int, float)):
            result["confidence"] = 0.5
        
        app.logger.debug("Prediction: %s -> priority=%s, status=%s, source=%s, confidence=%.2f",
                        description[:50], result["priority"], result["status"], 
                        result["source"], result["confidence"])
        
        return jsonify(result), 200
        
    except Exception as exc:
        app.logger.error("Error in /predict endpoint: %s", exc, exc_info=True)
        # Return safe fallback response
        return jsonify({
            "priority": "medium",
            "status": "todo",
            "source": "error-fallback",
            "confidence": 0.5,
            "error": "Internal server error"
        }), 500


@app.get("/health")
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "modelLoaded": MODEL is not None,
        "modelPath": str(MODEL_PATH) if MODEL_PATH.exists() else None
    }), 200


@app.get("/")
def root():
    """Root endpoint with API information."""
    return jsonify({
        "service": "Task Classifier API",
        "version": "1.0.0",
        "endpoints": {
            "POST /predict": "Classify task description",
            "GET /health": "Health check"
        },
        "modelLoaded": MODEL is not None
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.logger.info("Starting classifier service on port %d", port)
    app.logger.info("Model loaded: %s", MODEL is not None)
    app.run(host="0.0.0.0", port=port, debug=True)


