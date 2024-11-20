import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'

interface ChannelDetail {
  channel_id: string
  channel_name: string
  description: string
  canonical_base_url: string
  subscriber_count: number
  video_count: number
  view_count: number
  joined_date: string
  country: string
  crawl_date: string
  avg_view_count: number
  avg_subscriber_increase: number
  daily_view_increase: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid channel ID' })
  }

  try {
    const query = `
      SELECT 
        channel_id,
        channel_name,
        description,
        canonical_base_url,
        subscriber_count,
        video_count,
        view_count,
        joined_date,
        country,
        crawl_date,
        avg_view_count,
        avg_subscriber_increase,
        daily_view_increase
      FROM channel_crawl
      WHERE channel_id = ?
      ORDER BY crawl_date DESC
    `

    const results = await db.query<ChannelDetail[]>(query, [id])

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Channel not found' })
    }

    res.status(200).json(results)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 