import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';

export async function GET(request) {
    try {
        const statuses = await prisma.status.findMany();
        return NextResponse.json(statuses, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to retrieve statuses. Please try again later' }, { status: 500 });
    }
}
