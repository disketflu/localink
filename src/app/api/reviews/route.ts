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

    const body = await request.json()
    const sanitizedBody = sanitizeObject(body)

    const { tourId, rating, comment } = sanitizedBody

    // Validate required fields
    if (!tourId || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
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

    // Check if user has completed a booking for this tour
    const booking = await prisma.booking.findFirst({
      where: {
        tourId,
        touristId: session.user.id,
        status: "COMPLETED",
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "You can only review tours you have completed" },
        { status: 403 }
      )
    }

    // Check if user has already reviewed this tour
    const existingReview = await prisma.review.findFirst({
      where: {
        tourId,
        authorId: session.user.id,
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this tour" },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        tour: {
          connect: { id: tourId },
        },
        author: {
          connect: { id: session.user.id },
        },
        guide: {
          connect: { id: tour.guideId },
        },
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get("tourId")
    const guideId = searchParams.get("guideId")

    if (!tourId && !guideId) {
      return NextResponse.json(
        { error: "Either tourId or guideId is required" },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: {
        ...(tourId ? { tourId } : {}),
        ...(guideId ? { tour: { guideId } } : {}),
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        tour: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
} 