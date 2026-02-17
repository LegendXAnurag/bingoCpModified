import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchAndFilterProblems, type Problem } from '@/app/lib/problems'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' })
  }
  const {
    minRating = 800,
    maxRating = 3500,
    userHandles = [],
    count = 25,
    exclude = [],
  } = req.body

  try {
    const problems = await fetchAndFilterProblems({
      minRating,
      maxRating,
      userHandles,
      count,
      exclude,
    });
    return res.status(200).json({ problems })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
