import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import ProfileDropdown from '@/components/shadcn-studio/blocks/dropdown-profile'

export default function DropdownProfilePage() {
  return (
    <div className='flex h-132 items-start justify-center p-8'>
      <ProfileDropdown
        defaultOpen
        align='center'
        trigger={
          <button className='rounded-full'>
            <Avatar size='lg' className='cursor-pointer'>
              <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' alt='John Doe' />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </button>
        }
      />
    </div>
  )
}
