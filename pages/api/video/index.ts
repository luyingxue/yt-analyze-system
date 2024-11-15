import type { NextApiRequest, NextApiResponse } from 'next'
import { VideoModel } from '../../../lib/models/video'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const page = Number(req.query.page) || 1
    const pageSize = Number(req.query.pageSize) || 20

    // 获取并验证排序参数
    const sortField = req.query.sortField as 'view_count' | 'published_date'
    const sortDirection = req.query.sortDirection as 'asc' | 'desc'
    
    // 构建筛选条件
    const filters = {
      channelId: req.query.channelId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      minViews: req.query.minViews ? Number(req.query.minViews) : undefined,
    }

    // 添加排序配置
    const sort = sortField && sortDirection ? {
      field: sortField,
      direction: sortDirection
    } : undefined

    const result = await VideoModel.getPage(page, pageSize, filters, sort)
    return res.status(200).json(result)
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
} 