'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { appointmentApi, doctorApi } from '../../../lib/api'
import { socketService } from '../../../lib/socket'
import { Appointment, Doctor } from '../../../lib/types'

export default function QueueStatusPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [position, setPosition] = useState<number | null>(null)
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<string | null>(null)
  
  useEffect(() => {
    if (id) {
      fetchAppointment(id)
      setupSocket(id)
    }
    
    return () => {
      socketService.disconnect()
    }
  }, [id])
  
  const fetchAppointment = async (appointmentId: string) => {
    try {
      const response = await appointmentApi.get(appointmentId)
      setAppointment(response.data)
      setPosition(response.data.position || null)
      setEstimatedWaitTime(response.data.estimatedWaitTime || null)
      
      // Fetch doctor info
      if (response.data.doctorId) {
        const doctorResponse = await doctorApi.get(response.data.doctorId)
        setDoctor(doctorResponse.data)
      }
    } catch (error) {
      console.error('Error fetching appointment:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const setupSocket = (appointmentId: string) => {
    socketService.connect()
    socketService.subscribeToQueue(appointmentId)
    
    socketService.onQueueUpdate((data) => {
      setPosition(data.position)
      setEstimatedWaitTime(data.estimatedWaitTime)
    })
    
    socketService.onTurnNotification((data) => {
      setNotification(data.message)
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000)
    })
  }
  
  const formatWaitTime = (minutes: number | null) => {
    if (minutes === null) return '-- minutes'
    if (minutes < 1) return 'Less than 1 minute'
    if (minutes === 1) return '1 minute'
    return `${minutes} minutes`
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading queue information...</div>
      </div>
    )
  }
  
  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Appointment not found</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{notification}</span>
          </div>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Queue Status</h1>
          <p className="mt-2 text-lg text-gray-600">
            Welcome, {appointment.patientName}
          </p>
          {doctor && (
            <p className="mt-1 text-md text-gray-500">
              With {doctor.name} - {doctor.specialty}
            </p>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Appointment Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                <p className="text-gray-600">ID: {appointment.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Queue Position Card */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Position in Queue</h3>
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {position !== null ? position : '--'}
              </div>
              <p className="text-gray-600">of {position !== null ? position : '--'} patients</p>
            </div>
          </div>
          
          {/* Wait Time Card */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Estimated Wait Time</h3>
              <div className="text-4xl font-bold text-orange-600 mb-4">
                {formatWaitTime(estimatedWaitTime)}
              </div>
              <p className="text-gray-600">Based on current queue and doctor availability</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="px-6 py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Queue Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: position ? `${Math.max(5, 100 - ((position - 1) * 20))}%` : '0%' 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Your turn</span>
              <span>Current position</span>
              <span>End of queue</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 flex justify-between">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Book New Appointment
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Refresh Status
            </button>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your position updates automatically. You'll be notified when it's your turn.</p>
        </div>
      </div>
    </div>
  )
}