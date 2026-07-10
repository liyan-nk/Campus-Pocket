import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { parseLocalDate, formatTime12Hour } from '../../utils/dateUtils';
import { 
  Sparkles, Calendar, BookOpen, Clock, MapPin, 
  Check, X, ChevronRight, AlertCircle, RefreshCw, User 
} from 'lucide-react';

const Dashboard = () => {
  const { user, avatarMode, avatarInitials, avatarImage } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchDashboardData = async (targetDate) => {
    const dateToUse = (targetDate instanceof Date) ? targetDate : new Date();
    try {
      const dateStr = getLocalDateString(dateToUse);
      const hours = String(dateToUse.getHours()).padStart(2, '0');
      const mins = String(dateToUse.getMinutes()).padStart(2, '0');
      const secs = String(dateToUse.getSeconds()).padStart(2, '0');
      const timeStr = `${hours}:${mins}:${secs}`;

      const response = await fetch(`${API_BASE_URL}/api/student/dashboard?date=${dateStr}&time=${timeStr}`, {
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
    fetchDashboardData(new Date());

    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentDate(prevDate => {
        if (getLocalDateString(prevDate) !== getLocalDateString(now)) {
          fetchDashboardData(now);
        }
        return now;
      });
    }, 60000);

    const handleActiveState = () => {
      if (document.visibilityState === 'visible') {
        const now = new Date();
        setCurrentDate(prevDate => {
          if (getLocalDateString(prevDate) !== getLocalDateString(now)) {
            fetchDashboardData(now);
          } else {
            fetchDashboardData(now);
          }
          return now;
        });
      }
    };

    document.addEventListener('visibilitychange', handleActiveState);
    window.addEventListener('focus', handleActiveState);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleActiveState);
      window.removeEventListener('focus', handleActiveState);
    };
  }, []);

  const handleMarkAttendance = async (timetableId, status) => {
    setError('');
    const previousData = { ...data };

    // Optimistically update state
    const updatedTodayClasses = (data?.todayClasses || []).map(cls => {
      if (cls?.timetable?.id === timetableId) {
        return {
          ...cls,
          attendanceStatus: status
        };
      }
      return cls;
    });

    setData(prev => ({
      ...prev,
      todayClasses: updatedTodayClasses
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/student/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          timetableId,
          date: getLocalDateString(currentDate), // yyyy-MM-dd (local today date based on device local time)
          status
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to mark attendance.');
      }
    } catch (err) {
      setError(err.message);
      // Rollback to previous state
      setData(previousData);
    }
  };

  // Format date helper: "Tuesday, July 7"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = (dateString instanceof Date) ? dateString : parseLocalDate(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Greeting helper based on time (05:00 - 11:59 Morning, 12:00 - 16:59 Afternoon, 17:00 - 04:59 Evening)
  const getGreeting = () => {
    const hours = currentDate.getHours();
    if (hours >= 5 && hours < 12) return 'Good Morning';
    if (hours >= 12 && hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Sanitization helpers
  const cleanSemester = (sem) => {
    if (!sem) return '';
    let s = sem.replace(/semester/gi, '').replaceAll(/\s+/g, '').toUpperCase();
    if (/^S+\d+$/.test(s)) {
      return 'S' + s.replace(/^S+/, '');
    } else if (/^\d+$/.test(s)) {
      return 'S' + s;
    }
    return s;
  };

  const cleanBatch = (bat) => {
    if (!bat) return '';
    let b = bat.replace(/batch/gi, '').replaceAll(/\s+/g, '').toUpperCase();
    if (b.length > 1 && b.startsWith('B')) {
      return b.substring(1);
    }
    return b;
  };

  const cleanDept = (dept) => {
    if (!dept) return '';
    let d = dept.trim().toUpperCase();
    if (d === 'AI&DS' || d === 'AIDS' || d === 'AI AND DS' || d === 'AI & DS') {
      return 'AI & DS';
    }
    return d;
  };

  // Timetable formatting helpers
  const getSubjectName = (t) => {
    if (!t) return '';
    if (t.subjectName) return t.subjectName;
    if (t.subject && t.subject.includes('(')) {
      return t.subject.split('(')[0].trim();
    }
    return t.subject;
  };

  const getSubjectCode = (t) => {
    if (!t) return '';
    if (t.subjectCode) return t.subjectCode;
    if (t.subject && t.subject.includes('(')) {
      const match = t.subject.match(/\(([^)]+)\)/);
      return match ? match[1].trim() : '';
    }
    return '';
  };

  const getFacultyName = (t) => {
    if (!t) return '';
    if (t.facultyName) return t.facultyName;
    if (t.faculty && t.faculty.includes('(')) {
      return t.faculty.split('(')[0].trim();
    }
    return t.faculty;
  };

  return (
    <div className="p-4 space-y-4 pb-2">
      
      {/* Header Profile Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-cp-text-secondary text-[10px] font-bold uppercase tracking-wider">{loading ? 'Loading...' : getGreeting()}</p>
          <h2 className="text-xl font-display font-extrabold text-cp-text-primary tracking-tight leading-none mt-0.5">
            Hello, {user?.name?.split(' ')[0] || 'Student'}!
          </h2>
        </div>
        <Link 
          to="/profile"
          className="w-10 h-10 bg-cp-accent-light rounded-full flex items-center justify-center text-cp-text-primary font-display font-extrabold border border-cp-border overflow-hidden transition-all duration-200 active:scale-95 hover:opacity-90 cursor-pointer shrink-0"
        >
          {avatarMode === 'image' && avatarImage ? (
            <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{avatarInitials || user?.name?.charAt(0) || 'S'}</span>
          )}
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="h-12 bg-cp-surface border border-cp-border rounded-2xl animate-pulse"></div>
            <div className="h-12 bg-cp-surface border border-cp-border rounded-2xl animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-12 bg-cp-surface border border-cp-border rounded animate-pulse"></div>
            <div className="h-28 bg-cp-surface border border-cp-border rounded-3xl animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 bg-cp-surface border border-cp-border rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-14 bg-cp-surface border border-cp-border rounded-2xl animate-pulse"></div>
              <div className="h-14 bg-cp-surface border border-cp-border rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Overview stats: Schedule on left, Tasks on right */}
          <div className="grid grid-cols-2 gap-2.5">
        <div className="flex items-center space-x-2.5 bg-cp-surface p-3 rounded-2xl border border-cp-border shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <Calendar className="w-4.5 h-4.5 text-cp-accent shrink-0" />
          <div className="text-xs min-w-0">
            <p className="font-bold text-cp-text-primary truncate">Schedule</p>
            <p className="text-cp-text-secondary font-medium text-[9px] leading-tight mt-0.5 truncate">{formatDate(currentDate)}</p>
          </div>
        </div>

        <Link 
          to="/tasks"
          className="flex items-center space-x-2.5 bg-cp-surface hover:bg-cp-accent-light p-3 rounded-2xl border border-cp-border hover:border-cp-accent/30 transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
        >
          <div className="w-7 h-7 bg-cp-accent-light rounded-xl flex items-center justify-center text-cp-accent font-display font-extrabold text-xs shrink-0 border border-cp-border">
            {data?.pendingTasksCount || 0}
          </div>
          <div className="text-xs min-w-0">
            <p className="font-bold text-cp-text-primary truncate">Tasks Pending</p>
            <p className="text-cp-text-secondary font-semibold uppercase tracking-wider text-[8px] truncate">To-do list</p>
          </div>
        </Link>
      </div>

      {/* NEXT CLASS CARD */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider">Next Up</h3>
        {data?.nextClass ? (
          <div className="bg-cp-accent text-cp-text-on-accent rounded-3xl p-4 shadow-md border border-cp-border/10 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 min-w-0 pr-2 flex-grow">
                <span className="px-2 py-0.5 bg-cp-text-on-accent/10 backdrop-blur-md rounded-lg text-[9px] font-bold uppercase tracking-wider">
                  Upcoming
                </span>
                <h4 className="text-base font-display font-extrabold tracking-tight mt-1 leading-tight">
                  {getSubjectName(data.nextClass?.timetable)}
                </h4>
                <p className="text-[10px] font-mono text-cp-text-on-accent/60 font-bold tracking-wider uppercase">
                  {getSubjectCode(data.nextClass?.timetable)}
                </p>
              </div>
              <div className="w-9 h-9 bg-cp-text-on-accent/10 backdrop-blur-md rounded-xl flex items-center justify-center font-display font-extrabold text-xs border border-cp-text-on-accent/15 shrink-0">
                {data.nextClass?.timetable?.room || ''}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-cp-text-on-accent/80 pt-2 border-t border-cp-text-on-accent/15">
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                <span className="font-mono">
                  {formatTime12Hour(data.nextClass?.timetable?.startTime)} - {formatTime12Hour(data.nextClass?.timetable?.endTime)}
                </span>
              </div>
              <div className="flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-cp-text-on-accent/60" />
                <span>{getFacultyName(data.nextClass?.timetable)}</span>
              </div>
            </div>
          </div>
        ) : data?.todayClasses && data.todayClasses.length > 0 ? (
          <div className="bg-cp-surface border border-cp-border rounded-3xl p-4 text-center text-xs font-bold text-green-600 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            Classes completed for today 🎉
          </div>
        ) : (
          <div className="bg-cp-surface border border-cp-border rounded-3xl p-4 text-center text-xs text-cp-text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            No upcoming classes scheduled for today. Enjoy!
          </div>
        )}
      </div>

      {/* TODAY'S CLASSES CHECKLIST */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider">Today's Class Checklist</h3>
          <button 
            onClick={fetchDashboardData}
            title="Refresh dashboard"
            className="p-1 hover:bg-cp-accent-light text-cp-text-secondary hover:text-cp-accent rounded-lg transition-all border border-transparent hover:border-cp-border"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {data?.todayClasses?.length === 0 ? (
          <div className="text-center py-8 bg-cp-surface border border-cp-border rounded-3xl text-xs text-cp-text-secondary shadow-[0_1px_2px_rgba(0,0,0,0.01)] px-4">
            No classes scheduled for today in {cleanDept(data?.department)} / {cleanSemester(data?.semester)} / {cleanBatch(data?.batch)}.
          </div>
        ) : (
          <div className="space-y-2.5">
            {data?.todayClasses?.map((cls) => {
              const markedPresent = cls.attendanceStatus === 'PRESENT';
              const markedAbsent = cls.attendanceStatus === 'ABSENT';

              return (
                <div 
                  key={cls?.timetable?.id || Math.random()} 
                  className={`bg-cp-surface border rounded-2xl p-3 flex items-center justify-between transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${
                    markedPresent ? 'border-green-200/50 bg-green-500/5' :
                    markedAbsent ? 'border-red-200/50 bg-red-500/5' :
                    'border-cp-border'
                  }`}
                >
                  {/* Left Metadata */}
                  <div className="space-y-0.5 max-w-[200px] truncate">
                    <h4 className="text-xs font-bold text-cp-text-primary truncate">{getSubjectName(cls?.timetable)}</h4>
                    <div className="flex items-center space-x-2 text-[10px] text-cp-text-secondary">
                      <span className="font-mono flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime12Hour(cls?.timetable?.startTime)}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {cls?.timetable?.room || ''}
                      </span>
                    </div>
                  </div>

                  {/* Right Status Toggles */}
                  <div className="flex items-center space-x-1.5">
                    {/* PRESENT Toggle */}
                    <button
                      onClick={() => cls?.timetable?.id && handleMarkAttendance(cls.timetable.id, 'PRESENT')}
                      className={`p-1.5 rounded-lg transition-all flex items-center justify-center border ${
                        markedPresent
                          ? 'bg-green-600 border-green-600 text-white shadow-sm'
                          : 'bg-cp-surface border-cp-border hover:border-green-300 text-cp-text-secondary hover:text-green-600'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* ABSENT Toggle */}
                    <button
                      onClick={() => cls?.timetable?.id && handleMarkAttendance(cls.timetable.id, 'ABSENT')}
                      className={`p-1.5 rounded-lg transition-all flex items-center justify-center border ${
                        markedAbsent
                          ? 'bg-red-600 border-red-600 text-white shadow-sm'
                          : 'bg-cp-surface border-cp-border hover:border-red-300 text-cp-text-secondary hover:text-red-600'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

    </div>
  );
};

export default Dashboard;
