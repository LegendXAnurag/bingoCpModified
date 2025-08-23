
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { matchId } = req.query;

  if (matchId) {
    console.log("Poll-submissions logic executed for match ID:", matchId);
  } else {
    console.log("Poll-submissions logic executed (no match ID provided)");
  }

  res.status(200).json({ ok: true, matchId: matchId ?? null });
}
