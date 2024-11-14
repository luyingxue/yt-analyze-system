import './globals.css'
import Sidebar from './components/Sidebar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 