import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { apiClient, Employee, Department, JobTitle, EmployeeSearch } from '../lib/api'

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchFilters, setSearchFilters] = useState<EmployeeSearch>({})
  const [formData, setFormData] = useState({
    employeeid: '',
    fname: '',
    mname: '',
    lname: '',
    birthdate: '',
    sex: '',
    workphone: '',
    workextn: '',
    workemail: '',
    homeemail: '',
    homephone: '',
    mobile: '',
    ssn: '',
    emptype: '',
    empyear: '',
    empmonth: '',
    empstatus: 'Active',
    jobtitle: '',
    department: '',
    homeaddres: '',
    empstartdt: '',
    empleavedt: '',
    membership: ''
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [employeesData, departmentsData, jobTitlesData] = await Promise.all([
        apiClient.getEmployees(),
        apiClient.getDepartments(),
        apiClient.getJobTitles()
      ])
      setEmployees(employeesData)
      setDepartments(departmentsData)
      setJobTitles(jobTitlesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const employeeData = {
        ...formData,
        emptype: formData.emptype ? parseInt(formData.emptype) : undefined,
        empyear: formData.empyear ? parseInt(formData.empyear) : undefined,
        empmonth: formData.empmonth ? parseInt(formData.empmonth) : undefined,
        birthdate: formData.birthdate || undefined,
        empstartdt: formData.empstartdt || undefined,
        empleavedt: formData.empleavedt || undefined
      }

      if (editingEmployee) {
        await apiClient.updateEmployee(editingEmployee.id, employeeData)
      } else {
        await apiClient.createEmployee(employeeData)
      }
      await fetchInitialData()
      setShowModal(false)
      setEditingEmployee(null)
      resetForm()
    } catch (error) {
      console.error('Error saving employee:', error)
    }
  }

  const handleSearch = async () => {
    try {
      const results = await apiClient.searchEmployees(searchFilters)
      setEmployees(results)
      setShowSearchModal(false)
    } catch (error) {
      console.error('Error searching employees:', error)
    }
  }

  const resetSearch = async () => {
    setSearchFilters({})
    setSearchTerm('')
    await fetchInitialData()
  }

  const resetForm = () => {
    setFormData({
      employeeid: '',
      fname: '',
      mname: '',
      lname: '',
      birthdate: '',
      sex: '',
      workphone: '',
      workextn: '',
      workemail: '',
      homeemail: '',
      homephone: '',
      mobile: '',
      ssn: '',
      emptype: '',
      empyear: '',
      empmonth: '',
      empstatus: 'Active',
      jobtitle: '',
      department: '',
      homeaddres: '',
      empstartdt: '',
      empleavedt: '',
      membership: ''
    })
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      employeeid: employee.employeeid,
      fname: employee.fname,
      mname: employee.mname || '',
      lname: employee.lname,
      birthdate: employee.birthdate || '',
      sex: employee.sex || '',
      workphone: employee.workphone || '',
      workextn: employee.workextn || '',
      workemail: employee.workemail || '',
      homeemail: employee.homeemail || '',
      homephone: employee.homephone || '',
      mobile: employee.mobile || '',
      ssn: employee.ssn || '',
      emptype: employee.emptype?.toString() || '',
      empyear: employee.empyear?.toString() || '',
      empmonth: employee.empmonth?.toString() || '',
      empstatus: employee.empstatus || 'Active',
      jobtitle: employee.jobtitle || '',
      department: employee.department || '',
      homeaddres: employee.homeaddres || '',
      empstartdt: employee.empstartdt || '',
      empleavedt: employee.empleavedt || '',
      membership: employee.membership || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await apiClient.deleteEmployee(id)
        await fetchInitialData()
      } catch (error) {
        console.error('Error deleting employee:', error)
      }
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeid.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage employee records and information.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Search
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingEmployee(null)
              resetForm()
              setShowModal(true)
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
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
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.employeeid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.fname} {employee.mname} {employee.lname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.department_rel?.name || employee.department || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.jobtitle_rel?.jobname || employee.jobtitle || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.empstatus === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.empstatus || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={formData.employeeid}
                      onChange={(e) => setFormData({ ...formData, employeeid: e.target.value })}
                      disabled={!!editingEmployee}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fname}
                      onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formData.mname}
                      onChange={(e) => setFormData({ ...formData, mname: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lname}
                      onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.idcode}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <select
                      value={formData.jobtitle}
                      onChange={(e) => setFormData({ ...formData, jobtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Job Title</option>
                      {jobTitles.map((job) => (
                        <option key={job.id} value={job.idcode}>
                          {job.jobname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.empstatus}
                      onChange={(e) => setFormData({ ...formData, empstatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={formData.workemail}
                      onChange={(e) => setFormData({ ...formData, workemail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.workphone}
                      onChange={(e) => setFormData({ ...formData, workphone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={15}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.empstartdt}
                      onChange={(e) => setFormData({ ...formData, empstartdt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
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
                    {editingEmployee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Advanced Employee Search
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Term
                  </label>
                  <input
                    type="text"
                    value={searchFilters.search_term || ''}
                    onChange={(e) => setSearchFilters({ ...searchFilters, search_term: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Name, ID, or SSN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={searchFilters.department || ''}
                    onChange={(e) => setSearchFilters({ ...searchFilters, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.idcode}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <select
                    value={searchFilters.jobtitle || ''}
                    onChange={(e) => setSearchFilters({ ...searchFilters, jobtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Job Titles</option>
                    {jobTitles.map((job) => (
                      <option key={job.id} value={job.idcode}>
                        {job.jobname}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={searchFilters.empstatus || ''}
                    onChange={(e) => setSearchFilters({ ...searchFilters, empstatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetSearch}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
