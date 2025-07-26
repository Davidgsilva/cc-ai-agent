import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the sample response data
    const sampleDataPath = path.join(process.cwd(), 'public', 'sample-response.json');
    const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));
    
    console.log('📊 Serving test data from sample-response.json');
    
    return NextResponse.json(sampleData, {
      headers: {
        'X-AI-Provider': 'test',
        'X-Response-Time': '50ms',
        'X-Data-Quality': 'test-data'
      },
    });
    
  } catch (error) {
    console.error('❌ Test API error:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to load test data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📝 Test API POST request:', body);
    
    // Read the sample response data
    const sampleDataPath = path.join(process.cwd(), 'public', 'sample-response.json');
    const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));
    
    // Add request metadata to response
    const testResponse = {
      ...sampleData,
      requestMetadata: {
        message: body.message || 'Test request',
        preferences: body.preferences || {},
        provider: body.provider || 'test',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('📊 Serving test data with request metadata');
    
    return NextResponse.json(testResponse, {
      headers: {
        'X-AI-Provider': 'test',
        'X-Response-Time': '75ms',
        'X-Data-Quality': 'test-data'
      },
    });
    
  } catch (error) {
    console.error('❌ Test API POST error:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to process test request',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    },
  });
}