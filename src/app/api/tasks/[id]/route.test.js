import { GET, PATCH } from './route.js';
import { prisma } from '../../../../lib/prisma.js';

describe('Task Resource', () => {
    let topic;
    let todoStatus;
    let doneStatus;

    beforeEach(async () => {
        await prisma.task.deleteMany();
        await prisma.topic.deleteMany();
        await prisma.status.deleteMany();

        todoStatus = await prisma.status.create({ data: { name: 'Todo' } });

        doneStatus = await prisma.status.create({ data: { name: 'Done' } });

        topic = await prisma.topic.create({ data: { name: 'Java' } });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET', () => {
        test('returns 400 when task id is invalid', async () => {
            const response = await GET(
                {},
                {
                    params: Promise.resolve({ id: 'abc' }),
                },
            );

            expect(response.status).toBe(400);

            const body = await response.json();

            expect(body).toEqual({
                message: 'Invalid task id! Please provide a valid task id and try again',
            });
        });

        test('returns 404 when task does not exist', async () => {
            const response = await GET(
                {},
                {
                    params: Promise.resolve({ id: '1' }),
                },
            );

            expect(response.status).toBe(404);

            const body = await response.json();

            expect(body).toEqual({
                message: 'Task not found! Please make sure that the task exists',
            });
        });

        test('returns task with status 200', async () => {
            const task = await prisma.task.create({
                data: {
                    title: 'Task 1',
                    description: 'Description',
                    archived: false,
                    dueDate: new Date('2026-12-31'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const response = await GET(
                {},
                {
                    params: Promise.resolve({
                        id: task.id.toString(),
                    }),
                },
            );

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.id).toBe(task.id);
            expect(body.title).toBe('Task 1');
            expect(body.description).toBe('Description');
            expect(body.archived).toBe(false);
            expect(body.topic.name).toBe('Java');
            expect(body.status.name).toBe('Todo');
            expect(body.dueDate).toBe(new Date('2026-12-31').toISOString());
        });

        test('returns overdue field when task is overdue', async () => {
            const task = await prisma.task.create({
                data: {
                    title: 'Old Task',
                    description: 'Description',
                    archived: false,
                    dueDate: new Date('2020-01-01'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const response = await GET(
                {},
                {
                    params: Promise.resolve({
                        id: task.id.toString(),
                    }),
                },
            );

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.overdue).toBe(true);
        });

        test('returns 500 when prisma throws an error', async () => {
            jest.spyOn(prisma.task, 'findUnique').mockRejectedValue(new Error('Database error'));

            jest.spyOn(console, 'error').mockImplementation(() => {});

            const response = await GET(
                {},
                {
                    params: Promise.resolve({ id: '1' }),
                },
            );

            expect(response.status).toBe(500);

            const body = await response.json();

            expect(body).toEqual({
                message: 'Failed to retrieve task. Please try again later',
            });

            prisma.task.findUnique.mockRestore();
            console.error.mockRestore();
        });
    });
    describe('PATCH', () => {
        test('returns 400 when task id is invalid', async () => {
            const request = {
                json: async () => ({}),
            };

            const response = await PATCH(request, {
                params: Promise.resolve({ id: 'abc' }),
            });

            expect(response.status).toBe(400);

            const body = await response.json();

            expect(body).toEqual({
                message: 'Invalid task id! Please provide a valid task id and try again',
            });
        });

        test('returns 404 when task does not exist', async () => {
            const request = {
                json: async () => ({}),
            };

            const response = await PATCH(request, {
                params: Promise.resolve({ id: '999' }),
            });

            expect(response.status).toBe(404);

            const body = await response.json();

            expect(body).toEqual({
                message: 'Task not found! Please make sure that the task exists',
            });
        });

        test('returns 400 when no fields are provided', async () => {
            const task = await prisma.task.create({
                data: {
                    title: 'Task 1',
                    description: 'Description',
                    dueDate: new Date('2026-12-31'),
                    archived: false,
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const request = {
                json: async () => ({}),
            };

            const response = await PATCH(request, {
                params: Promise.resolve({
                    id: task.id.toString(),
                }),
            });

            expect(response.status).toBe(400);

            const body = await response.json();

            expect(body).toEqual({
                message: 'At least one field is required! Please provide a field to update',
            });
        });

        test('returns 400 when task title already exists', async () => {
            await prisma.task.create({
                data: {
                    title: 'Task 1',
                    description: 'Description',
                    dueDate: new Date('2026-12-31'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const task2 = await prisma.task.create({
                data: {
                    title: 'Task 2',
                    description: 'Description',
                    dueDate: new Date('2026-12-31'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const request = {
                json: async () => ({
                    title: 'Task 1',
                }),
            };

            const response = await PATCH(request, {
                params: Promise.resolve({
                    id: task2.id.toString(),
                }),
            });

            expect(response.status).toBe(400);

            const body = await response.json();

            expect(body).toEqual({
                message: 'Task with title already exists! Please update task to a different title',
            });
        });

        test('updates task successfully', async () => {
            const task = await prisma.task.create({
                data: {
                    title: 'Task 1',
                    description: 'Description',
                    archived: false,
                    dueDate: new Date('2026-01-01'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const request = {
                json: async () => ({
                    title: 'Updated Task',
                    description: 'Updated Description',
                    archived: true,
                    dueDate: '2026-12-31',
                    topicId: topic.id,
                    statusId: doneStatus.id,
                }),
            };

            const response = await PATCH(request, {
                params: Promise.resolve({
                    id: task.id.toString(),
                }),
            });

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.title).toBe('Updated Task');
            expect(body.description).toBe('Updated Description');
            expect(body.archived).toBe(true);
            expect(body.status.name).toBe('Done');
            expect(body.topic.name).toBe('Java');
            expect(body.dueDate).toBe(new Date('2026-12-31').toISOString());

            const updated = await prisma.task.findUnique({
                where: {
                    id: task.id,
                },
                include: {
                    status: true,
                    topic: true,
                },
            });

            expect(updated.title).toBe('Updated Task');
            expect(updated.description).toBe('Updated Description');
            expect(updated.archived).toBe(true);
            expect(updated.status.name).toBe('Done');
        });

        test('archives a task successfully', async () => {
            const task = await prisma.task.create({
                data: {
                    title: 'Task 1',
                    description: 'Description',
                    archived: false,
                    dueDate: new Date('2026-12-31'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const request = {
                json: async () => ({
                    archived: true,
                }),
            };

            const response = await PATCH(request, {
                params: Promise.resolve({
                    id: task.id.toString(),
                }),
            });

            expect(response.status).toBe(200);

            const body = await response.json();

            expect(body.archived).toBe(true);

            const updated = await prisma.task.findUnique({
                where: {
                    id: task.id,
                },
            });

            expect(updated.archived).toBe(true);
        });

        test('returns 500 when prisma throws an error', async () => {
            jest.spyOn(prisma.task, 'findUnique').mockRejectedValue(new Error('Database error'));

            jest.spyOn(console, 'error').mockImplementation(() => {});

            const request = {
                json: async () => ({}),
            };

            const response = await PATCH(request, {
                params: Promise.resolve({
                    id: '1',
                }),
            });

            expect(response.status).toBe(500);

            const body = await response.json();

            expect(body).toEqual({
                message: 'Failed to update task. Please try again later',
            });

            prisma.task.findUnique.mockRestore();
            console.error.mockRestore();
        });
    });
});
