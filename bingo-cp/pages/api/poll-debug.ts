// /pages/api/poll-debug.ts
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Poll-submissions logic executed at:", new Date().toISOString());
  res.status(200).json({ ok: true });
}
