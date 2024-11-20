import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { channelId } = req.body

  if (!channelId) {
    return res.status(400).json({ message: 'Channel ID is required' })
  }

  try {
    const query = `
      UPDATE channel_base 
      SET is_benchmark = 1 
      WHERE channel_id = ?
    `

    await db.query(query, [channelId])
    res.status(200).json({ message: 'Successfully updated' })
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 