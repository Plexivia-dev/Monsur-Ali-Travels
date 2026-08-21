import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'
import { useAuth } from '@/store/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function ProfileDropdown({ defaultOpen, align, trigger }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.name || 'Admin User'
  const displayEmail = user?.email || 'admin@monsuralitravels.com'
  const displayAvatar = user?.avatar || 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png'
  const displayInitials = displayName.slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const defaultTrigger = (
    <button className='rounded-full relative border border-border cursor-pointer'>
      <Avatar size='lg' className='cursor-pointer'>
        <AvatarImage src={displayAvatar} alt={displayName} />
        <AvatarFallback>{displayInitials}</AvatarFallback>
      </Avatar>
      <span className='ring-card absolute right-0 bottom-0 block size-2.5 rounded-full bg-green-600 ring-2' />
    </button>
  )

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger render={trigger || defaultTrigger} />
      <DropdownMenuContent align={align || 'end'} className='w-60'>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='flex items-center gap-4 px-2 py-2.5 font-normal'>
            <div className='relative'>
              <Avatar className='size-10'>
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback>{displayInitials}</AvatarFallback>
              </Avatar>
              <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
            </div>
            <div className='flex flex-1 flex-col items-start'>
              <span className='text-foreground text-sm font-semibold'>{displayName}</span>
              <span className='text-muted-foreground text-xs truncate max-w-[150px]'>{displayEmail}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/admin/profile-dropdown')}>
            <UserIcon className="size-4" />
            <span>My Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/admin/dropdown')}>
            <SettingsIcon className="size-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem variant='destructive' onClick={handleLogout}>
            <LogOutIcon className="size-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
