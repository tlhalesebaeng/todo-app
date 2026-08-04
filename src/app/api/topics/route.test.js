import { GET, POST } from './route.js';
import { prisma } from '../../../lib/prisma.js';

describe('Topics Resource', () => {
    beforeEach(async () => {
        await prisma.task.deleteMany();
        await prisma.topic.deleteMany();
        await prisma.status.deleteMany();

        await prisma.status.createMany({
            data: [{ name: 'Todo' }, { name: 'In Progress' }, { name: 'Done' }],
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST', () => {
        test('returns 400 when name is missing', async () => {
            const request = { json: async () => ({}) };

            const response = await POST(request);
            expect(response.status).toBe(400);

            const body = await response.json();
            expect(body).toEqual({ message: 'Name required! Please provide the name of the topic' });
        });

        test('returns 400 when topic already exists', async () => {
            await prisma.topic.create({ data: { name: 'Value 1' } });

            const request = { json: async () => ({ name: 'Value 1' }) };

            const response = await POST(request);
            expect(response.status).toBe(400);

            const body = await response.json();
            expect(body).toEqual({ message: 'Topic already exists! Please create a different topic' });

            const topics = await prisma.topic.findMany();
            expect(topics).toHaveLength(1);
        });

        test('creates a topic successfully', async () => {
            const request = { json: async () => ({ name: 'Value 1' }) };

            const response = await POST(request);
            expect(response.status).toBe(201);

            const body = await response.json();
            expect(body.name).toBe('Value 1');

            const topic = await prisma.topic.findUnique({ where: { id: body.id } });
            expect(topic).not.toBeNull();
            expect(topic.name).toBe('Value 1');
        });

        test('returns 500 when prisma throws an error', async () => {
            jest.spyOn(prisma.topic, 'create').mockRejectedValue(new Error('Database error'));
            jest.spyOn(console, 'error').mockImplementation(() => {});

            const request = { json: async () => ({ name: 'Value 1' }) };

            const response = await POST(request);
            expect(response.status).toBe(500);

            const body = await response.json();
            expect(body).toEqual({ message: 'Failed to create topic. Please try again later' });

            prisma.topic.create.mockRestore();
            console.error.mockRestore();
        });
    });

    describe('GET', () => {
        test('returns all topics with status 200', async () => {
            await prisma.topic.createMany({
                data: [{ name: 'Topic 1' }, { name: 'Topic 2' }, { name: 'Topic 3' }],
            });

            const response = await GET();
            expect(response.status).toBe(200);

            const body = await response.json();
            expect(body).toHaveLength(3);

            expect(body.map((task) => task.name).sort()).toEqual(['Topic 1', 'Topic 2', 'Topic 3']);
        });

        test('returns 500 when prisma throws an error', async () => {
            jest.spyOn(prisma.topic, 'findMany').mockRejectedValue(new Error('Database error'));
            jest.spyOn(console, 'error').mockImplementation(() => {});

            const response = await GET();
            expect(response.status).toBe(500);

            const body = await response.json();
            expect(body).toEqual({ message: 'Failed to retrieve topics. Please try again later' });

            prisma.topic.findMany.mockRestore();
            console.error.mockRestore();
        });
    });
});
