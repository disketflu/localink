import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sanitizeObject } from "@/lib/sanitize"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "TOURIST") {
      return NextResponse.json({ error: "Only tourists can create bookings" }, { status: 403 })
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

    // Validate date is in the future
    const bookingDate = new Date(date)
    if (bookingDate <= new Date()) {
      return NextResponse.json(
        { error: "Booking date must be in the future" },
        { status: 400 }
      )
    }

    // Check if tour exists
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Check if user has already booked this tour on this date
    const existingBooking = await prisma.booking.findFirst({
      where: {
        tourId,
        touristId: session.user.id,
        date: bookingDate,
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: "You have already booked this tour on this date" },
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

    // Create booking
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
      include: {
        tour: {
          select: {
            title: true,
            guide: {
              select: {
                name: true,
              },
            },
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