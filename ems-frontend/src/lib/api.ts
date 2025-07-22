const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Department {
  id: number;
  idcode: string;
  name: string;
  created_at: string;
}

export interface JobTitle {
  id: number;
  idcode: string;
  jobname: string;
  created_at: string;
}

export interface Supplier {
  id: number;
  idcode: string;
  name: string;
  created_at: string;
}

export interface Employee {
  id: number;
  employeeid: string;
  fname: string;
  mname?: string;
  lname: string;
  birthdate?: string;
  sex?: string;
  workphone?: string;
  workextn?: string;
  workemail?: string;
  homeemail?: string;
  homephone?: string;
  mobile?: string;
  ssn?: string;
  emptype?: number;
  empyear?: number;
  empmonth?: number;
  empstatus?: string;
  jobtitle?: string;
  department?: string;
  homeaddres?: string;
  empstartdt?: string;
  empleavedt?: string;
  membership?: string;
  created_at: string;
  updated_at: string;
  department_rel?: Department;
  jobtitle_rel?: JobTitle;
}

export interface EmployeeSearch {
  search_term?: string;
  department?: string;
  jobtitle?: string;
  empstatus?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getDepartments(): Promise<Department[]> {
    return this.request<Department[]>('/departments/');
  }

  async createDepartment(department: Omit<Department, 'id' | 'created_at'>): Promise<Department> {
    return this.request<Department>('/departments/', {
      method: 'POST',
      body: JSON.stringify(department),
    });
  }

  async updateDepartment(id: number, department: Partial<Omit<Department, 'id' | 'created_at'>>): Promise<Department> {
    return this.request<Department>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(department),
    });
  }

  async deleteDepartment(id: number): Promise<void> {
    await this.request(`/departments/${id}`, {
      method: 'DELETE',
    });
  }

  async getJobTitles(): Promise<JobTitle[]> {
    return this.request<JobTitle[]>('/job-titles/');
  }

  async createJobTitle(jobTitle: Omit<JobTitle, 'id' | 'created_at'>): Promise<JobTitle> {
    return this.request<JobTitle>('/job-titles/', {
      method: 'POST',
      body: JSON.stringify(jobTitle),
    });
  }

  async updateJobTitle(id: number, jobTitle: Partial<Omit<JobTitle, 'id' | 'created_at'>>): Promise<JobTitle> {
    return this.request<JobTitle>(`/job-titles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobTitle),
    });
  }

  async deleteJobTitle(id: number): Promise<void> {
    await this.request(`/job-titles/${id}`, {
      method: 'DELETE',
    });
  }

  async getSuppliers(): Promise<Supplier[]> {
    return this.request<Supplier[]>('/suppliers/');
  }

  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> {
    return this.request<Supplier>('/suppliers/', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
  }

  async updateSupplier(id: number, supplier: Partial<Omit<Supplier, 'id' | 'created_at'>>): Promise<Supplier> {
    return this.request<Supplier>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    });
  }

  async deleteSupplier(id: number): Promise<void> {
    await this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  async getEmployees(): Promise<Employee[]> {
    return this.request<Employee[]>('/employees/');
  }

  async searchEmployees(search: EmployeeSearch): Promise<Employee[]> {
    return this.request<Employee[]>('/employees/search', {
      method: 'POST',
      body: JSON.stringify(search),
    });
  }

  async createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'department_rel' | 'jobtitle_rel'>): Promise<Employee> {
    return this.request<Employee>('/employees/', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  async updateEmployee(id: number, employee: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'department_rel' | 'jobtitle_rel'>>): Promise<Employee> {
    return this.request<Employee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
  }

  async deleteEmployee(id: number): Promise<void> {
    await this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
