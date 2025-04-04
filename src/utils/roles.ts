import { Roles } from '@/types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();

  // Ensure metadata and role exist before comparing
  const userRole = sessionClaims?.metadata?.role;
  return userRole === role;
}