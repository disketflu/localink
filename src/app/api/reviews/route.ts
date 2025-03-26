import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sanitizeObject } from "@/lib/sanitize"

const MAX_COMMENT_LENGTH = 1000
const MIN_COMMENT_LENGTH = 10

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
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      )
    }

    // Validate comment length and content
    if (comment.length < MIN_COMMENT_LENGTH || comment.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be between ${MIN_COMMENT_LENGTH} and ${MAX_COMMENT_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Check if tour exists
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        id: true,
        guideId: true,
        bookings: {
          where: {
            touristId: session.user.id,
            status: "COMPLETED",
          },
          select: {
            id: true,
            date: true,
          },
        },
      },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Check if user has completed a booking for this tour
    if (tour.bookings.length === 0) {
      return NextResponse.json(
        { error: "You can only review tours you have completed" },
        { status: 403 }
      )
    }

    // Check if the most recent completed booking is within 30 days
    const mostRecentBooking = tour.bookings[0]
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    if (mostRecentBooking.date < thirtyDaysAgo) {
      return NextResponse.json(
        { error: "Reviews can only be submitted within 30 days of tour completion" },
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

    // Create review with minimal return data
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
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
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
    const touristId = searchParams.get("touristId")

    if (!tourId && !guideId && !touristId) {
      return NextResponse.json(
        { error: "Either tourId, guideId, or touristId is required" },
        { status: 400 }
      )
    }

    // Validate that the authenticated user has permission to view these reviews
    const session = await getServerSession(authOptions)
    if (touristId && (!session?.user || (session.user.id !== touristId && session.user.role !== "GUIDE"))) {
      return NextResponse.json(
        { error: "Unauthorized to view these reviews" },
        { status: 403 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: {
        ...(tourId ? { tourId } : {}),
        ...(guideId ? { tour: { guideId } } : {}),
        ...(touristId ? { authorId: touristId } : {}),
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        tour: {
          select: {
            title: true,
            id: true,
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