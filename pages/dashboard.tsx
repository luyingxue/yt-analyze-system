'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart2, Users, Layers, TrendingUp } from 'lucide-react'

const mockData = {
  videoCount: 1000000,
  channelCount: 50000,
  targetTrackCount: 100,
  targetChannelCount: 5000,
  growthData: [
    { name: 'Jan', videos: 800000, channels: 40000, targetChannels: 4000, targetTracks: 80 },
    { name: 'Feb', videos: 850000, channels: 45000, targetChannels: 4500, targetTracks: 90 },
    { name: 'Mar', videos: 1000000, channels: 50000, targetChannels: 5000, targetTracks: 100 },
  ],
}

export default function Dashboard() {
  return (
    <div className="space-y-6 bg-green-50 text-green-900">
      <h2 className="text-2xl font-bold text-green-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="视频信息" value={mockData.videoCount} icon={<BarChart2 className="w-6 h-6 text-blue-500" />} />
        <StatCard title="频道" value={mockData.channelCount} icon={<Users className="w-6 h-6 text-green-500" />} />
        <StatCard title="对标赛道" value={mockData.targetTrackCount} icon={<Layers className="w-6 h-6 text-yellow-500" />} />
        <StatCard title="对标频道" value={mockData.targetChannelCount} icon={<TrendingUp className="w-6 h-6 text-purple-500" />} />
      </div>

      <div className="bg-green-100 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-green-800 mb-4">数据增长趋势</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={mockData.growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#065f46" />
            <YAxis stroke="#065f46" />
            <Tooltip />
            <Bar dataKey="videos" fill="#059669" name="视频数量" />
            <Bar dataKey="channels" fill="#34d399" name="频道数量" />
            <Bar dataKey="targetChannels" fill="#6ee7b7" name="对标频道数量" />
            <Bar dataKey="targetTracks" fill="#a7f3d0" name="对标赛道数量" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
  <div className="bg-green-100 overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-semibold text-gray-900">{value.toLocaleString()}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
)