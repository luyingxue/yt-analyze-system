import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Button } from "../../components/ui/button"
import { useToast } from "../../components/ui/use-toast"

interface Video {
  id: bigint;
  video_id?: string;
  title?: string;
  view_count?: number;
  published_date?: string;
  channel_name?: string;
  canonical_base_url?: string;
}

// 工具函数
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
}

const getFrameUrl = (videoId?: string) => {
  if (!videoId) return ''
  return `https://i.ytimg.com/vi/${videoId}/hq720.jpg`
}

const getTotalPages = (total: number, size: number) => Math.ceil(total / size)

export default function VideoGroupAnalysis() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const { toast } = useToast()

  const loadVideos = async () => {
    try {
      setLoading(true)
      
      // 计算 ROW_NUMBER 范围
      const start = (page - 1) * pageSize + 1;
      const end = page * pageSize;
      
      // 构建查询参数
      const queryParams = new URLSearchParams({
        queryType: 'row_number',  // 明确指示使用 ROW_NUMBER 查询
        groupBy: 'channel',       // 指示按频道分组
        rowStart: start.toString(),
        rowEnd: end.toString()
      });

      // 打印请求信息
      console.log('发送分组查询:', {
        URL: `/api/video/group?${queryParams.toString()}`,  // 使用专门的分组查询端点
        参数: {
          queryType: 'row_number',
          groupBy: 'channel',
          rowStart: start,
          rowEnd: end
        }
      });

      const response = await fetch(`/api/video/group?${queryParams}`)  // 使用专门的分组查询端点
      if (!response.ok) throw new Error('Network response was not ok')
      
      const result = await response.json()
      
      // 打印响应数据
      console.log('分组查询响应:', {
        状态: response.status,
        总数: result.total,
        数据条数: result.data?.length,
        首条数据: result.data?.[0]
      });

      if (!result.data) {
        throw new Error('Response data is missing')
      }

      setVideos(result.data)
      setTotalCount(result.total)
    } catch (error) {
      console.error('分组查询失败:', error)
      toast({
        title: "加载失败",
        description: "无法加载分组数据",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 组件加载时执行一次查询
  useEffect(() => {
    console.log('分组查询页面加载');
    loadVideos()
  }, [])

  // 当页码或每页数量变化时重新加载
  useEffect(() => {
    console.log('分页参数变化:', { page, pageSize });
    loadVideos()
  }, [page, pageSize])

  const handleVideoClick = (videoId?: string) => {
    if (!videoId) return
    const url = `https://www.youtube.com/shorts/${videoId}`
    window.open(url, '_blank')
  }

  const handleChannelClick = (canonicalBaseUrl?: string) => {
    if (!canonicalBaseUrl) return
    const url = `https://www.youtube.com${canonicalBaseUrl}/shorts`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-6 bg-green-50 text-green-900 p-6">
      <Card className="bg-green-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>按频道视频数量分组（视频数量多的频道排在前面）</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm">每页显示：</span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">加载中...</div>
          ) : videos.length === 0 ? (
            <div className="text-center py-4">暂无数据</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>首帧图片</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead>频道</TableHead>
                    <TableHead>发布日期</TableHead>
                    <TableHead>播放量</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow 
                      key={String(video.id)} 
                      className="hover:bg-green-200/50 h-32"
                    >
                      <TableCell className="w-32 py-4">
                        <img
                          src={getFrameUrl(video.video_id)}
                          alt={video.title || '视频首帧'}
                          className="w-32 h-24 object-cover rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleVideoClick(video.video_id)}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder.png'
                            target.alt = '图片加载失败'
                          }}
                        />
                      </TableCell>
                      <TableCell 
                        className="font-medium max-w-md truncate cursor-pointer hover:text-green-700 hover:underline py-4"
                        onClick={() => handleVideoClick(video.video_id)}
                        title={video.title}
                      >
                        {video.title}
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer hover:text-green-700 hover:underline py-4"
                        onClick={() => handleChannelClick(video.canonical_base_url)}
                      >
                        {video.channel_name}
                      </TableCell>
                      <TableCell className="py-4">{formatDate(video.published_date)}</TableCell>
                      <TableCell className="py-4">{video.view_count?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-green-700">
                  总计 {totalCount} 个视频
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(1)}
                    disabled={page === 1 || loading}
                  >
                    首页
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    上一页
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm">第</span>
                    <Select 
                      value={page.toString()} 
                      onValueChange={(value) => setPage(Number(value))}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(
                          { length: getTotalPages(totalCount, pageSize) },
                          (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <span className="text-sm">/ {getTotalPages(totalCount, pageSize)} 页</span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * pageSize >= totalCount || loading}
                  >
                    下一页
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(getTotalPages(totalCount, pageSize))}
                    disabled={page * pageSize >= totalCount || loading}
                  >
                    尾页
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 