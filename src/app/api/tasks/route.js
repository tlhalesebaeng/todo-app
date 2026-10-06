import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma.js';

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.title || !body.description || !body.dueDate || !body.topicId) {
            return NextResponse.json(
                { message: 'All fields are required! Please provide all fields' },
                { status: 400 },
            );
        }

        if (isNaN(Number(body.topicId))) {
            return NextResponse.json(
                { message: 'Invalid topic id! Please provide a valid topic id and try again' },
                { status: 400 },
            );
        }

        // Ensure that the topic exists
        const topicExists = await prisma.topic.findUnique({ where: { id: body.topicId } });
        if (!topicExists) {
            return NextResponse.json(
                { message: 'Topic not found! Please make sure that the topic exists' },
                { status: 404 },
            );
        }

        // Ensure that the task is not a duplicate
        const taskExists = await prisma.task.findUnique({ where: { title: body.title } });
        if (taskExists) {
            return NextResponse.json(
                { message: 'Task already exists! Please create a task a different title' },
                { status: 400 },
            );
        }

        // Get the status of new tasks
        const status = await prisma.status.findUnique({ where: { name: 'Todo' } });
        if (!status) {
            throw new Error('The Todo status does not exist in the database');
        }

        // Create the task and return the corresponding topic and status
        const task = await prisma.task.create({
            data: {
                title: body.title,
                description: body.description,
                dueDate: new Date(body.dueDate),
                statusId: status.id,
                topicId: Number(body.topicId),
            },
            include: { status: true, topic: true },
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to create task. Please try again later' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const topicId = searchParams.get('topicId');
        const statusId = searchParams.get('statusId');
        const beforeDate = searchParams.get('beforeDate');
        const afterDate = searchParams.get('afterDate');

        let options = {};
        if (topicId) {
            if (isNaN(Number(topicId))) {
                return NextResponse.json(
                    { message: 'Invalid topic id! Please provide a valid topic id' },
                    { status: 400 },
                );
            }
            options.topicId = Number(topicId);
        }

        if (statusId) {
            if (isNaN(Number(statusId))) {
                return NextResponse.json(
                    { message: 'Invalid status id! Please provide a valid status id' },
                    { status: 400 },
                );
            }
            options.statusId = Number(statusId);
        }

        if (beforeDate) {
            if (isNaN(Date.parse(beforeDate))) {
                return NextResponse.json(
                    { message: 'Invalid before date! Please provide a valid before date' },
                    { status: 400 },
                );
            }
            options.dueDate = { lte: new Date(beforeDate) };
        }

        if (afterDate) {
            if (isNaN(Date.parse(afterDate))) {
                return NextResponse.json(
                    { message: 'Invalid after date! Please provide a valid after date' },
                    { status: 400 },
                );
            }
            options.dueDate = { gte: new Date(afterDate) };
        }

        const tasks = await prisma.task.findMany({ where: options, include: { status: true, topic: true } });

        return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to retrieve tasks. Please try again later' }, { status: 500 });
    }
}
