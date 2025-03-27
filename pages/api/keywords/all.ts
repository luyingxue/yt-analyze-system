import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const query = `
      SELECT id, key_words, last_crawl_date 
      FROM key_words 
      ORDER BY id DESC
    `
    const keywords = await db.query(query)
    res.status(200).json(keywords)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 