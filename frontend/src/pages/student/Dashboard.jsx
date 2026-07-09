import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { 
  Sparkles, Calendar, BookOpen, Clock, MapPin, 
  Check, X, ChevronRight, AlertCircle, RefreshCw 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingId, setMarkingId] = useState(null); // tracking active marking action

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/dashboard`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError('Failed to load dashboard data.');
      }
    } catch (err) {
      setError('Connection error. Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkAttendance = async (timetableId, status) => {
    setError('');
    setMarkingId(timetableId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          timetableId,
          date: new Date().toISOString().split('T')[0], // yyyy-MM-dd (local today date)
          status
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to mark attendance.');
      }
      
      // Reload dashboard data to refresh statuses
      await fetchDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingId(null);
    }
  };

  // Format date helper: "Tuesday, July 7"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Greeting helper based on time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      
      {/* Header Profile Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-cp-text-secondary text-xs font-bold uppercase tracking-wider">{getGreeting()}</p>
          <h2 className="text-2xl font-display font-extrabold text-cp-text-primary tracking-tight">
            Hello, {user?.name.split(' ')[0]}!
          </h2>
        </div>
        <div className="w-10 h-10 bg-cp-accent-light rounded-full flex items-center justify-center text-cp-text-primary font-display font-extrabold border border-cp-border">
          {user?.name.charAt(0)}
        </div>
      </div>

      {/* Overview stats: Schedule on left, Tasks on right */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center space-x-3 bg-cp-surface p-4 rounded-2xl border border-cp-border shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <Calendar className="w-5 h-5 text-cp-accent shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-cp-text-primary">Schedule</p>
            <p className="text-cp-text-secondary font-medium text-[10px] leading-tight mt-0.5">{formatDate(data?.date)}</p>
          </div>
        </div>

        <Link 
          to="/tasks"
          className="flex items-center space-x-3 bg-cp-surface hover:bg-cp-accent-light p-4 rounded-2xl border border-cp-border hover:border-cp-accent/30 transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
        >
          <div className="w-8 h-8 bg-cp-accent-light rounded-xl flex items-center justify-center text-cp-accent font-display font-extrabold text-sm shrink-0 border border-cp-border">
            {data?.pendingTasksCount || 0}
          </div>
          <div className="text-xs">
            <p className="font-bold text-cp-text-primary">Tasks Pending</p>
            <p className="text-cp-text-secondary font-semibold uppercase tracking-wider text-[9px]">To-do list</p>
          </div>
        </Link>
      </div>

      {/* NEXT CLASS CARD */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-cp-text-secondary uppercase tracking-wider">Next Up</h3>
        {data?.nextClass ? (
          <div className="bg-cp-accent text-cp-text-on-accent rounded-3xl p-5 shadow-md border border-cp-border/10 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-cp-text-on-accent/10 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  Upcoming
                </span>
                <h4 className="text-lg font-display font-extrabold tracking-tight">
                  {data.nextClass.timetable.subject}
                </h4>
                <p className="text-xs text-cp-text-on-accent/60 font-medium">{data.nextClass.timetable.faculty}</p>
              </div>
              <div className="w-10 h-10 bg-cp-text-on-accent/10 backdrop-blur-md rounded-xl flex items-center justify-center font-display font-extrabold text-sm border border-cp-text-on-accent/15">
                {data.nextClass.timetable.room}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-cp-text-on-accent/80 pt-2 border-t border-cp-text-on-accent/15">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                <span className="font-mono">
                  {data.nextClass.timetable.startTime.substring(0, 5)} - {data.nextClass.timetable.endTime.substring(0, 5)}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{data.nextClass.timetable.room}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-cp-surface border border-cp-border rounded-3xl p-5 text-center text-sm text-cp-text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            No upcoming classes scheduled for today. Enjoy!
          </div>
        )}
      </div>

      {/* TODAY'S CLASSES CHECKLIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-cp-text-secondary uppercase tracking-wider">Today's Class Checklist</h3>
          <button 
            onClick={fetchDashboardData}
            title="Refresh dashboard"
            className="p-1 hover:bg-cp-accent-light text-cp-text-secondary hover:text-cp-accent rounded-lg transition-all border border-transparent hover:border-cp-border"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {data?.todayClasses?.length === 0 ? (
          <div className="text-center py-10 bg-cp-surface border border-cp-border rounded-3xl text-sm text-cp-text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            No classes scheduled for today in {data?.department} S{data?.semester} B{data?.batch}.
          </div>
        ) : (
          <div className="space-y-3">
            {data?.todayClasses?.map((cls) => {
              const markedPresent = cls.attendanceStatus === 'PRESENT';
              const markedAbsent = cls.attendanceStatus === 'ABSENT';

              return (
                <div 
                  key={cls.timetable.id} 
                  className={`bg-cp-surface border rounded-2xl p-4 flex items-center justify-between transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${
                    markedPresent ? 'border-green-200/50 bg-green-500/5' :
                    markedAbsent ? 'border-red-200/50 bg-red-500/5' :
                    'border-cp-border'
                  }`}
                >
                  {/* Left Metadata */}
                  <div className="space-y-1 max-w-[200px] truncate">
                    <h4 className="text-sm font-bold text-cp-text-primary truncate">{cls.timetable.subject}</h4>
                    <div className="flex items-center space-x-3 text-xs text-cp-text-secondary">
                      <span className="font-mono flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {cls.timetable.startTime.substring(0, 5)}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {cls.timetable.room}
                      </span>
                    </div>
                  </div>

                  {/* Right Status Toggles */}
                  <div className="flex items-center space-x-2">
                    {/* PRESENT Toggle */}
                    <button
                      onClick={() => handleMarkAttendance(cls.timetable.id, 'PRESENT')}
                      disabled={markingId !== null}
                      className={`p-2 rounded-xl transition-all flex items-center justify-center border ${
                        markedPresent
                          ? 'bg-green-600 border-green-600 text-white shadow-sm'
                          : 'bg-cp-surface border-cp-border hover:border-green-300 text-cp-text-secondary hover:text-green-600'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    {/* ABSENT Toggle */}
                    <button
                      onClick={() => handleMarkAttendance(cls.timetable.id, 'ABSENT')}
                      disabled={markingId !== null}
                      className={`p-2 rounded-xl transition-all flex items-center justify-center border ${
                        markedAbsent
                          ? 'bg-red-600 border-red-600 text-white shadow-sm'
                          : 'bg-cp-surface border-cp-border hover:border-red-300 text-cp-text-secondary hover:text-red-600'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
