'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Trash2 } from 'lucide-react'
import { useToast } from "../components/ui/use-toast"
import Layout from '../components/Layout'

// 添加类型定义
interface Keyword {
  id?: number;
  text: string;
  value?: number;
}

interface Position {
  x: number;
  y: number;
  fontSize: number;
}

interface SpiralTagCloudProps {
  keywords: Keyword[];
  onKeywordClick: (keyword: Keyword) => void;
}

// 模拟数据库中的关键词
const initialDatabaseKeywords = [
  { id: 1, text: 'YouTube', value: 100 },
  { id: 2, text: 'Video', value: 95 },
  { id: 3, text: 'Content', value: 90 },
  { id: 4, text: 'Creator', value: 85 },
  { id: 5, text: 'Monetization', value: 80 },
  { id: 6, text: 'Algorithm', value: 75 },
  { id: 7, text: 'Subscribers', value: 70 },
  { id: 8, text: 'Engagement', value: 65 },
  { id: 9, text: 'Trending', value: 60 },
  { id: 10, text: 'Analytics', value: 55 },
  { id: 11, text: 'SEO', value: 50 },
  { id: 12, text: 'Thumbnail', value: 48 },
  { id: 13, text: 'Viral', value: 45 },
  { id: 14, text: 'Playlist', value: 43 },
  { id: 15, text: 'Collaboration', value: 40 },
  { id: 16, text: 'Niche', value: 38 },
  { id: 17, text: 'Audience', value: 35 },
  { id: 18, text: 'Editing', value: 33 },
  { id: 19, text: 'Sponsorship', value: 30 },
  { id: 20, text: 'Livestream', value: 28 },
  { id: 21, text: 'Vlog', value: 25 },
  { id: 22, text: 'Podcast', value: 23 },
  { id: 23, text: 'Hashtag', value: 20 },
  { id: 24, text: 'Copyright', value: 18 },
  { id: 25, text: 'Branding', value: 15 },
  { id: 26, text: 'Clickbait', value: 13 },
  { id: 27, text: 'Subscriber', value: 10 },
  { id: 28, text: 'Demonetized', value: 8 },
  { id: 29, text: 'Premiere', value: 5 },
  { id: 30, text: 'Annotation', value: 3 },
]


const generateAIKeywords = () => {
  const topics = ['Shorts', 'Live Streaming', 'AI Content', 'Niche Content', 'Community', 'Storytelling', 'Cross-platform', 'Authenticity', 'Vertical Video', 'Interactive Content', 'Micro-content', 'Personalization', 'Virtual Reality', 'Augmented Reality', 'Social Commerce', 'User-generated Content', 'Influencer Marketing', 'Video SEO', 'Multi-channel Networks', 'Subscription Model']
  
  return topics
    .sort(() => 0.5 - Math.random())
    .slice(0, 15)
    .map((text) => ({ text }))
}

// 添加 DOMRect 类型的接口
interface CustomRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// 修改碰撞检测函数的类型
const checkCollision = (rect1: CustomRect, rect2: CustomRect): boolean => {
  return !(rect1.right < rect2.left || 
           rect1.left > rect2.right || 
           rect1.bottom < rect2.top || 
           rect1.top > rect2.bottom);
};

// 添加位置数组的类型
const newPositions: Position[] = [];
const placedRects: CustomRect[] = [];

