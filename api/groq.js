const dotenv = require('dotenv');
dotenv.config();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to handle CORS preflight requests
const handleCors = (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
};

// Helper function to create JSON response
const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
};

// Helper function to handle errors
const handleError = (error) => {
  console.error('Error:', error);
  return jsonResponse(
    { error: error.message || 'Internal server error' },
    error.status || 500
  );
};

// Generate idea endpoint
async function generateIdea(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return jsonResponse(
        { error: 'Prompt is required' },
        400
      );
    }

    const response = await fetch('https://api.groq.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a creative business idea generator. Provide detailed, practical, and innovative business ideas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return jsonResponse(data);
  } catch (error) {
    return handleError(error);
  }
}

// Main handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // Get the endpoint from the URL path
    const path = req.url.split('?')[0];
    console.log('Request path:', path);

    // Route to appropriate handler
    if (path === '/api/test') {
      return res.status(200).json({ message: 'API is working!' });
    } else if (path === '/api/generate-idea' || path === '/api/groq') {
      const result = await generateIdea(req);
      return res.status(200).json(result);
    } else {
      console.log('404 Not Found:', path);
      return res.status(404).json({ error: 'Endpoint not found', path });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}; 