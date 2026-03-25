import { Activity } from 'lucide-react'
import React from 'react'

function Loader() {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-4'>
      {/* Animate lucide-react icon with tailwind */}
      <Activity className='h-6 w-6 animate-pulse' />
      <p className='text-sm'>Cargando</p>
    </div>
  )
}

export default Loader
