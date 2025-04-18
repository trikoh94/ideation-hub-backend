import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function validateApiKey(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const apiKey = authHeader.split(' ')[1];
  return apiKey === process.env.GROQ_API_KEY;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that generates innovative business ideas. Your response should be in JSON format with the following structure: { "title": "Business Idea Title", "description": "Detailed description of the idea", "target_market": "Target market description", "revenue_model": "How the business will make money", "initial_investment": "Estimated initial investment needed" }',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const idea = completion.choices[0]?.message?.content;
    if (!idea) {
      return NextResponse.json(
        { error: 'No idea generated' },
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      const parsedIdea = JSON.parse(idea);
      return NextResponse.json(parsedIdea, { headers: corsHeaders });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse generated idea' },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
} 