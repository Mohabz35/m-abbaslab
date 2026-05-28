'use client'

import React from 'react'
import FashionManager from '@/components/admin/FashionManager'

export default function FashionPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fashion Lab</h1>
          <p className="text-gray-500 mt-2">Design tracking, inventory management, and collections control.</p>
        </div>
        <FashionManager />
      </div>
    </div>
  )
}
