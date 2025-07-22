from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import psycopg

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Employee Management System API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/departments/", response_model=List[schemas.Department])
def read_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    departments = crud.get_departments(db, skip=skip, limit=limit)
    return departments

@app.post("/departments/", response_model=schemas.Department)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    db_department = crud.get_department_by_idcode(db, idcode=department.idcode)
    if db_department:
        raise HTTPException(status_code=400, detail="Department with this ID code already exists")
    return crud.create_department(db=db, department=department)

@app.get("/departments/{department_id}", response_model=schemas.Department)
def read_department(department_id: int, db: Session = Depends(get_db)):
    db_department = crud.get_department(db, department_id=department_id)
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return db_department

@app.put("/departments/{department_id}", response_model=schemas.Department)
def update_department(department_id: int, department: schemas.DepartmentUpdate, db: Session = Depends(get_db)):
    db_department = crud.update_department(db, department_id=department_id, department=department)
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return db_department

@app.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):
    db_department = crud.delete_department(db, department_id=department_id)
    if db_department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department deleted successfully"}

@app.get("/job-titles/", response_model=List[schemas.JobTitle])
def read_job_titles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    job_titles = crud.get_job_titles(db, skip=skip, limit=limit)
    return job_titles

@app.post("/job-titles/", response_model=schemas.JobTitle)
def create_job_title(job_title: schemas.JobTitleCreate, db: Session = Depends(get_db)):
    db_job_title = crud.get_job_title_by_idcode(db, idcode=job_title.idcode)
    if db_job_title:
        raise HTTPException(status_code=400, detail="Job title with this ID code already exists")
    return crud.create_job_title(db=db, job_title=job_title)

@app.get("/job-titles/{job_title_id}", response_model=schemas.JobTitle)
def read_job_title(job_title_id: int, db: Session = Depends(get_db)):
    db_job_title = crud.get_job_title(db, job_title_id=job_title_id)
    if db_job_title is None:
        raise HTTPException(status_code=404, detail="Job title not found")
    return db_job_title

@app.put("/job-titles/{job_title_id}", response_model=schemas.JobTitle)
def update_job_title(job_title_id: int, job_title: schemas.JobTitleUpdate, db: Session = Depends(get_db)):
    db_job_title = crud.update_job_title(db, job_title_id=job_title_id, job_title=job_title)
    if db_job_title is None:
        raise HTTPException(status_code=404, detail="Job title not found")
    return db_job_title

@app.delete("/job-titles/{job_title_id}")
def delete_job_title(job_title_id: int, db: Session = Depends(get_db)):
    db_job_title = crud.delete_job_title(db, job_title_id=job_title_id)
    if db_job_title is None:
        raise HTTPException(status_code=404, detail="Job title not found")
    return {"message": "Job title deleted successfully"}

@app.get("/suppliers/", response_model=List[schemas.Supplier])
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    suppliers = crud.get_suppliers(db, skip=skip, limit=limit)
    return suppliers

@app.post("/suppliers/", response_model=schemas.Supplier)
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    return crud.create_supplier(db=db, supplier=supplier)

@app.get("/suppliers/{supplier_id}", response_model=schemas.Supplier)
def read_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = crud.get_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier

@app.put("/suppliers/{supplier_id}", response_model=schemas.Supplier)
def update_supplier(supplier_id: int, supplier: schemas.SupplierUpdate, db: Session = Depends(get_db)):
    db_supplier = crud.update_supplier(db, supplier_id=supplier_id, supplier=supplier)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return db_supplier

@app.delete("/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = crud.delete_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted successfully"}

@app.get("/employees/", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = crud.get_employees(db, skip=skip, limit=limit)
    return employees

@app.post("/employees/search", response_model=List[schemas.Employee])
def search_employees(search: schemas.EmployeeSearch, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = crud.search_employees(db, search=search, skip=skip, limit=limit)
    return employees

@app.post("/employees/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = crud.get_employee_by_employeeid(db, employeeid=employee.employeeid)
    if db_employee:
        raise HTTPException(status_code=400, detail="Employee with this ID already exists")
    return crud.create_employee(db=db, employee=employee)

@app.get("/employees/{employee_id}", response_model=schemas.Employee)
def read_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = crud.get_employee(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return db_employee

@app.put("/employees/{employee_id}", response_model=schemas.Employee)
def update_employee(employee_id: int, employee: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    db_employee = crud.update_employee(db, employee_id=employee_id, employee=employee)
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return db_employee

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = crud.delete_employee(db, employee_id=employee_id)
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted successfully"}
