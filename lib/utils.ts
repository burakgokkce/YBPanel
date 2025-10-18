import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Turkish translations for task status and priority
export const getTaskStatusText = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'beklemede': 'Beklemede',
    'devam_ediyor': 'Devam Ediyor',
    'tamamlandi': 'Tamamlandı',
    'iptal_edildi': 'İptal Edildi'
  };
  return statusMap[status] || status;
};

export const getTaskPriorityText = (priority: string): string => {
  const priorityMap: { [key: string]: string } = {
    'dusuk': 'Düşük',
    'orta': 'Orta',
    'yuksek': 'Yüksek',
    'acil': 'Acil'
  };
  return priorityMap[priority] || priority;
};

export const getTaskStatusColor = (status: string): string => {
  const colorMap: { [key: string]: string } = {
    'beklemede': 'bg-yellow-500/20 text-yellow-400',
    'devam_ediyor': 'bg-blue-500/20 text-blue-400',
    'tamamlandi': 'bg-green-500/20 text-green-400',
    'iptal_edildi': 'bg-red-500/20 text-red-400'
  };
  return colorMap[status] || 'bg-gray-500/20 text-gray-400';
};

export const getTaskPriorityColor = (priority: string): string => {
  const colorMap: { [key: string]: string } = {
    'dusuk': 'bg-gray-500/20 text-gray-400',
    'orta': 'bg-blue-500/20 text-blue-400',
    'yuksek': 'bg-orange-500/20 text-orange-400',
    'acil': 'bg-red-500/20 text-red-400'
  };
  return colorMap[priority] || 'bg-gray-500/20 text-gray-400';
};

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
