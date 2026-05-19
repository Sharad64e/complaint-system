# ⚖️ CivilResolve – AI-Driven Complaint Management System

A full-stack MERN application for registering, tracking, and resolving public complaints with AI-powered prioritization and automated department routing.

## 🚀 Live URLs (fill after deployment)
- **Frontend:** `https://complaint-system-frontend.onrender.com`
- **Backend API:** `https://complaint-system-backend.onrender.com`

## 🗂️ Project Structure

```
complaint-system/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js       # JWT login/register
│   │   ├── complaint.controller.js  # CRUD + search
│   │   └── ai.controller.js         # OpenRouter AI integration
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT protection
│   │   └── validation.middleware.js  # express-validator
│   ├── models/
│   │   ├── User.model.js             # User + bcrypt
│   │   └── Complaint.model.js        # Full complaint schema
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── complaint.routes.js
│   │   └── ai.routes.js
│   ├── .env                          # Environment variables
│   ├── server.js                     # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── context/
│   │   │   └── AuthContext.js        # Global auth state
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── SubmitComplaint.js    # Complaint form + AI preview
│   │   │   ├── ComplaintList.js      # Filters + search
│   │   │   ├── ComplaintDetail.js    # Detail + status update + AI
│   │   │   └── Dashboard.js          # Admin panel
│   │   ├── utils/
│   │   │   └── api.js                # Axios + interceptors
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
├── render.yaml
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/auth/me` | Get current user (protected) |

### Complaints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/complaints` | Add complaint |
| GET | `/api/complaints` | Get all (with pagination + filters) |
| GET | `/api/complaints/:id` | Get single complaint |
| PUT | `/api/complaints/:id` | Update status (protected) |
| DELETE | `/api/complaints/:id` | Delete (admin) |
| GET | `/api/complaints/search?location=Ghaziabad` | Search by location |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/analyze` | Analyze complaint (urgency, dept, summary, response) |

## ⚙️ Setup & Run

### Backend
```bash
cd backend
npm install
# Edit .env with your MONGO_URI and OPENROUTER_API_KEY
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔑 Environment Variables

**Backend `.env`:**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🤖 AI Features (OpenRouter)
- **Urgency Detection**: Low / Medium / High / Critical
- **Department Routing**: Water Dept, Electricity Board, PWD, etc.
- **Complaint Summary**: One-line AI-generated summary
- **Auto Response**: Professional reply to complainant

## 🔒 Security
- JWT authentication with 7-day expiry
- bcrypt password hashing (10 salt rounds)
- Protected routes on both frontend and backend
- Input validation via express-validator

## 🚀 Deployment (Render)
1. Push to GitHub
2. Connect repo on [render.com](https://render.com)
3. Use `render.yaml` for auto-configuration
4. Set environment variables in Render dashboard
5. Deploy!

## 👨‍💻 Tech Stack
- **Frontend**: React 18, React Router v6, Axios, React Toastify
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB Atlas
- **AI**: OpenRouter API (GPT-3.5-turbo)
- **Auth**: JWT + bcryptjs
- **Deployment**: Render
