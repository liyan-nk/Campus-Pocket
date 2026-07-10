import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { 
  ArrowLeft, Clock, ChevronLeft, ChevronRight, AlertCircle 
} from 'lucide-react';
import { parseLocalDate, formatTime12Hour } from '../../utils/dateUtils';

const AttendanceHistory = () => {
  const { user } = useAuth();
  
  // Date-wise navigation states
  const [dates, setDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(true);
  const [datesError, setDatesError] = useState('');
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Single-day history states
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PRESENT', 'ABSENT'

  const fetchAttendanceDates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/attendance/dates`, { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setDates(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.message || `Failed to load available dates (Server returned ${response.status}).`;
        setDatesError(msg);
        console.error('Dates fetch failed:', response.status, errData);
      }
    } catch (err) {
      setDatesError(`Connection error. Failed to load dates (${err.message}).`);
      console.error('Dates fetch connection error:', err);
    } finally {
      setDatesLoading(false);
    }
  };

  const fetchAttendanceHistoryForDate = async (dateStr) => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/attendance/history?date=${dateStr}`, { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.message || `Failed to load history for ${dateStr} (Server returned ${response.status}).`;
        setHistoryError(msg);
        console.error('History for date fetch failed:', response.status, errData);
      }
    } catch (err) {
      setHistoryError(`Connection error. Failed to load history (${err.message}).`);
      console.error('History for date fetch connection error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceDates();
  }, []);

  useEffect(() => {
    if (dates.length > 0 && selectedDateIndex >= 0 && selectedDateIndex < dates.length) {
      fetchAttendanceHistoryForDate(dates[selectedDateIndex]);
    }
  }, [dates, selectedDateIndex]);

  const handleNavigateDate = (direction) => {
    setSelectedDateIndex(prev => {
      const nextIndex = prev + direction;
      if (nextIndex >= 0 && nextIndex < dates.length) {
        return nextIndex;
      }
      return prev;
    });
  };

  // Helper to format date string: e.g. "Friday, July 10, 2026"
  const formatHistoryDate = (dateString) => {
    if (!dateString) return '';
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (datesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  const hasDates = dates.length > 0;
  const selectedDateStr = hasDates ? dates[selectedDateIndex] : '';

  // Filter history entries based on select tab
  const filteredHistory = history.filter(item => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  return (
    <div className="p-4 space-y-4 pb-2">
      
      {/* Back button & Header Info */}
      <div className="space-y-1">
        <Link 
          to="/attendance" 
          className="inline-flex items-center text-[10px] font-bold text-cp-accent uppercase tracking-wider hover:opacity-80 transition-all select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Link>
        <h2 className="text-xl font-display font-extrabold text-cp-text-primary tracking-tight mt-1">
          Attendance History
        </h2>
        <p className="text-[10px] text-cp-text-secondary font-bold uppercase tracking-wider">
          Your marked class records
        </p>
      </div>

      {/* Dates Error Alert */}
      {datesError && (
        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{datesError}</span>
        </div>
      )}

      {/* Main Single Day History Container */}
      {!hasDates ? (
        /* Entirely Empty State (no dates marked at all) */
        <div className="text-center py-12 bg-cp-surface border border-cp-border border-dashed rounded-3xl text-xs text-cp-text-secondary space-y-2 shadow-[0_1px_2px_rgba(0,0,0,0.01)] px-4">
          <Clock className="w-8 h-8 mx-auto text-cp-text-secondary/40" />
          <p className="font-semibold text-cp-text-primary">No attendance records yet</p>
          <p className="text-[10px] text-cp-text-secondary">Marked classes will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Day Navigation Bar */}
          <div className="flex items-center justify-between bg-cp-surface border border-cp-border rounded-2xl p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            {/* older date is further down in the dates list (larger index) */}
            <button
              onClick={() => handleNavigateDate(1)}
              disabled={selectedDateIndex >= dates.length - 1}
              title="Older date"
              className="p-1.5 hover:bg-cp-accent-light text-cp-text-secondary hover:text-cp-accent disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all border border-cp-border shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="font-display font-extrabold text-[11px] text-cp-text-primary text-center px-2 truncate">
              {formatHistoryDate(selectedDateStr)}
            </span>
            
            {/* newer date is closer to index 0 */}
            <button
              onClick={() => handleNavigateDate(-1)}
              disabled={selectedDateIndex <= 0}
              title="Newer date"
              className="p-1.5 hover:bg-cp-accent-light text-cp-text-secondary hover:text-cp-accent disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-all border border-cp-border shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* History Error Alert */}
          {historyError && (
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{historyError}</span>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex space-x-1.5 pb-0.5">
            {['ALL', 'PRESENT', 'ABSENT'].map(opt => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase transition-all border shrink-0 ${
                  filter === opt
                    ? 'bg-cp-accent text-cp-text-on-accent border-cp-accent shadow-sm'
                    : 'bg-cp-surface text-cp-text-secondary border-cp-border hover:text-cp-text-primary'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* History list for selected date */}
          {historyLoading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cp-accent"></div>
            </div>
          ) : filteredHistory.length === 0 ? (
            /* Empty state when filter yields 0 matches */
            <div className="text-center py-8 bg-cp-surface border border-cp-border border-dashed rounded-3xl text-xs text-cp-text-secondary space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <Clock className="w-5 h-5 mx-auto text-cp-text-secondary/50" />
              <p className="font-semibold text-cp-text-primary">No logs matched the filter</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((entry, idx) => {
                const isPresent = entry.status === 'PRESENT';

                return (
                  <div 
                    key={idx} 
                    className="bg-cp-surface border border-cp-border rounded-2xl p-3.5 flex items-center justify-between hover:border-cp-accent/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                  >
                    <div className="space-y-0.5 max-w-[200px] truncate">
                      <h4 className="text-xs font-bold text-cp-text-primary truncate">{entry.subjectName}</h4>
                      <div className="flex items-center space-x-2 text-[9px] text-cp-text-secondary">
                        {entry.subjectCode && (
                          <span className="font-mono font-bold uppercase tracking-wider">{entry.subjectCode}</span>
                        )}
                        <span className="font-mono flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime12Hour(entry.startTime)}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                      isPresent 
                        ? 'bg-green-500/10 text-green-600 border border-green-500/20' 
                        : 'bg-red-500/10 text-red-600 border border-red-500/20'
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AttendanceHistory;
