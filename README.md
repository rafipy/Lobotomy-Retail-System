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

> *"This system has been designed to manage our retail operations efficiently. It handles inventory, employees, suppliers, and transactions—everything a well-run corporation requires."*

| Module | Technology | Purpose |
|--------|------------|---------|
| **Control Room** | Next.js | Frontend Interface |
| **Central Command** | FastAPI | Backend API |
| **Records** | MySQL | Database |

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
cp .env.example .env
uv run uvicorn app.main:app --reload
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Step 4: Access the System
- **Frontend:** `http://localhost:3000`
- **API Docs:** `http://localhost:8000/docs`

---

### ALTERNATIVE Step 1: Use Docker
```bash
// Insure Docker is online.
git clone <repository-url>
cd lobotomy-retail-system
docker-compose up --build
```

## 🔐 Environment Configuration

<img align="right" src="https://static.wikia.nocookie.net/lobotomycorp/images/b/b5/Worried.PNG" width="100"/>

> *"Sensitive data must be properly secured. Create a `.env` file in the backend directory."*

```env
DATABASE_HOST=localhost
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=lobotomy_retail
SECRET_KEY=your_secret_key
```

---

## ⚠️ Important Notices

<img align="right" src="https://static.wikia.nocookie.net/lobotomycorp/images/c/c5/EyesFrown.PNG" width="100"/>

> *"For your safety and the safety of others, please observe the following protocols:"*

- 🔴 **Always** log out when leaving your workstation
- 🔴 **Never** share your credentials with unauthorized personnel  
- 🔴 **Report** any anomalous system behavior immediately

---

## 📁 Facility Structure

```
lobotomy-retail-system/
├── frontend/          # Control Room Interface
│   ├── app/           # Next.js App Router
│   └── components/    # UI Components
└── backend/           # Central Command API
    ├── app/           # FastAPI Application
    └── routes/        # API Endpoints
```

---

<p align="center">
  <img src="https://static.wikia.nocookie.net/lobotomycorp/images/3/3a/Neutral.PNG" width="80"/>
</p>

<p align="center">
  <em>"That concludes the orientation. Should you require further assistance, you know where to find me.<br/>Good luck, Manager. You'll need it."</em>
</p>

---

<p align="center">
  <sub>© L Corporation — "Face the items. Build the future."</sub>
</p>
