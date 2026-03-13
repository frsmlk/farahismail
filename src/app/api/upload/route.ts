import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireApiKey } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const contentType = req.headers.get('content-type') || '';

  // Handle multipart form data (file upload)
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const folder = formData.get('folder') as string | null;
    const prefix = folder ? `${folder}/` : '';
    const pathname = `${prefix}${Date.now()}-${file.name}`;

    const blob = await put(pathname, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
    }, { status: 201 });
  }

  // Handle JSON body with base64 data (for agents that can't do multipart)
  if (contentType.includes('application/json')) {
    const body = await req.json();
    const { data, filename, mimeType, folder } = body;

    if (!data || !filename) {
      return NextResponse.json(
        { error: 'Missing data or filename' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(data, 'base64');
    const prefix = folder ? `${folder}/` : '';
    const pathname = `${prefix}${Date.now()}-${filename}`;

    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: mimeType || 'application/octet-stream',
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: mimeType || 'application/octet-stream',
      size: buffer.length,
    }, { status: 201 });
  }

  return NextResponse.json(
    { error: 'Content-Type must be multipart/form-data or application/json' },
    { status: 400 },
  );
}
