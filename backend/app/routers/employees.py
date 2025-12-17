from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/user/{user_id}")
def get_employee_by_user_id(user_id: int, db=Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT e.id, e.user_id, u.username
        FROM employees e
        JOIN users u ON e.user_id = u.id
        WHERE e.user_id = %s
        """,
        (user_id,),
    )
    employee = cursor.fetchone()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {
        "id": employee["id"],
        "user_id": employee["user_id"],
        "username": employee["username"],
    }


@router.get("/", response_model=List[dict])
def get_all_employees(db=Depends(get_db)):
    cursor = db["cursor"]
    cursor.execute(
        """
        SELECT e.id, e.user_id, u.username
        FROM employees e
        JOIN users u ON e.user_id = u.id
        ORDER BY e.id
        """
    )
    employees = cursor.fetchall()
    return [
        {
            "id": e["id"],
            "user_id": e["user_id"],
            "username": e["username"],
        }
        for e in employees
    ]
