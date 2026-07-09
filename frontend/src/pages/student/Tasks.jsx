import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';
import { 
  CheckSquare, Square, Trash2, Edit2, Plus, 
  Calendar, AlertCircle, CheckCircle2, ListTodo, X 
} from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/tasks`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
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
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dueDate || null,
          completed: false
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create task.');
      }

      setSuccess('Task created successfully!');
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task) => {
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          completed: !task.completed
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update task.');
      }

      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDueDate(task.dueDate || '');
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editTitle.trim()) {
      setError('Task title is required.');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          dueDate: editDueDate || null,
          completed: editingTask.completed
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update task.');
      }

      setSuccess('Task updated successfully!');
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete task.');
      }

      setSuccess('Task deleted successfully.');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Split tasks
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Format date helper: "Jul 7, 2026"
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-2">
      
      {/* Header */}
      <div>
        <p className="text-cp-text-secondary text-[10px] font-bold uppercase tracking-wider">Academic Tracker</p>
        <h2 className="text-xl font-display font-extrabold text-cp-text-primary tracking-tight mt-0.5">Personal Tasks</h2>
      </div>

      {/* Logger Alerts */}
      {error && (
        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20 flex items-start space-x-2.5 text-xs text-green-500">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* CREATE / EDIT TASK ACCORDION */}
      {editingTask ? (
        /* EDIT TASK FORM */
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
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task Title (e.g. Finish Record)"
              className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cp-accent text-cp-text-primary placeholder-cp-text-secondary font-medium"
              disabled={updating}
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Task Description (optional)"
              className="w-full px-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cp-accent h-16 resize-none text-cp-text-primary placeholder-cp-text-secondary"
              disabled={updating}
            />
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-cp-text-secondary pointer-events-none" />
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cp-accent text-cp-text-primary font-medium"
                disabled={updating}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={updating}
              className="w-1/2 py-2.5 bg-cp-accent hover:bg-cp-accent-hover text-cp-text-on-accent font-semibold text-xs rounded-xl transition-all"
            >
              {updating ? 'Saving...' : 'Update Task'}
            </button>
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="w-1/2 py-2.5 bg-cp-bg hover:bg-cp-accent-light text-cp-text-primary font-semibold text-xs rounded-xl transition-all border border-cp-border"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* CREATE TASK FORM */
        <form onSubmit={handleCreateTask} className="p-3.5 bg-cp-surface border border-cp-border rounded-3xl space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <h3 className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider flex items-center">
            <Plus className="w-3.5 h-3.5 mr-1 text-cp-accent" />
            Add New Task
          </h3>
          
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-text-primary placeholder-cp-text-secondary font-medium"
              disabled={submitting}
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-text-primary placeholder-cp-text-secondary"
              disabled={submitting}
            />
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-cp-text-secondary pointer-events-none" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-cp-bg border border-cp-border rounded-xl text-xs text-cp-text-primary font-medium"
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-cp-accent hover:bg-cp-accent-hover text-cp-text-on-accent font-semibold rounded-xl text-xs transition-all flex items-center justify-center space-x-1"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-cp-text-on-accent border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* PENDING TASKS SECTION */}
      <div className="space-y-2.5">
        <h3 className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider">
          Pending Tasks ({pendingTasks.length})
        </h3>
        
        {pendingTasks.length === 0 ? (
          <div className="text-center py-8 bg-cp-surface border border-cp-border border-dashed rounded-3xl text-xs text-cp-text-secondary space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <CheckCircle2 className="w-5 h-5 mx-auto text-green-500" />
            <p className="font-semibold text-cp-text-primary">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.map(task => (
              <div key={task.id} className="bg-cp-surface border border-cp-border rounded-2xl p-3 flex items-start justify-between shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-cp-accent/30 transition-all duration-300">
                {/* Left check circle & details */}
                <div className="flex items-start space-x-2.5 flex-grow pr-2 min-w-0">
                  <button 
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 text-cp-text-secondary/60 hover:text-cp-accent transition-all shrink-0 cursor-pointer"
                  >
                    <Square className="w-4.5 h-4.5" />
                  </button>
                  <div className="space-y-0.5 truncate min-w-0 flex-grow">
                    <h4 className="text-xs font-bold text-cp-text-primary leading-tight truncate">{task.title}</h4>
                    {task.description && (
                      <p className="text-[11px] text-cp-text-secondary leading-normal truncate">{task.description}</p>
                    )}
                    <span className="inline-flex items-center text-[9px] text-cp-text-secondary font-mono font-medium mt-0.5">
                      <Calendar className="w-3 h-3 mr-1 text-cp-text-secondary/60" />
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => handleStartEdit(task)}
                    className="p-1.5 text-cp-text-secondary hover:text-cp-accent hover:bg-cp-accent-light rounded-lg transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-cp-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED TASKS SECTION */}
      {completedTasks.length > 0 && (
        <div className="space-y-2 pt-1">
          <h3 className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider">
            Completed Tasks ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id} className="bg-cp-surface/60 border border-cp-border rounded-2xl p-3 flex items-start justify-between opacity-60">
                <div className="flex items-start space-x-2.5 flex-grow pr-2 min-w-0">
                  <button 
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 text-cp-accent transition-all shrink-0 cursor-pointer"
                  >
                    <CheckSquare className="w-4.5 h-4.5" />
                  </button>
                  <div className="space-y-0.5 truncate min-w-0 flex-grow">
                    <h4 className="text-xs font-semibold text-cp-text-secondary line-through leading-tight truncate">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[11px] text-cp-text-secondary/70 line-through leading-normal truncate">{task.description}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-cp-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
