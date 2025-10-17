# 🚀 YB Digital Panel - Quick Start Guide

Get your YB Digital internal management panel up and running in minutes!

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control

## 🏃‍♂️ Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
The `.env.local` file is already configured with default values:
```env
MONGODB_URI=mongodb://localhost:27017/yb-digital-panel
JWT_SECRET=yb-digital-panel-super-secret-jwt-key-2024
ADMIN_MASTER_PASSWORD=YB150924
PORT=5000
```

### 3. Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env.local)
```

### 4. Seed Database (Optional but Recommended)
```bash
npm run seed
```
This creates sample data including:
- 1 Admin user
- 5 Sample team members
- Sample announcements, tasks, and meetings

### 5. Start the Application

**Terminal 1 - Backend Server:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. Access the Application
Open your browser and go to: **http://localhost:3000**

## 🔑 Login Credentials

### Admin Access
- Go to "Admin Login"
- **Master Password:** `YB150924`

### Sample Member Access
- Go to "Member Login"
- **Email:** Any of the sample emails (e.g., `john.doe@ybdigital.com`)
- **Password:** `password123`

### Sample Member Accounts
- `john.doe@ybdigital.com` - Senior Frontend Developer
- `jane.smith@ybdigital.com` - UI/UX Designer  
- `mike.johnson@ybdigital.com` - Backend Developer
- `sarah.wilson@ybdigital.com` - Digital Marketing Specialist
- `david.brown@ybdigital.com` - DevOps Engineer

## 🎯 What You Can Do

### As Admin
- ✅ Manage team members (add, edit, delete)
- ✅ Create and manage announcements
- ✅ Assign tasks to individuals or teams
- ✅ Schedule and manage meetings
- ✅ View dashboard analytics and stats
- ✅ Search and filter all data

### As Member
- ✅ View personalized dashboard
- ✅ Manage assigned tasks and update status
- ✅ View team tasks and announcements
- ✅ Check upcoming meetings
- ✅ Update profile information
- ✅ Change password

## 🛠️ Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB if not running
mongod --dbpath /usr/local/var/mongodb
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Clear Database and Reseed
```bash
npm run seed
```

## 📱 Mobile Responsive
The application is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets  
- 💻 Desktop computers

## 🎨 Features Showcase

### Dark Theme
- Modern dark UI with custom color scheme
- Purple accent colors (#5635D7, #C5A3FF)
- Smooth animations and transitions

### Real-time Updates
- Live dashboard updates
- Instant notifications
- Real-time task status changes

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control

## 🔄 Development Workflow

### Making Changes
1. Frontend changes: Edit files in `/app` directory
2. Backend changes: Edit files in `/server` directory
3. Both servers auto-reload on file changes

### Adding New Features
1. Update database models in `/server/models`
2. Add API routes in `/server/routes`
3. Create frontend pages in `/app`
4. Update types in `/types/index.ts`

## 📚 Next Steps

1. **Customize Branding**: Update colors, fonts, and logos
2. **Add More Features**: Implement file uploads, notifications, etc.
3. **Deploy to Production**: Use Vercel, Netlify, or your preferred platform
4. **Setup CI/CD**: Implement automated testing and deployment

## 🆘 Need Help?

- Check the full **README.md** for detailed documentation
- Review the **API endpoints** section for backend integration
- Examine the **project structure** to understand the codebase

---

**Happy coding! 🎉**

*YB Digital Panel - Making team management simple and efficient.*
