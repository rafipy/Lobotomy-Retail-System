import random
from datetime import datetime

from app.database import get_connection
from app.utils.auth import get_password_hash

# ============================================
# CATEGORIES (matching frontend)
# ============================================
# "Abnormalities / E.G.O", "Beverages", "Food", "Safety Equipment",
# "Accessories", "Tools", "Medical", "Documentation", "Services",
# "Electronics", "Miscellaneous"

# ============================================
# SEED PRODUCTS - Lobotomy Corporation Theme
# ============================================
SEED_PRODUCTS = [
    # ==================== Abnormalities / E.G.O ====================
    {
        "name": "Penitence E.G.O Weapon",
        "description": "A whip wrapped in thorns extracted from the abnormality 'One Sin and Hundreds of Good Deeds'. Deals White damage. Handle with prayer.",
        "selling_price": 1899.99,
        "purchase_price": 1100.00,
        "category": "Abnormalities / E.G.O",
    },
    {
        "name": "Mimicry E.G.O Suit",
        "description": "Armor that shifts and changes form. Extracted from 'Nothing There'. Warning: May develop its own personality.",
        "selling_price": 4999.99,
        "purchase_price": 3200.00,
        "category": "Abnormalities / E.G.O",
    },
    {
        "name": "Happy Teddy Bear Hammer",
        "description": "A cheerful hammer from 'Scorched Girl'. Always smiling. Deals Red damage with a chance to burn.",
        "selling_price": 1599.99,
        "purchase_price": 900.00,
        "category": "Abnormalities / E.G.O",
    },
    {
        "name": "Twilight E.G.O Blade",
        "description": "A sword from 'Der Freischütz'. Exists between day and night. 7 bullets remain.",
        "selling_price": 2499.99,
        "purchase_price": 1600.00,
        "category": "Abnormalities / E.G.O",
    },
    {
        "name": "Red Shoes E.G.O Boots",
        "description": "Beautiful crimson dancing shoes. Once worn, they never stop. Speed +50%, Sanity -30%.",
        "selling_price": 899.99,
        "purchase_price": 500.00,
        "category": "Abnormalities / E.G.O",
    },
    {
        "name": "Justitia E.G.O Scales",
        "description": "Balanced scales from 'Justicia'. Weighs sins and virtues equally. Black damage dealer.",
        "selling_price": 3299.99,
        "purchase_price": 2100.00,
        "category": "Abnormalities / E.G.O",
    },
    # ==================== Beverages ====================
    {
        "name": "Enkephalin Energy Drink (12-pack)",
        "description": "L Corp's signature energy boost! Extracted humanely. Tastes like motivation and slight existential dread.",
        "selling_price": 24.99,
        "purchase_price": 12.00,
        "category": "Beverages",
    },
    {
        "name": "Cogito Clarity Coffee",
        "description": "Premium coffee that enhances mental acuity. Warning: May cause philosophical revelations. 1kg bag.",
        "selling_price": 34.99,
        "purchase_price": 15.00,
        "category": "Beverages",
    },
    {
        "name": "Blue Star Soda",
        "description": "Refreshing blue carbonated drink. Inspired by a certain starry abnormality. Non-lethal version.",
        "selling_price": 3.99,
        "purchase_price": 1.50,
        "category": "Beverages",
    },
    {
        "name": "Distilled Nest Water (24-pack)",
        "description": "Pure water from District 12 filtration. Guaranteed 99.9% abnormality-free.",
        "selling_price": 12.99,
        "purchase_price": 5.00,
        "category": "Beverages",
    },
    {
        "name": "Rabbit Team Energy Shot",
        "description": "Quick energy boost favored by the Rabbit Team. Fast-acting. Cherry flavor.",
        "selling_price": 5.99,
        "purchase_price": 2.50,
        "category": "Beverages",
    },
    # ==================== Food ====================
    {
        "name": "Nest Instant Noodles (Box of 24)",
        "description": "Standard employee meal. Chicken flavor. Quick to prepare between containment breaches.",
        "selling_price": 18.99,
        "purchase_price": 8.00,
        "category": "Food",
    },
    {
        "name": "L Corp Nutrition Bar (10-pack)",
        "description": "Complete nutrition in bar form. Tastes like cardboard but keeps you alive. Chocolate flavor.",
        "selling_price": 14.99,
        "purchase_price": 6.00,
        "category": "Food",
    },
    {
        "name": "Wellcheers Snack Pack",
        "description": "Assorted snacks to boost morale. Includes chips, cookies, and hope.",
        "selling_price": 9.99,
        "purchase_price": 4.00,
        "category": "Food",
    },
    {
        "name": "Manager's Premium Lunch Set",
        "description": "Gourmet meal box for Sephirah-level employees. Actually tastes good.",
        "selling_price": 29.99,
        "purchase_price": 15.00,
        "category": "Food",
    },
    {
        "name": "Emergency Rations Crate",
        "description": "Long-lasting survival food. 30-day supply. For when things go really wrong.",
        "selling_price": 89.99,
        "purchase_price": 45.00,
        "category": "Food",
    },
    # ==================== Safety Equipment ====================
    {
        "name": "Standard Containment Suit",
        "description": "Basic protective gear for employees. Offers minimal protection against all damage types.",
        "selling_price": 149.99,
        "purchase_price": 70.00,
        "category": "Safety Equipment",
    },
    {
        "name": "Advanced Hazmat Helmet",
        "description": "Protects against airborne cognitohazards. Required for ZAYIN+ level areas.",
        "selling_price": 199.99,
        "purchase_price": 100.00,
        "category": "Safety Equipment",
    },
    {
        "name": "Rabbit Protocol Gas Mask",
        "description": "Military-grade respiratory protection. Used by Rabbit Team during extractions.",
        "selling_price": 249.99,
        "purchase_price": 130.00,
        "category": "Safety Equipment",
    },
    {
        "name": "Anti-Cogito Earplugs",
        "description": "Blocks auditory cognitohazards. Essential for 'Silent Orchestra' containment duty.",
        "selling_price": 49.99,
        "purchase_price": 20.00,
        "category": "Safety Equipment",
    },
    {
        "name": "Reinforced Steel Boots",
        "description": "Heavy-duty footwear. Protects against physical hazards and small abnormalities.",
        "selling_price": 129.99,
        "purchase_price": 55.00,
        "category": "Safety Equipment",
    },
    # ==================== Accessories ====================
    {
        "name": "Employee ID Badge Holder",
        "description": "Stylish badge holder in L Corp colors. Clip-on design. Don't lose your clearance!",
        "selling_price": 12.99,
        "purchase_price": 4.00,
        "category": "Accessories",
    },
    {
        "name": "Cogito Wristwatch",
        "description": "Tells time and monitors your sanity levels. Alerts when below 30%. Water-resistant.",
        "selling_price": 89.99,
        "purchase_price": 40.00,
        "category": "Accessories",
    },
    {
        "name": "Sephirah Commemorative Pin Set",
        "description": "Collector's set of 10 pins featuring all Sephirah. Limited edition.",
        "selling_price": 34.99,
        "purchase_price": 15.00,
        "category": "Accessories",
    },
    {
        "name": "Lucky Four-Leaf Clover Charm",
        "description": "A small charm said to bring fortune. May or may not be related to a certain rabbit.",
        "selling_price": 19.99,
        "purchase_price": 8.00,
        "category": "Accessories",
    },
    {
        "name": "Department Lanyard Collection",
        "description": "Choose your department! Available in Control, Information, Safety, and more.",
        "selling_price": 7.99,
        "purchase_price": 2.50,
        "category": "Accessories",
    },
    # ==================== Tools ====================
    {
        "name": "Standard Suppression Baton",
        "description": "Basic melee weapon for employee self-defense. Deals Red damage. Extendable.",
        "selling_price": 79.99,
        "purchase_price": 35.00,
        "category": "Tools",
    },
    {
        "name": "Cogito Measurement Device",
        "description": "Portable device for measuring PE Box output. Essential for managers.",
        "selling_price": 299.99,
        "purchase_price": 150.00,
        "category": "Tools",
    },
    {
        "name": "Emergency Containment Kit",
        "description": "Portable kit with restraints, sedatives, and basic containment tools.",
        "selling_price": 199.99,
        "purchase_price": 90.00,
        "category": "Tools",
    },
    {
        "name": "Maintenance Toolkit",
        "description": "Complete toolkit for facility repairs. Includes wrench, screwdrivers, and hope.",
        "selling_price": 59.99,
        "purchase_price": 25.00,
        "category": "Tools",
    },
    {
        "name": "Flashlight (Anti-Dark)",
        "description": "High-powered flashlight. Effective against darkness-based abnormalities.",
        "selling_price": 44.99,
        "purchase_price": 18.00,
        "category": "Tools",
    },
    # ==================== Medical ====================
    {
        "name": "Standard First Aid Kit",
        "description": "Basic medical supplies. Bandages, antiseptic, and minor wound treatment.",
        "selling_price": 29.99,
        "purchase_price": 12.00,
        "category": "Medical",
    },
    {
        "name": "Enkephalin Healing Syringe (5-pack)",
        "description": "Fast-acting healing injection. Restores HP but may cause brief euphoria.",
        "selling_price": 149.99,
        "purchase_price": 70.00,
        "category": "Medical",
    },
    {
        "name": "Sanity Restoration Pills (30-count)",
        "description": "Helps restore mental stability. Take as needed. Do not exceed 5 per day.",
        "selling_price": 89.99,
        "purchase_price": 40.00,
        "category": "Medical",
    },
    {
        "name": "Trauma Recovery Blanket",
        "description": "Weighted blanket infused with calming agents. For post-breach recovery.",
        "selling_price": 69.99,
        "purchase_price": 30.00,
        "category": "Medical",
    },
    {
        "name": "Automated Defibrillator",
        "description": "Portable AED unit. Because accidents happen. A lot.",
        "selling_price": 499.99,
        "purchase_price": 250.00,
        "category": "Medical",
    },
    # ==================== Documentation ====================
    {
        "name": "Abnormality Encyclopedia Vol. 1",
        "description": "Comprehensive guide to ZAYIN and TETH class abnormalities. Required reading.",
        "selling_price": 49.99,
        "purchase_price": 20.00,
        "category": "Documentation",
    },
    {
        "name": "Employee Handbook (Updated Edition)",
        "description": "Complete guide to L Corp policies and survival tips. Now with 50% more warnings.",
        "selling_price": 24.99,
        "purchase_price": 10.00,
        "category": "Documentation",
    },
    {
        "name": "E.G.O Equipment Manual",
        "description": "Technical manual for E.G.O weapon and suit maintenance. Heavily illustrated.",
        "selling_price": 39.99,
        "purchase_price": 15.00,
        "category": "Documentation",
    },
    {
        "name": "Blank Incident Report Forms (100-pack)",
        "description": "Standard forms for documenting containment breaches. You'll need these.",
        "selling_price": 14.99,
        "purchase_price": 5.00,
        "category": "Documentation",
    },
    {
        "name": "Department Safety Poster Set",
        "description": "Motivational posters reminding employees to stay safe. Set of 10.",
        "selling_price": 19.99,
        "purchase_price": 7.00,
        "category": "Documentation",
    },
    # ==================== Services ====================
    {
        "name": "Facility Tour Pass",
        "description": "Guided tour of safe facility areas. Includes complimentary coffee. 2-hour duration.",
        "selling_price": 29.99,
        "purchase_price": 10.00,
        "category": "Services",
    },
    {
        "name": "Employee Training Session",
        "description": "1-on-1 training with experienced staff. Covers basic suppression techniques.",
        "selling_price": 99.99,
        "purchase_price": 40.00,
        "category": "Services",
    },
    {
        "name": "Psychological Evaluation",
        "description": "Mandatory mental health checkup. Includes sanity assessment and counseling.",
        "selling_price": 149.99,
        "purchase_price": 60.00,
        "category": "Services",
    },
    {
        "name": "Equipment Repair Service",
        "description": "Professional repair for damaged E.G.O gear. 24-hour turnaround.",
        "selling_price": 79.99,
        "purchase_price": 30.00,
        "category": "Services",
    },
    {
        "name": "Memorial Service Package",
        "description": "Dignified farewell for fallen colleagues. Includes ceremony and plaque.",
        "selling_price": 199.99,
        "purchase_price": 80.00,
        "category": "Services",
    },
    # ==================== Electronics ====================
    {
        "name": "Cogito Neural Headset",
        "description": "Brain-computer interface for enhanced work efficiency. Minor side effects include headaches.",
        "selling_price": 599.99,
        "purchase_price": 300.00,
        "category": "Electronics",
    },
    {
        "name": "Portable Abnormality Scanner",
        "description": "Handheld device that detects nearby abnormality activity. Beeps when danger is close.",
        "selling_price": 449.99,
        "purchase_price": 220.00,
        "category": "Electronics",
    },
    {
        "name": "Emergency Radio Communicator",
        "description": "Long-range radio for facility-wide communication. Battery lasts 72 hours.",
        "selling_price": 129.99,
        "purchase_price": 55.00,
        "category": "Electronics",
    },
    {
        "name": "Personal Data Tablet",
        "description": "Tablet preloaded with employee apps and abnormality database access.",
        "selling_price": 349.99,
        "purchase_price": 170.00,
        "category": "Electronics",
    },
    {
        "name": "Security Camera (Self-Install Kit)",
        "description": "Wireless camera for monitoring. Includes night vision. Easy installation.",
        "selling_price": 89.99,
        "purchase_price": 40.00,
        "category": "Electronics",
    },
    # ==================== Miscellaneous ====================
    {
        "name": "L Corp Branded Mug",
        "description": "Ceramic mug with L Corp logo. 'A Well-Managed Day Starts with Coffee'",
        "selling_price": 14.99,
        "purchase_price": 5.00,
        "category": "Miscellaneous",
    },
    {
        "name": "Desk Plant (Fake)",
        "description": "Plastic plant for your workspace. Real plants don't survive here.",
        "selling_price": 9.99,
        "purchase_price": 3.00,
        "category": "Miscellaneous",
    },
    {
        "name": "Stress Ball (Slime Shape)",
        "description": "Squeezable stress relief in the shape of a friendly slime abnormality.",
        "selling_price": 7.99,
        "purchase_price": 2.50,
        "category": "Miscellaneous",
    },
    {
        "name": "Employee of the Month Frame",
        "description": "Display frame for your achievements. Fits standard photo size.",
        "selling_price": 19.99,
        "purchase_price": 7.00,
        "category": "Miscellaneous",
    },
    {
        "name": "Motivational Calendar 2024",
        "description": "Daily inspirational quotes from Angela and the Sephirah. Desk calendar.",
        "selling_price": 12.99,
        "purchase_price": 4.00,
        "category": "Miscellaneous",
    },
]


