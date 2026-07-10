import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { 
  ArrowLeft, Clock, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react';
import { parseLocalDate, formatTime12Hour } from '../../utils/dateUtils';

const AttendanceHistory = () => {
  const { user } = useAuth();
  
  // History states
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PRESENT', 'ABSENT'
  const [expandedDates, setExpandedDates] = useState({});

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/attendance/history`, { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.message || `Failed to load attendance history (Server returned ${response.status}).`;
        setHistoryError(msg);
        console.error('History fetch failed:', response.status, errData);
      }
    } catch (err) {
      setHistoryError(`Connection error. Failed to load attendance history (${err.message}).`);
      console.error('History fetch connection error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  // Set initial expanded states for the latest 3 unique dates when history is fetched
  useEffect(() => {
    if (history && history.length > 0) {
      const uniqueDates = [...new Set(history.map(item => item.date))];
      const initialExpanded = {};
      uniqueDates.slice(0, 3).forEach(d => {
        initialExpanded[d] = true;
      });
      setExpandedDates(initialExpanded);
    }
  }, [history]);

  const toggleDateExpanded = (dateStr) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
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

  if (historyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  // Filter history entries based on select tab
  const filteredHistory = history.filter(item => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  // Group filtered history entries by date string
  const groupedHistory = {};
  filteredHistory.forEach(item => {
    if (!groupedHistory[item.date]) {
      groupedHistory[item.date] = [];
    }
    groupedHistory[item.date].push(item);
  });

  // Unique dates sorted descending (since history is already sorted by date descending from backend)
  const sortedUniqueDates = [...new Set(filteredHistory.map(item => item.date))];

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

      {/* History Error Alert */}
      {historyError && (
        <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{historyError}</span>
        </div>
      )}

      {/* Collapsible grouped history list */}
      {history.length === 0 ? (
        /* Entirely Empty State (no records at all) */
        <div className="text-center py-12 bg-cp-surface border border-cp-border border-dashed rounded-3xl text-xs text-cp-text-secondary space-y-2 shadow-[0_1px_2px_rgba(0,0,0,0.01)] px-4">
          <Clock className="w-8 h-8 mx-auto text-cp-text-secondary/40" />
          <p className="font-semibold text-cp-text-primary">No attendance records yet</p>
          <p className="text-[10px] text-cp-text-secondary">Marked classes will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Filter buttons */}
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

          {sortedUniqueDates.length === 0 ? (
            /* Empty state when filter yields 0 matches */
            <div className="text-center py-8 bg-cp-surface border border-cp-border border-dashed rounded-3xl text-xs text-cp-text-secondary space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <Clock className="w-5 h-5 mx-auto text-cp-text-secondary/50" />
              <p className="font-semibold text-cp-text-primary">No logs matched the filter</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedUniqueDates.map(dateStr => {
                const entries = groupedHistory[dateStr] || [];
                const isExpanded = !!expandedDates[dateStr];

                return (
                  <div key={dateStr} className="bg-cp-surface border border-cp-border rounded-3xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                    {/* Collapsible date header button */}
                    <button
                      onClick={() => toggleDateExpanded(dateStr)}
                      className="w-full p-3.5 flex items-center justify-between text-left border-b border-cp-border/5 bg-cp-surface hover:bg-cp-accent-light/30 transition-all font-display font-extrabold text-[11px] text-cp-text-primary"
                    >
                      <span>{formatHistoryDate(dateStr)}</span>
                      <div className="flex items-center space-x-2 text-cp-text-secondary">
                        <span className="text-[9px] font-medium font-sans">({entries.length} {entries.length === 1 ? 'class' : 'classes'})</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {/* Expanded entry sublist */}
                    {isExpanded && (
                      <div className="p-3 space-y-2.5 bg-cp-bg/30">
                        {entries.map((entry, idx) => {
                          const isPresent = entry.status === 'PRESENT';

                          return (
                            <div 
                              key={idx} 
                              className="bg-cp-surface border border-cp-border/50 rounded-2xl p-3 flex items-center justify-between hover:border-cp-accent/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
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
