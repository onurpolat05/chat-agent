import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_FILE_TYPES = new Set([
  '.pdf',
  '.csv',
  '.docx',
  '.epub',
  '.txt',
  '.json'
]);

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/agents`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch agents');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const files = formData.getAll('files') as File[];

    if (!name || files.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one file are required' },
        { status: 400 }
      );
    }

    // Validate file types
    const invalidFiles = files.filter(file => {
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return !SUPPORTED_FILE_TYPES.has(ext);
    });

    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { 
          error: `Unsupported file types: ${invalidFiles.map(f => f.name).join(', ')}`,
          details: 'Only PDF, CSV, DOCX, EPUB, TXT, and JSON files are supported'
        },
        { status: 400 }
      );
    }

    // Create a new FormData instance to forward the request
    const forwardFormData = new FormData();
    forwardFormData.append('name', name);
    files.forEach(file => {
      forwardFormData.append('files', file);
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/agents`, {
      method: 'POST',
      body: forwardFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
} 