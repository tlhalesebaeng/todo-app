import { GET } from './route.js';
import { prisma } from '../../../lib/prisma.js';

describe('GET /api/statuses', () => {
    beforeEach(async () => {
        await prisma.task.deleteMany();
        await prisma.topic.deleteMany();
        await prisma.status.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('returns all statuses with status 200', async () => {
        await prisma.status.createMany({
            data: [{ name: 'Todo' }, { name: 'In Progress' }, { name: 'Done' }],
        });

        const response = await GET();

        expect(response.status).toBe(200);

        const body = await response.json();

        expect(body).toHaveLength(3);
        expect(body.map((status) => status.name).sort()).toEqual(['Done', 'In Progress', 'Todo']);
    });

    test('returns 500 when prisma throws an error', async () => {
        jest.spyOn(prisma.status, 'findMany').mockRejectedValue(new Error('Database error'));

        jest.spyOn(console, 'error').mockImplementation(() => {});

        const response = await GET();

        expect(response.status).toBe(500);

        const body = await response.json();

        expect(body).toEqual({
            message: 'Failed to retrieve statuses. Please try again later',
        });

        prisma.status.findMany.mockRestore();
        console.error.mockRestore();
    });
});
