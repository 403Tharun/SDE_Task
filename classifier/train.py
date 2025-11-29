import json
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Suppress warnings
warnings.filterwarnings('ignore')

# Expanded realistic training dataset covering all combinations
DATASET = [
    # High Priority - Progress
    ("Server outage impacting all clients", "high", "progress"),
    ("Critical payment bug fails for EU customers", "high", "progress"),
    ("Customer escalation needs immediate fix", "high", "progress"),
    ("Deploy hotfix for login authentication", "high", "progress"),
    ("Database connection timeout causing errors", "high", "progress"),
    ("API rate limit exceeded breaking integrations", "high", "progress"),
    ("Security vulnerability in user authentication", "high", "progress"),
    ("Memory leak causing server crashes", "high", "progress"),
    ("Critical bug in checkout process", "high", "progress"),
    ("Emergency fix for data loss issue", "high", "progress"),
    
    # High Priority - Todo
    ("Urgent: Fix payment processing bug", "high", "todo"),
    ("Critical: Address security vulnerability", "high", "todo"),
    ("High priority: Resolve database performance issue", "high", "todo"),
    ("Emergency: Fix customer data export failure", "high", "todo"),
    ("Critical bug in order processing system", "high", "todo"),
    ("Urgent fix needed for API authentication", "high", "todo"),
    ("High priority task: Fix memory leak", "high", "todo"),
    ("Critical issue: Server downtime prevention", "high", "todo"),
    ("Urgent: Resolve payment gateway integration", "high", "todo"),
    ("Critical: Fix data synchronization bug", "high", "todo"),
    
    # High Priority - Done
    ("Fixed critical server outage", "high", "done"),
    ("Resolved payment processing bug", "high", "done"),
    ("Completed emergency security patch", "high", "done"),
    ("Fixed database connection timeout", "high", "done"),
    ("Resolved critical authentication issue", "high", "done"),
    
    # Medium Priority - Progress
    ("Draft product requirements for Q2", "medium", "progress"),
    ("Implement new user dashboard", "medium", "progress"),
    ("Working on analytics feature", "medium", "progress"),
    ("Developing email notification system", "medium", "progress"),
    ("Building user profile page", "medium", "progress"),
    ("Implementing search functionality", "medium", "progress"),
    ("Designing new UI components", "medium", "progress"),
    ("Reviewing code for pull request", "medium", "progress"),
    ("Testing new feature integration", "medium", "progress"),
    ("Updating API documentation", "medium", "progress"),
    ("Investigating analytics spike", "medium", "progress"),
    ("Working on performance optimization", "medium", "progress"),
    ("Developing new API endpoint", "medium", "progress"),
    ("Implementing caching strategy", "medium", "progress"),
    ("Building automated test suite", "medium", "progress"),
    
    # Medium Priority - Todo
    ("Refactor onboarding code", "medium", "todo"),
    ("Plan migration to new database", "medium", "todo"),
    ("Review and update dependencies", "medium", "todo"),
    ("QA regression checklist", "medium", "todo"),
    ("Update user documentation", "medium", "todo"),
    ("Plan sprint for next quarter", "medium", "todo"),
    ("Design new feature architecture", "medium", "todo"),
    ("Review code quality metrics", "medium", "todo"),
    ("Plan API versioning strategy", "medium", "todo"),
    ("Update deployment scripts", "medium", "todo"),
    ("Plan user onboarding flow", "medium", "todo"),
    ("Review security audit findings", "medium", "todo"),
    ("Plan database migration", "medium", "todo"),
    ("Design new notification system", "medium", "todo"),
    ("Plan feature rollout strategy", "medium", "todo"),
    
    # Medium Priority - Done
    ("Completed user dashboard implementation", "medium", "done"),
    ("Finished analytics feature", "medium", "done"),
    ("Completed email notification system", "medium", "done"),
    ("Finished code refactoring", "medium", "done"),
    ("Completed API documentation update", "medium", "done"),
    ("Finished performance optimization", "medium", "done"),
    ("Completed test suite implementation", "medium", "done"),
    
    # Low Priority - Progress
    ("Researching new caching strategy", "low", "progress"),
    ("Exploring new UI framework options", "low", "progress"),
    ("Testing experimental feature", "low", "progress"),
    ("Working on code cleanup", "low", "progress"),
    ("Reviewing old documentation", "low", "progress"),
    
    # Low Priority - Todo
    ("Write release notes", "low", "todo"),
    ("Cleanup CSS debt", "low", "todo"),
    ("Research new technology stack", "low", "todo"),
    ("Plan future feature ideas", "low", "todo"),
    ("Update old documentation", "low", "todo"),
    ("Clean up unused code", "low", "todo"),
    ("Organize project files", "low", "todo"),
    ("Review old pull requests", "low", "todo"),
    ("Plan team building activity", "low", "todo"),
    ("Update personal development goals", "low", "todo"),
    ("Research best practices", "low", "todo"),
    ("Plan code review process", "low", "todo"),
    ("Explore new tools", "low", "todo"),
    ("Plan documentation structure", "low", "todo"),
    ("Review coding standards", "low", "todo"),
    
    # Low Priority - Done
    ("Completed release notes", "low", "done"),
    ("Finished CSS cleanup", "low", "done"),
    ("Completed documentation update", "low", "done"),
    ("Finished code organization", "low", "done"),
    ("Completed research on new tools", "low", "done"),
]

