import { useState, useEffect } from 'react'
import { FileText, Download, Building2, Users, Briefcase } from 'lucide-react'
import { apiClient, Employee, Department, JobTitle, Supplier } from '../lib/api'

export default function Reports() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<string>('')

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const [employeesData, departmentsData, jobTitlesData, suppliersData] = await Promise.all([
        apiClient.getEmployees(),
        apiClient.getDepartments(),
        apiClient.getJobTitles(),
        apiClient.getSuppliers()
      ])
      setEmployees(employeesData)
      setDepartments(departmentsData)
      setJobTitles(jobTitlesData)
      setSuppliers(suppliersData)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateDepartmentReport = () => {
    const reportData = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept.idcode)
      return {
        ...dept,
        employeeCount: deptEmployees.length,
        activeEmployees: deptEmployees.filter(emp => emp.empstatus === 'Active').length
      }
    })
    return reportData
  }

  const generateJobTitleReport = () => {
    const reportData = jobTitles.map(job => {
      const jobEmployees = employees.filter(emp => emp.jobtitle === job.idcode)
      return {
        ...job,
        employeeCount: jobEmployees.length,
        activeEmployees: jobEmployees.filter(emp => emp.empstatus === 'Active').length
      }
    })
    return reportData
  }

  const generateEmployeeReport = () => {
    return employees.map(emp => ({
      ...emp,
      departmentName: departments.find(d => d.idcode === emp.department)?.name || 'N/A',
      jobTitleName: jobTitles.find(j => j.idcode === emp.jobtitle)?.jobname || 'N/A'
    }))
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const reports = [
    {
      id: 'departments',
      title: 'Department Report',
      description: 'Overview of all departments with employee counts',
      icon: Building2,
      color: 'bg-blue-500',
      generate: generateDepartmentReport
    },
    {
      id: 'jobtitles',
      title: 'Job Title Report',
      description: 'Overview of all job titles with employee counts',
      icon: Briefcase,
      color: 'bg-purple-500',
      generate: generateJobTitleReport
    },
    {
      id: 'employees',
      title: 'Employee Report',
      description: 'Complete employee listing with details',
      icon: Users,
      color: 'bg-green-500',
      generate: generateEmployeeReport
    },
    {
      id: 'suppliers',
      title: 'Supplier Report',
      description: 'List of all suppliers',
      icon: FileText,
      color: 'bg-orange-500',
      generate: () => suppliers
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const selectedReportData = selectedReport ? reports.find(r => r.id === selectedReport) : null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-600">
          Generate and export various reports from the system
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8">
        {reports.map((report) => (
          <div
            key={report.id}
            className={`bg-white overflow-hidden shadow rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedReport === report.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedReport(selectedReport === report.id ? '' : report.id)}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${report.color} rounded-md p-3`}>
                    <report.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {report.title}
                    </dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {report.description}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedReportData && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {selectedReportData.title}
              </h3>
              <button
                onClick={() => exportToCSV(selectedReportData.generate(), selectedReportData.id)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>

            <div className="overflow-hidden">
              {selectedReport === 'departments' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Employees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active Employees
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generateDepartmentReport().map((dept: any) => (
                      <tr key={dept.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dept.idcode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dept.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dept.employeeCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dept.activeEmployees}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReport === 'jobtitles' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Employees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Active Employees
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generateJobTitleReport().map((job: any) => (
                      <tr key={job.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {job.idcode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.jobname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.employeeCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.activeEmployees}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReport === 'employees' && (
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
                        Work Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generateEmployeeReport().map((emp: any) => (
                      <tr key={emp.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {emp.employeeid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {emp.fname} {emp.mname} {emp.lname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {emp.departmentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {emp.jobTitleName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            emp.empstatus === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {emp.empstatus || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {emp.workemail || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedReport === 'suppliers' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {supplier.idcode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {supplier.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(supplier.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
