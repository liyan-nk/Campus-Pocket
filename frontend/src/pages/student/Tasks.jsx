import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import { 
  Plus, Trash2, Calendar, AlertCircle, CheckCircle2, ListTodo, X, Edit2, Loader2 
} from 'lucide-react';
import { parseLocalDate } from '../../utils/dateUtils';
import { getCachedData, setCachedData } from '../../utils/dataCache';
import PullToRefresh from '../../components/PullToRefresh';

const Tasks = () => {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState(() => getCachedData('tasks', user?.username) || []);
  const [loading, setLoading] = useState(() => !getCachedData('tasks', user?.username));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showUpdatedToast, setShowUpdatedToast] = useState(false);

  // Task creation/editing states
  const [editingTask, setEditingTask] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Submit button loader
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/tasks`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        setCachedData('tasks', user?.username, data);
        setError('');
      } else {
        setError('Failed to fetch tasks.');
      }
    } catch (err) {
      setError('Connection error. Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.username) return;

    // Load initial cache once user credentials exist
    const cached = getCachedData('tasks', user.username);
    if (cached) {
      setTasks(cached);
      setLoading(false);
    }

    // Always fetch backend data silently
    fetchTasks();

    const goOnline = () => {
      setIsOffline(false);
      fetchTasks();
    };
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [user]);

  const handlePullRefresh = async () => {
    await fetchTasks();
    setShowUpdatedToast(true);
    setTimeout(() => setShowUpdatedToast(false), 2000);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (isOffline) {
      setError('Cannot add tasks while offline.');
      return;
    }
    setError('');
    setSuccess('');

    if (!title.trim() || !dueDate) {
      setError('Title and Due Date are required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, dueDate }),
        credentials: 'include'
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setDueDate('');
        setShowCreateForm(false);
        setSuccess('Task created successfully!');
        setTimeout(() => setSuccess(''), 3000);

        // Fetch fresh list to sync state & cache
        fetchTasks();
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || 'Failed to create task.');
      }
    } catch (err) {
      setError('Connection error. Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCompleted = async (task) => {
    if (isOffline) {
      setError('Cannot complete tasks while offline.');
      return;
    }
    setError('');
    const originalTasks = [...tasks];

    // Optimistic toggle
    const toggledCompleted = !task.completed;
    const updatedList = tasks.map(t => {
      if (t.id === task.id) {
        return { ...t, completed: toggledCompleted };
      }
      return t;
    });
    setTasks(updatedList);
    setCachedData('tasks', user?.username, updatedList);

    try {
      const response = await fetch(`${API_BASE_URL}/api/student/tasks/${task.id}/toggle`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        fetchTasks();
      } else {
        throw new Error('Failed to update task.');
      }
    } catch (err) {
      setError(err.message || 'Connection error.');
      setTasks(originalTasks);
      setCachedData('tasks', user?.username, originalTasks);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (isOffline) {
      setError('Cannot edit tasks while offline.');
      return;
    }
    setError('');
    setSuccess('');

    if (!title.trim() || !dueDate) {
      setError('Title and Due Date are required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, dueDate }),
        credentials: 'include'
      });

      if (response.ok) {
        setEditingTask(null);
        setTitle('');
        setDescription('');
        setDueDate('');
        setSuccess('Task updated successfully!');
        setTimeout(() => setSuccess(''), 3000);

        fetchTasks();
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || 'Failed to update task.');
      }
    } catch (err) {
      setError('Connection error. Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (isOffline) {
      setError('Cannot delete tasks while offline.');
      return;
    }
    if (!window.confirm('Delete this task?')) return;
    setError('');
    const originalTasks = [...tasks];

    // Optimistic delete
    const updatedList = tasks.filter(t => t.id !== taskId);
    setTasks(updatedList);
    setCachedData('tasks', user?.username, updatedList);

    try {
      const response = await fetch(`${API_BASE_URL}/api/student/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchTasks();
      } else {
        throw new Error('Failed to delete task.');
      }
    } catch (err) {
      setError(err.message || 'Connection error.');
      setTasks(originalTasks);
      setCachedData('tasks', user?.username, originalTasks);
    }
  };

  const startEditTask = (task) => {
    if (isOffline) {
      setError('Cannot edit tasks while offline.');
      return;
    }
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    // Format YYYY-MM-DD
    const dateVal = task.dueDate instanceof Date ? task.dueDate : parseLocalDate(task.dueDate);
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    setDueDate(`${y}-${m}-${d}`);
    setShowCreateForm(false);
  };

  const startCreateTask = () => {
    if (isOffline) {
      setError('Cannot add tasks while offline.');
      return;
    }
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setShowCreateForm(true);
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const date = (dateString instanceof Date) ? dateString : parseLocalDate(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = (task.dueDate instanceof Date) ? task.dueDate : parseLocalDate(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
      <div className="p-4 space-y-4 pb-2 animate-fadeIn">
        
        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start space-x-2.5 text-xs text-amber-600 font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>Offline mode - showing last updated data</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cp-text-secondary text-[10px] font-bold uppercase tracking-wider">Academic Tracker</p>
            <h2 className="text-xl font-display font-extrabold text-cp-text-primary tracking-tight mt-0.5 animate-slideDown">Personal Tasks</h2>
          </div>
          <button
            onClick={startCreateTask}
            disabled={isOffline}
            className={`w-9 h-9 bg-cp-accent text-cp-text-on-accent rounded-xl flex items-center justify-center shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer ${isOffline ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Errors Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-start space-x-2.5 text-xs text-green-500 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* CREATE TASK FORM ACCORDION */}
        {showCreateForm && (
          <form onSubmit={handleCreateTask} className="p-4 bg-cp-surface border border-cp-border rounded-3xl space-y-3 animate-fadeIn shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between text-cp-accent">
              <span className="text-xs font-bold flex items-center">
                <Plus className="w-4 h-4 mr-1.5" />
                Add New Task
              </span>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="text-cp-text-secondary hover:text-cp-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Task Title (e.g. Maths assignment)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cp-bg border border-cp-border rounded-xl focus:border-cp-accent/50 outline-none text-cp-text-primary"
              />
              <textarea 
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cp-bg border border-cp-border rounded-xl focus:border-cp-accent/50 outline-none text-cp-text-primary h-16 resize-none"
              />
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cp-bg border border-cp-border rounded-xl focus:border-cp-accent/50 outline-none text-cp-text-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-cp-accent text-cp-text-on-accent font-bold text-xs rounded-xl hover:opacity-90 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Add Task</span>}
            </button>
          </form>
        )}

        {/* EDIT TASK FORM ACCORDION */}
        {editingTask && (
          <form onSubmit={handleUpdateTask} className="p-4 bg-cp-surface border border-cp-border rounded-3xl space-y-3 animate-fadeIn shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between text-cp-accent">
              <span className="text-xs font-bold flex items-center">
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit Task Details
              </span>
              <button 
                type="button" 
                onClick={() => setEditingTask(null)}
                className="text-cp-text-secondary hover:text-cp-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cp-bg border border-cp-border rounded-xl focus:border-cp-accent/50 outline-none text-cp-text-primary"
              />
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cp-bg border border-cp-border rounded-xl focus:border-cp-accent/50 outline-none text-cp-text-primary h-16 resize-none"
              />
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-cp-bg border border-cp-border rounded-xl focus:border-cp-accent/50 outline-none text-cp-text-primary"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-cp-accent text-cp-text-on-accent font-bold text-xs rounded-xl hover:opacity-90 active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Update Task</span>}
            </button>
          </form>
        )}

        {/* LIST OF TASKS */}
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-cp-surface border border-cp-border rounded-3xl text-xs text-cp-text-secondary space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)] px-4 animate-fadeIn">
            <ListTodo className="w-7 h-7 mx-auto text-cp-text-secondary/50" />
            <p className="font-bold text-cp-text-primary">No tasks pending</p>
            <p className="text-[10px] text-cp-text-secondary">Click the '+' button above to add a task.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-3.5 bg-cp-surface border rounded-2xl flex items-center justify-between hover:border-cp-accent/20 transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)] animate-fadeIn ${
                  task.completed ? 'border-cp-border/50 opacity-60' : 'border-cp-border'
                }`}
              >
                <div className="flex items-start space-x-3 max-w-[240px]">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    disabled={isOffline}
                    onChange={() => handleToggleCompleted(task)}
                    className="w-4 h-4 rounded border-cp-border text-cp-accent focus:ring-cp-accent/30 mt-0.5 cursor-pointer disabled:opacity-40"
                  />
                  <div className="space-y-0.5 min-w-0" onClick={() => !task.completed && startEditTask(task)}>
                    <h4 className={`text-xs font-bold text-cp-text-primary truncate leading-snug ${
                      task.completed ? 'line-through text-cp-text-secondary animate-pulse' : 'cursor-pointer hover:text-cp-accent'
                    }`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[10px] text-cp-text-secondary truncate">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-1.5 pt-1">
                      {isOverdue(task) ? (
                        <div className="flex items-center text-[9px] text-red-500 font-bold space-x-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>Overdue ({formatShortDate(task.dueDate)})</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-[9px] text-cp-text-secondary font-bold space-x-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{formatShortDate(task.dueDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={isOffline}
                  className="p-1.5 text-cp-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all shrink-0 cursor-pointer disabled:opacity-30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic PTR Toast Notification */}
        {showUpdatedToast && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-cp-surface border border-cp-border text-cp-text-primary px-3 py-1.5 rounded-full shadow-lg text-[10px] font-bold z-50 animate-fadeIn uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Updated</span>
          </div>
        )}

      </div>
    </PullToRefresh>
  );
};

export default Tasks;
