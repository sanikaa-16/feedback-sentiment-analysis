const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const admin = require('firebase-admin');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
app.use(bodyParser.json());

// OpenAI Setup
const openai = new OpenAI({
  apiKey: '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'
});
openai.baseURL = 'https://api.groq.com/openai/v1';

// Firebase setup
const serviceAccount = require('/Users/sanikakamath/Downloads/feedback-server/service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Helper to extract JSON from response
function extractJSONFromText(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        throw new Error('Could not parse valid JSON from response');
      }
    }
    throw new Error('No JSON structure found in response');
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Feedback Sentiment Analysis API' });
});

app.get('/test', (req, res) => {
  res.json({ status: 'Server is running properly' });
});

// Analyze feedback
app.post('/analyze', async (req, res) => {
  console.log('📩 Received feedback:', req.body);
  const { firstName, lastName, email, feedback, rating } = req.body;

  if (!firstName || !email || !feedback || !rating) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Spam Detection
    const spamPrompt = `
Classify the following user feedback as spam or not. Respond ONLY in JSON like this:

{
  "isSpam": true or false,
  "reason": "brief reason"
}

Feedback: "${feedback}"
`;

    const spamResponse = await openai.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are a moderation assistant. Return ONLY a valid JSON object as instructed.' },
        { role: 'user', content: spamPrompt }
      ],
      temperature: 0.2,
      max_tokens: 100
    });

    let spamResult;
    try {
      spamResult = extractJSONFromText(spamResponse.choices[0].message.content.trim());
      console.log('📌 Spam Detection Result:', spamResult); // Logging spam result here
    } catch (e) {
      console.error('🚨 Failed to parse spam detection result');
      return res.status(500).json({ error: 'Spam check failed' });
    }

    if (spamResult.isSpam) {
      console.warn('❌ Feedback flagged as spam:', spamResult);
      return res.status(403).json({
        message: 'Your feedback was flagged as spam and was not recorded.',
        ...spamResult
      });
    }

    // Sentiment Analysis
    const sentimentResponse = await openai.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis assistant. Respond with only one word: Positive, Negative, or Neutral.'
        },
        {
          role: 'user',
          content: `Analyze the sentiment of this feedback: "${feedback}"`
        }
      ],
      max_tokens: 10,
      temperature: 0.3
    });

    const sentiment = sentimentResponse.choices[0].message.content.trim();
    if (!['Positive', 'Negative', 'Neutral'].includes(sentiment)) {
      throw new Error('Invalid sentiment response');
    }

    // Category Classification
    const categoryPrompt = `
Classify the following feedback into one of these categories:
- UI
- Performance
- Feature Request
- Bug
- Content
- Product Design
- Customer Care
- Update
- Other

Return only a JSON like:
{
  "category": "..."
}

Feedback: "${feedback}"
`;

    const categoryResponse = await openai.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are a classification assistant. Return ONLY a JSON object as instructed.' },
        { role: 'user', content: categoryPrompt }
      ],
      temperature: 0.3,
      max_tokens: 30
    });

    let category;
    try {
      const categoryResult = extractJSONFromText(categoryResponse.choices[0].message.content.trim());
      category = categoryResult.category;
    } catch (e) {
      console.error('❌ Failed to parse category response');
      category = 'Other';
    }

    // Suggestions
    const suggestionPrompt = `
Analyze the following feedback and provide suggestions in JSON format:
Sentiment: ${sentiment}
Feedback: "${feedback}"

Return ONLY a JSON object in this exact format (no other text):
{
  "developerSuggestion": "Actionable suggestion for internal use, like what to fix or improve",
  "suggestion": "Polite and empathetic response for the user based on the sentiment and feedback and don't ask any further questions."
}`;

    const suggestionResponse = await openai.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only response bot. Only output valid JSON objects, no other text.'
        },
        {
          role: 'user',
          content: suggestionPrompt
        }
      ],
      temperature: 0.5,
      max_tokens: 150
    });

    const rawOutput = suggestionResponse.choices[0].message.content.trim();
    let suggestions;

    try {
      suggestions = extractJSONFromText(rawOutput);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', rawOutput);
      suggestions = {
        developerSuggestion: 'Review LLM response formatting - JSON parsing failed',
        suggestion: 'Thank you for your feedback. We will review it carefully.'
      };
    }

    if (!suggestions.developerSuggestion || !suggestions.suggestion) {
      throw new Error('Invalid suggestion format from LLM');
    }

    // Store in Firebase
    const feedbackData = {
      firstName,
      lastName,
      email,
      feedback,
      rating,
      sentiment,
      category,
      suggestion: suggestions.suggestion,
      developerSuggestion: suggestions.developerSuggestion,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('feedback').add(feedbackData);

    res.status(200).json({
      message: 'Sentiment, category, and suggestions analyzed successfully',
      sentiment,
      category,
      suggestion: suggestions.suggestion,
      developerSuggestion: suggestions.developerSuggestion
    });

  } catch (error) {
    console.error('❌ Error analyzing feedback:', error);
    res.status(500).json({ error: 'Failed to process feedback: ' + error.message });
  }
});

// Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
