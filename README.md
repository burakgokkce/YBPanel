# YB Digital Panel

A comprehensive full-stack internal management panel built with Next.js 15, TypeScript, TailwindCSS, Express.js, and MongoDB.

## 🚀 Features

### Authentication System
- **Admin Access**: Master password authentication (`YB150924`)
- **Member System**: Registration, login with email/password
- **JWT-based Sessions**: Secure token-based authentication
- **Role-based Access Control**: Separate admin and member dashboards

### Admin Dashboard
- **Member Management**: Add, edit, delete, and manage team members
- **Announcements**: Create and manage company-wide announcements
- **Task Assignment**: Assign tasks to individuals or teams
- **Meeting Scheduling**: Schedule and manage team meetings
- **Analytics**: Dashboard with stats and recent activities
- **Search & Filtering**: Advanced filtering for members and tasks

### Member Dashboard
- **Personal Profile**: View and edit personal information
- **Task Management**: View assigned tasks and update status
- **Team Tasks**: Access to team-wide assignments
- **Announcements**: Real-time company announcements
- **Meeting Calendar**: View upcoming meetings and join links
- **Profile Settings**: Update personal info and change password

### Technical Features
- **Dark Theme**: Modern dark UI with accent colors (#5635D7, #C5A3FF)
- **Responsive Design**: Mobile-first responsive layout
- **Real-time Updates**: Live data synchronization
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: TailwindCSS with custom components
- **API Integration**: RESTful API with Express.js backend

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **React Hot Toast** - Notification system
- **Axios** - HTTP client for API calls

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd YBPanel
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/yb-digital-panel
JWT_SECRET=your-super-secret-jwt-key
ADMIN_MASTER_PASSWORD=YB150924
PORT=5000
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud connection
```

5. **Start the development servers**

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 Usage

### Admin Access
1. Go to http://localhost:3000
2. Click "Admin Login"
3. Enter master password: `YB150924`
4. Access admin dashboard with full management capabilities

### Member Access
1. Go to http://localhost:3000
2. Click "Join Team" to register as a new member
3. Fill in registration details
4. Login with your credentials
5. Access personalized member dashboard

## 📁 Project Structure

```
YBPanel/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin dashboard pages
│   │   ├── members/              # Member management
│   │   ├── announcements/        # Announcement management
│   │   ├── tasks/                # Task management
│   │   └── meetings/             # Meeting management
│   ├── member/                   # Member dashboard pages
│   │   └── profile/              # Member profile management
│   ├── login/                    # Admin login page
│   ├── member-login/             # Member login page
│   ├── register/                 # Member registration
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable React components
│   ├── DashboardLayout.tsx       # Dashboard wrapper component
│   └── Sidebar.tsx               # Navigation sidebar
├── lib/                          # Utility libraries
│   ├── api.ts                    # Axios API client
│   ├── auth.ts                   # Authentication utilities
│   └── utils.ts                  # Helper functions
├── server/                       # Express.js backend
│   ├── models/                   # MongoDB models
│   │   ├── User.js               # User model
│   │   ├── Announcement.js       # Announcement model
│   │   ├── Task.js               # Task model
│   │   └── Meeting.js            # Meeting model
│   ├── routes/                   # API routes
│   │   ├── auth.js               # Authentication routes
│   │   ├── users.js              # User management routes
│   │   ├── announcements.js      # Announcement routes
│   │   ├── tasks.js              # Task routes
│   │   ├── meetings.js           # Meeting routes
│   │   └── dashboard.js          # Dashboard data routes
│   ├── middleware/               # Express middleware
│   │   └── auth.js               # Authentication middleware
│   └── index.js                  # Server entry point
├── types/                        # TypeScript type definitions
│   └── index.ts                  # Shared types
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment variables
├── package.json                  # Dependencies and scripts
├── tailwind.config.js            # TailwindCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/admin-login` - Admin login with master password
- `POST /api/auth/member-login` - Member login with email/password
- `POST /api/auth/register` - Member registration
- `GET /api/auth/verify` - Verify JWT token

### User Management
- `GET /api/users` - Get all members (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin only)

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (admin only)
- `PUT /api/announcements/:id` - Update announcement (admin only)
- `DELETE /api/announcements/:id` - Delete announcement (admin only)

### Tasks
- `GET /api/tasks` - Get tasks (filtered by role)
- `POST /api/tasks` - Create task (admin only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (admin only)

### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create meeting (admin only)
- `PUT /api/meetings/:id` - Update meeting (admin only)
- `DELETE /api/meetings/:id` - Delete meeting (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get admin dashboard statistics
- `GET /api/dashboard/member` - Get member dashboard data
- `GET /api/dashboard/activities` - Get recent activities

## 🎨 Design System

### Colors
- **Primary Background**: #24384D (dark-bg)
- **Card Background**: #2a4052 (dark-card)
- **Border**: #3a505e (dark-border)
- **Accent**: #5635D7 (primary purple)
- **Highlight**: #C5A3FF (light purple)

### Typography
- **Primary Font**: Inter
- **Secondary Font**: Poppins
- **Font Weights**: 300, 400, 500, 600, 700

### Components
- **Rounded Corners**: 1rem (xl), 1.5rem (2xl)
- **Shadows**: Subtle with accent colors
- **Animations**: Smooth transitions and hover effects

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based sessions
- **Role-based Access**: Admin and member permission levels
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured cross-origin policies

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
ADMIN_MASTER_PASSWORD=YB150924
PORT=5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software for YB Digital internal use.

## 📞 Support

For support and questions, contact the YB Digital development team.

---

**YB Digital Panel** - Internal Management System © 2024
