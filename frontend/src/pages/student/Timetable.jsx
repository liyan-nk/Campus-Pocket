import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
      const response = await fetch('/api/student/timetable');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      
      {/* Header Title */}
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Class Schedule</p>
        <h2 className="text-2xl font-display font-extrabold text-gray-900 tracking-tight">Timetable</h2>
      </div>

      {/* Profile summary banner */}
      <div className="bg-gray-50 border border-gray-150 p-3 px-4 rounded-2xl flex items-center justify-between text-xs text-gray-500 font-semibold">
        <span>Academic Profile</span>
        <span className="font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">
          {user?.department} S{user?.semester} B{user?.batch}
        </span>
      </div>

      {/* Error alert logger */}
      {error && (
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start space-x-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Day Swiper (Horizontal navigation) */}
      <div className="overflow-x-auto -mx-5 px-5 py-1 scrollbar-none flex space-x-2">
        {daysOfWeek.map((day) => {
          const isToday = getCurrentDay().toLowerCase() === day.toLowerCase();
          const isActive = activeDay.toLowerCase() === day.toLowerCase();
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2.5 rounded-xl font-display text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {day.substring(0, 3)}
              {isToday && <span className="ml-1 text-[8px] uppercase px-1 bg-white/20 rounded-md">Today</span>}
            </button>
          );
        })}
      </div>

      {/* Class Slots Cards List */}
      <div className="space-y-4">
        {filteredSlots.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border border-gray-150 border-dashed rounded-3xl text-sm text-gray-400 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-gray-300" />
            <p>No classes scheduled for {activeDay}.</p>
          </div>
        ) : (
          filteredSlots.map((slot) => (
            <div 
              key={slot.id} 
              className="bg-white border border-gray-150 hover:border-purple-200 rounded-3xl p-5 hover:shadow-sm transition-all duration-300 space-y-4"
            >
              {/* Header section */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-display font-extrabold text-base text-gray-900 tracking-tight leading-tight">
                    {slot.subject}
                  </h4>
                  <p className="text-xs text-gray-400 font-medium flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" />
                    {slot.faculty}
                  </p>
                </div>
                <div className="px-2.5 py-1 bg-purple-50 text-purple-600 font-display font-extrabold text-xs rounded-xl border border-purple-100">
                  {slot.room}
                </div>
              </div>

              {/* Time slots and class room details footer */}
              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5 text-gray-300" />
                  <span className="font-mono font-medium">
                    {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-300" />
                  <span className="font-semibold text-gray-500">{slot.room}</span>
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
