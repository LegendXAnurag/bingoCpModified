
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
    try {
        const maps = await prisma.ttrMap.findMany({
            orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(maps);
    } catch (error) {
        console.error('Error fetching maps:', error);
        return NextResponse.json({ error: 'Failed to fetch maps' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, width, height, imageUrl } = body;

        const newMap = await prisma.ttrMap.create({
            data: {
                name,
                width: width || 800,
                height: height || 600,
                data: { cities: [], tracks: [], imageUrl }, // Initial state with image
            },
        });

        return NextResponse.json(newMap);
    } catch (error) {
        console.error('Error creating map:', error);
        return NextResponse.json({ error: 'Failed to create map' }, { status: 500 });
    }
}
