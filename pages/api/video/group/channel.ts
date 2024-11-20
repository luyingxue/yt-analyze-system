import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { channelId } = req.query

    const result = await db.query(`
      SELECT *
      FROM videos
      WHERE channel_id = ?
      ORDER BY view_count DESC
    `, [channelId])

    return res.status(200).json({
      data: result
    })
  } catch (error) {
    console.error('获取频道视频失败:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 