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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      
      {/* Header */}
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Academic Tracker</p>
        <h2 className="text-2xl font-display font-extrabold text-gray-900 tracking-tight">Personal Tasks</h2>
      </div>

      {/* Logger Alerts */}
      {error && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start space-x-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-start space-x-3 text-sm text-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* CREATE / EDIT TASK ACCORDION */}
      {editingTask ? (
        /* EDIT TASK FORM */
        <form onSubmit={handleUpdateTask} className="p-5 bg-gray-50 border border-purple-100 rounded-3xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-sm font-bold flex items-center">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Task Details
            </span>
            <button 
              type="button" 
              onClick={() => setEditingTask(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task Title (e.g. Finish Record)"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              disabled={updating}
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Task Description (optional)"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 h-20 resize-none"
              disabled={updating}
            />
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-700"
                disabled={updating}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={updating}
              className="w-1/2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-all"
            >
              {updating ? 'Saving...' : 'Update Task'}
            </button>
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="w-1/2 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* CREATE TASK FORM */
        <form onSubmit={handleCreateTask} className="p-4 bg-gray-50 border border-gray-200 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
            <Plus className="w-4 h-4 mr-1 text-purple-600" />
            Add New Task
          </h3>
          
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              disabled={submitting}
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              disabled={submitting}
            />
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-500"
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center space-x-1"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* PENDING TASKS SECTION */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Pending Tasks ({pendingTasks.length})
        </h3>
        
        {pendingTasks.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 border border-gray-150 border-dashed rounded-3xl text-sm text-gray-400 space-y-1">
            <CheckCircle2 className="w-6 h-6 mx-auto text-green-500" />
            <p className="font-semibold text-gray-600">All caught up!</p>
            <p className="text-xs text-gray-400">No pending academic tasks left.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div key={task.id} className="bg-white border border-gray-150 rounded-2xl p-4 flex items-start justify-between shadow-sm/5 hover:border-purple-200 transition-all duration-300">
                {/* Left check circle & details */}
                <div className="flex items-start space-x-3 flex-grow pr-3">
                  <button 
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 text-gray-300 hover:text-purple-600 transition-all shrink-0"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                  <div className="space-y-1 truncate max-w-[240px]">
                    <h4 className="text-sm font-bold text-gray-800 leading-tight truncate">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-gray-500 leading-relaxed truncate">{task.description}</p>
                    )}
                    <span className="inline-flex items-center text-[10px] text-gray-400 font-mono font-medium">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => handleStartEdit(task)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED TASKS SECTION */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Completed Tasks ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 flex items-start justify-between opacity-60">
                <div className="flex items-start space-x-3 flex-grow pr-3">
                  <button 
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 text-purple-600 transition-all shrink-0"
                  >
                    <CheckSquare className="w-5 h-5" />
                  </button>
                  <div className="space-y-1 truncate max-w-[240px]">
                    <h4 className="text-sm font-semibold text-gray-500 line-through leading-tight truncate">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-gray-400 line-through leading-relaxed truncate">{task.description}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
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
