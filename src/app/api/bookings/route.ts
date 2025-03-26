import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sanitizeObject } from "@/lib/sanitize"

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 3600000 // 1 hour in milliseconds
const MAX_BOOKINGS_PER_WINDOW = 5
const bookingAttempts = new Map<string, { count: number; timestamp: number }>()

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const userAttempts = bookingAttempts.get(userId)

  if (!userAttempts || (now - userAttempts.timestamp) > RATE_LIMIT_WINDOW) {
    bookingAttempts.set(userId, { count: 1, timestamp: now })
    return false
  }

  if (userAttempts.count >= MAX_BOOKINGS_PER_WINDOW) {
    return true
  }

  userAttempts.count++
  return false
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "TOURIST") {
      return NextResponse.json({ error: "Only tourists can create bookings" }, { status: 403 })
    }

    // Check rate limiting
    if (isRateLimited(session.user.id)) {
      return NextResponse.json(
        { error: "Too many booking attempts. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const sanitizedBody = sanitizeObject(body)

    const { tourId, date } = sanitizedBody

    // Validate required fields
    if (!tourId || !date) {
      return NextResponse.json(
        { error: "Tour ID and date are required" },
        { status: 400 }
      )
    }

    // Validate date is in the future and within reasonable range
    const bookingDate = new Date(date)
    const now = new Date()
    const maxFutureDate = new Date()
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1)

    if (bookingDate <= now) {
      return NextResponse.json(
        { error: "Booking date must be in the future" },
        { status: 400 }
      )
    }

    if (bookingDate > maxFutureDate) {
      return NextResponse.json(
        { error: "Booking date cannot be more than 1 year in the future" },
        { status: 400 }
      )
    }

    // Check if tour exists and is active
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        guide: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Check if user has any pending or confirmed bookings for this tour
    const existingBookings = await prisma.booking.findMany({
      where: {
        tourId,
        touristId: session.user.id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    })

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: "You already have an active booking for this tour" },
        { status: 400 }
      )
    }

    // Check if the tour is already fully booked for this date
    const confirmedBookings = await prisma.booking.count({
      where: {
        tourId,
        date: bookingDate,
        status: "CONFIRMED",
      },
    })

    if (confirmedBookings >= tour.maxGroupSize) {
      return NextResponse.json(
        { error: "This tour is fully booked for the selected date" },
        { status: 400 }
      )
    }

    // Create booking with minimal return data
    const booking = await prisma.booking.create({
      data: {
        date: bookingDate,
        tour: {
          connect: { id: tourId },
        },
        tourist: {
          connect: { id: session.user.id },
        },
      },
      select: {
        id: true,
        date: true,
        status: true,
        tour: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            price: true,
            duration: true,
            maxGroupSize: true,
            imageUrl: true,
            guide: {
              select: {
                name: true,
              },
            },
          },
        },
        tourist: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error creating booking:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create booking"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const guideId = searchParams.get("guideId")

    const bookings = await prisma.booking.findMany({
      where: {
        ...(guideId
          ? { tour: { guideId } }
          : { touristId: session.user.id }),
      },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            price: true,
            duration: true,
            maxGroupSize: true,
            imageUrl: true,
            guide: {
              select: {
                name: true,
              },
            },
          },
        },
        tourist: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
} 