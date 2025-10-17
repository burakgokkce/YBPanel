export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  role: 'admin' | 'member';
  joinDate: Date;
  isActive: boolean;
  department?: string;
  position?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  _id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  date: Date;
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo?: string[];
  assignedToNames?: string[];
  team?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  _id: string;
  title: string;
  description?: string;
  date: Date;
  time: string;
  link?: string;
  notes?: string;
  attendees?: string[];
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalAnnouncements: number;
  upcomingMeetings: number;
}
