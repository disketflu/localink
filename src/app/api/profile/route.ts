import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sanitizeObject } from "@/lib/utils"

const MAX_BIO_LENGTH = 500
const MAX_NAME_LENGTH = 50
const MAX_LANGUAGES = 5
const MAX_EXPERTISE = 5

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        profile: {
          select: {
            bio: true,
            location: true,
            languages: true,
            expertise: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const sanitizedBody = sanitizeObject(body)

    const { name, image, profile } = sanitizedBody

    // Validate name length
    if (name && (typeof name !== 'string' || name.length > MAX_NAME_LENGTH)) {
      return NextResponse.json(
        { error: `Name must be a string with maximum ${MAX_NAME_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Validate image URL
    if (image) {
      try {
        new URL(image)
      } catch {
        return NextResponse.json(
          { error: "Invalid image URL" },
          { status: 400 }
        )
      }
    }

    // Validate profile data
    if (profile) {
      if (profile.bio && (typeof profile.bio !== 'string' || profile.bio.length > MAX_BIO_LENGTH)) {
        return NextResponse.json(
          { error: `Bio must be a string with maximum ${MAX_BIO_LENGTH} characters` },
          { status: 400 }
        )
      }

      if (profile.languages && (!Array.isArray(profile.languages) || profile.languages.length > MAX_LANGUAGES)) {
        return NextResponse.json(
          { error: `Maximum ${MAX_LANGUAGES} languages allowed` },
          { status: 400 }
        )
      }

      if (profile.expertise && (!Array.isArray(profile.expertise) || profile.expertise.length > MAX_EXPERTISE)) {
        return NextResponse.json(
          { error: `Maximum ${MAX_EXPERTISE} expertise entries allowed` },
          { status: 400 }
        )
      }

      // Validate each language and expertise entry
      if (profile.languages) {
        for (const lang of profile.languages) {
          if (typeof lang !== 'string' || lang.length > 50) {
            return NextResponse.json(
              { error: "Invalid language format" },
              { status: 400 }
            )
          }
        }
      }

      if (profile.expertise) {
        for (const exp of profile.expertise) {
          if (typeof exp !== 'string' || exp.length > 50) {
            return NextResponse.json(
              { error: "Invalid expertise format" },
              { status: 400 }
            )
          }
        }
      }
    }

    // Update user and profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        image,
        profile: profile ? {
          upsert: {
            create: {
              bio: profile.bio,
              location: profile.location,
              languages: profile.languages || [],
              expertise: profile.expertise || [],
            },
            update: {
              bio: profile.bio,
              location: profile.location,
              languages: profile.languages || [],
              expertise: profile.expertise || [],
            },
          },
        } : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        profile: {
          select: {
            bio: true,
            location: true,
            languages: true,
            expertise: true,
          },
        },
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

