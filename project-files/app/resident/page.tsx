
'use client'

import { useState, useEffect } from 'react'

type Appointment = {
  id: number
  fullName: string
  email: string
  contact: string
  service: string
  date: string
  time: string
  purpose: string
  status: string
}

type Announcement = {
  id: number
  title: string
  description: string
  date: string
  published: boolean
}

type SKService = {
  id: number
  name: string
  description: string
  active: boolean
}

type ResidentProfile = {
  fullName: string
  email: string
  contact: string
}

export default function ResidentDashboard() {
  const [activePage, setActivePage] = useState('Dashboard')

  // APPOINTMENTS
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loaded, setLoaded] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [appointmentFilter, setAppointmentFilter] = useState('All')

  useEffect(() => {
    function loadAppointments() {
      try {
        const saved = localStorage.getItem('skAppointments')
        const parsed = saved ? JSON.parse(saved) : []
        setAppointments(Array.isArray(parsed) ? parsed : [])
      } catch {
        setAppointments([])
      }

      setLoaded(true)
    }

    loadAppointments()
    window.addEventListener('storage', loadAppointments)

    return () => {
      window.removeEventListener('storage', loadAppointments)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('skAppointments', JSON.stringify(appointments))
  }, [appointments, loaded])

  // RESIDENT PROFILE
  const [profile, setProfile] = useState<ResidentProfile>({
    fullName: '',
    email: '',
    contact: '',
  })

  const [profileSaved, setProfileSaved] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('skResidentProfile')

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile)

        setProfile({
          fullName: parsed.fullName || '',
          email: parsed.email || '',
          contact: parsed.contact || '',
        })
      }
    } catch {
      console.error('Unable to load resident profile.')
    }

    setProfileLoaded(true)
  }, [])

  function handleProfileSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    localStorage.setItem(
      'skResidentProfile',
      JSON.stringify(profile)
    )

    setProfileSaved(true)
  }

  // ANNOUNCEMENTS
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    function loadAnnouncements() {
      try {
        const saved = localStorage.getItem('skAnnouncements')
        const parsed: Announcement[] = saved ? JSON.parse(saved) : []

        setAnnouncements(
          Array.isArray(parsed)
            ? parsed.filter((announcement) => announcement.published)
            : []
        )
      } catch {
        setAnnouncements([])
      }
    }

    loadAnnouncements()
    window.addEventListener('storage', loadAnnouncements)

    return () => {
      window.removeEventListener('storage', loadAnnouncements)
    }
  }, [])

  // SK SERVICES
  const [services, setServices] = useState<SKService[]>([])
  const [servicesLoaded, setServicesLoaded] = useState(false)

  useEffect(() => {
    function loadServices() {
      try {
        const saved = localStorage.getItem('skServices')
        const parsed: SKService[] = saved ? JSON.parse(saved) : []

        setServices(Array.isArray(parsed) ? parsed : [])
      } catch {
        setServices([])
      }

      setServicesLoaded(true)
    }

    loadServices()
    window.addEventListener('storage', loadServices)

    return () => {
      window.removeEventListener('storage', loadServices)
    }
  }, [])

  const activeServices = services.filter(
    (service) => service.active
  )

  const menuItems = [
    'Dashboard',
    'Book an Appointment',
    'My Appointments',
    'SK Services',
    'Announcements',
    'My Profile',
  ]

  // SUBMIT APPOINTMENT
  function handleAppointmentSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const selectedService = String(formData.get('service'))

    const serviceIsActive = activeServices.some(
      (service) => service.name === selectedService
    )

    if (!serviceIsActive) {
      alert(
        'This service is no longer available. Please select another service.'
      )
      return
    }

    const newAppointment: Appointment = {
      id: Date.now(),
      fullName: String(formData.get('fullName')),
      email: String(formData.get('email')),
      contact: String(formData.get('contact')),
      service: selectedService,
      date: String(formData.get('date')),
      time: String(formData.get('time')),
      purpose: String(formData.get('purpose')),
      status: 'Pending',
    }

    setAppointments((previous) => [
      ...previous,
      newAppointment,
    ])

    setSubmitted(true)
  }

  // APPOINTMENT COUNTS
  const pendingCount = appointments.filter(
    (appointment) => appointment.status === 'Pending'
  ).length

  const approvedCount = appointments.filter(
    (appointment) => appointment.status === 'Approved'
  ).length

  const rejectedCount = appointments.filter(
    (appointment) => appointment.status === 'Rejected'
  ).length

  // FILTER AND SORT APPOINTMENTS
  const filteredAppointments = appointments
    .filter((appointment) => {
      return (
        appointmentFilter === 'All' ||
        appointment.status === appointmentFilter
      )
    })
    .sort((a, b) => b.id - a.id)

  function getStatusStyle(status: string) {
    if (status === 'Approved') {
      return 'bg-green-100 text-green-800'
    }

    if (status === 'Rejected') {
      return 'bg-red-100 text-red-800'
    }

    return 'bg-yellow-100 text-yellow-800'
  }

  return (
    <main className="min-h-screen bg-[#F5F7F4] md:flex">

      {/* SIDEBAR */}
      <aside className="bg-[#145C3A] text-white p-6 md:w-64">
        <h1 className="text-xl font-bold">SK Portal</h1>

        <p className="text-xs text-green-100 mt-1">
          Resident Dashboard
        </p>

        <nav className="mt-8 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActivePage(item)
                setSubmitted(false)
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${
                activePage === item
                  ? 'bg-white text-[#145C3A] font-bold'
                  : 'text-green-50 hover:bg-white/10'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <button
          onClick={() => window.location.href = '/login'}
          className="mt-8 w-full text-left px-4 py-3 rounded-xl text-sm text-green-100 hover:bg-white/10"
        >
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 p-6 md:p-10">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Sangguniang Kabataan Service Portal
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-1">
              {activePage}
            </h2>
          </div>

          <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
            <p className="text-sm font-semibold text-gray-800">
              Welcome, {profile.fullName || 'Resident'}!
            </p>

            <p className="text-xs text-gray-500">
              Your community, your services.
            </p>
          </div>
        </header>

        {/* DASHBOARD */}
        {activePage === 'Dashboard' && (
          <div className="mt-8">

            <div className="bg-[#145C3A] text-white rounded-2xl p-8">
              <p className="text-sm text-green-100">
                WELCOME TO YOUR SK PORTAL
              </p>

              <h3 className="text-2xl md:text-3xl font-bold mt-3">
                Access SK services with ease.
              </h3>

              <p className="text-sm text-green-100 mt-3">
                Book appointments, track requests, and stay updated
                with your Sangguniang Kabataan.
              </p>

              <button
                onClick={() => setActivePage('Book an Appointment')}
                className="mt-6 bg-[#E6B94D] text-[#145C3A] font-bold px-5 py-3 rounded-xl hover:bg-yellow-400"
              >
                Book an Appointment
              </button>
            </div>

            {/* DASHBOARD CARDS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
              {[
                {
                  title: 'My Appointments',
                  value: appointments.length,
                  description: 'Total appointments',
                },
                {
                  title: 'Pending Requests',
                  value: pendingCount,
                  description: 'Awaiting confirmation',
                },
                {
                  title: 'Approved Requests',
                  value: approvedCount,
                  description: 'Confirmed appointments',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <h3 className="text-3xl font-bold text-[#145C3A] mt-3">
                    {card.value}
                  </h3>

                  <p className="text-xs text-gray-400 mt-2">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>

            {/* LATEST ANNOUNCEMENTS */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mt-8">
              <div className="flex justify-between items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Latest Announcements
                </h3>

                <button
                  onClick={() => setActivePage('Announcements')}
                  className="text-sm text-[#145C3A] font-semibold"
                >
                  View All
                </button>
              </div>

              {announcements.length === 0 ? (
                <p className="text-sm text-gray-500 mt-5">
                  There are no announcements at the moment.
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div
                      key={announcement.id}
                      className="border-b border-gray-100 pb-4 last:border-0"
                    >
                      <h4 className="font-bold text-gray-900">
                        {announcement.title}
                      </h4>

                      <p className="text-xs text-gray-400 mt-1">
                        {announcement.date}
                      </p>

                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                        {announcement.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOK AN APPOINTMENT */}
        {activePage === 'Book an Appointment' && (
          <div className="mt-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">

            <h3 className="text-xl font-bold text-gray-900">
              Appointment Request Form
            </h3>

            <p className="text-sm text-gray-500 mt-2 mb-6">
              Fill out the information below to request an appointment.
            </p>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h4 className="font-bold text-[#145C3A]">
                  Appointment request submitted!
                </h4>

                <p className="text-sm text-gray-600 mt-2">
                  Your appointment has been saved successfully.
                </p>

                <button
                  onClick={() => {
                    setSubmitted(false)
                    setActivePage('My Appointments')
                  }}
                  className="mt-4 bg-[#145C3A] text-white px-5 py-2 rounded-lg"
                >
                  View My Appointments
                </button>

                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 ml-3 text-[#145C3A] font-semibold text-sm"
                >
                  Book Another
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleAppointmentSubmit}
                className="space-y-5"
              >
                <div className="grid md:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      required
                      defaultValue={profile.fullName}
                      placeholder="Enter your full name"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      required
                      defaultValue={profile.email}
                      placeholder="Enter your email"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number
                    </label>

                    <input
                      type="tel"
                      name="contact"
                      required
                      defaultValue={profile.contact}
                      placeholder="09XXXXXXXXX"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SK Service
                    </label>

                    <select
                      name="service"
                      required
                      defaultValue=""
                      disabled={!servicesLoaded || activeServices.length === 0}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="" disabled>
                        {!servicesLoaded
                          ? 'Loading services...'
                          : activeServices.length === 0
                          ? 'No services available'
                          : 'Select a service'}
                      </option>

                      {activeServices.map((service) => (
                        <option key={service.id} value={service.name}>
                          {service.name}
                        </option>
                      ))}
                    </select>

                    {activeServices.length === 0 && servicesLoaded && (
                      <p className="text-xs text-red-600 mt-2">
                        There are currently no active SK services. Please check again later.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Appointment Date
                    </label>

                    <input
                      type="date"
                      name="date"
                      required
                      min="2026-01-01"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preferred Time
                    </label>

                    <select
                      name="time"
                      required
                      defaultValue=""
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-800"
                    >
                      <option value="" disabled>
                        Select a time
                      </option>

                      <option value="9:00 AM - 10:00 AM">
                        9:00 AM - 10:00 AM
                      </option>

                      <option value="10:00 AM - 11:00 AM">
                        10:00 AM - 11:00 AM
                      </option>

                      <option value="1:00 PM - 2:00 PM">
                        1:00 PM - 2:00 PM
                      </option>

                      <option value="2:00 PM - 3:00 PM">
                        2:00 PM - 3:00 PM
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Purpose of Appointment
                  </label>

                  <textarea
                    name="purpose"
                    required
                    rows={4}
                    placeholder="Briefly explain your concern or request..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!servicesLoaded || activeServices.length === 0}
                  className="bg-[#145C3A] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#10492E] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Submit Appointment
                </button>
              </form>
            )}
          </div>
        )}

        {/* MY APPOINTMENTS */}
        {activePage === 'My Appointments' && (
          <div className="mt-8">

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Total', value: appointments.length, color: 'text-gray-900' },
                { label: 'Pending', value: pendingCount, color: 'text-yellow-600' },
                { label: 'Approved', value: approvedCount, color: 'text-green-700' },
                { label: 'Rejected', value: rejectedCount, color: 'text-red-600' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                >
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <h3 className={`text-3xl font-bold mt-2 ${item.color}`}>
                    {item.value}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Appointments</p>
                </div>
              ))}
            </div>

            {/* APPOINTMENT HISTORY */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Appointment History
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    View and track the status of your appointment requests.
                  </p>
                </div>

                <button
                  onClick={() => setActivePage('Book an Appointment')}
                  className="bg-[#145C3A] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#10492E]"
                >
                  + New Appointment
                </button>
              </div>

              {/* FILTER BUTTONS */}
              <div className="flex flex-wrap gap-2 mt-6">
                {['All', 'Pending', 'Approved', 'Rejected'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setAppointmentFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                      appointmentFilter === filter
                        ? 'bg-[#145C3A] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                    {filter === 'All' && ` (${appointments.length})`}
                    {filter === 'Pending' && ` (${pendingCount})`}
                    {filter === 'Approved' && ` (${approvedCount})`}
                    {filter === 'Rejected' && ` (${rejectedCount})`}
                  </button>
                ))}
              </div>

              {/* APPOINTMENT LIST */}
              {!loaded ? (
                <p className="text-center text-gray-500 py-12">
                  Loading appointments...
                </p>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📋</div>

                  <h4 className="font-bold text-gray-800">
                    {appointments.length === 0
                      ? 'No Appointments Yet'
                      : `No ${appointmentFilter} Appointments`}
                  </h4>

                  <p className="text-sm text-gray-500 mt-2">
                    {appointments.length === 0
                      ? 'Your appointment requests will appear here once you book a service.'
                      : 'Try selecting another status filter to view your appointments.'}
                  </p>

                  {appointments.length === 0 && (
                    <button
                      onClick={() => setActivePage('Book an Appointment')}
                      className="mt-5 bg-[#145C3A] text-white px-5 py-3 rounded-xl font-semibold"
                    >
                      Book an Appointment
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-400 font-medium">
                            APPOINTMENT #{appointment.id}
                          </p>

                          <h4 className="text-lg font-bold text-gray-900 mt-1">
                            {appointment.service}
                          </h4>
                        </div>

                        <span className={`px-4 py-2 rounded-full text-xs font-bold w-fit ${getStatusStyle(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                        <div>
                          <p className="text-xs text-gray-400">Appointment Date</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {appointment.date}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Preferred Time</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {appointment.time}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Applicant Name</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {appointment.fullName}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 mt-5 pt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Purpose of Appointment
                        </p>

                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                          {appointment.purpose}
                        </p>
                      </div>

                      <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col sm:flex-row sm:justify-between gap-2">
                        <p className="text-xs text-gray-400">
                          Contact: {appointment.contact}
                        </p>

                        <p className="text-xs text-gray-400">
                          Email: {appointment.email}
                        </p>
                      </div>

                      {appointment.status === 'Pending' && (
                        <p className="mt-4 text-xs text-yellow-700 bg-yellow-50 rounded-lg p-3">
                          Your request is waiting for review by an SK Official.
                        </p>
                      )}

                      {appointment.status === 'Approved' && (
                        <p className="mt-4 text-xs text-green-700 bg-green-50 rounded-lg p-3">
                          Your appointment has been approved. Please remember your scheduled date and time.
                        </p>
                      )}

                      {appointment.status === 'Rejected' && (
                        <p className="mt-4 text-xs text-red-700 bg-red-50 rounded-lg p-3">
                          Your appointment request was rejected. Please contact the SK office for further information.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SK SERVICES */}
        {activePage === 'SK Services' && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                Available SK Services
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Browse the services currently offered by your Sangguniang Kabataan.
              </p>

              {!servicesLoaded ? (
                <p className="text-sm text-gray-500 mt-6">
                  Loading services...
                </p>
              ) : activeServices.length === 0 ? (
                <div className="text-center py-12">
                  <h4 className="font-bold text-gray-800">
                    No Active Services
                  </h4>

                  <p className="text-sm text-gray-500 mt-2">
                    There are currently no available services. Please check again later.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-5 mt-6">
                  {activeServices.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-100 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-[#145C3A] p-2 rounded-lg">
                          ✓
                        </span>

                        <h4 className="font-bold text-gray-900">
                          {service.name}
                        </h4>
                      </div>

                      <p className="text-sm text-gray-600 mt-4">
                        {service.description}
                      </p>

                      <button
                        onClick={() => setActivePage('Book an Appointment')}
                        className="mt-5 text-sm font-semibold text-[#145C3A] hover:underline"
                      >
                        Book this service
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {activePage === 'Announcements' && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                SK Announcements
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Stay updated with the latest news, activities, and notices
                from your Sangguniang Kabataan.
              </p>

              <div className="mt-6 space-y-5">
                {announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <h4 className="font-bold text-gray-800">
                      No Announcements Available
                    </h4>

                    <p className="text-sm text-gray-500 mt-2">
                      Please check again later for updates from your SK officials.
                    </p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="border border-gray-100 rounded-xl p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <h4 className="text-lg font-bold text-[#145C3A]">
                          {announcement.title}
                        </h4>

                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full h-fit">
                          Published
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-2">
                        Announcement Date: {announcement.date}
                      </p>

                      <div className="border-t border-gray-100 mt-4 pt-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {announcement.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* MY PROFILE */}
        {activePage === 'My Profile' && (
          <div className="mt-8 max-w-3xl">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">

              {/* PROFILE HEADER */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-[#145C3A]">
                  {profile.fullName
                    ? profile.fullName.charAt(0).toUpperCase()
                    : 'R'}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Resident Profile
                  </h3>

                  <p className="text-sm text-gray-500">
                    Manage your personal information.
                  </p>
                </div>
              </div>

              {!profileLoaded ? (
                <p className="text-sm text-gray-500">
                  Loading profile...
                </p>
              ) : (
                <>
                  {profileSaved && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                      <p className="text-sm font-semibold text-green-800">
                        ✓ Profile updated successfully!
                      </p>
                    </div>
                  )}

                  <form
                    onSubmit={handleProfileSubmit}
                    className="space-y-5"
                  >
                    {/* FULL NAME */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>

                      <input
                        type="text"
                        required
                        value={profile.fullName}
                        onChange={(e) => {
                          setProfile({
                            ...profile,
                            fullName: e.target.value,
                          })
                          setProfileSaved(false)
                        }}
                        placeholder="Enter your full name"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                      />
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>

                      <input
                        type="email"
                        required
                        value={profile.email}
                        onChange={(e) => {
                          setProfile({
                            ...profile,
                            email: e.target.value,
                          })
                          setProfileSaved(false)
                        }}
                        placeholder="Enter your email address"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                      />
                    </div>

                    {/* CONTACT */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Number
                      </label>

                      <input
                        type="tel"
                        required
                        value={profile.contact}
                        onChange={(e) => {
                          setProfile({
                            ...profile,
                            contact: e.target.value,
                          })
                          setProfileSaved(false)
                        }}
                        placeholder="09XXXXXXXXX"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                      />
                    </div>

                    {/* SAVE BUTTON */}
                    <div className="border-t border-gray-100 pt-5">
                      <button
                        type="submit"
                        className="bg-[#145C3A] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#10492E] transition"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

      </section>
    </main>
  )
}
