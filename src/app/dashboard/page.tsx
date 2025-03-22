import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Redirect based on user role
  if (session.user.role === "TOURIST") {
    redirect("/dashboard/tourist")
  } else if (session.user.role === "GUIDE") {
    redirect("/dashboard/guide")
  }

  return null
} 