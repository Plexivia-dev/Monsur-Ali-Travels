import * as React from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Compass, Layers, User, AlertCircle, LogOut, Menu, X } from 'lucide-react'
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

  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Sales Metrics', path: '/admin/metrics', icon: Compass },
    { name: 'Language Dropdown', path: '/admin/dropdown', icon: Layers },
    { name: 'Profile Dropdown', path: '/admin/profile-dropdown', icon: User },
    { name: 'Error Dialog', path: '/admin/dialog', icon: AlertCircle },
  ]

  const handleMenuItemClick = (e, itemPath) => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false)
    } else {
      if (isCollapsed) {
        setIsCollapsed(false)
      } else {
        setIsCollapsed(true)
      }
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans relative">
      {/* Mobile Sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar drawer (Fixed viewport height constraints to prevent empty bottom spaces) */}
      <aside 
        className={`fixed top-0 left-0 h-dvh w-64 bg-card border-r border-border flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between bg-primary text-white shrink-0">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="size-8 p-1 bg-white rounded-full object-contain shadow-sm shrink-0" />
              <span className="font-bold text-sm tracking-wide text-white uppercase font-sans">
                Monsur Ali <span className="text-white/80 font-extrabold">Travels</span>
              </span>
            </div>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded-md border border-white/40 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer shrink-0"
              title="Close Navigation"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-2 flex-grow">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleMenuItemClick(e, item.path)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="text-[15px]">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer Logout Button inside flex scroll container */}
          <div className="p-3 border-t border-border shrink-0 bg-card">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-3"
            >
              <LogOut className="size-5 shrink-0" />
              <span className="text-[15px]">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside 
        className={`h-screen sticky top-0 flex flex-col justify-between bg-card border-r border-border transition-all duration-300 ease-in-out hidden md:flex shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`h-16 px-4 border-b border-white/10 flex items-center bg-primary text-white shrink-0 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}>
            <div 
              onClick={() => isCollapsed && setIsCollapsed(false)}
              className={`flex items-center gap-3 ${isCollapsed ? 'cursor-pointer' : ''}`}
            >
              <img src={logo} alt="Logo" className="size-8 p-1 bg-white rounded-full object-contain shadow-sm shrink-0" />
              {!isCollapsed && (
                <span className="font-bold text-sm tracking-wide text-white uppercase font-sans">
                  Monsur Ali <span className="text-white/80 font-extrabold">Travels</span>
                </span>
              )}
            </div>
            {!isCollapsed && (
              <button 
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-md border border-white/40 text-white/80 hover:text-white hover:border-white transition-colors cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-2 flex-grow overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleMenuItemClick(e, item.path)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="size-5 shrink-0" />
                  {!isCollapsed && <span className="text-[15px]">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Footer Logout Button */}
          <div className="p-3 border-t border-border shrink-0 bg-card">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className={`w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-3 ${
                isCollapsed ? 'px-0 justify-center' : ''
              }`}
              title={isCollapsed ? "Sign Out" : undefined}
            >
              <LogOut className="size-5 shrink-0" />
              {!isCollapsed && <span className="text-[15px]">Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-white/10 bg-primary text-white px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Hamburger button on mobile */}
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-md hover:bg-white/10 text-white md:hidden cursor-pointer shrink-0"
              title="Open Navigation"
            >
              <Menu className="size-5" />
            </button>
            <h2 className="font-bold text-base md:text-lg text-white tracking-wide uppercase font-sans">
              Admin Panel
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <LanguageDropdown
              align="end"
              trigger={
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white">
                  <RiTranslate2 className="size-5" />
                </Button>
              }
            />
            <ProfileDropdown
              align="end"
              trigger={
                <button className="rounded-full relative border border-white/20 cursor-pointer">
                  <Avatar size="default" className="cursor-pointer">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="absolute right-0 bottom-0 block size-2.5 rounded-full bg-green-600 ring-2 ring-primary" />
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
