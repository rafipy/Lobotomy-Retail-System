from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])

# Dummy data to seed the database
SEED_PRODUCTS = [
    {
        "name": "L. CORP Energy Drink",
        "description": "Official L. CORP branded energy drink. Side effects may include: enhanced productivity, mild paranoia.",
        "selling_price": 4.99,
        "purchase_price": 2.50,
        "supplier_name": "K Corp Beverages",
        "stock": 247,
        "category": "Beverages",
    },
    {
        "name": "Emergency Ration Pack",
        "description": "Standard issue rations for extended shifts. Nutritionally complete. Taste not guaranteed.",
        "selling_price": 12.99,
        "purchase_price": 7.25,
        "supplier_name": "W Corp Supplies",
        "stock": 156,
        "category": "Food",
    },
    {
        "name": "L. CORP Safety Helmet",
        "description": "Regulation safety equipment. Protects against falling objects and minor anomalies.",
        "selling_price": 45.00,
        "purchase_price": 28.00,
        "supplier_name": "R Corp Equipment",
        "stock": 89,
        "category": "Safety Equipment",
    },
    {
        "name": "Employee ID Badge",
        "description": "Official identification badge. Required for all facility access. Do not lose.",
        "selling_price": 5.00,
        "purchase_price": 1.50,
        "supplier_name": "L. CORP Internal",
        "stock": 342,
        "category": "Accessories",
    },
    {
        "name": "Flashlight (Heavy Duty)",
        "description": "Industrial-grade flashlight. Essential for navigating dark sectors. Battery life: 72 hours.",
        "selling_price": 29.99,
        "purchase_price": 15.00,
        "supplier_name": "N Corp Tools",
        "stock": 23,
        "category": "Tools",
    },
    {
        "name": "First Aid Kit",
        "description": "Comprehensive medical supplies. For minor injuries only. Major injuries require medical bay.",
        "selling_price": 34.50,
        "purchase_price": 18.75,
        "supplier_name": "T Corp Medical",
        "stock": 67,
        "category": "Medical",
    },
    {
        "name": "Maintenance Manual",
        "description": "Complete maintenance procedures. Updated quarterly. Read before operating equipment.",
        "selling_price": 19.99,
        "purchase_price": 8.00,
        "supplier_name": "L. CORP Publishing",
        "stock": 12,
        "category": "Documentation",
    },
    {
        "name": "Coffee (Premium Blend)",
        "description": "High-quality coffee beans. Sourced from K Corp. Keeps you alert during night shifts.",
        "selling_price": 15.99,
        "purchase_price": 9.50,
        "supplier_name": "K Corp Beverages",
        "stock": 198,
        "category": "Beverages",
    },
]


@router.get("/", response_model=List[ProductResponse])
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/seed")
def seed_products(db: Session = Depends(get_db)):
    """Seed the database with dummy products (for development only)"""
    existing = db.query(Product).first()
    if existing:
        return {"message": "Products already seeded"}

    for product_data in SEED_PRODUCTS:
        product = Product(**product_data)
        db.add(product)

    db.commit()
    return {"message": f"Seeded {len(SEED_PRODUCTS)} products"}
