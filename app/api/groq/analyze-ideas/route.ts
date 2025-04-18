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
    const { ideas } = body;

    if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
      return NextResponse.json(
        { error: 'Ideas array is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant that analyzes business ideas. Your response should be in JSON format with the following structure: { "analysis": { "market_potential": "Analysis of market potential", "competition": "Analysis of competition", "risks": "Analysis of risks", "opportunities": "Analysis of opportunities" }, "recommendations": ["List of specific recommendations"], "score": number between 0 and 100 }',
        },
        {
          role: 'user',
          content: `Please analyze these business ideas: ${JSON.stringify(ideas)}`,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const analysis = completion.choices[0]?.message?.content;
    if (!analysis) {
      return NextResponse.json(
        { error: 'No analysis generated' },
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      const parsedAnalysis = JSON.parse(analysis);
      return NextResponse.json(parsedAnalysis, { headers: corsHeaders });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse generated analysis' },
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