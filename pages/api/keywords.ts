import type { NextApiRequest, NextApiResponse } from 'next'
import { KeywordModel } from '../../lib/models/keyword'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API Request:', req.method, req.query, req.body)

  try {
    switch (req.method) {
      case 'GET':
        const page = Math.max(1, Number(req.query.page) || 1)
        const pageSize = Math.max(1, Number(req.query.pageSize) || 10)
        console.log('Fetching keywords:', { page, pageSize })
        
        const result = await KeywordModel.getPage(page, pageSize)
        console.log('Query result:', result)
        
        return res.status(200).json(result)

      case 'POST':
        const { keyWords } = req.body
        if (!keyWords || typeof keyWords !== 'string') {
          return res.status(400).json({ error: 'Invalid keyword' })
        }
        
        try {
          console.log('Creating keyword:', keyWords)
          const newId = await KeywordModel.create(keyWords)
          return res.status(201).json({ id: newId })
        } catch (error: any) {
          if (error.message === '关键词已存在') {
            return res.status(409).json({ message: '关键词已存在' })
          }
          throw error
        }

      case 'DELETE':
        const id = BigInt(req.query.id as string)
        if (!id) {
          return res.status(400).json({ error: 'Invalid ID' })
        }
        
        console.log('Deleting keyword:', id)
        const success = await KeywordModel.delete(id)
        return res.status(success ? 200 : 404).json({ success })

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
} 