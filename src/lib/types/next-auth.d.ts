import { Role } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string | null
    email: string
    role: Role
  }

  interface Session {
    user: User
  }
} 