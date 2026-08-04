import { prisma } from '../lib/prisma.js';

describe('Prisma Task Extension', () => {
    let topic;
    let inProgressStatus;
    let completeStatus;

    beforeEach(async () => {
        await prisma.task.deleteMany();
        await prisma.topic.deleteMany();
        await prisma.status.deleteMany();

        topic = await prisma.topic.create({ data: { name: 'Testing' } });

        inProgressStatus = await prisma.status.create({ data: { name: 'In Progress' } });

        completeStatus = await prisma.status.create({ data: { name: 'Complete' } });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('computes overdue as true when due date is in the past and task is not complete', async () => {
        const task = await prisma.task.create({
            data: {
                title: 'Past Task',
                description: 'Already overdue',
                dueDate: new Date('2020-01-01'),
                topicId: topic.id,
                statusId: inProgressStatus.id,
            },
        });

        const retrieved = await prisma.task.findUnique({ where: { id: task.id }, include: { status: true } });
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
                statusId: inProgressStatus.id,
            },
        });

        const retrieved = await prisma.task.findUnique({ where: { id: task.id }, include: { status: true } });
        expect(retrieved).not.toBeNull();
        expect(retrieved.overdue).toBe(false);
    });

    test('computes overdue as false when task is complete even if due date is in the past', async () => {
        const task = await prisma.task.create({
            data: {
                title: 'Completed Task',
                description: 'Completed before today',
                dueDate: new Date('2020-01-01'),
                topicId: topic.id,
                statusId: completeStatus.id,
            },
        });

        const retrieved = await prisma.task.findUnique({ where: { id: task.id }, include: { status: true } });
        expect(retrieved).not.toBeNull();
        expect(retrieved.overdue).toBe(false);
    });

    test('changing the status to Complete changes overdue to false', async () => {
        const task = await prisma.task.create({
            data: {
                title: 'Status Change',
                description: 'Testing overdue',
                dueDate: new Date('2020-01-01'),
                topicId: topic.id,
                statusId: inProgressStatus.id,
            },
        });

        let retrieved = await prisma.task.findUnique({ where: { id: task.id }, include: { status: true } });
        expect(retrieved.overdue).toBe(true);

        await prisma.task.update({ where: { id: task.id }, data: { statusId: completeStatus.id } });
        retrieved = await prisma.task.findUnique({ where: { id: task.id }, include: { status: true } });
        expect(retrieved.overdue).toBe(false);
    });
});
