import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import { Calendar, Clock, User, MapPin, AlertCircle } from 'lucide-react';
import { formatTime12Hour } from '../../utils/dateUtils';
import { getCachedData, setCachedData } from '../../utils/dataCache';
import PullToRefresh from '../../components/PullToRefresh';

const Timetable = () => {
  const { user } = useAuth();
  
  const [timetable, setTimetable] = useState(() => getCachedData('timetable', user?.username) || []);
  const [loading, setLoading] = useState(() => !getCachedData('timetable', user?.username));
  const [error, setError] = useState('');
  
  // Day filter states
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const getCurrentDayString = () => {
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    if (dayIndex === 0) return 'MONDAY'; // fallback Sunday to Monday
    return daysOfWeek[dayIndex - 1];
  };
  const [activeDay, setActiveDay] = useState(getCurrentDayString());

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showUpdatedToast, setShowUpdatedToast] = useState(false);

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/timetable`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTimetable(data);
        setCachedData('timetable', user?.username, data);
        setError('');
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || 'Failed to load timetable.');
      }
    } catch (err) {
      setError('Connection error. Failed to load timetable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.username) return;

    // Load initial cache once user credentials exist
    const cached = getCachedData('timetable', user.username);
    if (cached) {
      setTimetable(cached);
      setLoading(false);
    }

    // Always fetch backend data silently
    fetchTimetable();

    const goOnline = () => {
      setIsOffline(false);
      fetchTimetable();
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
    await fetchTimetable();
    setShowUpdatedToast(true);
    setTimeout(() => setShowUpdatedToast(false), 2000);
  };

  const getSubjectName = (slot) => {
    if (slot.subjectName) return slot.subjectName;
    if (slot.subject && slot.subject.includes('(')) {
      return slot.subject.split('(')[0].trim();
    }
    return slot.subject;
  };

  const getSubjectCode = (slot) => {
    if (slot.subjectCode) return slot.subjectCode;
    if (slot.subject && slot.subject.includes('(')) {
      const match = slot.subject.match(/\(([^)]+)\)/);
      return match ? match[1].trim() : '';
    }
    return '';
  };

  const getFacultyName = (slot) => {
    if (slot.facultyName) return slot.facultyName;
    if (slot.faculty && slot.faculty.includes('(')) {
      return slot.faculty.split('(')[0].trim();
    }
    return slot.faculty;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  // Filter slots for current active day selection
  const filteredSlots = timetable.filter(
    (slot) => slot.dayOfWeek === activeDay
  );

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
        <div>
          <p className="text-cp-text-secondary text-[10px] font-bold uppercase tracking-wider">Academic Tracker</p>
          <h2 className="text-xl font-display font-extrabold text-cp-text-primary tracking-tight mt-0.5">Class Timetable</h2>
        </div>

        {/* Errors Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Day Select Scroller */}
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 select-none">
          {daysOfWeek.map((day) => {
            const isToday = getCurrentDayString() === day;
            const isActive = activeDay === day;

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-3.5 py-2 rounded-xl font-display text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-cp-accent text-cp-text-on-accent shadow-sm'
                    : 'bg-cp-surface text-cp-text-secondary border border-cp-border hover:border-cp-accent/30 shadow-[0_1px_2px_rgba(0,0,0,0.01)]'
                }`}
              >
                {day.substring(0, 3)}
                {isToday && <span className="ml-1 text-[8px] uppercase px-1 bg-cp-accent-light text-cp-text-primary rounded-md">Today</span>}
              </button>
            );
          })}
        </div>

        {/* Class Slots Cards List */}
        <div className="space-y-3">
          {filteredSlots.length === 0 ? (
            <div className="text-center py-12 bg-cp-surface border border-cp-border border-dashed rounded-3xl text-xs text-cp-text-secondary space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)] animate-fadeIn">
              <Calendar className="w-6 h-6 mx-auto text-cp-text-secondary/55" />
              <p>No classes scheduled for {activeDay}.</p>
            </div>
          ) : (
            // Sort slots chronologically by start time
            filteredSlots
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((slot) => (
                <div 
                  key={slot.id} 
                  className="bg-cp-surface border border-cp-border hover:border-cp-accent/30 rounded-3xl p-4 hover:shadow-sm transition-all duration-300 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)] animate-fadeIn"
                >
                  {/* Header section */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0 pr-2 flex-grow">
                      <h4 className="font-display font-extrabold text-sm text-cp-text-primary tracking-tight leading-tight">
                        {getSubjectName(slot)}
                      </h4>
                      <p className="text-[10px] font-mono text-cp-text-secondary font-bold tracking-wider uppercase">
                        {getSubjectCode(slot)}
                      </p>
                    </div>
                    {slot.room && (
                      <div className="px-2 py-0.5 bg-cp-accent-light text-cp-text-primary font-display font-extrabold text-[10px] rounded-lg border border-cp-border-light shrink-0">
                        {slot.room}
                      </div>
                    )}
                  </div>

                  {/* Time slots and class room details footer */}
                  <div className="flex items-center justify-between text-[11px] text-cp-text-secondary border-t border-cp-border-light pt-2.5">
                    <div className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-cp-text-secondary/60" />
                      <span className="font-mono font-medium text-cp-text-primary">
                        {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1 text-cp-text-secondary/60 shrink-0" />
                      <span className="font-semibold text-cp-text-primary truncate max-w-[80px]">{getFacultyName(slot)}</span>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

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

export default Timetable;
