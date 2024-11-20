import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'

interface ChannelGroup {
  channel_id: string;
  channel_name: string;
  video_count: number;
  canonical_base_url: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { start, end } = req.query
    const startRow = parseInt(start as string)
    const endRow = parseInt(end as string)

    // 先获取频道分组信息
    const result = await db.query<ChannelGroup[]>(`
      WITH channel_stats AS (
        SELECT 
          channel_id,
          channel_name,
          canonical_base_url,
          COUNT(*) as video_count,
          ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as row_num
        FROM videos
        GROUP BY channel_id, channel_name, canonical_base_url
      )
      SELECT 
        channel_id,
        channel_name,
        canonical_base_url,
        video_count
      FROM channel_stats
      WHERE row_num BETWEEN ? AND ?
      ORDER BY video_count DESC
    `, [startRow, endRow])

    // 获取总频道数
    const [countResult] = await db.query<[{total: number}]>(`
      SELECT COUNT(DISTINCT channel_id) as total
      FROM videos
    `)

    return res.status(200).json({
      data: result,
      total: countResult.total
    })
  } catch (error) {
    console.error('分组查询失败:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 