<p align="center">
  <img src="https://static.wikitide.net/projectmoonwiki/thumb/9/90/Lobotomy-Logo.webp/744px-Lobotomy-Logo.webp.png?20250327174408" alt="Lobotomy Corporation" width="280"/>
</p>

<h1 align="center">LOBOTOMY RETAIL SYSTEM</h1>

<h3 align="center"><em>Face the Items. Build the Shopping Cart.</em></h3>

<p align="center">
  <img src="https://static.wikia.nocookie.net/lobotomycorp/images/1/11/AngelaFullBody.png" alt="Angela" width="120"/>
</p>

<p align="center">
  <em>"I am Angela, an AI. I am your assistant, your secretary, and someone to whom you can talk.<br/>I hope I can help make your time here a little more comfortable."</em>
</p>

---

## 📋 Facility Overview

<img align="right" src="https://static.wikia.nocookie.net/lobotomycorp/images/3/3a/Neutral.PNG" width="100"/>

> *"This system has been designed to manage our retail operations efficiently. It handles inventory, employees, suppliers, customers, orders, and payments—everything a well-run corporation requires."*

| Module | Technology | Purpose |
|--------|------------|---------|
| **Control Room** | Next.js 16 | Frontend Interface |
| **Central Command** | FastAPI | Backend API |
| **Records** | MySQL | Database |

---

## ⚠️ Prerequisites

<img align="right" src="https://static.wikia.nocookie.net/lobotomycorp/images/c/c5/EyesFrown.PNG" width="100"/>

> *"Before we begin, ensure these requirements are met. Failure to comply may result in... unforeseen consequences."*

- **Python 3.13+**
- **Node.js 18+**
- **MySQL 8.0+** — You must have a MySQL server running
- **uv** (Python package manager)

> ⚠️ **Database Notice:** This system requires a running MySQL instance. You are responsible for setting up and configuring your own MySQL server before proceeding.

---

## 🔐 Environment Configuration

<img align="right" src="https://static.wikia.nocookie.net/lobotomycorp/images/b/b5/Worried.PNG" width="100"/>

> *"Sensitive data must be properly secured. Configure your environment before initialization."*

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=mysql+pymysql://your_user:your_password@localhost:3306/retail
SECRET_KEY=your_secret_key_here
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `SECRET_KEY` | JWT secret for authentication |

---

## ⚙️ Initialization Sequence

<img align="right" src="https://static.wikia.nocookie.net/lobotomycorp/images/0/02/Smiling.PNG" width="100"/>

> *"Please follow these steps precisely. Deviations may result in... complications."*

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd lobotomy-retail-system
```

### Step 2: Backend Setup
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Step 4: Access the System
| Interface | URL |
|-----------|-----|
| Frontend | `http://localhost:3000` |
| Admin Panel | `http://localhost:3000/admin` |
| API Docs | `http://localhost:8000/docs` |

### RECOMMENDED Step 1: Use DOCKER*
```bash
git clone <repository-url>
cd lobotomy-retail-system
docker-compose up --build
```
<sub>* Insure docker is downloaded and running in the system</sub>

---

## 📁 Facility Structure

```
lobotomy-retail-system/
├── frontend/                    # Control Room Interface
│   ├── app/
│   │   ├── admin/               # Admin pages (dashboard, inventory, orders, etc.)
│   │   ├── components/
│   │   │   ├── layout/          # Header, Sidebar components
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   ├── inventory/       # Inventory management
│   │   │   ├── orders/          # Order management
│   │   │   ├── settings/        # Settings components
│   │   │   └── form/            # Login & form components
│   │   └── globals.css
│   ├── components/ui/           # Shadcn UI components
│   └── lib/                     # Utilities & auth helpers
│
└── backend/                     # Central Command API
    └── app/
        ├── main.py              # FastAPI application entry
        ├── database.py          # Database connection
        ├── create_tables.sql    # Database schema
        ├── seed.py              # Initial data seeding
        ├── models/              # Enums & data models
        ├── routers/             # API route handlers
        │   ├── auth.py
        │   ├── products.py
        │   ├── customers.py
        │   ├── employees.py
        │   ├── supplier.py
        │   ├── supplier_orders.py
        │   ├── customer_orders.py
        │   ├── payments.py
        │   └── users.py
        └── utils/               # Auth & helper utilities
```

---

## 🔴 Important Notices

> *"For your safety and the safety of others, please observe the following protocols:"*

- **Always** log out when leaving your workstation
- **Never** share your credentials with unauthorized personnel  
- **Report** any anomalous system behavior immediately
- **Remember:** A well-managed day starts with proper procedure

---

<p align="center">
  <img src="https://static.wikia.nocookie.net/lobotomycorp/images/3/3a/Neutral.PNG" width="80"/>
</p>

<p align="center">
  <em>"That concludes the orientation. Should you require further assistance, you know where to find me.<br/>Good luck, Manager. You'll need it."</em>
</p>

---

<p align="center">
  <sub>© L Corporation — "Face the fear. Build the future"</sub>
</p>
