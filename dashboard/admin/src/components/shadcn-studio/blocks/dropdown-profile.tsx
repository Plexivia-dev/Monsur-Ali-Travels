// Third-party Imports
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'

// Component Imports
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

const STATIC_USER = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  imageUrl: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png',
  initials: 'JD'
}

type Props = {
  trigger?: React.ReactElement
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

export function ProfileDropdown({ defaultOpen, align, trigger }: Props) {
  const defaultTrigger = (
    <button className='rounded-full relative'>
      <Avatar size='lg' className='cursor-pointer'>
        <AvatarImage src={STATIC_USER.imageUrl} alt={STATIC_USER.fullName} />
        <AvatarFallback>{STATIC_USER.initials}</AvatarFallback>
      </Avatar>
      <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
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
                <AvatarImage src={STATIC_USER.imageUrl} alt={STATIC_USER.fullName} />
                <AvatarFallback>{STATIC_USER.initials}</AvatarFallback>
              </Avatar>
              <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
            </div>
            <div className='flex flex-1 flex-col items-start'>
              <span className='text-foreground text-base font-semibold'>{STATIC_USER.fullName}</span>
              <span className='text-muted-foreground text-sm'>{STATIC_USER.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => window.location.href = '/pages/user-profile?view=profile'}>
            <UserIcon className="size-4" />
            <span>My Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.location.href = '/pages/user-settings?setting=general'}>
            <SettingsIcon className="size-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem variant='destructive' onClick={() => window.location.href = '/pages/auth/login'}>
            <LogOutIcon className="size-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