def seed_products():
    """Seed the database with Lobotomy Corporation themed products"""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Check if products already exist
        cursor.execute("SELECT COUNT(*) as count FROM products")
        result = cursor.fetchone()
        if result and result["count"] > 0:
            print(f"Products already seeded ({result['count']} products exist)")
            return {
                "message": f"Products already seeded ({result['count']} products exist)"
            }

        # Get supplier IDs (we need at least one supplier)
        cursor.execute("SELECT id FROM suppliers LIMIT 10")
        suppliers = cursor.fetchall()

        if not suppliers:
            print("No suppliers found! Please seed suppliers first.")
            return {"error": "No suppliers found. Run seed_suppliers first."}

        supplier_ids = [s["id"] for s in suppliers]
        now = datetime.now()

        # Insert products
        for product in SEED_PRODUCTS:
            # Randomly assign a supplier
            supplier_id = random.choice(supplier_ids)
            # Random stock between 0 and 200
            stock = random.randint(0, 200)
            # Random reorder level between 20 and 80
            reorder_level = random.randint(20, 80)
            # Random reorder amount between 50 and 150
            reorder_amount = random.randint(50, 150)

            cursor.execute(
                """
                INSERT INTO products
                (name, description, selling_price, purchase_price, supplier_id,
                 stock, reorder_level, reorder_amount, category, image_url, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    product["name"],
                    product["description"],
                    product["selling_price"],
                    product["purchase_price"],
                    supplier_id,
                    stock,
                    reorder_level,
                    reorder_amount,
                    product["category"],
                    product.get("image_url"),
                    now,
                    now,
                ),
            )

        conn.commit()
        print(f"Successfully seeded {len(SEED_PRODUCTS)} products!")
        return {"message": f"Successfully seeded {len(SEED_PRODUCTS)} products"}

    except Exception as e:
        conn.rollback()
        print(f"Error seeding products: {e}")
        return {"error": str(e)}
    finally:
        cursor.close()
        conn.close()


def seed_test_user():
    """Seed a test admin user"""
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Check if admin already exists
        cursor.execute("SELECT id FROM users WHERE username = 'admin'")
        if cursor.fetchone():
            print("Admin user already exists")
            return {"message": "Admin user already exists"}

        password_hash = get_password_hash("admin123")
        cursor.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s)",
            ("admin", password_hash, "admin"),
        )
        conn.commit()
        print("Successfully created admin user (username: admin, password: admin123)")
        return {"message": "Admin user created"}

    except Exception as e:
        conn.rollback()
        print(f"Error creating admin user: {e}")
        return {"error": str(e)}
    finally:
        cursor.close()
        conn.close()


def seed_all():
    """Seed everything"""
    print("=" * 50)
    print("Seeding test data...")
    print("=" * 50)

    print("\n1. Creating admin user...")
    seed_test_user()

    print("\n2. Seeding products...")
    seed_products()

    print("\n" + "=" * 50)
    print("Seeding complete!")
    print("=" * 50)


if __name__ == "__main__":
    seed_all()
