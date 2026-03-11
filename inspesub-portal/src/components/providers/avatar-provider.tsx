"use client"

import { createContext, useContext, useState } from "react"

interface AvatarContextType {
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
}

const AvatarContext = createContext<AvatarContextType>({
  avatarUrl: null,
  setAvatarUrl: () => {},
})

export function AvatarProvider({
  children,
  initialUrl,
}: {
  children: React.ReactNode
  initialUrl: string | null
}) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialUrl)
  return (
    <AvatarContext.Provider value={{ avatarUrl, setAvatarUrl }}>
      {children}
    </AvatarContext.Provider>
  )
}

export function useAvatar() {
  return useContext(AvatarContext)
}
