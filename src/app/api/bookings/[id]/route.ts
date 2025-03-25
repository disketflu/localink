import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

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

    const { status } = await request.json()

    if (!status || !["CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Find the booking with tour and tourist information
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
      },
      include: {
        tour: true,
        tourist: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Check permissions based on role and status update
    if (session.user.role === "GUIDE") {
      // Guide can only update bookings for their own tours
      if (booking.tour.guideId !== session.user.id) {
        return NextResponse.json(
          { error: "You can only update bookings for your own tours" },
          { status: 403 }
        )
      }
      // Guide can confirm or complete bookings
      if (status === "CANCELLED") {
        return NextResponse.json(
          { error: "Guides cannot cancel bookings" },
          { status: 403 }
        )
      }
      // Guide can only complete confirmed bookings
      if (status === "COMPLETED" && booking.status !== "CONFIRMED") {
        return NextResponse.json(
          { error: "Only confirmed bookings can be marked as completed" },
          { status: 400 }
        )
      }
    } else if (session.user.role === "TOURIST") {
      // Tourist can only update their own bookings
      if (booking.touristId !== session.user.id) {
        return NextResponse.json(
          { error: "You can only update your own bookings" },
          { status: 403 }
        )
      }
      // Tourist can only cancel pending bookings
      if (status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Tourists can only cancel bookings" },
          { status: 403 }
        )
      }
      if (booking.status !== "PENDING") {
        return NextResponse.json(
          { error: "Only pending bookings can be cancelled" },
          { status: 400 }
        )
      }
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
      const existingBookings = await prisma.booking.count({
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
    const updatedBooking = await prisma.booking.update({
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