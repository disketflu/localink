import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tourId, date } = await request.json()

    if (!tourId || !date) {
      return NextResponse.json(
        { error: "Tour ID and date are required" },
        { status: 400 }
      )
    }

    // Check if the tour exists
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Check if the date is in the future
    const bookingDate = new Date(date)
    if (bookingDate < new Date()) {
      return NextResponse.json(
        { error: "Booking date must be in the future" },
        { status: 400 }
      )
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        tour: {
          connect: { id: tourId }
        },
        tourist: {
          connect: { id: session.user.id }
        },
        date: bookingDate,
        status: "PENDING",
      },
      include: {
        tour: true,
        tourist: true,
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get("tourId")
    const userId = searchParams.get("userId")

    let where = {}
    if (session.user.role === "GUIDE") {
      // Guides can see bookings for their tours
      where = {
        tour: {
          guideId: session.user.id,
        },
      }
    } else {
      // Tourists can see their own bookings
      where = {
        touristId: session.user.id,
      }
    }

    // Add additional filters if provided
    if (tourId) {
      where = { ...where, tourId }
    }
    if (userId) {
      where = { ...where, touristId: userId }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        tour: true,
        tourist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "asc",
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