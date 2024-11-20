import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'

interface ChannelResult {
  channel_id: string
  channel_name: string
  subscriber_count: number
  video_count: number
  view_count: number
  joined_date: string
  country: string
  avg_view_count: number
  daily_view_increase: number
  crawl_date: string
  is_benchmark: boolean
}

interface SearchParams {
  channelName?: string
  joinedDays?: number
  minViewCount?: number
  pageSize: number
  currentPage: number
  sort: {
    field: string
    direction: 'asc' | 'desc'
  }
}

interface CountResult {
  total: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { 
      channelName = '', 
      joinedDays = 0, 
      minViewCount = 0,
      pageSize = 20,
      currentPage = 1,
      sort = { field: 'view_count', direction: 'desc' as const }
    } = req.body as SearchParams

    // 构建查询条件
    const conditions = []
    const values = []

    if (channelName) {
      conditions.push('c1.channel_name LIKE ?')
      values.push(`%${channelName}%`)
    }

    if (joinedDays > 0) {
      conditions.push('c1.joined_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)')
      values.push(joinedDays)
    }

    if (minViewCount > 0) {
      conditions.push('c1.view_count >= ?')
      values.push(minViewCount)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // 添加计数查询
    const countQuery = `
      SELECT COUNT(DISTINCT c1.channel_id) as total
      FROM channel_crawl c1
      INNER JOIN (
        SELECT channel_id, MAX(crawl_date) as latest_date
        FROM channel_crawl
        GROUP BY channel_id
      ) c2 ON c1.channel_id = c2.channel_id AND c1.crawl_date = c2.latest_date
      ${whereClause}
    `

    const countResults = await db.query<CountResult[]>(countQuery, values)
    const total = countResults[0]?.total || 0

    // 修改主查询以支持排序和分页
    const offset = (currentPage - 1) * pageSize
    const mainQuery = `
      SELECT DISTINCT
        c1.channel_id,
        c1.channel_name,
        c1.subscriber_count,
        c1.video_count,
        c1.view_count,
        c1.joined_date,
        c1.country,
        c1.avg_view_count,
        c1.daily_view_increase,
        c1.crawl_date,
        cb.is_benchmark
      FROM channel_crawl c1
      INNER JOIN (
        SELECT channel_id, MAX(crawl_date) as latest_date
        FROM channel_crawl
        GROUP BY channel_id
      ) c2 ON c1.channel_id = c2.channel_id AND c1.crawl_date = c2.latest_date
      LEFT JOIN channel_base cb ON c1.channel_id = cb.channel_id
      ${whereClause}
      ORDER BY ${sort.field} ${sort.direction}
      LIMIT ${pageSize} OFFSET ${offset}
    `

    // 直接使用字符串拼接而不是参数化这些值
    const results = await db.query<ChannelResult[]>(mainQuery, values)

    res.status(200).json({
      results: results || [],
      total,
      currentPage,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    })
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 