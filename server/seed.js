const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Announcement = require('./models/Announcement');
const Task = require('./models/Task');
const Meeting = require('./models/Meeting');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yb-digital-panel', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Announcement.deleteMany({});
    await Task.deleteMany({});
    await Meeting.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create Admin User
    const adminPassword = await bcrypt.hash(process.env.ADMIN_MASTER_PASSWORD || 'YB150924', 10);
    const admin = new User({
      name: 'YB Digital Admin',
      email: 'admin@ybdigital.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      joinDate: new Date(),
    });
    await admin.save();

    console.log('👑 Created admin user');

    // Create Sample Members
    const members = [
      {
        name: 'John Doe',
        email: 'john.doe@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1 (555) 123-4567',
        address: '123 Main St, New York, NY 10001',
        department: 'Development',
        position: 'Senior Frontend Developer',
        role: 'member',
        isActive: true,
        joinDate: new Date('2024-01-15'),
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1 (555) 987-6543',
        address: '456 Oak Ave, Los Angeles, CA 90210',
        department: 'Design',
        position: 'UI/UX Designer',
        role: 'member',
        isActive: true,
        joinDate: new Date('2024-02-01'),
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1 (555) 456-7890',
        address: '789 Pine St, Chicago, IL 60601',
        department: 'Development',
        position: 'Backend Developer',
        role: 'member',
        isActive: true,
        joinDate: new Date('2024-01-20'),
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1 (555) 321-0987',
        address: '321 Elm St, Miami, FL 33101',
        department: 'Marketing',
        position: 'Digital Marketing Specialist',
        role: 'member',
        isActive: true,
        joinDate: new Date('2024-02-10'),
      },
      {
        name: 'David Brown',
        email: 'david.brown@ybdigital.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1 (555) 654-3210',
        address: '654 Maple Ave, Seattle, WA 98101',
        department: 'Development',
        position: 'DevOps Engineer',
        role: 'member',
        isActive: true,
        joinDate: new Date('2024-03-01'),
      }
    ];

    const createdMembers = await User.insertMany(members);
    console.log(`👥 Created ${createdMembers.length} sample members`);

    // Create Sample Announcements
    const announcements = [
      {
        title: 'Welcome to YB Digital Panel!',
        description: 'We are excited to launch our new internal management system. This platform will help us stay organized, communicate effectively, and track our progress as a team.',
        createdBy: admin._id,
        createdByName: admin.name,
        isImportant: true,
        date: new Date(),
      },
      {
        title: 'Team Meeting - Weekly Standup',
        description: 'Our weekly standup meeting will be held every Monday at 10:00 AM. Please come prepared with your updates and any blockers you might have.',
        createdBy: admin._id,
        createdByName: admin.name,
        isImportant: false,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      },
      {
        title: 'New Project Kickoff',
        description: 'We will be starting a new client project next week. All team members will receive their specific assignments through the task management system.',
        createdBy: admin._id,
        createdByName: admin.name,
        isImportant: true,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      }
    ];

    const createdAnnouncements = await Announcement.insertMany(announcements);
    console.log(`📢 Created ${createdAnnouncements.length} sample announcements`);

    // Create Sample Tasks
    const tasks = [
      {
        title: 'Setup Development Environment',
        description: 'Install and configure all necessary development tools including Node.js, MongoDB, and VS Code extensions.',
        assignedTo: [createdMembers[0]._id, createdMembers[2]._id],
        assignedToNames: [createdMembers[0].name, createdMembers[2].name],
        status: 'completed',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
        createdByName: admin.name,
      },
      {
        title: 'Design System Documentation',
        description: 'Create comprehensive documentation for our design system including colors, typography, and component guidelines.',
        assignedTo: [createdMembers[1]._id],
        assignedToNames: [createdMembers[1].name],
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
        createdByName: admin.name,
      },
      {
        title: 'API Integration Testing',
        description: 'Perform thorough testing of all API endpoints and ensure proper error handling and validation.',
        assignedTo: [createdMembers[2]._id, createdMembers[4]._id],
        assignedToNames: [createdMembers[2].name, createdMembers[4].name],
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
        createdByName: admin.name,
      },
      {
        title: 'Marketing Campaign Planning',
        description: 'Develop a comprehensive marketing strategy for our upcoming product launch including social media and content marketing.',
        assignedTo: [createdMembers[3]._id],
        assignedToNames: [createdMembers[3].name],
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
        createdByName: admin.name,
      },
      {
        title: 'Team Collaboration Guidelines',
        description: 'Establish clear guidelines for team collaboration, code reviews, and project management processes.',
        team: 'Development Team',
        status: 'in_progress',
        priority: 'low',
        createdBy: admin._id,
        createdByName: admin.name,
      }
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`✅ Created ${createdTasks.length} sample tasks`);

    // Create Sample Meetings
    const meetings = [
      {
        title: 'Weekly Team Standup',
        description: 'Our regular weekly standup to discuss progress, blockers, and upcoming tasks.',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '10:00',
        link: 'https://zoom.us/j/1234567890',
        notes: 'Please prepare your weekly updates and any questions you might have.',
        attendees: createdMembers.map(member => member._id),
        createdBy: admin._id,
        createdByName: admin.name,
      },
      {
        title: 'Project Planning Session',
        description: 'Planning session for the upcoming client project. We will discuss requirements, timeline, and resource allocation.',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        time: '14:00',
        link: 'https://meet.google.com/abc-defg-hij',
        notes: 'Review the project brief before the meeting.',
        attendees: [createdMembers[0]._id, createdMembers[1]._id, createdMembers[2]._id],
        createdBy: admin._id,
        createdByName: admin.name,
      },
      {
        title: 'Design Review Meeting',
        description: 'Review and feedback session for the new design mockups and prototypes.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: '11:30',
        link: 'https://teams.microsoft.com/l/meetup-join/xyz',
        notes: 'Bring your design feedback and suggestions.',
        attendees: [createdMembers[1]._id, createdMembers[3]._id],
        createdBy: admin._id,
        createdByName: admin.name,
      }
    ];

    const createdMeetings = await Meeting.insertMany(meetings);
    console.log(`📅 Created ${createdMeetings.length} sample meetings`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Data Summary:');
    console.log(`   • 1 Admin user (admin@ybdigital.com)`);
    console.log(`   • ${createdMembers.length} Team members`);
    console.log(`   • ${createdAnnouncements.length} Announcements`);
    console.log(`   • ${createdTasks.length} Tasks`);
    console.log(`   • ${createdMeetings.length} Meetings`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: Master Password = YB150924');
    console.log('   Members: password123 (for all sample members)');
    console.log('\n🌐 Access the application at http://localhost:3000');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedData();
