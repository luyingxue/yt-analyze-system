'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Trash2 } from 'lucide-react'
import { useToast } from "../components/ui/use-toast"
import { KeywordModel, Keyword } from '../lib/models/keyword'

// 修改 Keyword 接口
interface KeywordDisplay {
  id?: number;
  text: string;  // 用于显示
}

interface Position {
  x: number;
  y: number;
  fontSize: number;
}

interface SpiralTagCloudProps {
  keywords: KeywordDisplay[];
  onKeywordClick: (keyword: KeywordDisplay) => void;
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

// 将 generateAIKeywords 移到组件外部
const generateAIKeywords = () => {
  const topics = [
    'Shorts', 'Live Streaming', 'AI Content', 'Niche Content', 'Community',
    'Storytelling', 'Cross-platform', 'Authenticity', 'Vertical Video',
    'Interactive Content', 'Micro-content', 'Personalization'
  ]
  
  return topics
    .sort(() => 0.5 - Math.random())
    .slice(0, 8)
    .map((text, index) => ({ 
      id: index + 1,
      text
    }))
}

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

    // 将位置组移到 useEffect 内部
    const newPositions: Position[] = [];
    const placedRects: CustomRect[] = [];

    const calculateWordDimensions = (text: string, fontSize: number) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return { width: 0, height: 0 };
      
