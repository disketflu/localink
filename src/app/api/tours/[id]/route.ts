import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sanitizeObject } from "@/lib/sanitize"

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
            id: true,
            name: true,
            image: true,
          },
        },
        reviews: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
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

    const body = await request.json()
    const sanitizedBody = sanitizeObject(body)

    const {
      title,
      description,
      location,
      price,
      duration,
      maxGroupSize,
      included,
      imageUrl,
    } = sanitizedBody

    // Validate required fields
    if (!title || !description || !location || !price || !duration || !maxGroupSize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (price <= 0 || duration <= 0 || maxGroupSize <= 0) {
      return NextResponse.json(
        { error: "Price, duration, and max group size must be positive numbers" },
        { status: 400 }
      )
    }

    // Check if tour exists and belongs to the guide
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

    // Update tour
    const tour = await prisma.tour.update({
      where: { id: params.id },
      data: {
        title,
        description,
        location,
        price,
        duration,
        maxGroupSize,
        included: included || [],
        imageUrl,
      },
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(tour)
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

    // Check if tour exists and belongs to the guide
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

    // Delete tour
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