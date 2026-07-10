import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import { 
  Award, AlertCircle, CheckCircle2, XCircle, 
  BarChart2, ChevronDown, ChevronUp, Clock 
} from 'lucide-react';
import { parseLocalDate, formatTime12Hour } from '../../utils/dateUtils';

const Attendance = () => {
  const { user } = useAuth();
  
  // Summary states
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // History states
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PRESENT', 'ABSENT'
  const [expandedDates, setExpandedDates] = useState({});

  const fetchAttendanceSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/attendance/summary`, { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.message || `Failed to load attendance summary (Server returned ${response.status}).`;
        setError(msg);
        console.error('Summary fetch failed:', response.status, errData);
      }
    } catch (err) {
      setError(`Connection error. Failed to load attendance summary (${err.message}).`);
      console.error('Summary fetch connection error:', err);
    } finally {
      setLoading(false);
    }
  };

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
    fetchAttendanceSummary();
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

  if (loading || historyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  // Calculate Health Summary parameters
  const stats = summary?.stats || [];
  const hasAttendance = summary?.totalClasses > 0 && stats.length > 0;
  
  const safeCount = stats.filter(subj => subj.percentage >= 75.0).length;
  const attentionCount = stats.filter(subj => subj.percentage < 75.0).length;

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
      
      {/* Header */}
      <div>
        <p className="text-cp-text-secondary text-[10px] font-bold uppercase tracking-wider">Attendance Tracker</p>
        <h2 className="text-xl font-display font-extrabold text-cp-text-primary tracking-tight mt-0.5">Overview</h2>
      </div>

      {/* Summary Error Alert */}
      {error && (
        <div className="p-3.5 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ATTENDANCE HEALTH SUMMARY */}
      {!hasAttendance ? (
        <div className="text-center py-10 bg-cp-surface border border-cp-border rounded-3xl text-xs text-cp-text-secondary space-y-2 shadow-[0_1px_2px_rgba(0,0,0,0.01)] px-4">
          <BarChart2 className="w-8 h-8 mx-auto text-cp-text-secondary/50" />
          <p className="font-semibold text-cp-text-primary">No attendance marked yet</p>
          <p className="text-[10px] text-cp-text-secondary">Start marking today's classes to view insights.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Health counts */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-green-500/5 border border-green-500/10 p-3 rounded-2xl text-center space-y-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <p className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Safe Subjects</p>
              <p className="text-lg font-display font-extrabold text-green-700 leading-tight">{safeCount} {safeCount === 1 ? 'Subject' : 'Subjects'}</p>
              <p className="text-[8px] text-green-600/70 font-semibold uppercase leading-none mt-0.5">At or Above 75%</p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl text-center space-y-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Need Attention</p>
              <p className="text-lg font-display font-extrabold text-amber-700 leading-tight">{attentionCount} {attentionCount === 1 ? 'Subject' : 'Subjects'}</p>
              <p className="text-[8px] text-amber-600/70 font-semibold uppercase leading-none mt-0.5">Below 75% Target</p>
            </div>
          </div>

          {/* SUBJECT CARDS LIST */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider">Subject-wise Health</h3>
            <div className="space-y-3">
              {stats.map((subj) => {
                const aboveCriteria = subj.percentage >= 75.0;
                
                // Edge-case protected math formulas
                const canMiss = Math.max(0, Math.floor((subj.present * 4 - subj.total * 3) / 3));
                const neededToRecover = Math.max(0, subj.total * 3 - subj.present * 4);

                // Fetch subject code: check if there's any code mapped in subject, or fallback
                let subjectCode = '';
                if (subj.subject && subj.subject.includes('(')) {
                  const match = subj.subject.match(/\(([^)]+)\)/);
                  subjectCode = match ? match[1].trim() : '';
                }
                const cleanSubjectName = subj.subject.split('(')[0].trim();

                return (
                  <div 
                    key={subj.subject} 
                    className="bg-cp-surface border border-cp-border rounded-3xl p-4 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-cp-accent/30 transition-all duration-300"
                  >
                    {/* Header: Subject & Code */}
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-2">
                        <h4 className="font-display font-extrabold text-xs text-cp-text-primary tracking-tight truncate">
                          {cleanSubjectName}
                        </h4>
                        {subjectCode && (
                          <p className="text-[9px] font-mono text-cp-text-secondary font-bold uppercase tracking-wider mt-0.5">
                            {subjectCode}
                          </p>
                        )}
                        <p className="text-[10px] text-cp-text-secondary font-medium mt-1">
                          {subj.present} / {subj.total} hours attended
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-display font-extrabold text-base ${aboveCriteria ? 'text-green-600' : 'text-amber-500'}`}>
                          {subj.percentage}%
                        </p>
                        <p className="text-[8px] text-cp-text-secondary font-bold uppercase tracking-wider">
                          {aboveCriteria ? 'Safe' : 'Shortage'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="space-y-2">
                      <div className="w-full h-1.5 bg-cp-accent-light rounded-full overflow-hidden border border-cp-border/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            aboveCriteria ? 'bg-green-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${subj.percentage}%` }}
                        ></div>
                      </div>
                      
                      {/* Sub-card actionable insight messages */}
                      {aboveCriteria ? (
                        <p className="text-[9px] text-green-600 font-semibold flex items-center bg-green-500/5 p-1 px-2 rounded-lg border border-green-500/10">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                          {canMiss > 0 ? `Can miss ${canMiss} ${canMiss === 1 ? 'class' : 'classes'}` : 'Maintain streak'}
                        </p>
                      ) : (
                        neededToRecover > 0 && (
                          <p className="text-[9px] text-amber-600 font-semibold flex items-center bg-amber-500/5 p-1 px-2 rounded-lg border border-amber-500/10 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                            Attend next {neededToRecover} {neededToRecover === 1 ? 'class' : 'classes'} to reach 75%
                          </p>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE HISTORY SECTION */}
      <div className="space-y-3 pt-2">
        <h3 className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider">Marked History</h3>
        
        {/* History Error Alert */}
        {historyError && (
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{historyError}</span>
          </div>
        )}

        {/* Filter buttons */}
        <div className="flex space-x-1.5">
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

        {/* Collapsible grouped history list */}
        {sortedUniqueDates.length === 0 ? (
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

    </div>
  );
};

export default Attendance;
