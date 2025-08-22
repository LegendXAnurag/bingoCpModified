// pages/api/match/set-duration.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../src/app/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { matchId, durationMinutes } = req.body as { matchId?: string; durationMinutes?: number };

    if (!matchId) return res.status(400).json({ error: 'matchId required' });
    if (typeof durationMinutes !== 'number' || durationMinutes < 0) {
      return res.status(400).json({ error: 'durationMinutes must be a non-negative number' });
    }
    const updated = await prisma.match.update({
      where: { id: matchId },
      data: { durationMinutes: durationMinutes },
    });

    return res.status(200).json({ ok: true, match: updated });
  } catch (err) {
    console.error('API set-duration error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
