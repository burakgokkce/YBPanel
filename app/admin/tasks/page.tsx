'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CheckSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Users,
  X,
  Filter,
  Search
} from 'lucide-react';
import api from '@/lib/api';
import { Task, User as UserType } from '@/types';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[],
    team: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks', {
        params: {
          status: filterStatus !== 'all' ? filterStatus : undefined,
          priority: filterPriority !== 'all' ? filterPriority : undefined
        }
      });

      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to load tasks');
      console.error('Tasks error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const submitData = {
        ...formData,
        dueDate: formData.dueDate || undefined
      };

      const url = editingTask 
        ? `/tasks/${editingTask._id}` 
        : '/tasks';
      const method = editingTask ? 'put' : 'post';

      const response = await api[method](url, submitData);
      
      if (response.data.success) {
        toast.success(`Task ${editingTask ? 'updated' : 'created'} successfully`);
        setShowModal(false);
        setEditingTask(null);
        setFormData({
          title: '',
          description: '',
          assignedTo: [],
          team: '',
          priority: 'medium',
          dueDate: ''
        });
        fetchTasks();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo || [],
      team: task.team || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await api.delete(`/tasks/${taskId}`);
      if (response.data.success) {
        toast.success('Task deleted successfully');
        fetchTasks();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      assignedTo: [],
      team: '',
      priority: 'medium',
      dueDate: ''
    });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.team?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400';
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="h-12 bg-dark-card rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-dark-card rounded"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Task Management</h1>
            <p className="text-gray-400">Assign and track tasks for your team</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-accent transition-colors"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-gray-400">
              <Filter className="w-4 h-4 mr-2" />
              <span>{filteredTasks.length} tasks</span>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{task.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      {task.assignedToNames && task.assignedToNames.length > 0 && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          <span>Assigned to: {task.assignedToNames.join(', ')}</span>
                        </div>
                      )}
                      {task.team && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Team: {task.team}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span>Created by: {task.createdByName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-gray-400 hover:text-white"
                      title="Edit Task"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-red-400 hover:text-red-300"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-dark-card border border-dark-border rounded-xl">
              <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No tasks found</p>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Create First Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Enter task description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium mb-2">
                  Assign to Members
                </label>
                <select
                  multiple
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, assignedTo: values });
                  }}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  size={4}
                >
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple members</p>
              </div>

              <div>
                <label htmlFor="team" className="block text-sm font-medium mb-2">
                  Team Assignment
                </label>
                <input
                  type="text"
                  id="team"
                  value={formData.team}
                  onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="e.g., Development Team, Design Team"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 px-4 py-2 border border-dark-border text-gray-300 rounded-xl hover:bg-dark-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
