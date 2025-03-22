"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

const inter = Inter({ subsets: ["latin"] })

function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: "hsl(222.2 47.4% 11.2%)",
          colorTextOnPrimaryBackground: "white",
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClerkThemeProvider>{children}</ClerkThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

