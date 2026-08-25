import { Button } from '@/components/ui/button'
import LanguageDropdown from '@/components/blocks/dropdown-language'
import { RiTranslate2 } from '@remixicon/react'

export default function DropdownPage() {
  return (
    <div className='flex h-70 items-start justify-center p-8'>
      <LanguageDropdown
        defaultOpen
        align='center'
        trigger={
          <Button variant='outline' size='icon'>
            <RiTranslate2 />
          </Button>
        }
      />
    </div>
  )
}
