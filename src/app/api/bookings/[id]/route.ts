import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "GUIDE") {
      return NextResponse.json(
        { error: "Only guides can update booking status" },
        { status: 403 }
      )
    }

    const { status } = await request.json()

    if (!status || !["CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Check if the booking exists and belongs to the guide
    const booking = await db.booking.findFirst({
      where: {
        id: params.id,
        tour: {
          guideId: session.user.id,
        },
      },
      include: {
        tour: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check if the status transition is valid
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot update status of cancelled or completed bookings" },
        { status: 400 }
      )
    }

    if (status === "CONFIRMED") {
      // Check if there are any existing confirmed bookings for this tour on this date
      const existingBookings = await db.booking.count({
        where: {
          tourId: booking.tour.id,
          date: booking.date,
          status: "CONFIRMED",
          NOT: {
            id: booking.id,
          },
        },
      })

      if (existingBookings >= booking.tour.maxGroupSize) {
        return NextResponse.json(
          { error: "Tour is fully booked for this date" },
          { status: 400 }
        )
      }
    }

    // Update the booking status
    const updatedBooking = await db.booking.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 