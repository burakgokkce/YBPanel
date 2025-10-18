'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CheckSquare, 
  Calendar,
  Clock,
  Target,
  AlertCircle,
  User,
  Users,
  Filter,
  Search,
  GripVertical
} from 'lucide-react';
import api from '@/lib/api';
import { Task } from '@/types';
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

// Sortable Task Item Component for Members
function SortableTaskItem({ task, onStatusUpdate }: {
  task: Task;
  onStatusUpdate: (taskId: string, status: string) => void;
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
      className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-highlight/50 transition-colors"
    >
      {/* Drag Handle */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-2 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-highlight"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <h4 className="font-semibold text-sm line-clamp-2 flex-1">{task.title}</h4>
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

      {/* Team or Assigned Users */}
      <div className="flex items-center justify-between mb-3 ml-6">
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
                className="w-6 h-6 bg-highlight/20 rounded-full flex items-center justify-center text-highlight text-xs font-semibold border-2 border-dark-card"
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
      </div>

      {/* Status Update */}
      {task.status !== 'tamamlandi' && task.status !== 'iptal_edildi' && (
        <div className="ml-6">
          <select
            value={task.status}
            onChange={(e) => onStatusUpdate(task._id, e.target.value)}
            className="w-full text-xs bg-dark-bg border border-dark-border rounded px-2 py-1 focus:outline-none focus:border-highlight"
          >
            <option value="beklemede">Beklemede</option>
            <option value="devam_ediyor">Devam Ediyor</option>
            <option value="tamamlandi">Tamamlandı</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default function MemberTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMyTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const fetchMyTasks = async () => {
    try {
      const response = await api.get('/tasks/my-tasks');
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

  const filterTasks = () => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (response.data.success) {
        toast.success('Görev durumu güncellendi');
        fetchMyTasks();
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
          fetchMyTasks();
        }
      } catch (error: any) {
        toast.error('Durum güncellenemedi');
      }
    }
  };

  // Görevleri duruma göre grupla
  const tasksByStatus = {
    beklemede: filteredTasks.filter(task => task.status === 'beklemede'),
    devam_ediyor: filteredTasks.filter(task => task.status === 'devam_ediyor'),
    tamamlandi: filteredTasks.filter(task => task.status === 'tamamlandi'),
    iptal_edildi: filteredTasks.filter(task => task.status === 'iptal_edildi')
  };

  const statusColumns = [
    { key: 'beklemede', title: 'Beklemede', color: 'border-yellow-500/50 bg-yellow-500/5', icon: Clock },
    { key: 'devam_ediyor', title: 'Devam Ediyor', color: 'border-blue-500/50 bg-blue-500/5', icon: Target },
    { key: 'tamamlandi', title: 'Tamamlandı', color: 'border-green-500/50 bg-green-500/5', icon: CheckSquare },
    { key: 'iptal_edildi', title: 'İptal Edildi', color: 'border-red-500/50 bg-red-500/5', icon: AlertCircle }
  ];

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="member">
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
    <DashboardLayout requiredRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Görevlerim</h1>
            <p className="text-gray-400">Size atanan görevleri görüntüleyin ve yönetin</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Görev ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-highlight transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-highlight transition-colors"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="beklemede">Beklemede</option>
              <option value="devam_ediyor">Devam Ediyor</option>
              <option value="tamamlandi">Tamamlandı</option>
              <option value="iptal_edildi">İptal Edildi</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg focus:outline-none focus:border-highlight transition-colors"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="dusuk">Düşük</option>
              <option value="orta">Orta</option>
              <option value="yuksek">Yüksek</option>
              <option value="acil">Acil</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-gray-400">
              <Filter className="w-4 h-4 mr-2" />
              <span>{filteredTasks.length} görev</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statusColumns.map(column => {
            const Icon = column.icon;
            return (
              <div key={column.key} className={`border rounded-xl p-4 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">{column.title}</h3>
                    <p className="text-2xl font-bold">{tasksByStatus[column.key as keyof typeof tasksByStatus].length}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-60" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tasks Grid */}
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
                        onStatusUpdate={handleStatusUpdate}
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

        {/* No tasks message */}
        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Henüz görev yok</h3>
            <p className="text-gray-400">Size atanan görevler burada görünecek.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
