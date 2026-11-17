
'use client'

import { useEffect, useState, type FormEvent } from 'react'

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

type SKService = {
  id: number
  name: string
  description: string
  active: boolean
}

type Announcement = {
  id: number
  title: string
  description: string
  date: string
  published: boolean
}

type UserRole = 'official' | 'staff'

const defaultServices: SKService[] = [
  {
    id: 1,
    name: 'Certificate Request',
    description: 'Request certificates and other SK documents.',
    active: true,
  },
  {
    id: 2,
    name: 'Youth Program Inquiry',
    description: 'Ask about youth programs and community activities.',
    active: true,
  },
  {
    id: 3,
    name: 'SK Office Consultation',
    description: 'Schedule a consultation with an SK official.',
    active: true,
  },
]

export default function OfficialDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [activePage, setActivePage] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [loaded, setLoaded] = useState(false)

  // USER ROLE
  const [userRole, setUserRole] = useState<UserRole>('official')
  const [sessionLoaded, setSessionLoaded] = useState(false)

  const [services, setServices] = useState<SKService[]>([])
  const [servicesLoaded, setServicesLoaded] = useState(false)

  const [serviceName, setServiceName] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null)

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementsLoaded, setAnnouncementsLoaded] = useState(false)

  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementDescription, setAnnouncementDescription] = useState('')
  const [announcementDate, setAnnouncementDate] = useState('')
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null)

  // CHECK USER SESSION AND ROLE
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('skUserSession')

      if (!savedSession) {
        window.location.href = '/login'
        return
      }

      const session = JSON.parse(savedSession)

      if (session.role === 'resident') {
        window.location.href = '/resident'
        return
      }

      if (session.role !== 'official' && session.role !== 'staff') {
        window.location.href = '/login'
        return
      }

      setUserRole(session.role)
      setSessionLoaded(true)
    } catch {
      window.location.href = '/login'
    }
  }, [])

  // CHECK IF STAFF IS TRYING TO ACCESS AN OFFICIAL-ONLY PAGE
  useEffect(() => {
    if (
      userRole === 'staff' &&
      ['SK Services', 'Announcements', 'Reports'].includes(activePage)
    ) {
      setActivePage('Dashboard')
    }
  }, [userRole, activePage])

  // LOAD APPOINTMENTS
  useEffect(() => {
    function loadAppointments() {
      try {
        const saved = localStorage.getItem('skAppointments')
        setAppointments(saved ? JSON.parse(saved) : [])
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

  // SAVE APPOINTMENTS
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('skAppointments', JSON.stringify(appointments))
    }
  }, [appointments, loaded])

  // LOAD SK SERVICES
  useEffect(() => {
    try {
      const saved = localStorage.getItem('skServices')

      if (saved) {
        setServices(JSON.parse(saved))
      } else {
        setServices(defaultServices)
      }
    } catch {
      setServices(defaultServices)
    }

    setServicesLoaded(true)
  }, [])

  // SAVE SK SERVICES
  useEffect(() => {
    if (servicesLoaded) {
      localStorage.setItem('skServices', JSON.stringify(services))
    }
  }, [services, servicesLoaded])

  // LOAD ANNOUNCEMENTS
  useEffect(() => {
    try {
      const saved = localStorage.getItem('skAnnouncements')
      setAnnouncements(saved ? JSON.parse(saved) : [])
    } catch {
      setAnnouncements([])
    }

    setAnnouncementsLoaded(true)
  }, [])

  // SAVE ANNOUNCEMENTS
  useEffect(() => {
    if (announcementsLoaded) {
      localStorage.setItem('skAnnouncements', JSON.stringify(announcements))
    }
  }, [announcements, announcementsLoaded])

  // UPDATE APPOINTMENT STATUS
  function updateStatus(id: number, status: string) {
    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status }
          : appointment
      )
    )
  }

  // ADD OR UPDATE SERVICE
  function saveService(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!serviceName.trim() || !serviceDescription.trim()) {
      return
    }

    if (editingServiceId !== null) {
      setServices((previous) =>
        previous.map((service) =>
          service.id === editingServiceId
            ? {
                ...service,
                name: serviceName.trim(),
                description: serviceDescription.trim(),
              }
            : service
        )
      )
    } else {
      const newService: SKService = {
        id: Date.now(),
        name: serviceName.trim(),
        description: serviceDescription.trim(),
        active: true,
      }

      setServices((previous) => [...previous, newService])
    }

    setServiceName('')
    setServiceDescription('')
    setEditingServiceId(null)
  }

  // EDIT SERVICE
  function editService(service: SKService) {
    setEditingServiceId(service.id)
    setServiceName(service.name)
    setServiceDescription(service.description)
  }

  // DELETE SERVICE
  function deleteService(id: number) {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices((previous) =>
        previous.filter((service) => service.id !== id)
      )

      if (editingServiceId === id) {
        cancelEditing()
      }
    }
  }

  // ACTIVATE OR DEACTIVATE SERVICE
  function toggleService(id: number) {
    setServices((previous) =>
      previous.map((service) =>
        service.id === id
          ? { ...service, active: !service.active }
          : service
      )
    )
  }

  function cancelEditing() {
    setEditingServiceId(null)
    setServiceName('')
    setServiceDescription('')
  }

  // ADD OR UPDATE ANNOUNCEMENT
  function saveAnnouncement(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (
      !announcementTitle.trim() ||
      !announcementDescription.trim() ||
      !announcementDate
    ) {
      return
    }

    if (editingAnnouncementId !== null) {
      setAnnouncements((previous) =>
        previous.map((announcement) =>
          announcement.id === editingAnnouncementId
            ? {
                ...announcement,
                title: announcementTitle.trim(),
                description: announcementDescription.trim(),
                date: announcementDate,
              }
            : announcement
        )
      )
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now(),
        title: announcementTitle.trim(),
        description: announcementDescription.trim(),
        date: announcementDate,
        published: true,
      }

      setAnnouncements((previous) => [newAnnouncement, ...previous])
    }

    cancelAnnouncementEditing()
  }

  // EDIT ANNOUNCEMENT
  function editAnnouncement(announcement: Announcement) {
    setEditingAnnouncementId(announcement.id)
    setAnnouncementTitle(announcement.title)
    setAnnouncementDescription(announcement.description)
    setAnnouncementDate(announcement.date)
  }

  // CANCEL ANNOUNCEMENT EDITING
  function cancelAnnouncementEditing() {
    setEditingAnnouncementId(null)
    setAnnouncementTitle('')
    setAnnouncementDescription('')
    setAnnouncementDate('')
  }

  // DELETE ANNOUNCEMENT
  function deleteAnnouncement(id: number) {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements((previous) =>
        previous.filter((announcement) => announcement.id !== id)
      )

      if (editingAnnouncementId === id) {
        cancelAnnouncementEditing()
      }
    }
  }

  // PUBLISH OR UNPUBLISH ANNOUNCEMENT
  function toggleAnnouncement(id: number) {
    setAnnouncements((previous) =>
      previous.map((announcement) =>
        announcement.id === id
          ? { ...announcement, published: !announcement.published }
          : announcement
      )
    )
  }

  // APPOINTMENT STATISTICS
  const pendingCount = appointments.filter(
    (a) => a.status === 'Pending'
  ).length

  const approvedCount = appointments.filter(
    (a) => a.status === 'Approved'
  ).length

  const rejectedCount = appointments.filter(
    (a) => a.status === 'Rejected'
  ).length

  // FILTER APPOINTMENTS
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.service.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      filterStatus === 'All' || a.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // UNIQUE RESIDENTS
  const residents = Array.from(
    new Map(
      appointments.map((a) => [
        a.email.toLowerCase(),
        {
          fullName: a.fullName,
          email: a.email,
          contact: a.contact,
          totalAppointments: appointments.filter(
            (item) =>
              item.email.toLowerCase() === a.email.toLowerCase()
          ).length,
        },
      ])
    ).values()
  )

  const filteredResidents = residents.filter((resident) =>
    `${resident.fullName} ${resident.email} ${resident.contact}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // REPORT: APPOINTMENTS BY SERVICE
  const serviceReport = Array.from(
    appointments.reduce((map, appointment) => {
      map.set(
        appointment.service,
        (map.get(appointment.service) || 0) + 1
      )
      return map
    }, new Map<string, number>())
  ).map(([service, count]) => ({
    service,
    count,
  }))

  // REPORT: APPOINTMENTS BY MONTH
  const monthlyReport = Array.from(
    appointments.reduce((map, appointment) => {
      const month = appointment.date?.slice(0, 7)

      if (month && /^\d{4}-\d{2}$/.test(month)) {
        map.set(month, (map.get(month) || 0) + 1)
      }

      return map
    }, new Map<string, number>())
  )
    .map(([month, count]) => ({
      month,
      count,
      label: new Date(
        Number(month.slice(0, 4)),
        Number(month.slice(5, 7)) - 1
      ).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    }))
    .sort((a, b) => b.month.localeCompare(a.month))

  // SIDEBAR MENU BASED ON ROLE
  const menuItems =
    userRole === 'official'
      ? [
          'Dashboard',
          'Appointments',
          'Residents',
          'SK Services',
          'Announcements',
          'Reports',
        ]
      : [
          'Dashboard',
          'Appointments',
          'Residents',
        ]

  // WAIT FOR SESSION CHECK
  if (!sessionLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F5F7F4]">
        <p className="text-[#145C3A] font-semibold">
          Loading dashboard...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F5F7F4] md:flex">

      {/* SIDEBAR */}
      <aside className="bg-[#145C3A] text-white p-6 md:w-64">
        <h1 className="text-xl font-bold">SK Portal</h1>

        <p className="text-xs text-green-100 mt-1">
          {userRole === 'official' ? 'Official Dashboard' : 'Staff Dashboard'}
        </p>

        <nav className="mt-8 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActivePage(item)
                setSearch('')
                setFilterStatus('All')
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm ${
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
          onClick={() => {
            localStorage.removeItem('skUserSession')
            window.location.href = '/login'
          }}
          className="mt-8 w-full text-left px-4 py-3 rounded-xl text-sm text-green-100 hover:bg-white/10"
        >
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 p-6 md:p-10">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Sangguniang Kabataan Administration
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-1">
              {activePage}
            </h2>
          </div>

          <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
            <p className="text-sm font-semibold text-gray-800">
              Welcome, {userRole === 'official' ? 'SK Official' : 'Staff'}!
            </p>

            <p className="text-xs text-gray-500">
              {userRole === 'official'
                ? 'Manage all SK administration activities.'
                : 'Assist with resident appointments.'}
            </p>
          </div>
        </header>

        {/* DASHBOARD */}
        {activePage === 'Dashboard' && (
          <div className="mt-8">

            <div className="bg-[#145C3A] text-white rounded-2xl p-8">
              <p className="text-sm text-green-100">
                {userRole === 'official'
                  ? 'SK ADMINISTRATION PORTAL'
                  : 'SK STAFF PORTAL'}
              </p>

              <h3 className="text-2xl md:text-3xl font-bold mt-3">
                {userRole === 'official'
                  ? 'Manage appointments efficiently.'
                  : 'Assist with resident appointments.'}
              </h3>

              <p className="text-sm text-green-100 mt-3">
                {userRole === 'official'
                  ? 'Review requests, manage residents, and monitor your SK services.'
                  : 'Review appointment requests and assist residents with their concerns.'}
              </p>

              <button
                onClick={() => setActivePage('Appointments')}
                className="mt-6 bg-[#E6B94D] text-[#145C3A] font-bold px-5 py-3 rounded-xl"
              >
                Manage Appointments
              </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
              {[
                {
                  title: 'Total Appointments',
                  value: appointments.length,
                },
                {
                  title: 'Pending',
                  value: pendingCount,
                },
                {
                  title: 'Approved',
                  value: approvedCount,
                },
                {
                  title: 'Rejected',
                  value: rejectedCount,
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
                </div>
              ))}
            </div>

            {/* RECENT APPOINTMENTS */}
            <div className="bg-white rounded-2xl p-6 mt-8 shadow-sm">
              <div className="flex justify-between items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Appointments
                </h3>

                <button
                  onClick={() => setActivePage('Appointments')}
                  className="text-sm text-[#145C3A] font-semibold"
                >
                  View All
                </button>
              </div>

              {appointments.length === 0 ? (
                <p className="text-sm text-gray-500 mt-5">
                  No appointment requests have been submitted yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {[...appointments].reverse().slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="border-b border-gray-100 pb-3"
                    >
                      <p className="font-semibold text-gray-800">
                        {a.fullName}
                      </p>

                      <p className="text-sm text-gray-500">
                        {a.service} · {a.date}
                      </p>

                      <span className="text-xs font-semibold text-yellow-700">
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {activePage === 'Appointments' && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">

              <h3 className="text-xl font-bold text-gray-900">
                Appointment Management
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Review and manage resident appointment requests.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search resident or service..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                />

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="mt-6 space-y-5">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-10">
                    <h4 className="font-bold text-gray-800">
                      No Appointments Found
                    </h4>

                    <p className="text-sm text-gray-500 mt-2">
                      There are no matching appointment requests.
                    </p>
                  </div>
                ) : (
                  filteredAppointments.map((a) => (
                    <div
                      key={a.id}
                      className="border border-gray-100 rounded-xl p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">
                            {a.fullName}
                          </h4>

                          <p className="text-sm text-gray-500">
                            {a.service}
                          </p>
                        </div>

                        <span
                          className={`px-4 py-2 rounded-full text-xs font-bold h-fit ${
                            a.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : a.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 mt-5 text-sm">
                        <p className="text-gray-600">
                          <strong>Email:</strong> {a.email}
                        </p>

                        <p className="text-gray-600">
                          <strong>Contact:</strong> {a.contact}
                        </p>

                        <p className="text-gray-600">
                          <strong>Date:</strong> {a.date}
                        </p>

                        <p className="text-gray-600">
                          <strong>Time:</strong> {a.time}
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-700">
                          Purpose
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {a.purpose}
                        </p>
                      </div>

                      {a.status === 'Pending' && (
                        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t">
                          <button
                            onClick={() => updateStatus(a.id, 'Approved')}
                            className="bg-[#145C3A] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#10492E]"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => updateStatus(a.id, 'Rejected')}
                            className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* RESIDENTS */}
        {activePage === 'Residents' && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Registered Residents
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Residents who have submitted appointment requests.
                </p>
              </div>

              <div className="bg-green-50 rounded-xl px-5 py-3">
                <p className="text-sm text-gray-500">
                  Total Residents
                </p>

                <p className="text-2xl font-bold text-[#145C3A]">
                  {residents.length}
                </p>
              </div>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resident by name, email, or contact..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-6 text-gray-800 bg-white"
            />

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50 text-sm text-gray-600">
                    <th className="p-4">Resident Name</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Contact Number</th>
                    <th className="p-4">Appointments</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        No residents found.
                      </td>
                    </tr>
                  ) : (
                    filteredResidents.map((resident) => (
                      <tr
                        key={resident.email}
                        className="border-b border-gray-100 text-sm"
                      >
                        <td className="p-4 font-semibold text-gray-800">
                          {resident.fullName}
                        </td>

                        <td className="p-4 text-gray-600">
                          {resident.email}
                        </td>

                        <td className="p-4 text-gray-600">
                          {resident.contact}
                        </td>

                        <td className="p-4">
                          <span className="bg-green-50 text-[#145C3A] px-3 py-1 rounded-full font-semibold">
                            {resident.totalAppointments}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 mt-5">
              Resident records are generated from appointment submissions.
            </p>
          </div>
        )}

        {/* SK SERVICES - SK OFFICIAL ONLY */}
        {userRole === 'official' && activePage === 'SK Services' && (
          <div className="mt-8 space-y-6">

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                {editingServiceId !== null ? 'Edit Service' : 'Add New Service'}
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Manage the services available to residents.
              </p>

              <form onSubmit={saveService} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Name
                  </label>

                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Enter service name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Description
                  </label>

                  <textarea
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    placeholder="Describe this service..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                    required
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="bg-[#145C3A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#10492E]"
                  >
                    {editingServiceId !== null ? 'Update Service' : 'Add Service'}
                  </button>

                  {editingServiceId !== null && (
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Available SK Services
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {services.length} service(s) in your list.
                  </p>
                </div>

                <div className="bg-green-50 text-[#145C3A] px-4 py-2 rounded-xl text-sm font-semibold h-fit">
                  {services.filter((service) => service.active).length} Active
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {services.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No services added yet.
                  </p>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-100 rounded-xl p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-bold text-gray-900">
                              {service.name}
                            </h4>

                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${
                                service.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {service.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mt-2">
                            {service.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => editService(service)}
                            className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => toggleService(service.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                              service.active
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {service.active ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            onClick={() => deleteService(service.id)}
                            className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS - SK OFFICIAL ONLY */}
        {userRole === 'official' && activePage === 'Announcements' && (
          <div className="mt-8 space-y-6">

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">
                {editingAnnouncementId !== null
                  ? 'Edit Announcement'
                  : 'Create New Announcement'}
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Share important updates, activities, and notices with residents.
              </p>

              <form onSubmit={saveAnnouncement} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Announcement Title
                  </label>

                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="Enter announcement title"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    value={announcementDescription}
                    onChange={(e) => setAnnouncementDescription(e.target.value)}
                    placeholder="Write your announcement details here..."
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Announcement Date
                  </label>

                  <input
                    type="date"
                    value={announcementDate}
                    onChange={(e) => setAnnouncementDate(e.target.value)}
                    className="w-full md:w-1/2 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white"
                    required
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="bg-[#145C3A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#10492E]"
                  >
                    {editingAnnouncementId !== null
                      ? 'Update Announcement'
                      : 'Publish Announcement'}
                  </button>

                  {editingAnnouncementId !== null && (
                    <button
                      type="button"
                      onClick={cancelAnnouncementEditing}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    All Announcements
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Manage the announcements created by your SK office.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm font-semibold">
                  <span className="bg-green-50 text-green-800 px-4 py-2 rounded-xl">
                    {announcements.filter((a) => a.published).length} Published
                  </span>

                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl">
                    {announcements.filter((a) => !a.published).length} Unpublished
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-10">
                    <h4 className="font-bold text-gray-800">
                      No Announcements Yet
                    </h4>

                    <p className="text-sm text-gray-500 mt-2">
                      Create your first announcement using the form above.
                    </p>
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="border border-gray-100 rounded-xl p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-lg font-bold text-gray-900">
                              {announcement.title}
                            </h4>

                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${
                                announcement.published
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {announcement.published
                                ? 'Published'
                                : 'Unpublished'}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mt-2">
                            Date: {announcement.date}
                          </p>

                          <p className="text-sm text-gray-700 mt-4 whitespace-pre-wrap">
                            {announcement.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:items-start">
                          <button
                            onClick={() => editAnnouncement(announcement)}
                            className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => toggleAnnouncement(announcement.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                              announcement.published
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {announcement.published ? 'Unpublish' : 'Publish'}
                          </button>

                          <button
                            onClick={() => deleteAnnouncement(announcement.id)}
                            className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* REPORTS - SK OFFICIAL ONLY */}
        {userRole === 'official' && activePage === 'Reports' && (
          <div className="mt-8 space-y-6">

            <style jsx global>{`
              @media print {
                body * {
                  visibility: hidden;
                }

                #sk-report-print,
                #sk-report-print * {
                  visibility: visible;
                }

                #sk-report-print {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  padding: 20px;
                }

                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 no-print">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Appointment Reports
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Monitor appointment records and SK service activity.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-[#145C3A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#10492E]"
              >
                Print / Save as PDF
              </button>
            </div>

            <div id="sk-report-print" className="space-y-6">

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">
                  SK Appointment Summary Report
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  Complete summary of all resident appointment requests.
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  Generated: {new Date().toLocaleDateString()}
                </p>
              </div>

              {/* APPOINTMENT SUMMARY */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    title: 'Total Appointments',
                    value: appointments.length,
                  },
                  {
                    title: 'Pending',
                    value: pendingCount,
                  },
                  {
                    title: 'Approved',
                    value: approvedCount,
                  },
                  {
                    title: 'Rejected',
                    value: rejectedCount,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                  >
                    <p className="text-sm text-gray-500">
                      {item.title}
                    </p>

                    <h3 className="text-3xl font-bold text-[#145C3A] mt-3">
                      {item.value}
                    </h3>
                  </div>
                ))}
              </div>

              {/* APPOINTMENTS BY SERVICE */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">
                  Appointments by SK Service
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Number of requests received for each service.
                </p>

                {serviceReport.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No service appointment records available.
                  </p>
                ) : (
                  <div className="mt-5 space-y-5">
                    {serviceReport.map((item) => (
                      <div key={item.service}>
                        <div className="flex justify-between gap-3 text-sm mb-2">
                          <span className="font-semibold text-gray-700">
                            {item.service}
                          </span>

                          <span className="font-bold text-[#145C3A]">
                            {item.count}
                          </span>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className="bg-[#145C3A] h-3 rounded-full"
                            style={{
                              width: `${
                                appointments.length > 0
                                  ? (item.count / appointments.length) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MONTHLY APPOINTMENT SUMMARY */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">
                  Monthly Appointment Summary
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Appointment requests grouped by their scheduled month.
                </p>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-gray-50 text-sm text-gray-600">
                        <th className="p-4">Month</th>
                        <th className="p-4">Total Appointments</th>
                      </tr>
                    </thead>

                    <tbody>
                      {monthlyReport.length === 0 ? (
                        <tr>
                          <td
                            colSpan={2}
                            className="p-8 text-center text-gray-500"
                          >
                            No monthly records available.
                          </td>
                        </tr>
                      ) : (
                        monthlyReport.map((item) => (
                          <tr
                            key={item.month}
                            className="border-b border-gray-100 text-sm"
                          >
                            <td className="p-4 font-semibold text-gray-800">
                              {item.label}
                            </td>

                            <td className="p-4 text-gray-600">
                              {item.count}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* REPORT INFORMATION */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">
                  Report Information
                </h3>

                <ul className="text-sm text-gray-600 mt-3 space-y-2">
                  <li>
                    • All appointment records are included in this report.
                  </li>
                  <li>
                    • Pending appointments are requests awaiting review.
                  </li>
                  <li>
                    • Approved appointments are accepted requests.
                  </li>
                  <li>
                    • Rejected appointments are declined requests.
                  </li>
                  <li>
                    • Monthly totals are based on the appointment date.
                  </li>
                </ul>
              </div>

            </div>
          </div>
        )}

      </section>
    </main>
  )
}
