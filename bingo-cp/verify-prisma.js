
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database.');
        await prisma.$disconnect();
    } catch (e) {
        console.error('Failed to connect:', e);
        process.exit(1);
    }
}

main();
