import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// Input validation schema
const messageSchema = z.object({
  content: z.string().min(1).max(1000), // Prevent empty or too long messages
  bookingId: z.string().cuid(), // Validate bookingId format
})

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 2. Input validation
    let body;
    try {
      body = await request.json()
    } catch {
      return new NextResponse("Invalid JSON", { status: 400 })
    }

    try {
      messageSchema.parse(body)
    } catch (error) {
      return new NextResponse("Invalid input format", { status: 400 })
    }

    const { content, bookingId } = body

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

    // 5. Rate limiting check (last 60 seconds)
    const recentMessages = await prisma.message.count({
      where: {
        senderId: session.user.id,
        bookingId: bookingId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000) // Last 60 seconds
        }
      }
    })

    if (recentMessages >= 10) {
      return new NextResponse("Too many messages. Please wait a moment.", { status: 429 })
    }

    // 6. Sanitize content (remove any HTML)
    const sanitizedContent = content.replace(/<[^>]*>?/gm, '')

    // 7. Create the message
    const message = await prisma.message.create({
      data: {
        content: sanitizedContent,
        bookingId,
        senderId: session.user.id,
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
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("[MESSAGES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 