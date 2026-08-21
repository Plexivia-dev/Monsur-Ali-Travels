import * as React from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Compass, Layers, User, AlertCircle, LogOut } from 'lucide-react'
import { RiTranslate2 } from '@remixicon/react'
import { useAuth } from '@/store/useAuthStore'
import { LanguageDropdown } from '@/components/blocks/dropdown-language'
import { ProfileDropdown } from '@/components/blocks/dropdown-profile'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import logo from '@/assets/logo.png'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Sales Metrics', path: '/admin/metrics', icon: Compass },
    { name: 'Language Dropdown', path: '/admin/dropdown', icon: Layers },
    { name: 'Profile Dropdown', path: '/admin/profile-dropdown', icon: User },
    { name: 'Error Dialog', path: '/admin/dialog', icon: AlertCircle },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col justify-between hidden md:flex">
        <div className="flex flex-col">
          <div className="h-16 px-6 border-b border-border flex items-center gap-3">
            <img src={logo} alt="Logo" className="size-8 p-1 bg-white rounded-full object-contain shadow-sm" />
            <span className="font-bold text-sm tracking-wide text-foreground uppercase">
              Monsur Ali <span className="text-blue-500 font-extrabold">Travels</span>
            </span>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-3"
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg md:text-xl">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Admin Panel'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <LanguageDropdown
              align="end"
              trigger={
                <Button variant="ghost" size="icon" className="rounded-full">
                  <RiTranslate2 className="size-5" />
                </Button>
              }
            />
            <ProfileDropdown
              align="end"
              trigger={
                <button className="rounded-full relative border border-border">
                  <Avatar size="default" className="cursor-pointer">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="absolute right-0 bottom-0 block size-2.5 rounded-full bg-green-600 ring-2 ring-card" />
                </button>
              }
            />
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
