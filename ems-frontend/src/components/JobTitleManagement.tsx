import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { apiClient, JobTitle } from '../lib/api'

export default function JobTitleManagement() {
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingJobTitle, setEditingJobTitle] = useState<JobTitle | null>(null)
  const [formData, setFormData] = useState({ idcode: '', jobname: '' })

  useEffect(() => {
    fetchJobTitles()
  }, [])

  const fetchJobTitles = async () => {
    try {
      const data = await apiClient.getJobTitles()
      setJobTitles(data)
    } catch (error) {
      console.error('Error fetching job titles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingJobTitle) {
        await apiClient.updateJobTitle(editingJobTitle.id, { jobname: formData.jobname })
      } else {
        await apiClient.createJobTitle(formData)
      }
      await fetchJobTitles()
      setShowModal(false)
      setEditingJobTitle(null)
      setFormData({ idcode: '', jobname: '' })
    } catch (error) {
      console.error('Error saving job title:', error)
    }
  }

  const handleEdit = (jobTitle: JobTitle) => {
    setEditingJobTitle(jobTitle)
    setFormData({ idcode: jobTitle.idcode, jobname: jobTitle.jobname })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this job title?')) {
      try {
        await apiClient.deleteJobTitle(id)
        await fetchJobTitles()
      } catch (error) {
        console.error('Error deleting job title:', error)
      }
    }
  }

  const filteredJobTitles = jobTitles.filter(jobTitle =>
    jobTitle.jobname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jobTitle.idcode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Job Title Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage job titles and positions within the organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setEditingJobTitle(null)
              setFormData({ idcode: '', jobname: '' })
              setShowModal(true)
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Job Title
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search job titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredJobTitles.map((jobTitle) => (
            <li key={jobTitle.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {jobTitle.idcode}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {jobTitle.jobname}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {jobTitle.idcode}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(jobTitle)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(jobTitle.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingJobTitle ? 'Edit Job Title' : 'Add New Job Title'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title Code
                  </label>
                  <input
                    type="text"
                    value={formData.idcode}
                    onChange={(e) => setFormData({ ...formData, idcode: e.target.value })}
                    disabled={!!editingJobTitle}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required
                    maxLength={4}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title Name
                  </label>
                  <input
                    type="text"
                    value={formData.jobname}
                    onChange={(e) => setFormData({ ...formData, jobname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                    maxLength={50}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editingJobTitle ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
