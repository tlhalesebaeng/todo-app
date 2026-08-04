import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';

export async function POST(request) {
    try {
        const body = await request.json();
        const name = body.name;

        if (!name) {
            return NextResponse.json(
                { message: 'Name required! Please provide the name of the topic' },
                { status: 400 },
            );
        }

        const topic = await prisma.topic.create({ data: { name } });

        return NextResponse.json(topic, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to create topic. Please try again later' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const topics = await prisma.topic.findMany();
        return NextResponse.json(topics, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to retrieve topics. Please try again later' }, { status: 500 });
    }
}
