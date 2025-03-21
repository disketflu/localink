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

    const { tourId, rating, comment } = await request.json()

    if (!tourId || !rating || !comment) {
      return NextResponse.json(
        { error: "Tour ID, rating, and comment are required" },
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

    // Check if the user has completed a booking for this tour
    const completedBooking = await prisma.booking.findFirst({
      where: {
        tourId,
        userId: session.user.id,
        status: "COMPLETED",
      },
    })

    if (!completedBooking) {
      return NextResponse.json(
        { error: "You can only review tours you have completed" },
        { status: 403 }
      )
    }

    // Check if the user has already reviewed this tour
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

    // Create the review
    const review = await prisma.review.create({
      data: {
        tourId,
        authorId: session.user.id,
        rating,
        comment,
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
        { error: "Tour ID or Guide ID is required" },
        { status: 400 }
      )
    }

    let where = {}
    if (tourId) {
      where = { tourId }
    } else if (guideId) {
      where = {
        tour: {
          guideId,
        },
      }
    }

    const reviews = await prisma.review.findMany({
      where,
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