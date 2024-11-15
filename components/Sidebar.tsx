import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  Home, 
  Search, 
  Video, 
  Users, 
  Compass,
  Menu,
  ListFilter,
  GroupIcon
} from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()
  
  const isInSection = (path: string) => {
    return router.pathname.startsWith(path)
  }

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
      icon: <Video className="w-5 h-5" />,
      subItems: [
        {
          href: '/video',
          label: '基础查询',
          icon: <ListFilter className="w-4 h-4" />
        },
        {
          href: '/video/group',
          label: '分组查询',
          icon: <GroupIcon className="w-4 h-4" />
        }
      ]
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
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isActive = hasSubItems 
              ? isInSection(item.href) 
              : router.pathname === item.href 
            
            return (
              <li key={item.href}>
                <Link
                  href={hasSubItems ? '#' : item.href}
                  className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-green-200 text-green-900' 
                      : 'hover:bg-green-100 text-green-800'
                    }
                  `}
                >
                  <span className={`mr-4 ${isActive ? 'text-green-900' : 'text-green-700'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
                
                {/* 子菜单 */}
                {hasSubItems && (
                  <ul className="ml-10 space-y-1 mt-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = router.pathname === subItem.href
                      return (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={`w-full flex items-center px-4 py-2 text-sm transition-colors rounded-md
                              ${isSubActive 
                                ? 'bg-green-200 text-green-900' 
                                : 'hover:bg-green-100 text-green-800'
                              }
                            `}
                          >
                            <span className={`mr-3 ${isSubActive ? 'text-green-900' : 'text-green-700'}`}>
                              {subItem.icon}
                            </span>
                            <span>{subItem.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
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