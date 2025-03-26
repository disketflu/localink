import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // If user is authenticated and is a guide, return their tours
    if (session?.user.role === "GUIDE") {
      const tours = await db.tour.findMany({
        where: {
          guideId: session.user.id
        },
        include: {
          bookings: true,
          guide: {
            select: {
              name: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      })

      return NextResponse.json(tours)
    }

    // For all other cases (unauthenticated or tourists), return all tours
    const tours = await db.tour.findMany({
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
            id: true,
            name: true,
            image: true,
          },
        },
        reviews: {
          select: {
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
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    return NextResponse.json(tours)
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching tours" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
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
        { error: "Only guides can create tours" },
        { status: 403 }
      )
    }

    const { title, description, location, price, duration, maxGroupSize, included, imageUrl } = await req.json()

    const tour = await db.tour.create({
      data: {
        title,
        description,
        location,
        price,
        duration,
        maxGroupSize,
        included,
        imageUrl,
        guideId: session.user.id
      }
    })

    return NextResponse.json(tour)
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating tour" },
      { status: 500 }
    )
  }
} 