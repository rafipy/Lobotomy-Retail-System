from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.database import Base, engine
from app.models import Customer, Product, Supplier, User
from app.routers import auth, products, supplier, supplier_orders

load_dotenv()

app = FastAPI(title="Retail DBMS API")

Base.metadata.create_all(bind=engine)

try:
    from app.seed import seed_database

    seed_database()
except ImportError:
    print("No seed file found, skipping database seeding")


# Custom exception handler for Pydantic validation errors
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    errors = exc.errors()
    if errors:
        first_error = errors[0]
        message = first_error.get("msg", "Validation error")
        return JSONResponse(status_code=400, content={"detail": message})
    return JSONResponse(status_code=400, content={"detail": "Validation error"})


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(supplier.router)
app.include_router(supplier_orders.router)


@app.get("/")
def read_root():
    return {"message": "Retail DBMS API is running"}
