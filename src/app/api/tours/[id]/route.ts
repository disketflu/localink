import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tour = await db.tour.findUnique({
      where: {
        id: params.id,
      },
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                bio: true,
                languages: true,
                expertise: true,
              },
            },
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
        },
      },
    })

    if (!tour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(tour)
  } catch (error) {
    console.error("Error fetching tour:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 