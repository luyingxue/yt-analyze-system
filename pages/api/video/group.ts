import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'

// 定义返回数据的类型
interface Video {
  id: bigint;
  video_id: string;
  title: string;
  view_count: number;
  published_date: string;
  channel_id: string;
  channel_name: string;
  canonical_base_url: string;
  global_row_num: number;
}

// 定义计数结果的类型
interface CountResult {
  total: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { rowStart, rowEnd } = req.query
    const start = parseInt(rowStart as string)
    const end = parseInt(rowEnd as string)

    // 使用 WITH 子句和 ROW_NUMBER 进行分组查询
    const result = await db.query<Video[]>(`
      WITH channel_groups AS (
        SELECT *,
          ROW_NUMBER() OVER (
            ORDER BY (
              SELECT COUNT(*) 
              FROM videos v2 
              WHERE v2.channel_id = v1.channel_id
            ) DESC,
            channel_id,
            view_count DESC
          ) as global_row_num
        FROM videos v1
      )
      SELECT *
      FROM channel_groups
      WHERE global_row_num BETWEEN ? AND ?
    `, [start, end])

    // 获取总数
    const countResult = await db.query<CountResult[]>(`
      SELECT COUNT(DISTINCT channel_id) as total
      FROM videos
    `)

    return res.status(200).json({
      data: result,
      total: countResult[0].total
    })
  } catch (error) {
    console.error('分组查询失败:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 