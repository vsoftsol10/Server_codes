import React, { useEffect, useState } from 'react'
import { Search, Edit, Trash2, Phone, MapPin, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import SidePannel from '../../components/common/SidePannel'
import DeleteConfirmationModal from '../../components/AddSiteEngineer/DeleteConfirmationModal'
import AddEngineerModal from '../../components/AddSiteEngineer/AddEngineerModal'
import EditEngineerModal from '../../components/AddSiteEngineer/EditEngineerModal'

// ✅ ADD THIS HELPER FUNCTION AT THE TOP
const getImageUrl = (profileImage) => {
  if (!profileImage) return null;
  // If it's already a full URL, return as is
  if (profileImage.startsWith('http')) return profileImage;
  // Otherwise, prepend the backend URL
  return `${profileImage}`;
};

// API functions
const getAllEngineers = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No authentication token found')
  }
  
  const response = await fetch('/api/engineers', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    if (response.status === 401) {
      throw { error: 'Session expired. Please login again.' }
    }
    throw new Error('Failed to fetch engineers')
  }
  
  return await response.json()
}

const createEngineer = async (engineerData) => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No authentication token found')
  }
  
  const formData = new FormData()
  formData.append('name', engineerData.name)
  formData.append('phone', engineerData.phone)
  formData.append('alternatePhone', engineerData.alternatePhone)
  formData.append('empId', engineerData.empId)
  formData.append('address', engineerData.address)
  formData.append('username', engineerData.username)
  formData.append('password', engineerData.password)
  if (engineerData.profileImage) {
    formData.append('profileImage', engineerData.profileImage)
  }
  
  const response = await fetch('/api/engineers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw error
  }
  
  return await response.json()
}

const updateEngineer = async (id, engineerData) => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No authentication token found')
  }
  
  const formData = new FormData()
  formData.append('name', engineerData.name)
  formData.append('phone', engineerData.phone)
  formData.append('alternatePhone', engineerData.alternatePhone)
  formData.append('empId', engineerData.empId)
  formData.append('address', engineerData.address)
  formData.append('username', engineerData.username)
  if (engineerData.password) {
    formData.append('password', engineerData.password)
  }
  if (engineerData.profileImage) {
    formData.append('profileImage', engineerData.profileImage)
  }
  
  const response = await fetch(`/api/engineers/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw error
  }
  
  return await response.json()
}

const deleteEngineer = async (id) => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No authentication token found')
  }
  
  const response = await fetch(`/api/engineers/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw error
  }
  
  return await response.json()
}

const AddEngineers = () => {
  const navigate = useNavigate()
  const [engineers, setEngineers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEngineer, setSelectedEngineer] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchEngineers = async () => {
    setIsLoading(true)
    
    const token = localStorage.getItem('token')
    if (!token) {
      setEngineers([])
      setIsLoading(false)
      return
    }
    
    try {
      const response = await getAllEngineers()
      
      if (response && response.success && response.engineers) {
        setEngineers(response.engineers)
      } else {
        setEngineers([])
      }
    } catch (error) {
      console.error('Error fetching engineers:', error)
      
      if (error.error === 'Session expired. Please login again.' || 
          error.message === 'Session expired. Please login again.' ||
          error.error === 'Unauthorized' ||
          error.message === 'Unauthorized') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        setEngineers([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEngineers()
  }, [])

  const filteredEngineers = engineers.filter(engineer =>
    engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    engineer.phone.includes(searchTerm)
  )

  const handleDelete = async (id) => {
    try {
      const response = await deleteEngineer(id)
      if (response.success) {
        await fetchEngineers()
        setShowDeleteModal(false)
        setSelectedEngineer(null)
        alert('Engineer deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting engineer:', error)
      alert(error.error || 'Failed to delete engineer')
    }
  }

  const handleEdit = (engineer) => {
    setSelectedEngineer(engineer)
    setShowEditModal(true)
  }

  const handleAddEngineer = async (engineerData) => {
    try {
      setIsSubmitting(true)
      const response = await createEngineer(engineerData)
      
      if (response.success) {
        setShowAddModal(false)
        await fetchEngineers()
        alert('Engineer added successfully!')
        return true
      }
      return false
    } catch (error) {
      console.error('Add engineer error:', error)
      alert(error.error || 'Failed to add engineer')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateEngineer = async (id, engineerData) => {
    setIsSubmitting(true)
    
    try {
      const response = await updateEngineer(id, engineerData)
      
      if (response.success) {
        await fetchEngineers()
        setShowEditModal(false)
        setSelectedEngineer(null)
        alert('Engineer updated successfully!')
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating engineer:', error)
      alert(error.error || 'Failed to update engineer')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar/>
      </nav>

      <aside className="fixed left-0 top-16 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

      <div className="pt-25 pl-16 md:pl-64 pr-4 pb-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Engineers List</h2>
                <p className="text-gray-600 mt-1">
                  {isLoading ? 'Loading...' : `Total Engineers: ${filteredEngineers.length}`}
                </p>
              </div>
              
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 text-black rounded-lg transition-colors"
                style={{ backgroundColor: '#ffbe2a' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e6ab25'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffbe2a'}
              >
                <User className="w-4 h-4" />
                Add Engineer
              </button>
            </div>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, employee ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading engineers...</p>
            </div>
          )}

          {/* ✅ FIXED DESKTOP TABLE VIEW */}
          {!isLoading && (
            <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engineer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEngineers.map((engineer) => (
                      <tr key={engineer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                              {engineer.profileImage ? (
                                <img 
                                  src={getImageUrl(engineer.profileImage)}
                                  alt={engineer.name} 
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    console.error('Image failed to load:', engineer.profileImage);
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `<span class="text-blue-600 font-semibold">${engineer.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>`;
                                  }}
                                />
                              ) : (
                                <span className="text-blue-600 font-semibold">
                                  {engineer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{engineer.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{engineer.empId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{engineer.phone}</div>
                          {engineer.alternatePhone && (
                            <div className="text-sm text-gray-500">{engineer.alternatePhone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{engineer.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(engineer)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEngineer(engineer)
                                setShowDeleteModal(true)
                              }}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredEngineers.length === 0 && (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No engineers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new engineer.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ✅ FIXED MOBILE CARD VIEW */}
          {!isLoading && (
            <div className="lg:hidden space-y-4">
              {filteredEngineers.map((engineer) => (
                <div key={engineer.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {engineer.profileImage ? (
                          <img 
                            src={getImageUrl(engineer.profileImage)}
                            alt={engineer.name} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', engineer.profileImage);
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<span class="text-blue-600 font-semibold text-lg">${engineer.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold text-lg">
                            {engineer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{engineer.name}</h3>
                        <p className="text-sm text-gray-500">{engineer.empId}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(engineer)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEngineer(engineer)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Phone className="w-4 h-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-900">{engineer.phone}</p>
                        {engineer.alternatePhone && (
                          <p className="text-sm text-gray-500">{engineer.alternatePhone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{engineer.address}</p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredEngineers.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No engineers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new engineer.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddEngineerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddEngineer}
        isSubmitting={isSubmitting}
      />

      <EditEngineerModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedEngineer(null)
        }}
        onSubmit={handleUpdateEngineer}
        isSubmitting={isSubmitting}
        engineer={selectedEngineer}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        engineer={selectedEngineer}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false)
          setSelectedEngineer(null)
        }}
      />
    </div>
  )
}

export default AddEngineers