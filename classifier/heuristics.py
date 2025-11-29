"""Keyword fallback for classifier service with confidence scoring."""

# Rules with weights: (keywords, (priority, status), weight)
# Higher weight = higher confidence
RULES = [
    # High priority keywords (weight 0.9)
    (['crash', 'outage', 'urgent', 'critical', 'emergency', 'asap', 'immediate', 'security vulnerability'], ('high', 'progress'), 0.9),
    (['critical bug', 'critical issue', 'critical fix', 'urgent fix', 'emergency fix'], ('high', 'progress'), 0.95),
    (['payment bug', 'payment fail', 'checkout bug', 'authentication bug'], ('high', 'todo'), 0.85),
    
    # Medium priority keywords (weight 0.7-0.8)
    (['implement', 'develop', 'building', 'creating', 'working on', 'developing'], ('medium', 'progress'), 0.8),
    (['design', 'draft', 'spec', 'review', 'testing', 'test', 'qa', 'verify'], ('medium', 'progress'), 0.75),
    (['refactor', 'update', 'improve', 'optimize', 'investigate'], ('medium', 'progress'), 0.7),
    (['plan', 'planning', 'review', 'update documentation'], ('medium', 'todo'), 0.7),
    
    # Low priority keywords (weight 0.6-0.7)
    (['idea', 'research', 'explore', 'exploring', 'later', 'someday', 'future'], ('low', 'todo'), 0.7),
    (['cleanup', 'clean up', 'organize', 'organizing'], ('low', 'todo'), 0.65),
    (['docs', 'document', 'documentation', 'write notes', 'release notes'], ('low', 'todo'), 0.6),
    
    # Completion keywords (weight 0.9)
    (['done', 'completed', 'finished', 'resolved', 'closed', 'fixed'], ('medium', 'done'), 0.9),
    (['completed', 'finished implementing', 'resolved issue'], ('high', 'done'), 0.85),
    (['completed research', 'finished documentation'], ('low', 'done'), 0.8),
]

# Status-specific keywords
STATUS_KEYWORDS = {
    'progress': ['working on', 'implementing', 'developing', 'building', 'testing', 'reviewing', 'fixing'],
    'done': ['done', 'completed', 'finished', 'resolved', 'closed', 'fixed', 'deployed'],
    'todo': ['plan', 'planning', 'need to', 'should', 'will', 'todo', 'task'],
}

# Priority-specific keywords
PRIORITY_KEYWORDS = {
    'high': ['urgent', 'critical', 'emergency', 'asap', 'immediate', 'important', 'bug', 'error', 'fail', 'crash', 'outage'],
    'medium': ['implement', 'develop', 'design', 'update', 'improve', 'review'],
    'low': ['research', 'explore', 'idea', 'plan', 'cleanup', 'documentation', 'later'],
}


def calculate_confidence(matches, total_keywords):
    """Calculate confidence score based on keyword matches."""
    if total_keywords == 0:
        return 0.5  # Default confidence
    
    match_ratio = matches / total_keywords
    # Scale confidence: 0.5 (low) to 0.95 (high)
    return min(0.5 + (match_ratio * 0.45), 0.95)


def heuristic_predict(description: str):
    """Return (priority, status, confidence) based on weighted keyword matching."""
    if not description or not isinstance(description, str):
        return {
            'priority': 'medium',
            'status': 'todo',
            'source': 'heuristic-default',
            'confidence': 0.5
        }

    text = description.lower().strip()
    words = text.split()
    
    # Track matches and weights
    priority_scores = {'high': 0, 'medium': 0, 'low': 0}
    status_scores = {'todo': 0, 'progress': 0, 'done': 0}
    matched_rules = []
    
    # Check completion keywords first (highest priority)
    completion_keywords = ['done', 'completed', 'finished', 'resolved', 'closed', 'fixed']
    if any(keyword in text for keyword in completion_keywords):
        status_scores['done'] += 0.9
        matched_rules.append(('completion', 0.9))
    
    # Apply weighted rules
    for keywords, (priority, status), weight in RULES:
        matches = sum(1 for keyword in keywords if keyword in text)
        if matches > 0:
            priority_scores[priority] += weight * matches
            status_scores[status] += weight * matches
            matched_rules.append((f"{priority}-{status}", weight * matches))
    
    # Check status-specific keywords
    for status, keywords in STATUS_KEYWORDS.items():
        matches = sum(1 for keyword in keywords if keyword in text)
        if matches > 0:
            status_scores[status] += 0.3 * matches
    
    # Check priority-specific keywords
    for priority, keywords in PRIORITY_KEYWORDS.items():
        matches = sum(1 for keyword in keywords if keyword in text)
        if matches > 0:
            priority_scores[priority] += 0.3 * matches
    
    # Determine final priority and status
    final_priority = max(priority_scores, key=priority_scores.get)
    final_status = max(status_scores, key=status_scores.get)
    
    # Calculate confidence based on match strength
    total_priority_score = sum(priority_scores.values())
    total_status_score = sum(status_scores.values())
    
    if total_priority_score == 0:
        final_priority = 'medium'
        priority_confidence = 0.5
    else:
        priority_confidence = min(priority_scores[final_priority] / max(total_priority_score, 1), 0.95)
    
    if total_status_score == 0:
        final_status = 'todo'
        status_confidence = 0.5
    else:
        status_confidence = min(status_scores[final_status] / max(total_status_score, 1), 0.95)
    
    # Overall confidence is average of priority and status confidence
    overall_confidence = (priority_confidence + status_confidence) / 2
    
    # Ensure minimum confidence
    overall_confidence = max(overall_confidence, 0.5)
    
    return {
        'priority': final_priority,
        'status': final_status,
        'source': 'heuristic',
        'confidence': round(overall_confidence, 2)
    }


