import { NextResponse } from 'next/server';
import { getDbBookById } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await getDbBookById(id);

    if (!book || !book.filePath) {
      return new NextResponse('Book or physical file not found', { status: 404 });
    }

    if (!fs.existsSync(book.filePath)) {
      return new NextResponse(`Physical file does not exist on disk: ${book.filePath}`, { status: 404 });
    }

    const stat = fs.statSync(book.filePath);
    const fileSize = stat.size;
    const ext = path.extname(book.filePath).toLowerCase();
    const contentType = ext === '.epub' ? 'application/epub+zip' : 'application/pdf';

    const range = request.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(book.filePath, { start, end });

      // Convert Node readable stream to Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(webStream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${path.basename(book.filePath)}"`,
        },
      });
    } else {
      const fileStream = fs.createReadStream(book.filePath);
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(webStream as any, {
        status: 200,
        headers: {
          'Content-Length': String(fileSize),
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Content-Disposition': `inline; filename="${path.basename(book.filePath)}"`,
        },
      });
    }
  } catch (error: any) {
    console.error('File stream error:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
