import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 数据库配置
export const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

console.log('Database config:', {
  host: dbConfig.host,
  database: dbConfig.database,
  user: dbConfig.user,
})

// 创建连接池
const pool = mysql.createPool(dbConfig)

// 测试连接
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('Database connection successful')
    connection.release()
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// 通用查询函数
async function query<T>(sql: string, params?: any[]): Promise<T> {
  console.log('Executing query:', sql, params)
  try {
    const [rows] = await pool.execute(sql, params)
    console.log('Query successful, rows:', rows)
    return rows as T
  } catch (error) {
    console.error('Query error:', error)
    throw error
  }
}

// 初始化时测试连接
testConnection()
  .then(success => {
    if (!success) {
      console.error('Initial database connection test failed')
    }
  })
  .catch(error => {
    console.error('Error during initial connection test:', error)
  })

// 导出数据库接口
export const db = {
  query,
  testConnection,
  pool
} 