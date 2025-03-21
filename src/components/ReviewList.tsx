"use client"

import { StarIcon } from "@heroicons/react/20/solid"
import Image from "next/image"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  author: {
    name: string
    image: string | null
  }
}

interface ReviewListProps {
  reviews: Review[]
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reviews yet. Be the first to review this tour!</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-8">
          <div className="flex items-center space-x-4">
            <div className="relative h-10 w-10 flex-shrink-0">
              {review.author.image ? (
                <Image
                  src={review.author.image}
                  alt={review.author.name}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">
                    {review.author.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">{review.author.name}</h4>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <StarIcon
                    key={value}
                    className={`h-4 w-4 ${
                      value <= review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {review.comment}
          </div>
        </div>
      ))}
    </div>
  )
} 