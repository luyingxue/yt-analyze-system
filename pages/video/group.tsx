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

// 添加频道分组接口
interface ChannelGroup {
  channel_id: string;
  channel_name: string;
  video_count: number;
  canonical_base_url?: string;
}

export default function VideoGroupAnalysis() {
  const [channelGroups, setChannelGroups] = useState<ChannelGroup[]>([])
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set())
  const [channelVideos, setChannelVideos] = useState<Record<string, Video[]>>({})
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const { toast } = useToast()

  // 加载频道分组数据
  const loadChannelGroups = async () => {
    try {
      setLoading(true)
      
      const start = (page - 1) * pageSize + 1;
      const end = page * pageSize;
      
      const queryParams = new URLSearchParams({
        start: start.toString(),
        end: end.toString()
      });

      const response = await fetch(`/api/video/group?${queryParams}`)
      if (!response.ok) throw new Error('Network response was not ok')
      
      const result = await response.json()
      setChannelGroups(result.data)
      setTotalCount(result.total)
    } catch (error) {
      console.error('加载失败:', error)
      toast({
        title: "加载失败",
        description: "无法加载频道分组数据",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 加载频道视频
  const loadChannelVideos = async (channelId: string) => {
    try {
      const response = await fetch(`/api/video/group/channel?channelId=${channelId}`)
      if (!response.ok) throw new Error('Network response was not ok')
      
      const result = await response.json()
      setChannelVideos(prev => ({
        ...prev,
        [channelId]: result.data
      }))
    } catch (error) {
      console.error('加载频道视频失败:', error)
      toast({
        title: "加载失败",
        description: "无法加载频道视频",
        variant: "destructive",
      })
    }
  }

  // 处理频道展开/折叠
  const toggleChannel = async (channelId: string) => {
    const newExpandedChannels = new Set(expandedChannels)
    if (expandedChannels.has(channelId)) {
      newExpandedChannels.delete(channelId)
    } else {
      newExpandedChannels.add(channelId)
      if (!channelVideos[channelId]) {
        await loadChannelVideos(channelId)
      }
    }
    setExpandedChannels(newExpandedChannels)
  }

  useEffect(() => {
    loadChannelGroups()
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
          ) : channelGroups.length === 0 ? (
            <div className="text-center py-4">暂无数据</div>
          ) : (
            <div className="space-y-4">
              {channelGroups.map((channel) => (
                <div key={channel.channel_id} className="border rounded-lg bg-white">
                  {/* 频道标题行 */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-green-50"
                    onClick={() => toggleChannel(channel.channel_id)}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`transform transition-transform ${
                        expandedChannels.has(channel.channel_id) ? 'rotate-90' : ''
                      }`}>
                        ▶
                      </span>
                      <span 
                        className="font-medium hover:text-green-700 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (channel.canonical_base_url) {
                            window.open(`https://www.youtube.com${channel.canonical_base_url}/shorts`, '_blank')
                          }
                        }}
                      >
                        {channel.channel_name}
                      </span>
                    </div>
                    <span className="text-sm text-green-600">
                      {channel.video_count} 个视频
                    </span>
                  </div>

                  {/* 展开的视频列表 */}
                  {expandedChannels.has(channel.channel_id) && (
                    <div className="border-t">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>首帧图片</TableHead>
                            <TableHead>标题</TableHead>
                            <TableHead>发布日期</TableHead>
                            <TableHead>播放量</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {channelVideos[channel.channel_id]?.map((video) => (
                            <TableRow 
                              key={String(video.id)} 
                              className="hover:bg-green-50 h-32"
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
                              <TableCell className="py-4">{formatDate(video.published_date)}</TableCell>
                              <TableCell className="py-4">{video.view_count?.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 分页控件 */}
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
        </CardContent>
      </Card>
    </div>
  )
} 