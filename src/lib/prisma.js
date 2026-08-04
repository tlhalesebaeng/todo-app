import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter }).$extends({
    // Create a derived overdue field from the dueDate property
    result: {
        task: {
            overdue: {
                needs: { dueDate: true, status: true },
                compute(task) {
                    if (task.status.name !== 'Complete' && task.dueDate < new Date(Date.now())) {
                        return true;
                    }

                    return false;
                },
            },
        },
    },
});
