import * as React from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Compass, Layers, User, AlertCircle, LogOut, Menu, X, Settings, Server, FileText, ChevronDown, ChevronRight, FolderOpen, CreditCard, Receipt, PieChart, Wallet, Trash2, Users, Building2 } from 'lucide-react'
import { RiTranslate2 } from '@remixicon/react'
import { useAuth } from '@/store/useAuthStore'
import { ProfileDropdown } from '@/components/blocks/dropdown-profile'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Toaster } from '@/components/ui/toast'
import { useSocketNotification } from '@/hooks/useSocketNotification'
import logo from '@/assets/logo.png'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Activate real-time socket notification listener
  useSocketNotification()

  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [isAgencyOpen, setIsAgencyOpen] = React.useState(true)
  const [isReportsOpen, setIsReportsOpen] = React.useState(true)
  const [isSystemOpen, setIsSystemOpen] = React.useState(true)
  const [lang, setLang] = React.useState('EN')
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems = [
    { name: lang === 'BN' ? 'ওভারভিউ' : 'Overview', path: '/admin', icon: LayoutDashboard },
  ]

  const agencySubMenuItems = [
    { name: lang === 'BN' ? 'ক্লায়েন্ট ফাইলস' : 'Client Files', path: '/admin/cases', icon: FolderOpen },
    { name: lang === 'BN' ? 'ক্লায়েন্টস' : 'Clients', path: '/admin/clients', icon: Users },
    { name: lang === 'BN' ? 'ইউজারস' : 'Users', path: '/admin/users', icon: User },
  ]

  const reportsSubMenuItems = [
    { name: lang === 'BN' ? 'পেমেন্টস' : 'Payments', path: '/admin/reports/payments', icon: Wallet },
    { name: lang === 'BN' ? 'বিলস' : 'Bills', path: '/admin/reports/bills', icon: Receipt },
  ]

  const systemSubMenuItems = [
    { name: lang === 'BN' ? 'অ্যাক্টিভিটি লগস' : 'Activity Logs', path: '/admin/system/activity-logs', icon: FileText },
    { name: lang === 'BN' ? 'ট্র্যাশ' : 'Trash', path: '/admin/system/trash', icon: Trash2 },
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
        className={`fixed top-0 left-0 h-dvh w-64 bg-primary border-r border-white/10 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between bg-primary text-white shrink-0">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="size-8 p-1 bg-white rounded-full object-contain shadow-sm shrink-0" />
              <span className="font-bold text-sm tracking-wide text-white uppercase font-sans">
                Admin Panel
              </span>
            </div>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-md border border-white text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Close Navigation"
            >
              <X className="size-5" />
            </button>
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
                      ? 'bg-white text-primary font-bold shadow-md' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`size-5 shrink-0 ${isActive ? 'text-primary' : 'text-white/85'}`} />
                  <span className="text-[17px]">{item.name}</span>
                </Link>
              )
            })}

            {/* Agency Menu (Mobile) */}
            <div className="space-y-1 pt-1">
              <button
                type="button"
                onClick={() => setIsAgencyOpen(!isAgencyOpen)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="size-5 shrink-0 text-white/85" />
                  <span className="text-[18px] font-semibold">{lang === 'BN' ? 'এজেন্সি' : 'Agency'}</span>
                </div>
                {isAgencyOpen ? (
                  <ChevronDown className="size-4 text-white/70" />
                ) : (
                  <ChevronRight className="size-4 text-white/70" />
                )}
              </button>

              {isAgencyOpen && (
                <div className="border-l-2 border-white/20 ml-5 pl-2 space-y-1">
                  {agencySubMenuItems.map((sub) => {
                    const isSubActive = location.pathname === sub.path
                    const SubIcon = sub.icon
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[16px] font-semibold transition-all ${
                          isSubActive
                            ? 'bg-white text-primary font-bold shadow-md'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <SubIcon className={`size-4.5 shrink-0 ${isSubActive ? 'text-primary' : 'text-white/85'}`} />
                        <span>{sub.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Reports Menu (Mobile) */}
            <div className="space-y-1 pt-1">
              <button
                type="button"
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <PieChart className="size-5 shrink-0 text-white/85" />
                  <span className="text-[18px] font-semibold">{lang === 'BN' ? 'রিপোর্টস' : 'Reports'}</span>
                </div>
                {isReportsOpen ? (
                  <ChevronDown className="size-4 text-white/70" />
                ) : (
                  <ChevronRight className="size-4 text-white/70" />
                )}
              </button>

              {isReportsOpen && (
                <div className="border-l-2 border-white/20 ml-5 pl-2 space-y-1">
                  {reportsSubMenuItems.map((sub) => {
                    const isSubActive = location.pathname === sub.path
                    const SubIcon = sub.icon
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[16px] font-semibold transition-all ${
                          isSubActive
                            ? 'bg-white text-primary font-bold shadow-md'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <SubIcon className={`size-4.5 shrink-0 ${isSubActive ? 'text-primary' : 'text-white/85'}`} />
                        <span>{sub.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* System Menu (Mobile) */}
            <div className="space-y-1 pt-1">
              <button
                type="button"
                onClick={() => setIsSystemOpen(!isSystemOpen)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Server className="size-5 shrink-0 text-white/85" />
                  <span className="text-[18px] font-semibold">{lang === 'BN' ? 'সিস্টেম' : 'System'}</span>
                </div>
                {isSystemOpen ? (
                  <ChevronDown className="size-4 text-white/70" />
                ) : (
                  <ChevronRight className="size-4 text-white/70" />
                )}
              </button>

              {isSystemOpen && (
                <div className="border-l-2 border-white/20 ml-5 pl-2 space-y-1">
                  {systemSubMenuItems.map((sub) => {
                    const isSubActive = location.pathname === sub.path
                    const SubIcon = sub.icon
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[16px] font-semibold transition-all ${
                          isSubActive
                            ? 'bg-white text-primary font-bold shadow-md'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <SubIcon className={`size-4.5 shrink-0 ${isSubActive ? 'text-primary' : 'text-white/85'}`} />
                        <span>{sub.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Footer Logout and Settings Buttons inside mobile sidebar drawer (With distinct top border) */}
          <div className="p-3 border-t-2 border-white/20 shrink-0 bg-primary/95 flex items-center justify-between gap-3 shadow-xs">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsMobileOpen(false)
                navigate('/admin/settings')
              }}
              className="flex-1 flex items-center justify-center bg-white text-green-600 hover:bg-white/90 gap-2 rounded-lg py-2.5 cursor-pointer shadow-sm border-0 font-semibold"
            >
              <Settings className="size-5 shrink-0 text-green-600" />
              <span className="text-[15px]">Settings</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsMobileOpen(false)
                setShowLogoutConfirm(true)
              }}
              className="flex-1 flex items-center justify-center bg-white text-red-600 hover:bg-white/90 gap-2 rounded-lg py-2.5 cursor-pointer shadow-sm border-0 font-semibold"
            >
              <LogOut className="size-5 shrink-0 text-red-600" />
              <span className="text-[15px]">Log Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar (Theme color matched to Topbar primary with inverted selection states) */}
      <aside 
        className={`h-screen sticky top-0 flex flex-col justify-between bg-primary border-r border-white/10 transition-all duration-300 ease-in-out hidden md:flex shrink-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`h-16 border-b border-white/10 flex items-center bg-primary text-white shrink-0 ${
            isCollapsed ? 'justify-center' : 'px-4 justify-between'
          }`}>
            <div 
              onClick={() => isCollapsed && setIsCollapsed(false)}
              className={`flex items-center gap-3 cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
            >
              {isCollapsed ? (
                <div className="size-8 p-1 bg-white text-primary rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Menu className="size-5" />
                </div>
              ) : (
                <>
                  <img src={logo} alt="Logo" className="size-8 p-1 bg-white rounded-full object-contain shadow-sm shrink-0" />
                  <span className="font-bold text-sm tracking-wide text-white uppercase font-sans whitespace-nowrap animate-fade-in">
                    Admin Panel
                  </span>
                </>
              )}
            </div>
            {!isCollapsed && (
              <button 
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-md border border-white text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <X className="size-5" />
              </button>
            )}
          </div>

          {/* Navigation Links (With clean conditional rendering to prevent horizontal scrollbar overflows) */}
          <nav className="p-3 space-y-2 flex-grow overflow-x-hidden overflow-y-auto no-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleMenuItemClick(e, item.path)}
                  className={`flex items-center transition-all duration-300 overflow-hidden ${
                    isActive 
                      ? 'bg-white text-primary font-bold shadow-md' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  } ${isCollapsed ? 'size-10 justify-center rounded-xl mx-auto' : 'px-3 py-3 rounded-lg w-full gap-3'}`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`size-5 shrink-0 transition-colors duration-300 ${
                    isActive ? 'text-primary' : 'text-white/85'
                  }`} />
                  {!isCollapsed && (
                    <span className="text-[17px] whitespace-nowrap ml-1 animate-fade-in">
                      {item.name}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Agency Menu (Desktop Collapsible) */}
            <div className="space-y-1 pt-1">
              {isCollapsed ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCollapsed(false)
                    setIsAgencyOpen(true)
                  }}
                  className={`flex items-center size-10 justify-center rounded-xl mx-auto transition-all duration-300 text-white/80 hover:bg-white/10 hover:text-white cursor-pointer ${
                    location.pathname.startsWith('/admin/agency') || location.pathname === '/admin/cases' || location.pathname === '/admin/clients' || location.pathname === '/admin/users' ? 'bg-white/20 text-white' : ''
                  }`}
                  title={lang === 'BN' ? 'এজেন্সি' : 'Agency'}
                >
                  <Building2 className="size-5 shrink-0 text-white/85" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsAgencyOpen(!isAgencyOpen)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="size-5 shrink-0 text-white/85" />
                      <span className="text-[18px] font-semibold whitespace-nowrap ml-1 animate-fade-in">
                        {lang === 'BN' ? 'এজেন্সি' : 'Agency'}
                      </span>
                    </div>
                    {isAgencyOpen ? (
                      <ChevronDown className="size-4 text-white/70" />
                    ) : (
                      <ChevronRight className="size-4 text-white/70" />
                    )}
                  </button>

                  {isAgencyOpen && (
                    <div className="border-l-2 border-white/20 ml-5 pl-2 space-y-1">
                      {agencySubMenuItems.map((sub) => {
                        const isSubActive = location.pathname === sub.path
                        const SubIcon = sub.icon
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[16px] font-semibold transition-all ${
                              isSubActive
                                ? 'bg-white text-primary font-bold shadow-md'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <SubIcon className={`size-4.5 shrink-0 ${isSubActive ? 'text-primary' : 'text-white/85'}`} />
                            <span className="whitespace-nowrap">{sub.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Reports Menu (Desktop Collapsible) */}
            <div className="space-y-1 pt-1">
              {isCollapsed ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCollapsed(false)
                    setIsReportsOpen(true)
                  }}
                  className={`flex items-center size-10 justify-center rounded-xl mx-auto transition-all duration-300 text-white/80 hover:bg-white/10 hover:text-white cursor-pointer ${
                    location.pathname.startsWith('/admin/reports') ? 'bg-white/20 text-white' : ''
                  }`}
                  title={lang === 'BN' ? 'রিপোর্টস' : 'Reports'}
                >
                  <PieChart className="size-5 shrink-0 text-white/85" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsReportsOpen(!isReportsOpen)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <PieChart className="size-5 shrink-0 text-white/85" />
                      <span className="text-[18px] font-semibold whitespace-nowrap ml-1 animate-fade-in">
                        {lang === 'BN' ? 'রিপোর্টস' : 'Reports'}
                      </span>
                    </div>
                    {isReportsOpen ? (
                      <ChevronDown className="size-4 text-white/70" />
                    ) : (
                      <ChevronRight className="size-4 text-white/70" />
                    )}
                  </button>

                  {isReportsOpen && (
                    <div className="border-l-2 border-white/20 ml-5 pl-2 space-y-1">
                      {reportsSubMenuItems.map((sub) => {
                        const isSubActive = location.pathname === sub.path
                        const SubIcon = sub.icon
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[16px] font-semibold transition-all ${
                              isSubActive
                                ? 'bg-white text-primary font-bold shadow-md'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <SubIcon className={`size-4.5 shrink-0 ${isSubActive ? 'text-primary' : 'text-white/85'}`} />
                            <span className="whitespace-nowrap">{sub.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* System Menu (Desktop Collapsible) */}
            <div className="space-y-1 pt-1">
              {isCollapsed ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCollapsed(false)
                    setIsSystemOpen(true)
                  }}
                  className={`flex items-center size-10 justify-center rounded-xl mx-auto transition-all duration-300 text-white/80 hover:bg-white/10 hover:text-white cursor-pointer ${
                    location.pathname.startsWith('/admin/system') || location.pathname === '/admin/activity-logs' ? 'bg-white/20 text-white' : ''
                  }`}
                  title={lang === 'BN' ? 'সিস্টেম' : 'System'}
                >
                  <Server className="size-5 shrink-0 text-white/85" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsSystemOpen(!isSystemOpen)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Server className="size-5 shrink-0 text-white/85" />
                      <span className="text-[18px] font-semibold whitespace-nowrap ml-1 animate-fade-in">
                        {lang === 'BN' ? 'সিস্টেম' : 'System'}
                      </span>
                    </div>
                    {isSystemOpen ? (
                      <ChevronDown className="size-4 text-white/70" />
                    ) : (
                      <ChevronRight className="size-4 text-white/70" />
                    )}
                  </button>

                  {isSystemOpen && (
                    <div className="border-l-2 border-white/20 ml-5 pl-2 space-y-1">
                      {systemSubMenuItems.map((sub) => {
                        const isSubActive = location.pathname === sub.path
                        const SubIcon = sub.icon
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[16px] font-semibold transition-all ${
                              isSubActive
                                ? 'bg-white text-primary font-bold shadow-md'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <SubIcon className={`size-4.5 shrink-0 ${isSubActive ? 'text-primary' : 'text-white/85'}`} />
                            <span className="whitespace-nowrap">{sub.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </nav>

          {/* Footer Logout and Settings Buttons (With distinct top border) */}
          <div className={`p-3 border-t-2 border-white/20 shrink-0 bg-primary/95 flex shadow-xs ${
            isCollapsed ? 'flex-col items-center gap-3' : 'items-center justify-between gap-3'
          }`}>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/settings')}
              className={`flex items-center bg-white text-green-600 hover:bg-white/90 cursor-pointer transition-all duration-300 shadow-sm border-0 ${
                isCollapsed ? 'size-10 justify-center rounded-xl p-0' : 'flex-grow justify-center gap-2 px-3 py-2.5 rounded-lg'
              }`}
              title="Settings"
            >
              <Settings className="size-5 shrink-0 text-green-600" />
              {!isCollapsed && (
                <span className="text-[15px] font-semibold whitespace-nowrap ml-1 animate-fade-in">
                  Settings
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowLogoutConfirm(true)}
              className={`flex items-center bg-white text-red-600 hover:bg-white/90 cursor-pointer transition-all duration-300 shadow-sm border-0 ${
                isCollapsed ? 'size-10 justify-center rounded-xl p-0' : 'flex-grow justify-center gap-2 px-3 py-2.5 rounded-lg'
              }`}
              title="Log Out"
            >
              <LogOut className="size-5 shrink-0 text-red-600" />
              {!isCollapsed && (
                <span className="text-[15px] font-semibold whitespace-nowrap ml-1 animate-fade-in">
                  Log Out
                </span>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar (Fixed pixel height 64px / h-16 matching sidebar header) */}
        <header className="h-16 shrink-0 border-b border-white/10 bg-primary text-white px-6 flex items-center justify-between shadow-sm z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger button on mobile */}
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-md hover:bg-white/10 text-white md:hidden cursor-pointer shrink-0"
              title="Open Navigation"
            >
              <Menu className="size-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setLang(lang === 'EN' ? 'BN' : 'EN')}
              className="flex items-center bg-white p-1 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.25)] cursor-pointer select-none shrink-0 transition-all duration-200"
              title={`Switch to ${lang === 'EN' ? 'Bengali' : 'English'}`}
            >
              <span className={`text-[11px] font-black uppercase px-2 py-1 rounded-full transition-all duration-200 ${
                lang === 'EN' 
                  ? 'bg-primary text-white shadow-sm font-black' 
                  : 'text-primary/75 hover:text-primary'
              }`}>
                EN
              </span>
              <span className={`text-[11px] font-black uppercase px-2 py-1 rounded-full transition-all duration-200 ${
                lang === 'BN' 
                  ? 'bg-primary text-white shadow-sm font-black' 
                  : 'text-primary/75 hover:text-primary'
              }`}>
                BN
              </span>
            </div>
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

        {/* Page Body (Height strictly 100vh minus 64px navbar, internal scroll only) */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] p-6 md:p-8 bg-[#EFEFEF]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sign Out Confirmation Modal Overlay */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in scale-in duration-200">
            <h3 className="text-lg font-bold text-foreground">Confirm Sign Out</h3>
            <p className="text-muted-foreground text-sm mt-2">Are you sure you want to log out of the admin panel?</p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button 
                variant="ghost" 
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 cursor-pointer text-muted-foreground hover:bg-accent rounded-lg font-medium"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShowLogoutConfirm(false)
                  handleLogout()
                }}
                className="px-4 py-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md border-0"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Themed Toast Notification System */}
      <Toaster />
    </div>
  )
}
