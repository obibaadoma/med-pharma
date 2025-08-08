'use client';

import { useState, useEffect } from 'react';
import { doctorApi, appointmentApi } from '../../../lib/api';

export default function DoctorDashboard({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDoctorData();
    }
  }, [id]);

  const fetchDoctorData = async () => {
    try {
      const doctorResponse = await doctorApi.get(id);
      const queueResponse = await doctorApi.getQueue(id);
      setDoctor(doctorResponse.data);
      setAppointments(queueResponse.data.queue);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNextAppointment = async (appointmentId: string) => {
    try {
      await appointmentApi.updateStatus(appointmentId, 'in-progress');
      fetchDoctorData();
    } catch (error) {
      console.error('Error starting appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Doctor Dashboard
        </h1>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {doctor?.name} - {doctor?.specialty}
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No patients in queue</p>
              </div>
            ) : (
              appointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-800 font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.patientName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Booked:{' '}
                        {new Date(appointment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'in-progress'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {appointment.status}
                    </span>

                    {index === 0 && appointment.status === 'waiting' && (
                      <button
                        onClick={() => startNextAppointment(appointment.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        Start Consultation
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
