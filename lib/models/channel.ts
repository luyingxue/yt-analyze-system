import { db } from '../db'

export interface Channel {
  id: string
  name: string
  description: string
  registration_date: Date
  total_views: number
  subscriber_count: number
  video_count: number
  track: string
  visual_style: string
  audio_style: string
  is_blacklisted: boolean
  is_target: boolean
  created_at: Date
  updated_at: Date
}

export const ChannelModel = {
  // 获取所有频道
  async getAll(): Promise<Channel[]> {
    return await db.query<Channel[]>('SELECT * FROM channels')
  },

  // 根据ID获取频道
  async getById(id: string): Promise<Channel | null> {
    const results = await db.query<Channel[]>(
      'SELECT * FROM channels WHERE id = ?',
      [id]
    )
    return results[0] || null
  },

  // 搜索频道
  async search(params: {
    registrationTime?: number
    totalViews?: number
    track?: string
    visualStyle?: string
    audioStyle?: string
    channelName?: string
    isBlacklisted?: boolean
    isTarget?: boolean
  }): Promise<Channel[]> {
    let sql = 'SELECT * FROM channels WHERE 1=1'
    const values: any[] = []

    if (params.registrationTime) {
      sql += ' AND registration_date >= ?'
      const date = new Date()
      date.setMonth(date.getMonth() - params.registrationTime)
      values.push(date)
    }

    if (params.totalViews) {
      sql += ' AND total_views >= ?'
      values.push(params.totalViews)
    }

    if (params.track) {
      sql += ' AND track = ?'
      values.push(params.track)
    }

    if (params.visualStyle) {
      sql += ' AND visual_style = ?'
      values.push(params.visualStyle)
    }

    if (params.audioStyle) {
      sql += ' AND audio_style = ?'
      values.push(params.audioStyle)
    }

    if (params.channelName) {
      sql += ' AND name LIKE ?'
      values.push(`%${params.channelName}%`)
    }

    if (params.isBlacklisted !== undefined) {
      sql += ' AND is_blacklisted = ?'
      values.push(params.isBlacklisted)
    }

    if (params.isTarget !== undefined) {
      sql += ' AND is_target = ?'
      values.push(params.isTarget)
    }

    return await db.query<Channel[]>(sql, values)
  }
} 