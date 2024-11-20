import { db } from '../db'

export interface Keyword {
  id: bigint;
  key_words: string;
  last_crawl_time?: Date;
  created_at?: Date;
}

export const KeywordModel = {
  // 获取所有关键词
  async getAll(): Promise<Keyword[]> {
    return await db.query<Keyword[]>(
      'SELECT id, key_words, last_crawl_time, created_at FROM search_urls ORDER BY created_at DESC'
    )
  },

  // 根据ID获取关键词
  async getById(id: bigint): Promise<Keyword | null> {
    const results = await db.query<Keyword[]>(
      'SELECT id, key_words, last_crawl_time, created_at FROM search_urls WHERE id = ?',
      [id]
    )
    return results[0] || null
  },

  // 添加新关键词
  async create(keyWords: string): Promise<bigint> {
    try {
      const result = await db.query<any>(
        'INSERT INTO search_urls (key_words) VALUES (?)',
        [keyWords]
      )
      return result.insertId
    } catch (error: any) {
      // 处理唯一键约束冲突
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('关键词已存在')
      }
      throw error
    }
  },

  // 删除关键词
  async delete(id: bigint | number): Promise<boolean> {
    const result = await db.query<any>(
      'DELETE FROM search_urls WHERE id = ?',
      [BigInt(id)]
    )
    return result.affectedRows > 0
  },

  // 搜索关键词
  async search(query: string): Promise<Keyword[]> {
    return await db.query<Keyword[]>(
      'SELECT id, key_words, last_crawl_time, created_at FROM search_urls WHERE key_words LIKE ? ORDER BY created_at DESC',
      [`%${query}%`]
    )
  },

  // 分页获取关键词
  async getPage(page: number, pageSize: number): Promise<{ data: Keyword[]; total: number }> {
    try {
      const offset = Math.max(0, (page - 1) * pageSize)
      const limit = Math.max(1, pageSize)
      
      console.log('Pagination params:', { offset, limit })

      const [rows, [countResult]] = await Promise.all([
        db.query<Keyword[]>(
          `SELECT id, key_words, last_crawl_time, created_at 
           FROM search_urls 
           ORDER BY created_at DESC 
           LIMIT ${limit} OFFSET ${offset}`
        ),
        db.query<[{ total: number }]>('SELECT COUNT(*) as total FROM search_urls')
      ])

      return {
        data: rows,
        total: countResult.total
      }
    } catch (error) {
      console.error('Error in getPage:', error)
      throw error
    }
  }
} 