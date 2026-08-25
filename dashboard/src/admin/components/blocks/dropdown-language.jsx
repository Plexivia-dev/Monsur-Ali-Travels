import { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function LanguageDropdown({ defaultOpen, align, trigger }) {
  const [language, setLanguage] = useState('english')

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent className='w-50' align={align || 'end'}>
        <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
          <DropdownMenuRadioItem value='english'>English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='german'>Deutsch</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='spanish'>Española</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='portuguese'>Português</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='korean'>한국인</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageDropdown
