'use client'
import { SettingsTabs } from "@/components/settings-tabs"
import { checkRole } from '@/utils/roles';
import { useUser } from "@clerk/nextjs";
import { redirect } from 'next/navigation';
import React, { useEffect } from 'react';

export default async function SettingsPage() {
  const { user } = useUser()
   if(user?.publicMetadata.role !== 'admin') {
    redirect('/inventory')

   }
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <SettingsTabs />
    </div>
  )
}

