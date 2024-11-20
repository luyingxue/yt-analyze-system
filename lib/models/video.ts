import { db } from '../db'

export interface Video {
  id: bigint;
  video_id?: string;
  title?: string;
  view_count?: number;
  published_date?: Date;
  crawl_date?: Date;
  channel_id?: string;
  channel_name?: string;
  canonical_base_url?: string;
}

export const VideoModel = {
  async getPage(
    page: number, 
    pageSize: number,
    filters?: {
      channelId?: string;
      startDate?: Date;
      endDate?: Date;
      minViews?: number;
    },
    sort?: {
      field: 'view_count' | 'published_date';
      direction: 'asc' | 'desc';
    }
  ): Promise<{ data: Video[]; total: number }> {
    try {
      const offset = Math.max(0, (page - 1) * pageSize)
      const limit = Math.max(1, pageSize)
      
      // 构建基础 WHERE 子句
      let whereClause = '1=1'
      const params: any[] = []

      if (filters?.channelId) {
        whereClause += ' AND channel_id = ?'
        params.push(filters.channelId)
      }
      if (filters?.startDate) {
        whereClause += ' AND published_date >= ?'
        params.push(filters.startDate)
      }
      if (filters?.endDate) {
        whereClause += ' AND published_date <= ?'
        params.push(filters.endDate)
      }
      if (filters?.minViews) {
        whereClause += ' AND view_count >= ?'
        params.push(filters.minViews)
      }

      // 获取总数
      const countSql = `SELECT COUNT(*) as total FROM videos WHERE ${whereClause}`
      const countResult = await db.query<Array<{ total: number }>>(countSql, params)
      const total = countResult[0]?.total ?? 0

      // 构建排序子句
      let orderClause = 'published_date DESC'  // 默认排序
      if (sort?.field && sort?.direction) {
        // 添加安全检查
        const validFields = ['view_count', 'published_date']
        const validDirections = ['asc', 'desc']
        
        if (validFields.includes(sort.field) && validDirections.includes(sort.direction.toLowerCase())) {
          orderClause = `${sort.field} ${sort.direction.toUpperCase()}`
        }
      }

      // 添加调试日志
      console.log('Order clause:', orderClause)

      // 获取数据
      const dataSql = `
        SELECT 
          id,
          video_id,
          title,
          view_count,
          published_date,
          channel_id,
          channel_name,
          canonical_base_url
        FROM videos 
        WHERE ${whereClause} 
        ORDER BY ${orderClause}
        LIMIT ${limit} OFFSET ${offset}
      `

      console.log('Data query:', { sql: dataSql, params })
      const data = await db.query<Video[]>(dataSql, params)

      return {
        data,
        total
      }
    } catch (error) {
      console.error('Error in getPage:', error)
      throw error
    }
  }
} 