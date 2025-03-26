import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

type ContextType = {
  params: Promise<{ bookingId: string }> | { bookingId: string }
}

// Input validation schema
const paramsSchema = z.object({
  bookingId: z.string().cuid(), // Validate bookingId format
})

export async function GET(
  request: Request,
  context: ContextType
) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 2. Input validation
    const { bookingId } = await context.params
    try {
      paramsSchema.parse({ bookingId })
    } catch (error) {
      return new NextResponse("Invalid booking ID format", { status: 400 })
    }

    // 3. Resource validation
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tourist: true,
        tour: {
          include: {
            guide: true,
          },
        },
      },
    })

    if (!booking) {
      return new NextResponse("Booking not found", { status: 404 })
    }

    // 4. Authorization
    const isParticipant =
      booking.touristId === session.user.id || booking.tour.guide.id === session.user.id
    if (!isParticipant) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 5. Get pagination parameters with defaults
    const url = new URL(request.url)
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50", 10),
      50 // Max 50 messages per request
    )
    const before = url.searchParams.get("before")
      ? new Date(url.searchParams.get("before")!)
      : new Date()

    // 6. Fetch messages with pagination
    const messages = await prisma.message.findMany({
      where: { 
        bookingId,
        createdAt: {
          lt: before
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Latest messages first
      },
      take: limit,
    })

    // 7. Return messages with pagination metadata
    return NextResponse.json({
      messages: messages.reverse(), // Reverse to get chronological order
      pagination: {
        hasMore: messages.length === limit,
        nextBefore: messages[0]?.createdAt.toISOString(),
      }
    })
  } catch (error) {
    console.error("[MESSAGES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 