import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
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

// 添加日期格式化函数
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
}

// 修改首帧图片 URL 生成函数
const getFrameUrl = (videoId?: string) => {
  if (!videoId) return ''
  return `https://i.ytimg.com/vi/${videoId}/hq720.jpg`
}

// 修改排序项类型
type SortOption = {
  field: 'view_count' | 'published_date';
  direction: 'asc' | 'desc';
}

// 修改排序选项配置
const sortOptions = [
  { value: 'view_count-desc', label: '播放量（从高到低）', group: 'view_count' },
  { value: 'view_count-asc', label: '播放量（从低到高）', group: 'view_count' },
  { value: 'published_date-desc', label: '发布日期（最新）', group: 'published_date' },
  { value: 'published_date-asc', label: '发布日期（最早）', group: 'published_date' },
] as const

// 定义表头文本常量
const TABLE_HEADERS = {
  THUMBNAIL: "首帧图片",
  TITLE: "标题",
  CHANNEL: "频道",
  PUBLISH_DATE: "发布日期",
  VIEW_COUNT: "播放量"
} as const

// 添加计算总页数的函数
const getTotalPages = (total: number, size: number) => Math.ceil(total / size)

export default function VideoAnalysis() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState({
    channelId: '',
    startDate: '',
    endDate: '',
    minViews: ''
  })
  const { toast } = useToast()

  // 修改初始排序状态
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'published_date',
    direction: 'desc'
  })

  const loadVideos = async () => {
    try {
      setLoading(true)
      
      // 打印当前排序状态
      console.log('当前排序:', sortOption);

      // 构建查询参数
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortField: sortOption.field,
        sortDirection: sortOption.direction,
        ...(filters.channelId && { channelId: filters.channelId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minViews && { minViews: filters.minViews })
      });

      console.log('发送查询:', {
        页码: page,
        每页数量: pageSize,
        排序: sortOption,
        筛选: filters,
        完整URL: `/api/video?${queryParams.toString()}`
      });

      const response = await fetch(`/api/video?${queryParams}`)
      if (!response.ok) throw new Error('Network response was not ok')
      
      const result = await response.json()
      
      // 打印响应数据
      console.log('响应数据:', {
        总数: result.total,
        当前页数据: result.data.length
      });

      setVideos(result.data)
      setTotalCount(result.total)
    } catch (error) {
      console.error('加载失败:', error)
      toast({
        title: "加载失败",
        description: "无法加载视频列表",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('组件加载，执行初始查询', {
      初始排序: sortOption,
      页码: page,
      每页数量: pageSize
    });
    loadVideos()
  }, []) // 只在组件加载时执行一次

  useEffect(() => {
    // 跳过初始渲染
    const isInitialRender = !sortOption || !page || !pageSize;
    if (isInitialRender) return;

    console.log('排序或分页变化，重新查询', {
      排序: sortOption,
      页码: page,
      每页数量: pageSize
    });
    loadVideos()
  }, [sortOption, page, pageSize])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    setPage(1)  // 重置到第一页
    loadVideos()
  }

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

  // 修改排序处理函数
  const handleSortChange = (value: string) => {
    console.log('切换排序:', {
      原值: value,
      解析后: value.split('-')
    });
    const [field, direction] = value.split('-') as [SortOption['field'], SortOption['direction']]
    setSortOption({ field, direction })
    setPage(1)  // 重置到第一页
  }

  return (
    <div className="space-y-6 bg-green-50 text-green-900 p-6">
      <Card className="bg-green-100">
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="频道ID"
              value={filters.channelId}
              onChange={e => handleFilterChange('channelId', e.target.value)}
              className="bg-white"
            />
            <Input
              type="date"
              value={filters.startDate}
              onChange={e => handleFilterChange('startDate', e.target.value)}
              className="bg-white"
            />
            <Input
              type="date"
              value={filters.endDate}
              onChange={e => handleFilterChange('endDate', e.target.value)}
              className="bg-white"
            />
            <Input
              type="number"
              placeholder="最小播放量"
              value={filters.minViews}
              onChange={e => handleFilterChange('minViews', e.target.value)}
              className="bg-white"
            />
          </div>
          <Button onClick={handleSearch}>搜索</Button>
        </CardContent>
      </Card>

      <Card className="bg-green-100">
        <CardHeader>
          <CardTitle>排序条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 播放量排序 */}
            <div className="space-y-3">
              <div className="font-medium text-green-800">按播放量排序</div>
              <div className="space-y-2">
                {sortOptions
                  .filter(opt => opt.group === 'view_count')
                  .map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:text-green-700"
                    >
                      <input
                        type="radio"
                        name="sort-option"
                        value={option.value}
                        checked={`${sortOption.field}-${sortOption.direction}` === option.value}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-4 h-4 text-green-600 bg-green-100 border-green-300 focus:ring-green-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
              </div>
            </div>

            {/* 发布日期排序 */}
            <div className="space-y-3">
              <div className="font-medium text-green-800">按发布日期排序</div>
              <div className="space-y-2">
                {sortOptions
                  .filter(opt => opt.group === 'published_date')
                  .map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:text-green-700"
                    >
                      <input
                        type="radio"
                        name="sort-option"
                        value={option.value}
                        checked={`${sortOption.field}-${sortOption.direction}` === option.value}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-4 h-4 text-green-600 bg-green-100 border-green-300 focus:ring-green-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>视频列表</CardTitle>
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
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{TABLE_HEADERS.THUMBNAIL}</TableHead>
                    <TableHead>{TABLE_HEADERS.TITLE}</TableHead>
                    <TableHead>{TABLE_HEADERS.CHANNEL}</TableHead>
                    <TableHead>{TABLE_HEADERS.PUBLISH_DATE}</TableHead>
                    <TableHead>{TABLE_HEADERS.VIEW_COUNT}</TableHead>
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