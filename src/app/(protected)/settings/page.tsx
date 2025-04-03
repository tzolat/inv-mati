import { SettingsTabs } from "@/components/settings-tabs"
import { checkRole } from '@/utils/roles';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function SettingsPage() {
  const isAdmin = await checkRole('admin')
if (!isAdmin) {
  redirect('/inventory')
}
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <SettingsTabs />
    </div>
  )
}

