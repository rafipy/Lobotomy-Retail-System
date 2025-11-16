from app.database import get_db
from app.models.user import User, UserRole
from app.utils.auth import require_role
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard")
def get_admin_dashboard(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_admins = db.query(User).filter(User.role == UserRole.ADMIN).count()
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()

    return {
        "message": f"Welcome to admin dashboard, {current_user.username}",
        "stats": {
            "total_users": total_users,
            "admins": total_admins,
            "customers": total_customers,
        },
    }
