import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../src/app/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Match ID required' });
    }

    try {
        const match = await prisma.match.findUnique({
            where: { id },
            include: {
                teams: {
                    include: {
                        members: true,
                    },
                },
                problems: true,
                solveLog: true,
            },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        if (match.mode !== 'ticket_ride') {
            return res.status(400).json({ error: 'Not a Ticket to Ride match' });
        }

        return res.status(200).json({ match });
    } catch (error) {
        console.error('Error fetching Ticket to Ride match:', error);
        return res.status(500).json({ error: 'Failed to fetch match' });
    }
}
