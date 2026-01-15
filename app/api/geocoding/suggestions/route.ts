import { NextResponse } from 'next/server';
import { searchSuggestions } from '@/lib/geocoding';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const suggestions = await searchSuggestions(query);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
