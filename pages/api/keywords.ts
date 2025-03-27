import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'

interface CountResult {
  total: number
}

interface KeywordResult {
  id: number
  key_words: string
  last_crawl_date: string | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 10
    const offset = (page - 1) * pageSize

    try {
      // 获取总数
      const countResults = await db.query<CountResult[]>(
        'SELECT COUNT(*) as total FROM key_words'
      )
      const total = countResults[0]?.total || 0

      // 获取分页数据
      const data = await db.query<KeywordResult[]>(
        `SELECT id, key_words, last_crawl_date 
         FROM key_words 
         ORDER BY id DESC 
         LIMIT ${pageSize} OFFSET ${offset}`
      )

      res.status(200).json({ 
        data, 
        total,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      })
    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    const { keyWords } = req.body
    if (!keyWords) {
      return res.status(400).json({ message: 'Keywords are required' })
    }

    try {
      await db.query(
        'INSERT INTO key_words (key_words) VALUES (?)',
        [keyWords]
      )
      res.status(201).json({ message: 'Keyword added successfully' })
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: '关键词已存在' })
      }
      console.error('Database error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ message: 'ID is required' })
    }

    try {
      await db.query('DELETE FROM key_words WHERE id = ?', [id])
      res.status(200).json({ message: 'Keyword deleted successfully' })
    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
} 