import React from 'react'
import { SidebarTrigger } from './ui/sidebar'
import { LucideProps } from 'lucide-react'

interface HeaderProps {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >
  title: string
}

function Header({ icon: Icon, title }: HeaderProps) {
  return (
    <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
      <SidebarTrigger className='-ml-1' />
      <div className='flex items-center gap-2'>
        <Icon className='h-5 w-5' />
        <h1 className='text-lg font-semibold'>{title}</h1>
      </div>
    </header>
  )
}

export default Header
