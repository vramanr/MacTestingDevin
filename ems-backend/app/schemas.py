from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class DepartmentBase(BaseModel):
    idcode: str
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None

class Department(DepartmentBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class JobTitleBase(BaseModel):
    idcode: str
    jobname: str

class JobTitleCreate(JobTitleBase):
    pass

class JobTitleUpdate(BaseModel):
    jobname: Optional[str] = None

class JobTitle(JobTitleBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    idcode: str
    name: str

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None

class Supplier(SupplierBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    employeeid: str
    fname: str
    mname: Optional[str] = None
    lname: str
    birthdate: Optional[date] = None
    sex: Optional[str] = None
    workphone: Optional[str] = None
    workextn: Optional[str] = None
    workemail: Optional[str] = None
    homeemail: Optional[str] = None
    homephone: Optional[str] = None
    mobile: Optional[str] = None
    ssn: Optional[str] = None
    emptype: Optional[int] = None
    empyear: Optional[int] = None
    empmonth: Optional[int] = None
    empstatus: Optional[str] = None
    jobtitle: Optional[str] = None
    department: Optional[str] = None
    homeaddres: Optional[str] = None
    empstartdt: Optional[date] = None
    empleavedt: Optional[date] = None
    membership: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    fname: Optional[str] = None
    mname: Optional[str] = None
    lname: Optional[str] = None
    birthdate: Optional[date] = None
    sex: Optional[str] = None
    workphone: Optional[str] = None
    workextn: Optional[str] = None
    workemail: Optional[str] = None
    homeemail: Optional[str] = None
    homephone: Optional[str] = None
    mobile: Optional[str] = None
    ssn: Optional[str] = None
    emptype: Optional[int] = None
    empyear: Optional[int] = None
    empmonth: Optional[int] = None
    empstatus: Optional[str] = None
    jobtitle: Optional[str] = None
    department: Optional[str] = None
    homeaddres: Optional[str] = None
    empstartdt: Optional[date] = None
    empleavedt: Optional[date] = None
    membership: Optional[str] = None

class Employee(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    department_rel: Optional[Department] = None
    jobtitle_rel: Optional[JobTitle] = None
    
    class Config:
        from_attributes = True

class EmployeeSearch(BaseModel):
    search_term: Optional[str] = None
    department: Optional[str] = None
    jobtitle: Optional[str] = None
    empstatus: Optional[str] = None