      context.font = `${fontSize}px Arial`;
      const metrics = context.measureText(text);
      return {
        width: metrics.width + 30,
        height: fontSize * 1.8
      };
    };

    keywords.forEach((keyword, index) => {
      const fontSize = minFontSize + (maxFontSize - minFontSize) * (1 - index / keywords.length);
      const { width, height } = calculateWordDimensions(keyword.text, fontSize);
      
      let angle = index * 0.3;
      let radius = 30;
      let attempts = 0;
      let position;

      while (attempts < 3000) {
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        const margin = 20;
        if (
          x - width / 2 < margin || 
          x + width / 2 > containerWidth - margin || 
          y - height / 2 < margin || 
          y + height / 2 > containerHeight - margin
        ) {
          angle += 0.1;
          radius += 0.8;
          attempts++;
          continue;
        }
        
        const rect = {
          left: x - (width / 2 + 5),
          right: x + (width / 2 + 5),
          top: y - (height / 2 + 5),
          bottom: y + (height / 2 + 5)
        };

        if (placedRects.every(placedRect => !checkCollision(rect, placedRect))) {
          position = { x, y, fontSize };
          placedRects.push(rect);
          break;
        }

        angle += 0.1;
        radius += 0.8;
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
      className="relative w-full h-[500px] overflow-visible"
    >
      {keywords.map((keyword, index) => {
        const position = positions[index];
        if (!position) return null;

        const hue = (index * 24) % 360;
        
        return (
          <button
            key={keyword.text}
            onClick={() => onKeywordClick(keyword)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 
                      transition-all duration-300 hover:scale-110 
                      focus:outline-none focus:ring-2 focus:ring-green-300 
                      rounded-full px-3 py-1 cursor-pointer
                      hover:shadow-lg active:scale-95"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              fontSize: `${position.fontSize}px`,
              backgroundColor: `hsl(${hue}, 70%, 90%)`,
              color: 'hsl(160, 100%, 20%)',
              zIndex: Math.floor(position.fontSize),
              transition: 'all 0.3s ease-in-out',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  const [databaseKeywords, setDatabaseKeywords] = useState<KeywordDisplay[]>([])
  const [aiKeywords, setAiKeywords] = useState(generateAIKeywords())
  const [newKeyword, setNewKeyword] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { toast } = useToast()

  // 修改计算总页数的方式
  const totalPages = Math.ceil(totalCount / pageSize)

  // 修改获取当前页的关键词函数
  const getCurrentPageKeywords = () => {
    const currentPageData = databaseKeywords
    const middleIndex = Math.ceil(currentPageData.length / 2)
    
    return {
      leftColumn: currentPageData.slice(0, middleIndex),
      rightColumn: currentPageData.slice(middleIndex)
    }
  }

  const handleDatabaseKeywordClick = (keyword: KeywordDisplay) => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword.text)}`
    window.open(searchUrl, '_blank')
    
    toast({
      title: "正在跳转 🚀",
      description: `正在打开 "${keyword.text}" 的 YouTube 搜索结果`,
      variant: "default",
    })
  }

  const handleAIKeywordClick = (keyword: KeywordDisplay) => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword.text)}`
    window.open(searchUrl, '_blank')
    
    // 添加点击反馈
    toast({
      title: "正在跳转 🚀",
      description: `正在打开 "${keyword.text}" 的 YouTube 搜索结果`,
      variant: "default",
    })
  }

  const handleRefreshAIKeywords = () => {
    setAiKeywords(generateAIKeywords())
  }

  const handleAddKeyword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newKeyword.trim()) return

    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyWords: newKeyword.trim() }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '添加失败')
      }
      
      await loadKeywords()
      setNewKeyword('')
      toast({
        title: "添加成功",
        description: "新关键词已添加到数据库",
        variant: "default",
      })
    } catch (error: any) {
      console.error('Failed to add keyword:', error)
      toast({
        title: "⚠️ 添加失败",
        description: error.message === '关键词已存在' 
          ? "关键词已存在，请调整" 
          : "无法添加新关键词",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewKeyword(e.target.value)
  }

  const handleDeleteKeyword = async (id?: number) => {
    if (id === undefined) return

    // 添加确认对话框
    if (!window.confirm('确定要删除这个关键词吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/keywords?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Network response was not ok')
      await loadKeywords()
      toast({
        title: "删除成功",
        description: "关键词已从数据库中删除",
        variant: "default",
      })
    } catch (error) {
      console.error('Failed to delete keyword:', error)
      toast({
        title: "删除失败",
        description: "无法删除关键词",
        variant: "destructive",
      })
    }
  }

  // 添加数据加载
  useEffect(() => {
    loadKeywords()
  }, [currentPage, pageSize])

  const loadKeywords = async () => {
    try {
      const response = await fetch(`/api/keywords?page=${currentPage}&pageSize=${pageSize}`)
      if (!response.ok) throw new Error('Network response was not ok')
      const result = await response.json()
      setDatabaseKeywords(result.data.map((k: any) => ({
        id: k.id,
        text: k.key_words
      })))
      setTotalCount(result.total)
    } catch (error) {
      console.error('Failed to load keywords:', error)
      toast({
        title: "加载失败",
        description: "无法加载关键词列表",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8 bg-green-50 text-green-900">
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
              <Button 
                onClick={handleRefreshAIKeywords} 
                variant="outline" 
                className="bg-green-200 text-green-800 hover:bg-green-300" 
                size="sm"
              >
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
          <div className="flex justify-between items-center">
            <CardTitle>数据库关键词列表</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm">每页显示：</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="bg-green-50 border border-green-200 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddKeyword} className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="输入新关键词"
              value={newKeyword}
              onChange={handleInputChange}
              className="flex-grow bg-white border-green-300 text-green-900 focus:ring-green-200"
            />
            <Button 
              type="submit" 
              className="whitespace-nowrap min-w-[100px] bg-green-600 hover:bg-green-700"
            >
              添加关键词
            </Button>
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左列表 */}
            <Table className="bg-green-100">
              <TableHeader className="bg-green-200">
                <TableRow>
                  <TableHead>关键词</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageKeywords().leftColumn.map((keyword) => (
                  <TableRow key={keyword.id}>
                    <TableCell>{keyword.text}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKeyword(keyword.id)}
                        className="hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="删除关键词"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 右列表 */}
            <Table className="bg-green-100">
              <TableHeader className="bg-green-200">
                <TableRow>
                  <TableHead>关键词</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageKeywords().rightColumn.map((keyword) => (
                  <TableRow key={keyword.id}>
                    <TableCell>{keyword.text}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKeyword(keyword.id)}
                        className="hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="删除关键词"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 分页控制 */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-green-700">
              总计 {totalCount} 个关键词
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <span className="text-sm">
                第 {currentPage} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
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