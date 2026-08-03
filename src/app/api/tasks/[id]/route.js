import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request, { params }) {
    try {
        // Get the id parameter
        const { id } = await params;

        // Ensure that the provided id is valid
        if (isNaN(Number(id))) {
            return NextResponse.json(
                { message: 'Invalid task id! Please provide a valid task id and try again' },
                { status: 400 },
            );
        }

        // Get the task
        const task = await prisma.task.findUnique({
            where: { id: Number(id) },
            include: { status: true, topic: true },
        });

        // Ensure that the task exists
        if (!task) {
            return NextResponse.json(
                { message: 'Task not found! Please make sure that the task exists' },
                { status: 404 },
            );
        }

        return NextResponse.json(task, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to retrieve task. Please try again later' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;

        // Ensure that the provided id is valid
        if (isNaN(Number(id))) {
            return NextResponse.json(
                { message: 'Invalid task id! Please provide a valid task id and try again' },
                { status: 400 },
            );
        }

        // Ensure that the task exists
        const taskExists = await prisma.task.findUnique({ where: { id: Number(id) } });
        if (!taskExists) {
            return NextResponse.json(
                { message: 'Task not found! Please make sure that the task exists' },
                { status: 404 },
            );
        }

        // Update the task with provided details
        const body = await request.json();

        const archivedExists = body.archived !== undefined && body.archived !== null;
        if (!body.title && !body.description && !body.dueDate && !body.topicId && !body.statusId && !archivedExists) {
            return NextResponse.json(
                { message: 'At least one field is required! Please provide a field to update' },
                { status: 400 },
            );
        }

        // Ensure that the task is not a duplicate
        if (body.title) {
            const isDuplicate = await prisma.task.findUnique({ where: { title: body.title } });
            if (isDuplicate) {
                return NextResponse.json(
                    { message: 'Task with title already exists! Please update task to a different title' },
                    { status: 400 },
                );
            }
        }

        const dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
        const statusId = body.statusId ? Number(body.statusId) : undefined;
        const topicId = body.topicId ? Number(body.topicId) : undefined;

        const updatedTask = await prisma.task.update({
            where: { id: Number(id) },
            data: {
                title: body.title,
                description: body.description,
                archived: body.archived,
                dueDate,
                statusId,
                topicId,
            },
            include: { status: true, topic: true },
        });

        return NextResponse.json(updatedTask, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to update task. Please try again later' }, { status: 500 });
    }
}
