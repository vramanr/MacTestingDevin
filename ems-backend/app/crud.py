from sqlalchemy.orm import Session
from sqlalchemy import or_
from . import models, schemas
from typing import List, Optional

def get_departments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Department).offset(skip).limit(limit).all()

def get_department(db: Session, department_id: int):
    return db.query(models.Department).filter(models.Department.id == department_id).first()

def get_department_by_idcode(db: Session, idcode: str):
    return db.query(models.Department).filter(models.Department.idcode == idcode).first()

def create_department(db: Session, department: schemas.DepartmentCreate):
    db_department = models.Department(**department.dict())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

def update_department(db: Session, department_id: int, department: schemas.DepartmentUpdate):
    db_department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if db_department:
        for key, value in department.dict(exclude_unset=True).items():
            setattr(db_department, key, value)
        db.commit()
        db.refresh(db_department)
    return db_department

def delete_department(db: Session, department_id: int):
    db_department = db.query(models.Department).filter(models.Department.id == department_id).first()
    if db_department:
        db.delete(db_department)
        db.commit()
    return db_department

def get_job_titles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.JobTitle).offset(skip).limit(limit).all()

def get_job_title(db: Session, job_title_id: int):
    return db.query(models.JobTitle).filter(models.JobTitle.id == job_title_id).first()

def get_job_title_by_idcode(db: Session, idcode: str):
    return db.query(models.JobTitle).filter(models.JobTitle.idcode == idcode).first()

def create_job_title(db: Session, job_title: schemas.JobTitleCreate):
    db_job_title = models.JobTitle(**job_title.dict())
    db.add(db_job_title)
    db.commit()
    db.refresh(db_job_title)
    return db_job_title

def update_job_title(db: Session, job_title_id: int, job_title: schemas.JobTitleUpdate):
    db_job_title = db.query(models.JobTitle).filter(models.JobTitle.id == job_title_id).first()
    if db_job_title:
        for key, value in job_title.dict(exclude_unset=True).items():
            setattr(db_job_title, key, value)
        db.commit()
        db.refresh(db_job_title)
    return db_job_title

def delete_job_title(db: Session, job_title_id: int):
    db_job_title = db.query(models.JobTitle).filter(models.JobTitle.id == job_title_id).first()
    if db_job_title:
        db.delete(db_job_title)
        db.commit()
    return db_job_title

def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Supplier).offset(skip).limit(limit).all()

def get_supplier(db: Session, supplier_id: int):
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()

def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    db_supplier = models.Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

def update_supplier(db: Session, supplier_id: int, supplier: schemas.SupplierUpdate):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier:
        for key, value in supplier.dict(exclude_unset=True).items():
            setattr(db_supplier, key, value)
        db.commit()
        db.refresh(db_supplier)
    return db_supplier

def delete_supplier(db: Session, supplier_id: int):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier:
        db.delete(db_supplier)
        db.commit()
    return db_supplier

def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Employee).offset(skip).limit(limit).all()

def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()

def get_employee_by_employeeid(db: Session, employeeid: str):
    return db.query(models.Employee).filter(models.Employee.employeeid == employeeid).first()

def search_employees(db: Session, search: schemas.EmployeeSearch, skip: int = 0, limit: int = 100):
    query = db.query(models.Employee)
    
    if search.search_term:
        query = query.filter(
            or_(
                models.Employee.fname.contains(search.search_term),
                models.Employee.lname.contains(search.search_term),
                models.Employee.employeeid.contains(search.search_term),
                models.Employee.ssn.contains(search.search_term)
            )
        )
    
    if search.department:
        query = query.filter(models.Employee.department == search.department)
    
    if search.jobtitle:
        query = query.filter(models.Employee.jobtitle == search.jobtitle)
    
    if search.empstatus:
        query = query.filter(models.Employee.empstatus == search.empstatus)
    
    return query.offset(skip).limit(limit).all()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, employee_id: int, employee: schemas.EmployeeUpdate):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if db_employee:
        for key, value in employee.dict(exclude_unset=True).items():
            setattr(db_employee, key, value)
        db.commit()
        db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: int):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if db_employee:
        db.delete(db_employee)
        db.commit()
    return db_employee
