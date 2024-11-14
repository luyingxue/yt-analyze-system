import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  Home, 
  Search, 
  Video, 
  Users, 
  Compass,
  Menu
} from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()
  
  const menuItems = [
    { 
      href: '/dashboard', 
      label: '主页',
      icon: <Home className="w-5 h-5" />
    },
    { 
      href: '/keyword', 
      label: '关键词分析',
      icon: <Search className="w-5 h-5" />
    },
    { 
      href: '/video', 
      label: '视频分析',
      icon: <Video className="w-5 h-5" />
    },
    { 
      href: '/channel', 
      label: '频道分析',
      icon: <Users className="w-5 h-5" />
    },
    { 
      href: '/track', 
      label: '赛道分析',
      icon: <Compass className="w-5 h-5" />
    },
  ]

  return (
    <aside className="w-64 bg-green-50 text-green-900 min-h-screen">
      <div className="flex items-center p-4 border-b border-green-200">
        <Menu className="w-6 h-6 mr-4 text-green-800" />
        <h1 className="text-xl font-bold text-green-800">分析系统</h1>
      </div>

      <nav className="py-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-green-200 text-green-900' 
                      : 'hover:bg-green-100 text-green-800'
                    }
                  `}>
                    <span className={`mr-4 ${isActive ? 'text-green-900' : 'text-green-700'}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4 text-xs text-green-600 border-t border-green-200">
        <p>© 2024 分析系统</p>
      </div>
    </aside>
  )
} 