'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

interface ChannelData {
  channel_id: string
  channel_name: string
  description: string
  canonical_base_url: string
  subscriber_count: number
  video_count: number
  view_count: number
  joined_date: string
  country: string
  crawl_date: string
  avg_view_count: number
  avg_subscriber_increase: number
  daily_view_increase: number
}

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function ChannelDetail() {
  const router = useRouter()
  const { id } = router.query
  const [channelData, setChannelData] = useState<ChannelData[]>([])
  const [isBenchmark, setIsBenchmark] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      fetchChannelData(id as string)
      fetchBenchmarkStatus(id as string)
    }
  }, [id])

  const fetchChannelData = async (channelId: string) => {
    try {
      const response = await fetch(`/api/channel/${channelId}`)
      const data = await response.json()
      setChannelData(data)
    } catch (error) {
      console.error('Error fetching channel data:', error)
    }
  }

  const fetchBenchmarkStatus = async (channelId: string) => {
    try {
      const response = await fetch(`/api/channel/benchmark-status?channelId=${channelId}`)
      const data = await response.json()
      setIsBenchmark(data.isBenchmark)
    } catch (error) {
      console.error('Error fetching benchmark status:', error)
    }
  }

  const toggleBenchmark = async () => {
    if (!latestData?.channel_id || isUpdating) return

    setIsUpdating(true)
    try {
      const response = await fetch('/api/channel/benchmark-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId: latestData.channel_id,
          isBenchmark: !isBenchmark
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      setIsBenchmark(!isBenchmark)
    } catch (error) {
      console.error('Error toggling benchmark:', error)
      alert('操作失败，请重试')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBlacklist = async () => {
    if (!latestData?.channel_id) return

    const confirmed = window.confirm('是否将本频道加入黑名单')
    if (!confirmed) return

    try {
      const response = await fetch('/api/channel/blacklist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelId: latestData.channel_id }),
      })

      if (!response.ok) {
        throw new Error('Failed to blacklist channel')
      }

      alert('频道已加入黑名单')
      router.push('/channel')  // 确保跳转到频道查询页
    } catch (error) {
      console.error('Error blacklisting channel:', error)
      alert('操作失败，请重试')
    }
  }

  if (!channelData || channelData.length === 0) {
    return <div>加载中...</div>
  }

  const latestData = channelData[0]

  // 准备订阅数图表数据
  const subscriberChartData = {
    labels: channelData.map(data => new Date(data.crawl_date).toLocaleDateString()).reverse(),
    datasets: [
      {
        label: '订阅数',
        data: channelData.map(data => data.subscriber_count).reverse(),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      }
    ],
  }

  // 准备视频数图表数据
  const videoChartData = {
    labels: channelData.map(data => new Date(data.crawl_date).toLocaleDateString()).reverse(),
    datasets: [
      {
        label: '视频数',
        data: channelData.map(data => data.video_count).reverse(),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      }
    ],
  }

  // 准备播放量图表数据
  const viewChartData = {
    labels: channelData.map(data => new Date(data.crawl_date).toLocaleDateString()).reverse(),
    datasets: [
      {
        label: '总播放量',
        data: channelData.map(data => data.view_count).reverse(),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.1,
      }
    ],
  }

  // 为所有图表添加共享的交互配置
  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,  // 不需要严格相交
        radius: 10,       // 增加触发半径
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false    // 不需要严格相交
    },
  }

  // 修改各个图表的配置
  const subscriberChartOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString()
          }
        },
        suggestedMin: Math.min(...channelData.map(data => data.subscriber_count)) * 0.95,
        suggestedMax: Math.max(...channelData.map(data => data.subscriber_count)) * 1.05
      }
    },
  }

  const videoChartOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString()
          }
        },
        suggestedMin: Math.min(...channelData.map(data => data.video_count)) * 0.95,
        suggestedMax: Math.max(...channelData.map(data => data.video_count)) * 1.05
      }
    },
  }

  const viewChartOptions = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString()
          }
        },
        suggestedMin: Math.min(...channelData.map(data => data.view_count)) * 0.95,
        suggestedMax: Math.max(...channelData.map(data => data.view_count)) * 1.05
      }
    },
  }

  return (
    <div className="w-full p-6 space-y-8 bg-green-50 text-green-900">
      {/* 基本信息卡片 */}
      <Card className="bg-green-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-6">
            <CardTitle className="text-xl text-green-800">频道基本信息</CardTitle>
            <button
              onClick={toggleBenchmark}
              disabled={isUpdating}
              className={`transition-colors ${
                isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
              }`}
              title={isBenchmark ? '取消对标频道' : '设为对标频道'}
            >
              <img
                src={`/images/icons/${isBenchmark ? 'benchmark-active.png' : 'benchmark-inactive.png'}`}
                alt={isBenchmark ? '取消对标频道' : '设为对标频道'}
                className="w-[114.5px] h-[27px]"
              />
            </button>
            <button
              onClick={handleBlacklist}
              className="cursor-pointer hover:opacity-80"
              title="加入黑名单"
            >
              <img
                src="/images/icons/blacklist.png"
                alt="加入黑名单"
                className="w-[114.5px] h-[27px]"
              />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-200/50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-700 mb-2">频道名称</h3>
              <p className="text-lg text-green-900">{latestData.channel_name}</p>
            </div>
            <div className="p-4 bg-green-200/50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-700 mb-2">频道ID</h3>
              <p className="text-lg text-green-900">{latestData.channel_id}</p>
            </div>
            <div className="p-4 bg-green-200/50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-700 mb-2">频道链接</h3>
              <a 
                href={`https://www.youtube.com${latestData.canonical_base_url}/shorts`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg text-green-600 hover:text-green-700 break-all"
              >
                {`https://www.youtube.com${latestData.canonical_base_url}/shorts`}
              </a>
            </div>
            <div className="p-4 bg-green-200/50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-700 mb-2">所属国家</h3>
              <p className="text-lg text-green-900">{latestData.country || '-'}</p>
            </div>
            <div className="p-4 bg-green-200/50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-700 mb-2">加入日期</h3>
              <p className="text-lg text-green-900">{new Date(latestData.joined_date).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-green-200/50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-700 mb-2">数据更新日期</h3>
              <p className="text-lg text-green-900">{new Date(latestData.crawl_date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-200/50 rounded-lg">
            <h3 className="text-sm font-semibold text-green-700 mb-2">频道描述</h3>
            <p className="text-green-900 whitespace-pre-wrap">{latestData.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* 数据分析卡片 */}
      <Card className="bg-green-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-green-800">最新数据分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左侧数据 */}
            <div className="p-4 bg-green-200 rounded-lg space-y-2">
              <p>视频数：{latestData.video_count?.toLocaleString() || '-'}</p>
              <p>订阅数：{latestData.subscriber_count?.toLocaleString() || '-'}</p>
              <p>总播放量：{latestData.view_count?.toLocaleString() || '-'}</p>
            </div>

            {/* 右侧数据 */}
            <div className="p-4 bg-green-200 rounded-lg space-y-2">
              <p>昨日新增观看量：{latestData.daily_view_increase?.toLocaleString() || '-'}</p>
              <p>平均每视频播放量：{latestData.avg_view_count?.toLocaleString() || '-'}</p>
              <p>平均每视频订阅增长：{latestData.avg_subscriber_increase?.toLocaleString() || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 历史数据表格 */}
      <Card className="bg-green-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-green-800">历史数据</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-green-200">
                <TableRow>
                  <TableHead>采集日期</TableHead>
                  <TableHead>订阅数</TableHead>
                  <TableHead>视频数</TableHead>
                  <TableHead>总播放量</TableHead>
                  <TableHead>日增观看量</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channelData.map((data, index) => (
                  <TableRow key={data.crawl_date}>
                    <TableCell>{new Date(data.crawl_date).toLocaleDateString()}</TableCell>
                    <TableCell>{data.subscriber_count?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{data.video_count?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{data.view_count?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{data.daily_view_increase?.toLocaleString() || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 趋势图卡片 */}
      <Card className="bg-green-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-green-800">数据趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-8">
            <div className="p-4 bg-green-200/50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-700 mb-4">订阅数趋势</h3>
              <div className="h-[300px]">
                <Line 
                  options={subscriberChartOptions} 
                  data={subscriberChartData}
                />
              </div>
            </div>

            <div className="p-4 bg-green-200/50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-700 mb-4">视频数趋势</h3>
              <div className="h-[300px]">
                <Line 
                  options={videoChartOptions} 
                  data={videoChartData}
                />
              </div>
            </div>

            <div className="p-4 bg-green-200/50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-700 mb-4">总播放量趋势</h3>
              <div className="h-[300px]">
                <Line 
                  options={viewChartOptions} 
                  data={viewChartData}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 