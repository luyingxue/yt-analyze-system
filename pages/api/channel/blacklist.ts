import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { channelId } = req.body

  if (!channelId) {
    return res.status(400).json({ message: 'Channel ID is required' })
  }

  try {
    // 更新 channel_base 表
    const updateQuery = `
      UPDATE channel_base 
      SET is_blacklist = 1 
      WHERE channel_id = ?
    `
    await db.query(updateQuery, [channelId])

    // 删除 channel_crawl 表中的数据
    const deleteQuery = `
      DELETE FROM channel_crawl 
      WHERE channel_id = ?
    `
    await db.query(deleteQuery, [channelId])

    res.status(200).json({ message: 'Channel successfully blacklisted' })
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 