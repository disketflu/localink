import { Role } from "@prisma/client"
import NextAuth from "next-auth"

interface UserProfile {
  bio?: string
  location?: string
  languages?: string[]
}

declare module "next-auth" {
  interface User {
    id: string
    name: string | null
    email: string
    role: Role
    image?: string | null
    profile?: UserProfile
  }

  interface Session {
    user: User
  }
} 