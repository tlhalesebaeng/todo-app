import { prisma } from '../lib/prisma.js';

describe('Prisma Task Extension', () => {
    let topic;
    let status;

    beforeEach(async () => {
        await prisma.task.deleteMany();
        await prisma.topic.deleteMany();
        await prisma.status.deleteMany();

        topic = await prisma.topic.create({ data: { name: 'Testing' } });
        status = await prisma.status.create({ data: { name: 'Status 1' } });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('computes overdue as true when due date is in the past', async () => {
        const task = await prisma.task.create({
            data: {
                title: 'Past Task',
                description: 'Already overdue',
                dueDate: new Date('2020-01-01'),
                topicId: topic.id,
                statusId: status.id,
            },
        });

        const retrieved = await prisma.task.findUnique({ where: { id: task.id } });
        expect(retrieved).not.toBeNull();
        expect(retrieved.overdue).toBe(true);
    });

    test('computes overdue as false when due date is in the future', async () => {
        const task = await prisma.task.create({
            data: {
                title: 'Future Task',
                description: 'Not overdue',
                dueDate: new Date('2099-01-01'),
                topicId: topic.id,
                statusId: status.id,
            },
        });

        const retrieved = await prisma.task.findUnique({ where: { id: task.id } });
        expect(retrieved).not.toBeNull();
        expect(retrieved.overdue).toBe(false);
    });

    test('changing the due date changes the overdue value', async () => {
        const task = await prisma.task.create({
            data: {
                title: 'Change Due Date',
                description: 'Testing overdue',
                dueDate: new Date('2099-01-01'),
                topicId: topic.id,
                statusId: status.id,
            },
        });

        let retrieved = await prisma.task.findUnique({ where: { id: task.id } });
        expect(retrieved.overdue).toBe(false);

        await prisma.task.update({ where: { id: task.id }, data: { dueDate: new Date('2020-01-01') } });
        retrieved = await prisma.task.findUnique({ where: { id: task.id } });
        expect(retrieved.overdue).toBe(true);
    });
});
