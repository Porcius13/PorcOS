import { NextResponse } from 'next/server';
import { db } from '@/lib/kasa-db';

export async function GET() {
  try {
    const cards = db.prepare('SELECT * FROM cards').all();
    return NextResponse.json(cards);
  } catch (error) {
    console.error('Kasa API: Error fetching cards:', error);
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, card_limit, balance, closing_day, due_day, color } = body;

    const result = db.prepare(
      'INSERT INTO cards (name, card_limit, balance, closing_day, due_day, color) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, card_limit, balance, closing_day, due_day, color);

    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error('Kasa API: Error adding card:', error);
    return NextResponse.json({ error: 'Failed to add card' }, { status: 500 });
  }
}
