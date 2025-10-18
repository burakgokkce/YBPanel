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
  Clock,
  AlertCircle,
  Target,
  Flag,
  MoreHorizontal,
  GripVertical
} from 'lucide-react';
import api from '@/lib/api';
import { Task, User as UserType } from '@/types';
import toast from 'react-hot-toast';
import { formatDate, getTaskStatusText, getTaskPriorityText, getTaskStatusColor, getTaskPriorityColor, getInitials } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Task Item Component
function SortableTaskItem({ task, onEdit, onDelete, onStatusChange }: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-accent/50 transition-colors"
    >
      {/* Drag Handle */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-2 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-white"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-sm line-clamp-2 flex-1">{task.title}</h4>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(task)}
            className="p-1 hover:bg-dark-bg rounded text-gray-400 hover:text-white"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1 hover:bg-dark-bg rounded text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2 ml-6">{task.description}</p>
      )}

      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-3 ml-6">
        <span className={`px-2 py-1 text-xs rounded-full ${getTaskPriorityColor(task.priority)}`}>
          {getTaskPriorityText(task.priority)}
        </span>
        
        {task.dueDate && (
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(task.dueDate)}
          </div>
        )}
      </div>

      {/* Assigned Users or Team */}
      <div className="flex items-center justify-between ml-6">
        {task.team ? (
          <div className="flex items-center text-xs text-gray-400">
            <Users className="w-3 h-3 mr-1" />
            <span>{task.team}</span>
          </div>
        ) : (
          <div className="flex -space-x-1">
            {task.assignedToNames?.slice(0, 3).map((name, index) => (
              <div
                key={index}
                className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-semibold border-2 border-dark-card"
                title={name}
              >
                {getInitials(name)}
              </div>
            ))}
            {task.assignedToNames && task.assignedToNames.length > 3 && (
              <div className="w-6 h-6 bg-gray-500/20 rounded-full flex items-center justify-center text-gray-400 text-xs border-2 border-dark-card">
                +{task.assignedToNames.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Status Change Buttons */}
        <div className="flex space-x-1">
          {task.status !== 'devam_ediyor' && (
            <button
              onClick={() => onStatusChange(task._id, 'devam_ediyor')}
              className="p-1 hover:bg-blue-500/20 rounded text-blue-400 text-xs"
              title="Başlat"
            >
              ▶
            </button>
          )}
          {task.status !== 'tamamlandi' && (
            <button
              onClick={() => onStatusChange(task._id, 'tamamlandi')}
              className="p-1 hover:bg-green-500/20 rounded text-green-400 text-xs"
              title="Tamamla"
            >
              ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[],
    team: '',
    priority: 'orta' as 'dusuk' | 'orta' | 'yuksek' | 'acil',
    dueDate: '',
    assignmentType: 'individual' as 'individual' | 'team'
  });

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error: any) {
      toast.error('Görevler yüklenemedi');
      console.error('Tasks error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data.filter((user: UserType) => user.role === 'member'));
      }
    } catch (error) {
      console.error('Users error:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/tasks');
      if (response.data.success) {
        // Extract unique team names from existing tasks
        const teamNames = response.data.data
          .filter((task: Task) => task.team)
          .map((task: Task) => task.team as string);
        
        // Add default teams
        const defaultTeams = ['iOS', 'Android', 'Backend', 'Frontend', 'Web', 'Mobil', 'Tasarım', 'Test', 'Proje Yönetimi', 'Yönetim', 'DevOps', 'UI/UX', 'QA'];
        
        const combinedTeams = [...defaultTeams, ...teamNames];
        const uniqueTeams = Array.from(new Set(combinedTeams)) as string[];
        setTeams(uniqueTeams);
      }
    } catch (error) {
      console.error('Teams error:', error);
      // Set default teams if API fails
      setTeams(['iOS', 'Android', 'Backend', 'Frontend', 'Web', 'Mobil', 'Tasarım', 'Test', 'Proje Yönetimi', 'Yönetim', 'DevOps', 'UI/UX', 'QA']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Görev başlığı gerekli');
      return;
    }

    if (formData.assignmentType === 'individual' && formData.assignedTo.length === 0) {
      toast.error('Lütfen en az bir kişi seçin');
      return;
    }

    if (formData.assignmentType === 'team' && !formData.team) {
      toast.error('Lütfen takım adını girin');
      return;
    }

    try {
      const taskData = {
        ...formData,
        assignedTo: formData.assignmentType === 'individual' ? formData.assignedTo : [],
        team: formData.assignmentType === 'team' ? formData.team : '',
        status: 'beklemede'
      };

      const url = editingTask ? `/tasks/${editingTask._id}` : '/tasks';
      const method = editingTask ? 'put' : 'post';

      const response = await api[method](url, taskData);
      
      if (response.data.success) {
        toast.success(`Görev ${editingTask ? 'güncellendi' : 'oluşturuldu'}`);
        setShowModal(false);
        setEditingTask(null);
        setFormData({
          title: '',
          description: '',
          assignedTo: [],
          team: '',
          priority: 'orta',
          dueDate: '',
          assignmentType: 'individual'
        });
        fetchTasks();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Görev kaydedilemedi');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo || [],
      team: task.team || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignmentType: task.team ? 'team' : 'individual'
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await api.delete(`/tasks/${taskId}`);
      if (response.data.success) {
        toast.success('Görev silindi');
        fetchTasks();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Görev silinemedi');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (response.data.success) {
        toast.success('Görev durumu güncellendi');
        fetchTasks();
      }
    } catch (error: any) {
      toast.error('Durum güncellenemedi');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const activeTask = tasks.find(task => task._id === activeId);
    if (!activeTask) return;

    // Determine the new status based on the drop zone
    let newStatus = activeTask.status;
    
    // Check if dropped on a status column
    const statusColumns = ['beklemede', 'devam_ediyor', 'tamamlandi', 'iptal_edildi'];
    if (statusColumns.includes(overId)) {
      newStatus = overId as 'beklemede' | 'devam_ediyor' | 'tamamlandi' | 'iptal_edildi';
    } else {
      // Check if dropped on another task
      const overTask = tasks.find(task => task._id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // Update task status if it changed
    if (newStatus !== activeTask.status) {
      try {
        const response = await api.put(`/tasks/${activeId}`, { status: newStatus });
        if (response.data.success) {
          toast.success('Görev durumu güncellendi');
          fetchTasks();
        }
      } catch (error: any) {
        toast.error('Durum güncellenemedi');
      }
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
      priority: 'orta',
      dueDate: '',
      assignmentType: 'individual'
    });
  };

  // Görevleri duruma göre grupla
  const tasksByStatus = {
    beklemede: tasks.filter(task => task.status === 'beklemede'),
    devam_ediyor: tasks.filter(task => task.status === 'devam_ediyor'),
    tamamlandi: tasks.filter(task => task.status === 'tamamlandi'),
    iptal_edildi: tasks.filter(task => task.status === 'iptal_edildi')
  };

  const statusColumns = [
    { key: 'beklemede', title: 'Beklemede', color: 'border-yellow-500/50 bg-yellow-500/5' },
    { key: 'devam_ediyor', title: 'Devam Ediyor', color: 'border-blue-500/50 bg-blue-500/5' },
    { key: 'tamamlandi', title: 'Tamamlandı', color: 'border-green-500/50 bg-green-500/5' },
    { key: 'iptal_edildi', title: 'İptal Edildi', color: 'border-red-500/50 bg-red-500/5' }
  ];

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-dark-card rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-dark-card rounded-xl"></div>
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
            <h1 className="text-3xl font-bold mb-2">Görev Yönetimi</h1>
            <p className="text-gray-400">Görevleri oluşturun, atayın ve takip edin</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Görev</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statusColumns.map(column => (
            <div key={column.key} className={`border rounded-xl p-4 ${column.color}`}>
              <h3 className="font-semibold mb-1">{column.title}</h3>
              <p className="text-2xl font-bold">{tasksByStatus[column.key as keyof typeof tasksByStatus].length}</p>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusColumns.map(column => (
              <div key={column.key} className="space-y-4">
                <div 
                  id={column.key}
                  className={`border rounded-xl p-4 ${column.color}`}
                >
                  <h3 className="font-semibold text-center">{column.title}</h3>
                  <p className="text-center text-sm text-gray-400">
                    {tasksByStatus[column.key as keyof typeof tasksByStatus].length} görev
                  </p>
                </div>

                <SortableContext
                  items={tasksByStatus[column.key as keyof typeof tasksByStatus].map(task => task._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 min-h-[400px]">
                    {tasksByStatus[column.key as keyof typeof tasksByStatus].map(task => (
                      <SortableTaskItem
                        key={task._id}
                        task={task}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))}

                    {/* Empty State */}
                    {tasksByStatus[column.key as keyof typeof tasksByStatus].length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Henüz görev yok</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {editingTask ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
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
                  Görev Başlığı *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  placeholder="Görev başlığını girin"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Açıklama
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Görev açıklamasını girin"
                />
              </div>

              {/* Assignment Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Atama Türü</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="assignmentType"
                      value="individual"
                      checked={formData.assignmentType === 'individual'}
                      onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value as 'individual' | 'team' })}
                      className="mr-2"
                    />
                    <User className="w-4 h-4 mr-1" />
                    Kişisel Atama
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="assignmentType"
                      value="team"
                      checked={formData.assignmentType === 'team'}
                      onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value as 'individual' | 'team' })}
                      className="mr-2"
                    />
                    <Users className="w-4 h-4 mr-1" />
                    Takım Atama
                  </label>
                </div>
              </div>

              {/* Individual Assignment */}
              {formData.assignmentType === 'individual' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Atanan Kişiler *
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-dark-border rounded-xl p-4 space-y-2">
                    {users.length > 0 ? (
                      users.map(user => (
                        <label key={user._id} className="flex items-center space-x-3 cursor-pointer hover:bg-dark-bg p-2 rounded-lg">
                          <input
                            type="checkbox"
                            checked={formData.assignedTo.includes(user._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ 
                                  ...formData, 
                                  assignedTo: [...formData.assignedTo, user._id] 
                                });
                              } else {
                                setFormData({ 
                                  ...formData, 
                                  assignedTo: formData.assignedTo.filter(id => id !== user._id) 
                                });
                              }
                            }}
                            className="w-4 h-4 text-accent bg-dark-bg border-dark-border rounded focus:ring-accent focus:ring-2"
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent text-xs font-semibold">
                              {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-gray-400">{user.department || 'Departman belirtilmemiş'}</p>
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">Kayıtlı üye bulunamadı</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Seçilen: {formData.assignedTo.length} kişi
                  </p>
                </div>
              )}

              {/* Team Assignment */}
              {formData.assignmentType === 'team' && (
                <div>
                  <label htmlFor="team" className="block text-sm font-medium mb-2">
                    Takım Adı *
                  </label>
                  <div className="space-y-2">
                    <select
                      id="team"
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                    >
                      <option value="">Mevcut takım seçin</option>
                      {teams.map(team => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400">veya</p>
                    <input
                      type="text"
                      value={formData.team}
                      onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                      placeholder="Yeni takım adı girin (örn: Frontend Ekibi)"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-2">
                    Öncelik
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'dusuk' | 'orta' | 'yuksek' | 'acil' })}
                    className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="dusuk">Düşük</option>
                    <option value="orta">Orta</option>
                    <option value="yuksek">Yüksek</option>
                    <option value="acil">Acil</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-2">
                    Bitiş Tarihi
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

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 px-4 py-2 border border-dark-border text-gray-300 rounded-xl hover:bg-dark-bg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  {editingTask ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
