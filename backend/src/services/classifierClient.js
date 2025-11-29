const axios = require('axios');

const FALLBACK_RULES = [
  {
    keywords: ['urgent', 'critical', 'outage', 'bug', 'failure'],
    priority: 'high',
    status: 'progress',
  },
  {
    keywords: ['investigate', 'implement', 'draft', 'design', 'review'],
    priority: 'medium',
    status: 'progress',
  },
  {
    keywords: ['cleanup', 'refactor', 'document', 'research'],
    priority: 'low',
    status: 'todo',
  },
];

function fallbackPredict(description) {
  const text = description.toLowerCase();
  for (const rule of FALLBACK_RULES) {
    if (rule.keywords.some((word) => text.includes(word))) {
      return { priority: rule.priority, status: rule.status, source: 'fallback' };
    }
  }
  return { priority: 'medium', status: 'todo', source: 'fallback-default' };
}

async function classify(description, url) {
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    console.warn('Invalid description provided, using fallback');
    return fallbackPredict(description || '');
  }

  if (!url) {
    console.warn('CLASSIFIER_URL missing, using fallback heuristics.');
    return fallbackPredict(description);
  }

  try {
    const response = await axios.post(
      url,
      { description: description.trim() },
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Validate response structure
    if (response.data && typeof response.data === 'object') {
      const result = {
        priority: response.data.priority || 'medium',
        status: response.data.status || 'todo',
        source: response.data.source || 'classifier',
      };
      // Preserve confidence scores if present
      if (response.data.confidence !== undefined) {
        result.confidence = response.data.confidence;
      }
      if (response.data.priority_confidence !== undefined) {
        result.priority_confidence = response.data.priority_confidence;
      }
      if (response.data.status_confidence !== undefined) {
        result.status_confidence = response.data.status_confidence;
      }
      return result;
    }

    throw new Error('Invalid response format from classifier');
  } catch (error) {
    if (error.response) {
      console.error('Classifier service error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Classifier service unavailable (no response):', error.message);
    } else {
      console.error('Classifier request error:', error.message);
    }
    return fallbackPredict(description);
  }
}

module.exports = {
  classify,
};


