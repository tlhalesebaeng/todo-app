import { GET, POST } from './route.js';
import { prisma } from '../../../lib/prisma.js';

describe('Tasks Resource', () => {
    let topic;
    let todoStatus;

    beforeEach(async () => {
        await prisma.task.deleteMany();
        await prisma.topic.deleteMany();
        await prisma.status.deleteMany();

        todoStatus = await prisma.status.create({
            data: {
                name: 'Todo',
            },
        });

        await prisma.status.create({
            data: {
                name: 'In Progress',
            },
        });

        await prisma.status.create({
            data: {
                name: 'Done',
            },
        });

        topic = await prisma.topic.create({
            data: {
                name: 'Java',
            },
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST', () => {
        test('returns 400 when required fields are missing', async () => {
            const request = { json: async () => ({}) };

            const response = await POST(request);
            expect(response.status).toBe(400);

            const body = await response.json();
            expect(body).toEqual({ message: 'All fields are required! Please provide all fields' });
        });

        test('returns 400 when topic id is invalid', async () => {
            const request = {
                json: async () => ({
                    title: 'Task',
                    description: 'Description',
                    dueDate: '2026-12-31',
                    topicId: 'abc',
                }),
            };

            const response = await POST(request);
            expect(response.status).toBe(400);

            const body = await response.json();
            expect(body).toEqual({ message: 'Invalid topic id! Please provide a valid topic id and try again' });
        });

        test('returns 404 when topic does not exist', async () => {
            const request = {
                json: async () => ({
                    title: 'Task',
                    description: 'Description',
                    dueDate: '2026-12-31',
                    topicId: 999,
                }),
            };

            const response = await POST(request);
            expect(response.status).toBe(404);

            const body = await response.json();
            expect(body).toEqual({ message: 'Topic not found! Please make sure that the topic exists' });
        });

        test('returns 400 when task already exists', async () => {
            await prisma.task.create({
                data: {
                    title: 'Task',
                    description: 'Description',
                    dueDate: new Date('2026-12-31'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const request = {
                json: async () => ({
                    title: 'Task',
                    description: 'Description',
                    dueDate: '2026-12-31',
                    topicId: topic.id,
                }),
            };

            const response = await POST(request);
            expect(response.status).toBe(400);

            const body = await response.json();
            expect(body).toEqual({ message: 'Task already exists! Please create a task a different title' });

            const tasks = await prisma.task.findMany();
            expect(tasks).toHaveLength(1);
        });

        test('creates task successfully', async () => {
            const request = {
                json: async () => ({
                    title: 'Task',
                    description: 'Description',
                    dueDate: '2026-12-31',
                    topicId: topic.id,
                }),
            };

            const response = await POST(request);
            expect(response.status).toBe(201);

            const body = await response.json();
            expect(body.title).toBe('Task');
            expect(body.description).toBe('Description');
            expect(body.topic.id).toBe(topic.id);
            expect(body.status.name).toBe('Todo');
            expect(body.dueDate).toBe(new Date('2026-12-31').toISOString());

            const savedTask = await prisma.task.findUnique({
                where: { id: body.id },
                include: { status: true, topic: true },
            });

            expect(savedTask).not.toBeNull();
            expect(savedTask.title).toBe('Task');
            expect(savedTask.status.name).toBe('Todo');
            expect(savedTask.topic.name).toBe('Java');
        });

        test('returns 500 when Todo status does not exist', async () => {
            await prisma.task.deleteMany();
            await prisma.topic.deleteMany();
            await prisma.status.deleteMany();

            topic = await prisma.topic.create({ data: { name: 'Java' } });

            jest.spyOn(console, 'error').mockImplementation(() => {});

            const request = {
                json: async () => ({
                    title: 'Task',
                    description: 'Description',
                    dueDate: '2026-12-31',
                    topicId: topic.id,
                }),
            };

            const response = await POST(request);
            expect(response.status).toBe(500);

            const body = await response.json();
            expect(body).toEqual({ message: 'Failed to create task. Please try again later' });

            console.error.mockRestore();
        });

        test('returns 500 when prisma throws an error', async () => {
            jest.spyOn(prisma.topic, 'findUnique').mockRejectedValue(new Error('Database error'));

            jest.spyOn(console, 'error').mockImplementation(() => {});

            const request = {
                json: async () => ({
                    title: 'Task',
                    description: 'Description',
                    dueDate: '2026-12-31',
                    topicId: topic.id,
                }),
            };

            const response = await POST(request);
            expect(response.status).toBe(500);

            const body = await response.json();
            expect(body).toEqual({ message: 'Failed to create task. Please try again later' });

            prisma.topic.findUnique.mockRestore();
            console.error.mockRestore();
        });
    });

    describe('GET', () => {
        test('returns 400 when topic id is invalid', async () => {
            const request = { nextUrl: { searchParams: new URLSearchParams({ topicId: 'abc' }) } };

            const response = await GET(request);
            expect(response.status).toBe(400);

            const body = await response.json();
            expect(body).toEqual({ message: 'Invalid topic id! Please provide a valid topic id' });
        });

        test('returns 400 when status id is invalid', async () => {
            const request = { nextUrl: { searchParams: new URLSearchParams({ statusId: 'abc' }) } };

            const response = await GET(request);
            expect(response.status).toBe(400);

            const body = await response.json();
            expect(body).toEqual({ message: 'Invalid status id! Please provide a valid status id' });
        });

        test('returns 400 when before date is invalid', async () => {
            const request = {
                nextUrl: { searchParams: new URLSearchParams({ beforeDate: 'invalid-date' }) },
            };

            const response = await GET(request);
            expect(response.status).toBe(400);

            const body = await response.json();
            expect(body).toEqual({ message: 'Invalid before date! Please provide a valid before date' });
        });

        test('returns 400 when after date is invalid', async () => {
            const request = { nextUrl: { searchParams: new URLSearchParams({ afterDate: 'invalid-date' }) } };

            const response = await GET(request);
            expect(response.status).toBe(400);

            const body = await response.json();
            expect(body).toEqual({ message: 'Invalid after date! Please provide a valid after date' });
        });

        test('returns all tasks', async () => {
            await prisma.task.create({
                data: {
                    title: 'Task 1',
                    description: 'Description 1',
                    dueDate: new Date('2026-12-31'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            await prisma.task.create({
                data: {
                    title: 'Task 2',
                    description: 'Description 2',
                    dueDate: new Date('2026-11-30'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const request = { nextUrl: { searchParams: new URLSearchParams() } };

            const response = await GET(request);
            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body).toHaveLength(2);
            expect(body[0].title).toBe('Task 1');
            expect(body[1].title).toBe('Task 2');
        });

        test('returns filtered tasks by topic and status', async () => {
            const otherTopic = await prisma.topic.create({ data: { name: 'Python' } });

            const doneStatus = await prisma.status.findUnique({ where: { name: 'Done' } });

            await prisma.task.create({
                data: {
                    title: 'Task 1',
                    description: 'Description',
                    dueDate: new Date('2026-12-31'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            await prisma.task.create({
                data: {
                    title: 'Task 2',
                    description: 'Description',
                    dueDate: new Date('2026-12-31'),
                    topicId: otherTopic.id,
                    statusId: doneStatus.id,
                },
            });

            const request = {
                nextUrl: {
                    searchParams: new URLSearchParams({
                        topicId: topic.id.toString(),
                        statusId: todoStatus.id.toString(),
                    }),
                },
            };

            const response = await GET(request);
            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body).toHaveLength(1);
            expect(body[0].title).toBe('Task 1');
            expect(body[0].topic.id).toBe(topic.id);
            expect(body[0].status.id).toBe(todoStatus.id);
        });

        test('returns filtered tasks before a due date', async () => {
            await prisma.task.create({
                data: {
                    title: 'Earlier Task',
                    description: 'Description',
                    dueDate: new Date('2026-01-01'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            await prisma.task.create({
                data: {
                    title: 'Later Task',
                    description: 'Description',
                    dueDate: new Date('2027-01-01'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const request = { nextUrl: { searchParams: new URLSearchParams({ beforeDate: '2026-06-01' }) } };

            const response = await GET(request);
            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body).toHaveLength(1);
            expect(body[0].title).toBe('Earlier Task');
        });

        test('returns filtered tasks after a due date', async () => {
            await prisma.task.create({
                data: {
                    title: 'Earlier Task',
                    description: 'Description',
                    dueDate: new Date('2026-01-01'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            await prisma.task.create({
                data: {
                    title: 'Later Task',
                    description: 'Description',
                    dueDate: new Date('2027-01-01'),
                    topicId: topic.id,
                    statusId: todoStatus.id,
                },
            });

            const request = { nextUrl: { searchParams: new URLSearchParams({ afterDate: '2026-06-01' }) } };

            const response = await GET(request);
            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body).toHaveLength(1);
            expect(body[0].title).toBe('Later Task');
        });

        test('returns 500 when prisma throws an error', async () => {
            jest.spyOn(prisma.task, 'findMany').mockRejectedValue(new Error('Database error'));

            jest.spyOn(console, 'error').mockImplementation(() => {});

            const request = { nextUrl: { searchParams: new URLSearchParams() } };

            const response = await GET(request);
            expect(response.status).toBe(500);

            const body = await response.json();
            expect(body).toEqual({ message: 'Failed to retrieve tasks. Please try again later' });

            prisma.task.findMany.mockRestore();
            console.error.mockRestore();
        });
    });
});
