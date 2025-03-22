import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id: params.id },
      include: {
        guide: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    return NextResponse.json(tour)
  } catch (error) {
    console.error("Error fetching tour:", error)
    return NextResponse.json(
      { error: "Failed to fetch tour" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the tour exists and belongs to the guide
    const existingTour = await prisma.tour.findUnique({
      where: { id: params.id },
    })

    if (!existingTour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (existingTour.guideId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own tours" },
        { status: 403 }
      )
    }

    const {
      title,
      description,
      location,
      price,
      duration,
      maxGroupSize,
      includedItems,
      imageUrl,
    } = await request.json()

    // Validate required fields
    if (!title || !description || !location || !price || !duration || !maxGroupSize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Update the tour
    const updatedTour = await prisma.tour.update({
      where: { id: params.id },
      data: {
        title,
        description,
        location,
        price: parseFloat(price),
        duration: parseInt(duration),
        maxGroupSize: parseInt(maxGroupSize),
        included: includedItems || [],
        imageUrl,
      },
      include: {
        guide: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(updatedTour)
  } catch (error) {
    console.error("Error updating tour:", error)
    return NextResponse.json(
      { error: "Failed to update tour" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the tour exists and belongs to the guide
    const tour = await prisma.tour.findUnique({
      where: { id: params.id },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.guideId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own tours" },
        { status: 403 }
      )
    }

    // Delete the tour
    await prisma.tour.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Tour deleted successfully" })
  } catch (error) {
    console.error("Error deleting tour:", error)
    return NextResponse.json(
      { error: "Failed to delete tour" },
      { status: 500 }
    )
  }
} 