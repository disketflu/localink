"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { StarIcon } from "@heroicons/react/20/solid"
import Messages from "@/components/Messages"

interface Profile {
  bio: string | null
  location: string | null
  languages: string[]
  expertise: string[]
}

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: "TOURIST" | "GUIDE"
  profile: Profile | null
}

declare module "next-auth" {
  interface Session {
    user: User
  }
}

interface Booking {
  id: string
  date: string
  status: string
  tour: {
    id: string
    title: string
    description: string
    location: string
    price: number
    duration: number
    maxGroupSize: number
    imageUrl: string
    guide: {
      name: string
    }
  }
}

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  tour: {
    id: string
    title: string
  }
}

export default function TouristDashboard() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState("bookings")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsResponse, reviewsResponse, profileResponse] = await Promise.all([
          fetch("/api/bookings"),
          fetch("/api/reviews?touristId=" + session?.user?.id),
          fetch("/api/profile"),
        ])

        if (!bookingsResponse.ok || !reviewsResponse.ok || !profileResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const [bookingsData, reviewsData, profileData] = await Promise.all([
          bookingsResponse.json(),
          reviewsResponse.json(),
          profileResponse.json(),
        ])

        setBookings(bookingsData)
        setReviews(reviewsData)
        // Update session with profile data
        if (session) {
          session.user = {
            ...session.user,
            ...profileData,
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status, session?.user?.id])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Tourist Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Welcome back, {session?.user?.name}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              href="/tours"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              Browse Tours
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`${
                activeTab === "bookings"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`${
                activeTab === "messages"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`${
                activeTab === "reviews"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              My Reviews
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`${
                activeTab === "profile"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "bookings" && (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <li key={booking.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {booking.tour.imageUrl ? (
                              <Image
                                src={booking.tour.imageUrl}
                                alt={booking.tour.title}
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
                              {booking.tour.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Guide: {booking.tour.guide.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Date: {new Date(booking.date).toLocaleDateString()}
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
                          {booking.status === "PENDING" && (
                            <button
                              onClick={async () => {
                                if (confirm("Are you sure you want to cancel this booking?")) {
                                  try {
                                    const response = await fetch(
                                      `/api/bookings/${booking.id}`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          status: "CANCELLED"
                                        })
                                      }
                                    )
                                    if (!response.ok) {
                                      const error = await response.text()
                                      throw new Error(error || "Failed to cancel booking")
                                    }
                                    // Refresh the data instead of the whole page
                                    const updatedBookings = bookings.map(b => 
                                      b.id === booking.id ? { ...b, status: "CANCELLED" } : b
                                    )
                                    setBookings(updatedBookings)
                                  } catch (err) {
                                    console.error("Error cancelling booking:", err)
                                    setError(err instanceof Error ? err.message : "Failed to cancel booking")
                                  }
                                }
                              }}
                              className="text-sm font-medium text-red-600 hover:text-red-500"
                            >
                              Cancel
                            </button>
                          )}
                          {booking.status === "COMPLETED" && !reviews.some(r => r.tour.id === booking.tour.id) && (
                            <Link
                              href={`/tours/${booking.tour.id}/review`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Review
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "messages" && (
            <Messages bookings={bookings} />
          )}

          {activeTab === "reviews" && (
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <li key={review.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {review.tour.title}
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
                ))}
              </ul>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Profile Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your personal information and preferences
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Profile Picture</dt>
                    <dd className="mt-2 flex items-center">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "Profile"}
                          width={96}
                          height={96}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.name || "Not provided"}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.email}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {session?.user?.profile?.bio || "No bio provided"}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.profile?.location || "Not specified"}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Languages</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {session?.user?.profile?.languages?.length > 0
                        ? session.user.profile.languages.join(", ")
                        : "None specified"}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex justify-end">
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 