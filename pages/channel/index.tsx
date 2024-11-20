'use client'

import { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import { Slider } from "../../components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Button } from "../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Label } from "../../components/ui/label"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"

const registrationTimeOptions = [
  { value: 30, label: '1个月内' },
  { value: 90, label: '3个月内' },
  { value: 180, label: '半年内' },
  { value: 365, label: '1年内' },
  { value: 730, label: '2年内' },
  { value: 0, label: '不限' },
]

// 添加分页大小选项
const pageSizeOptions = [
  { value: 20, label: '20条/页' },
  { value: 50, label: '50条/页' },
  { value: 100, label: '100条/' },
]

// 修改排序字段定义
type SortField = 'channel_name' | 'joined_date' | 'subscriber_count' | 
                'video_count' | 'view_count' | 'daily_view_increase' | 'avg_view_count' |
                'country' | 'crawl_date'

interface SortState {
  field: SortField
  direction: 'asc' | 'desc'
}

// 修改接口定义
interface ChannelResult {
  channel_id: string
  channel_name: string
  subscriber_count: number
  video_count: number
  view_count: number
  joined_date: string
  country: string
  avg_view_count: number
  daily_view_increase: number
  crawl_date: string
}

// 添加 handleRowClick 函数定义
const handleRowClick = (channelId: string) => {
  window.open(`/channel/${channelId}`, '_blank')
}

export default function ChannelQuery() {
  const [joinedDays, setJoinedDays] = useState<number>(0)
  const [queryResults, setQueryResults] = useState<ChannelResult[]>([])
  const router = useRouter()
  const [pageSize, setPageSize] = useState<number>(20)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [sort, setSort] = useState<SortState>({ field: 'view_count', direction: 'desc' })
  const [totalCount, setTotalCount] = useState<number>(0)

  // 修改防抖函数的实现
  const debouncedQuery = useCallback(
    debounce(async (params: any) => {
      try {
        const response = await fetch('/api/channels/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        })
        
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        
        const data = await response.json()
        setQueryResults(data.results || [])
        setTotalCount(data.total || 0)
      } catch (error) {
        console.error('Error fetching channels:', error)
        setQueryResults([])
        setTotalCount(0)
      }
    }, 500),
    []
  )

  // 修改查询函数
  const handleQuery = useCallback(() => {
    const params = {
      joinedDays,
      pageSize,
      currentPage,
      sort
    }
    debouncedQuery(params)
  }, [joinedDays, pageSize, currentPage, sort, debouncedQuery])

  // 修改滑块处理函数
  const handleJoinedDaysChange = useCallback((value: number[]) => {
    const newValue = registrationTimeOptions[value[0]].value
    setJoinedDays(newValue)
    setCurrentPage(1) // 重置页码
  }, [])

  // 使用 useEffect 来监听查询条件的变化
  useEffect(() => {
    handleQuery()
  }, [handleQuery])

  // 修改排序处理函数
  const handleSort = useCallback((field: SortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
    setCurrentPage(1)
  }, [])

  // 处理分页大小变化
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1) // 重置到第一页
    handleQuery()
  }

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    handleQuery()
  }

  // 获取排序图标
  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return '↕️'
    return sort.direction === 'desc' ? '↓' : '↑'
  }

  // 初始化查询
  useEffect(() => {
    handleQuery()
  }, []) // 只在组件挂载时执行一次初始查询

  return (
    <div className="w-full p-6 space-y-8 bg-green-50 text-green-900">
      {/* 搜索条件卡片 */}
      <Card className="bg-green-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-green-800">注册时间筛选</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="pt-6 px-2">
              <Slider
                id="joined-days"
                defaultValue={[0]}
                value={[registrationTimeOptions.findIndex(opt => opt.value === joinedDays)]}
                onValueChange={handleJoinedDaysChange}
                max={registrationTimeOptions.length - 1}
                step={1}
                className="w-full"
              />
              <div className="relative mt-2">
                {registrationTimeOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className="absolute text-xs text-green-600 transform -translate-x-1/2"
                    style={{
                      left: `${(index / (registrationTimeOptions.length - 1)) * 100}%`,
                      top: '0'
                    }}
                  >
                    |
                  </div>
                ))}
              </div>
              <div className="relative mt-6">
                {registrationTimeOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className="absolute text-xs text-green-600 transform -translate-x-1/2 whitespace-nowrap"
                    style={{
                      left: `${(index / (registrationTimeOptions.length - 1)) * 100}%`,
                      top: '0'
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 查询结果卡片 */}
      <Card className="bg-green-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-green-800">查询结果</CardTitle>
          <div className="flex items-center gap-4">
            <Label htmlFor="page-size">每页显示</Label>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger id="page-size" className="w-[120px]">
                <SelectValue placeholder="选择每页条数" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-green-200">
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-green-300 w-48"
                    onClick={() => handleSort('channel_name')}
                  >
                    频道名称 {getSortIcon('channel_name')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-green-300"
                    onClick={() => handleSort('crawl_date')}
                  >
                    采集日期 {getSortIcon('crawl_date')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-green-300"
                    onClick={() => handleSort('joined_date')}
                  >
                    注册时间 {getSortIcon('joined_date')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-green-300"
                    onClick={() => handleSort('country')}
                  >
                    国家 {getSortIcon('country')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-green-300"
                    onClick={() => handleSort('subscriber_count')}
                  >
                    订阅数 {getSortIcon('subscriber_count')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-green-300"
                    onClick={() => handleSort('video_count')}
                  >
                    视频数 {getSortIcon('video_count')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-green-300"
                    onClick={() => handleSort('view_count')}
                  >
                    总播放量 {getSortIcon('view_count')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-green-300"
                    onClick={() => handleSort('daily_view_increase')}
                  >
                    日增观看量 {getSortIcon('daily_view_increase')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-green-300"
                    onClick={() => handleSort('avg_view_count')}
                  >
                    平均播放量 {getSortIcon('avg_view_count')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResults && queryResults.length > 0 ? (
                  queryResults.map((channel) => (
                    <TableRow 
                      key={channel.channel_id}
                      className="cursor-pointer hover:bg-green-200 transition-colors"
                      onClick={() => handleRowClick(channel.channel_id)}
                    >
                      <TableCell className="font-medium truncate max-w-[12rem]">
                        <div className="truncate" title={channel.channel_name}>
                          {channel.channel_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{channel.crawl_date ? new Date(channel.crawl_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{channel.joined_date ? new Date(channel.joined_date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{channel.country || '-'}</TableCell>
                      <TableCell>{channel.subscriber_count?.toLocaleString() || '-'}</TableCell>
                      <TableCell>{channel.video_count?.toLocaleString() || '-'}</TableCell>
                      <TableCell>{channel.view_count?.toLocaleString() || '-'}</TableCell>
                      <TableCell>{channel.daily_view_increase?.toLocaleString() || '-'}</TableCell>
                      <TableCell>{channel.avg_view_count?.toLocaleString() || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页控件 */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-green-700">
              共 {totalCount} 条记录
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <span className="text-sm text-green-700">
                第 {currentPage} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage * pageSize >= totalCount}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}