// 修改组件定义
const SpiralTagCloud: React.FC<SpiralTagCloudProps> = ({ keywords, onKeywordClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const maxFontSize = 24;
  const minFontSize = 14;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const calculateWordDimensions = (text: string, fontSize: number) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return { width: 0, height: 0 };
      
      context.font = `${fontSize}px Arial`;
      const metrics = context.measureText(text);
      return {
        width: metrics.width + 20,
        height: fontSize * 1.5
      };
    };

    keywords.forEach((keyword, index) => {
      const fontSize = minFontSize + (maxFontSize - minFontSize) * (1 - index / keywords.length);
      const { width, height } = calculateWordDimensions(keyword.text, fontSize);
      
      let angle = index * 0.2;
      let radius = 20;
      let attempts = 0;
      let position;

      while (attempts < 3000) {
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        const rect = {
          left: x - width / 2,
          right: x + width / 2,
          top: y - height / 2,
          bottom: y + height / 2
        };

        if (placedRects.every(placedRect => !checkCollision(rect, placedRect))) {
          position = { x, y, fontSize };
          placedRects.push(rect);
          break;
        }

        angle += 0.03;
        radius += 0.4;
        attempts++;
      }

      if (position) {
        newPositions.push(position);
      }
    });

    setPositions(newPositions);
  }, [keywords]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[400px] overflow-hidden"
    >
      {keywords.map((keyword, index) => {
        const position = positions[index];
        if (!position) return null;

        const hue = (index * 24) % 360;
        
        return (
          <button
            key={keyword.text}
            onClick={() => onKeywordClick(keyword)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full px-3 py-1"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              fontSize: `${position.fontSize}px`,
              backgroundColor: `hsl(${hue}, 70%, 90%)`,
              color: 'hsl(160, 100%, 20%)',
              zIndex: Math.floor(position.fontSize),
              transition: 'all 0.5s ease-in-out',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {keyword.text}
          </button>
        );
      })}
    </div>
  );
};

export default function KeywordAnalysis() {
  const [databaseKeywords, setDatabaseKeywords] = useState(initialDatabaseKeywords)
  const [aiKeywords, setAiKeywords] = useState(generateAIKeywords())
  const [newKeyword, setNewKeyword] = useState('')
  const { toast } = useToast()

  const handleDatabaseKeywordClick = (keyword: Keyword) => {
    navigator.clipboard.writeText(keyword.text).then(() => {
      toast({
        title: "已复制关键词",
        description: `"${keyword.text}" 已复制到剪贴板`,
      })
    })
  }

  const handleAIKeywordClick = (keyword: Keyword) => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(keyword.text)}`, '_blank')
  }

  const handleRefreshAIKeywords = () => {
    setAiKeywords(generateAIKeywords())
  }

  const handleAddKeyword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newKeyword.trim()) return

    const newId = Math.max(...databaseKeywords.map(k => k.id || 0)) + 1
    setDatabaseKeywords([
      ...databaseKeywords,
      { id: newId, text: newKeyword.trim(), value: 50 }
    ])
    setNewKeyword('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewKeyword(e.target.value)
  }

  const handleDeleteKeyword = (id?: number) => {
    if (id === undefined) return
    setDatabaseKeywords(databaseKeywords.filter(k => k.id !== id))
  }

  return (
    <Layout>
      <div className="space-y-8 bg-green-50 text-green-900">
        <h1 className="text-3xl font-bold mb-6 text-green-800">关键词分析</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-green-100">
            <CardHeader>
              <CardTitle>数据库关键词云</CardTitle>
            </CardHeader>
            <CardContent>
              <SpiralTagCloud keywords={databaseKeywords} onKeywordClick={handleDatabaseKeywordClick} />
            </CardContent>
          </Card>

          <Card className="bg-green-100">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>AI推测新关键词云</CardTitle>
                <Button onClick={handleRefreshAIKeywords} variant="outline" className="bg-green-200 text-green-800 hover:bg-green-300" size="sm">
                  刷新
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SpiralTagCloud keywords={aiKeywords} onKeywordClick={handleAIKeywordClick} />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-green-100">
          <CardHeader>
            <CardTitle>数据库关键词列表</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddKeyword} className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="输入新关键词"
                value={newKeyword}
                onChange={handleInputChange}
                className="flex-grow bg-green-100 border-green-300 text-green-900"
              />
              <Button type="submit">添加关键词</Button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1].map((columnIndex) => (
                <Table key={columnIndex} className="bg-green-100">
                  <TableHeader className="bg-green-200">
                    <TableRow>
                      <TableHead>关键词</TableHead>
                      <TableHead>权重</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {databaseKeywords
                      .filter((_, index) => index % 2 === columnIndex)
                      .map((keyword) => (
                        <TableRow key={keyword.id}>
                          <TableCell>{keyword.text}</TableCell>
                          <TableCell>{keyword.value}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteKeyword(keyword.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}