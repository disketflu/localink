"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

interface Booking {
  id: string
  date: string
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  tour: {
    title: string
    location: string
    price: number
    guide: {
      name: string | null
    }
  }
  tourist: {
    name: string | null
    email: string
  }
}

export default function BookingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings")
        if (!response.ok) {
          throw new Error("Failed to fetch bookings")
        }
        const data = await response.json()
        setBookings(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchBookings()
    }
  }, [status, router])

  const handleStatusUpdate = async (bookingId: string, newStatus: "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update booking status")
      }

      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ))
    } catch (error) {
      console.error("Error updating booking status:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
          {session?.user.role === "GUIDE" ? "Tour Bookings" : "My Bookings"}
        </h1>

        <div className="mt-8">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Tour</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                    {session?.user.role === "GUIDE" && (
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tourist</th>
                    )}
                    {session?.user.role === "TOURIST" && (
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Guide</th>
                    )}
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    {session?.user.role === "GUIDE" && (
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                        <div className="font-medium text-gray-900">{booking.tour.title}</div>
                        <div className="text-gray-500">{booking.tour.location}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {format(new Date(booking.date), "MMMM d, yyyy")}
                      </td>
                      {session?.user.role === "GUIDE" && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <div className="font-medium text-gray-900">{booking.tourist.name}</div>
                          <div className="text-gray-500">{booking.tourist.email}</div>
                        </td>
                      )}
                      {session?.user.role === "TOURIST" && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {booking.tour.guide.name}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        ${booking.tour.price}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          booking.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      {session?.user.role === "GUIDE" && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {booking.status === "PENDING" && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                                className="text-green-600 hover:text-green-900"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {booking.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Mark as Completed
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 