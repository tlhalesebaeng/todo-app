import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

try {
    await prisma.status.createMany({
        data: [{ name: 'Todo' }, { name: 'In-Progress' }, { name: 'Complete' }],
    });
} catch (error) {
    console.log('An error occurred while adding seed data!');
    console.error(error);
    process.exit(1);
} finally {
    const disconnect = async () => {
        await prisma.$disconnect();
    };
    disconnect();
}