BASE_DIR = Path(__file__).parent
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "classifier.pkl"


def build_dataset():
    """Build DataFrame from training dataset with validation."""
    records = []
    valid_priorities = {'high', 'medium', 'low'}
    valid_statuses = {'todo', 'progress', 'done'}
    
    for desc, priority, status in DATASET:
        # Validate labels
        if priority not in valid_priorities:
            warnings.warn(f"Invalid priority '{priority}' in dataset, skipping")
            continue
        if status not in valid_statuses:
            warnings.warn(f"Invalid status '{status}' in dataset, skipping")
            continue
        if not desc or not isinstance(desc, str) or len(desc.strip()) == 0:
            warnings.warn(f"Invalid description in dataset, skipping")
            continue
            
        records.append({
            "description": desc.strip(),
            "priority": priority,
            "status": status
        })
    
    df = pd.DataFrame(records)
    
    # Validate dataset balance
    priority_counts = df['priority'].value_counts()
    status_counts = df['status'].value_counts()
    
    print(f"\nDataset Statistics:")
    print(f"Total samples: {len(df)}")
    print(f"Priority distribution:\n{priority_counts}")
    print(f"Status distribution:\n{status_counts}")
    
    return df


def train_priority_model(df: pd.DataFrame):
    """Train priority classification model with validation."""
    X = df["description"]
    y = df["priority"]
    
    # Split for validation (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95
        )),
        ("clf", LogisticRegression(
            max_iter=2000,
            random_state=42,
            solver='lbfgs',
            multi_class='multinomial'
        )),
    ])
    
    print("\nTraining priority model...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Priority model accuracy: {accuracy:.3f}")
    print("\nPriority Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))
    
    return pipeline


def train_status_model(df: pd.DataFrame):
    """Train status classification model with validation."""
    X = df["description"]
    y = df["status"]
    
    # Split for validation (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95
        )),
        ("clf", LogisticRegression(
            max_iter=2000,
            random_state=42,
            solver='lbfgs',
            multi_class='multinomial'
        )),
    ])
    
    print("\nTraining status model...")
    pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Status model accuracy: {accuracy:.3f}")
    print("\nStatus Classification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))
    
    return pipeline


def main():
    """Main training function."""
    print("=" * 60)
    print("Training Task Classifier Model")
    print("=" * 60)
    
    df = build_dataset()
    
    if len(df) == 0:
        raise ValueError("No valid training samples found!")
    
    MODEL_DIR.mkdir(exist_ok=True)

    # Train models
    priority_model = train_priority_model(df)
    status_model = train_status_model(df)
    
    model = {
        "priority": priority_model,
        "status": status_model,
    }

    # Save model
    joblib.dump(model, MODEL_PATH)
    
    # Save metadata
    metadata = {
        "samples": len(df),
        "priority_distribution": df['priority'].value_counts().to_dict(),
        "status_distribution": df['status'].value_counts().to_dict(),
        "version": "1.0.0"
    }
    
    (MODEL_DIR / "label_info.json").write_text(
        json.dumps(metadata, indent=2), encoding="utf-8"
    )
    
    print("\n" + "=" * 60)
    print(f"✓ Model saved to {MODEL_PATH}")
    print(f"✓ Metadata saved to {MODEL_DIR / 'label_info.json'}")
    print("=" * 60)


if __name__ == "__main__":
    main()


