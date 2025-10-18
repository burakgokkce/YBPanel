export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  department?: 'iOS' | 'Android' | 'Backend' | 'Web' | 'Mobil' | 'Tasarım' | 'Test' | 'Proje Yönetimi' | 'Yönetim';
  position?: string;
  role: 'admin' | 'project_manager' | 'member';
  isActive: boolean;
  joinDate: string;
  profilePicture?: string;
  iban?: string;
  birthDate?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
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
  assignedTo: string[];
  assignedToNames: string[];
  team?: string;
  status: 'beklemede' | 'devam_ediyor' | 'tamamlandi' | 'iptal_edildi';
  priority: 'dusuk' | 'orta' | 'yuksek' | 'acil';
  dueDate?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
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
