import React from 'react'

export default function userDashboard  ()  {
  return (
    
    <div className='min-h-screen bg-gray-900 text-white flex'>
      
      <header className='bg-gray-800 text-white flex justify-between items-center px-6 py-4 shadow-md'> 
      </header>
      <aside className='w-1/5 p-6 border-r border-gray-700'>
        <nav className='space-y-4'>
          <div className='hover:text-blue-400 cursor-pointer test-postcss'>Dashboard</div>
          <div className='hover:text-blue-400 cursor-pointer'>History</div>
          <div className='hover:text-blue-400 cursor-pointer'>Integration</div>
          <div className='hover:text-blue-400 cursor-pointer'>Profile</div>
        </nav>
      </aside>

      {/* main content */}
      {/* <main className='flex' */}
    </div>
  )
}
