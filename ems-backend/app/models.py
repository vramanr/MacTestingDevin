from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    idcode = Column(String(4), unique=True, index=True, nullable=False)
    name = Column(String(50), nullable=False)
    short_name = Column(String(20))
    division = Column(String(50))
    location = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employees = relationship("Employee", back_populates="department_rel")

class JobTitle(Base):
    __tablename__ = "job_titles"
    
    id = Column(Integer, primary_key=True, index=True)
    idcode = Column(String(4), unique=True, index=True, nullable=False)
    jobname = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employees = relationship("Employee", back_populates="jobtitle_rel")

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    idcode = Column(String(4), unique=True, index=True, nullable=False)
    name = Column(String(50), nullable=False)
    address = Column(Text)
    telephone_no = Column(String(20))
    fax_no = Column(String(20))
    email = Column(String(100))
    tin_no = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    employeeid = Column(String(10), unique=True, index=True, nullable=False)
    fname = Column(String(50), nullable=False)
    mname = Column(String(50))
    lname = Column(String(50), nullable=False)
    birthdate = Column(Date)
    sex = Column(String(1))
    workphone = Column(String(15))
    workextn = Column(String(10))
    workemail = Column(String(50))
    homeemail = Column(String(50))
    homephone = Column(String(15))
    mobile = Column(String(15))
    ssn = Column(String(11), unique=True, index=True, nullable=True)
    emptype = Column(Integer)
    empyear = Column(Integer)
    empmonth = Column(Integer)
    empstatus = Column(String(10))
    jobtitle = Column(String(4), ForeignKey("job_titles.idcode"))
    department = Column(String(4), ForeignKey("departments.idcode"))
    homeaddres = Column(Text)
    empstartdt = Column(Date)
    empleavedt = Column(Date)
    membership = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    department_rel = relationship("Department", back_populates="employees")
    jobtitle_rel = relationship("JobTitle", back_populates="employees")
