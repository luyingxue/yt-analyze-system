import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { channelId } = req.query

    if (!channelId) {
      return res.status(400).json({ message: 'Channel ID is required' })
    }

    try {
      const query = `
        SELECT is_benchmark 
        FROM channel_base 
        WHERE channel_id = ?
      `
      const results = await db.query<Array<{is_benchmark: number}>>(query, [channelId])
      res.status(200).json({ isBenchmark: results[0]?.is_benchmark === 1 })
    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'PUT') {
    const { channelId, isBenchmark } = req.body

    if (!channelId) {
      return res.status(400).json({ message: 'Channel ID is required' })
    }

    try {
      const query = `
        UPDATE channel_base 
        SET is_benchmark = ? 
        WHERE channel_id = ?
      `
      await db.query(query, [isBenchmark ? 1 : 0, channelId])
      res.status(200).json({ message: 'Successfully updated' })
    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
} 