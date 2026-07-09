import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import { Calendar, Clock, User, MapPin, AlertCircle } from 'lucide-react';

const Timetable = () => {
  const { user } = useAuth();
  
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Day filter states
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Set current day of the week as default active tab
  const getCurrentDay = () => {
    const todayNum = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    const map = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return map[todayNum];
  };

  const [activeDay, setActiveDay] = useState(getCurrentDay());

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/timetable`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTimetable(data);
      } else {
        setError('Failed to load timetable.');
      }
    } catch (err) {
      setError('Connection error. Failed to load timetable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // Filter timetable for the active tab day
  const filteredSlots = timetable.filter(
    (slot) => slot.day.toLowerCase() === activeDay.toLowerCase()
  );

  // Format academic profile fields
  const getFormattedDept = (val) => (val || '').toUpperCase();
  const getFormattedSem = (val) => (val || '').replace(/semester/gi, '').trim().toUpperCase();
  const getFormattedBatch = (val) => (val || '').replace(/batch/gi, '').trim().toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-2">
      
      {/* Header Title */}
      <div>
        <p className="text-cp-text-secondary text-[10px] font-bold uppercase tracking-wider">Class Schedule</p>
        <h2 className="text-xl font-display font-extrabold text-cp-text-primary tracking-tight mt-0.5">Timetable</h2>
      </div>

      {/* Profile summary banner */}
      <div className="bg-cp-surface border border-cp-border p-2.5 px-3.5 rounded-2xl flex items-center justify-between text-xs text-cp-text-secondary font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        <span>Academic Profile</span>
        <span className="font-mono text-cp-text-primary bg-cp-accent-light px-2 py-0.5 rounded-lg border border-cp-border-light text-[10px]">
          {getFormattedDept(user?.department)} {getFormattedSem(user?.semester)} {getFormattedBatch(user?.batch)}
        </span>
      </div>

      {/* Error alert logger */}
      {error && (
        <div className="p-3.5 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Day Swiper (Horizontal navigation) */}
      <div className="overflow-x-auto -mx-4 px-4 py-1 scrollbar-none flex space-x-2">
        {daysOfWeek.map((day) => {
          const isToday = getCurrentDay().toLowerCase() === day.toLowerCase();
          const isActive = activeDay.toLowerCase() === day.toLowerCase();
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
          <div className="text-center py-12 bg-cp-surface border border-cp-border border-dashed rounded-3xl text-xs text-cp-text-secondary space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <Calendar className="w-6 h-6 mx-auto text-cp-text-secondary/55" />
            <p>No classes scheduled for {activeDay}.</p>
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div 
              key={slot.id} 
              className="bg-cp-surface border border-cp-border hover:border-cp-accent/30 rounded-3xl p-4 hover:shadow-sm transition-all duration-300 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
            >
              {/* Header section */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <h4 className="font-display font-extrabold text-sm text-cp-text-primary tracking-tight leading-tight truncate">
                    {slot.subject}
                  </h4>
                  <p className="text-[11px] text-cp-text-secondary font-medium flex items-center truncate">
                    <User className="w-3 h-3 mr-1 text-cp-text-secondary/60 shrink-0" />
                    {slot.faculty}
                  </p>
                </div>
                <div className="px-2 py-0.5 bg-cp-accent-light text-cp-text-primary font-display font-extrabold text-[10px] rounded-lg border border-cp-border-light shrink-0">
                  {slot.room}
                </div>
              </div>

              {/* Time slots and class room details footer */}
              <div className="flex items-center justify-between text-[11px] text-cp-text-secondary border-t border-cp-border-light pt-2.5">
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-cp-text-secondary/60" />
                  <span className="font-mono font-medium text-cp-text-primary">
                    {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-cp-text-secondary/60" />
                  <span className="font-semibold text-cp-text-primary">{slot.room}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Timetable;
