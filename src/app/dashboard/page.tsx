"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { StarIcon } from "@heroicons/react/20/solid"

interface Tour {
  id: string
  title: string
  description: string
  location: string
  price: number
  duration: number
  maxGroupSize: number
  included: string[]
  imageUrl: string
  bookings: Booking[]
  reviews: Review[]
}

interface Booking {
  id: string
  date: string
  status: string
  tourId: string
  tourist: {
    name: string
    email: string
  }
}

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  author: {
    name: string
    email: string
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tours, setTours] = useState<Tour[]>([])
  const [activeTab, setActiveTab] = useState("tours")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toursResponse, bookingsResponse] = await Promise.all([
          fetch("/api/tours"),
          fetch("/api/bookings"),
        ])

        if (!toursResponse.ok || !bookingsResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const [toursData, bookingsData] = await Promise.all([
          toursResponse.json(),
          bookingsResponse.json(),
        ])

        // Combine tours with their bookings
        const toursWithBookings = toursData.map((tour: Tour) => ({
          ...tour,
          bookings: bookingsData.filter((booking: Booking) => booking.tourId === tour.id),
        }))

        setTours(toursWithBookings)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            Please{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
              sign in
            </Link>{" "}
            to access your dashboard.
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Welcome back, {session?.user?.name}
            </p>
          </div>
          {session?.user?.role === "GUIDE" && (
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <Link
                href="/tours/create"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Create Tour
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("tours")}
              className={`${
                activeTab === "tours"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Tours
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`${
                activeTab === "bookings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Bookings
            </button>
            {session?.user?.role === "GUIDE" && (
              <button
                onClick={() => setActiveTab("reviews")}
                className={`${
                  activeTab === "reviews"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              >
                Reviews
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "tours" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    {tour.imageUrl ? (
                      <Image
                        src={tour.imageUrl}
                        alt={tour.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    {session?.user?.role === "GUIDE" && (
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <Link
                          href={`/tours/${tour.id}/edit`}
                          className="rounded-md bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this tour?")) {
                              try {
                                const response = await fetch(`/api/tours/${tour.id}`, {
                                  method: "DELETE",
                                })
                                if (!response.ok) {
                                  throw new Error("Failed to delete tour")
                                }
                                setTours(tours.filter((t) => t.id !== tour.id))
                              } catch (err) {
                                console.error("Error deleting tour:", err)
                              }
                            }
                          }}
                          className="rounded-md bg-white p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{tour.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{tour.location}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {tour.bookings.length} bookings
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ${tour.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {tours.flatMap((tour) =>
                  tour.bookings.map((booking) => (
                    <li key={booking.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              {tour.imageUrl ? (
                                <Image
                                  src={tour.imageUrl}
                                  alt={tour.title}
                                  width={48}
                                  height={48}
                                  className="rounded-lg"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <h4 className="text-sm font-medium text-gray-900">
                                {tour.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {new Date(booking.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                booking.status === "CONFIRMED"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : booking.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                            {session?.user?.role === "GUIDE" && (
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await fetch(
                                      `/api/bookings/${booking.id}`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          status:
                                            booking.status === "PENDING"
                                              ? "CONFIRMED"
                                              : "CANCELLED",
                                        }),
                                      }
                                    )
                                    if (!response.ok) {
                                      throw new Error("Failed to update booking")
                                    }
                                    // Refresh the page to show updated status
                                    window.location.reload()
                                  } catch (err) {
                                    console.error("Error updating booking:", err)
                                  }
                                }}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                {booking.status === "PENDING"
                                  ? "Confirm"
                                  : booking.status === "CONFIRMED"
                                  ? "Cancel"
                                  : ""}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {activeTab === "reviews" && session?.user?.role === "GUIDE" && (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {tours.flatMap((tour) =>
                  tour.reviews?.map((review) => (
                    <li key={review.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {tour.title}
                            </h4>
                            <div className="mt-1 flex items-center">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <StarIcon
                                  key={value}
                                  className={`h-4 w-4 ${
                                    value <= review.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {review.comment}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 