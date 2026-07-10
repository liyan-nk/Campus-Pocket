import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { 
  AlertCircle, CheckCircle2, BarChart2, Clock, ChevronRight 
} from 'lucide-react';
import { getCachedData, setCachedData, isCacheValid } from '../../utils/dataCache';
import PullToRefresh from '../../components/PullToRefresh';

const Attendance = () => {
  const { user } = useAuth();
  
  // Summary states
  const [summary, setSummary] = useState(() => getCachedData('attendanceSummary', user?.username));
  const [loading, setLoading] = useState(() => !getCachedData('attendanceSummary', user?.username));
  const [error, setError] = useState('');
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showUpdatedToast, setShowUpdatedToast] = useState(false);

  const fetchAttendanceSummary = async (force = false) => {
    const username = user?.username;
    if (!force && isCacheValid('attendanceSummary', username)) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/attendance/summary`, { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
        setCachedData('attendanceSummary', username, data);
        setError('');
      } else {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.message || `Failed to load attendance summary.`;
        setError(msg);
      }
    } catch (err) {
      setError('Connection error. Failed to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceSummary();

    const goOnline = () => {
      setIsOffline(false);
      fetchAttendanceSummary(true);
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
    await fetchAttendanceSummary(true);
    setShowUpdatedToast(true);
    setTimeout(() => setShowUpdatedToast(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cp-bg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cp-accent"></div>
      </div>
    );
  }

  // Calculate Health Summary parameters
  const statsList = summary?.subjectStats || [];
  const hasAttendance = statsList.length > 0;
  
  const safeCount = statsList.filter(s => {
    const pct = s.totalClasses > 0 ? (s.presentClasses * 100.0) / s.totalClasses : 0;
    return pct >= 75.0;
  }).length;

  const attentionCount = statsList.filter(s => {
    const pct = s.totalClasses > 0 ? (s.presentClasses * 100.0) / s.totalClasses : 0;
    return s.totalClasses > 0 && pct < 75.0;
  }).length;

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
      <div className="p-4 space-y-4 pb-2">
        
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
          <h2 className="text-xl font-display font-extrabold text-cp-text-primary tracking-tight mt-0.5">Attendance Insights</h2>
        </div>

        {/* Errors Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-2.5 text-xs text-red-500 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ATTENDANCE HEALTH SUMMARY */}
        {!hasAttendance ? (
          <div className="text-center py-10 bg-cp-surface border border-cp-border rounded-3xl text-xs text-cp-text-secondary space-y-2 shadow-[0_1px_2px_rgba(0,0,0,0.01)] px-4 animate-fadeIn">
            <BarChart2 className="w-8 h-8 mx-auto text-cp-text-secondary/50" />
            <p className="font-semibold text-cp-text-primary">No attendance marked yet</p>
            <p className="text-[10px] text-cp-text-secondary">Start marking today's classes to view insights.</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Health counts */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex items-center space-x-3 bg-cp-surface p-3.5 rounded-2xl border border-cp-border shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <div className="w-8 h-8 bg-green-500/10 rounded-xl border border-green-500/20 flex items-center justify-center text-green-600 text-[10px] font-extrabold shrink-0">
                  {safeCount}
                </div>
                <div className="text-xs min-w-0">
                  <p className="font-bold text-cp-text-primary">On Track</p>
                  <p className="text-cp-text-secondary text-[9px] font-semibold uppercase tracking-wider mt-0.5 truncate">&gt;= 75% present</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-cp-surface p-3.5 rounded-2xl border border-cp-border shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <div className="w-8 h-8 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center justify-center text-red-600 text-[10px] font-extrabold shrink-0">
                  {attentionCount}
                </div>
                <div className="text-xs min-w-0">
                  <p className="font-bold text-cp-text-primary">Needs Care</p>
                  <p className="text-cp-text-secondary text-[9px] font-semibold uppercase tracking-wider mt-0.5 truncate">&lt; 75% present</p>
                </div>
              </div>
            </div>

            {/* Subject-wise insights */}
            <div className="space-y-2.5">
              {statsList.map((stat, idx) => {
                const total = stat.totalClasses;
                const present = stat.presentClasses;
                const pct = total > 0 ? (present * 100.0) / total : 0;
                
                // Formulas for safety & recovery classes limit
                const isSafe = pct >= 75.0;
                const canMiss = Math.max(0, Math.floor((present * 4 - total * 3) / 3));
                
                // Continuous attendance needed to reach 75%
                const needed = Math.max(0, Math.ceil((3 * total - 4 * present)));
                
                const percentageString = total > 0 ? `${pct.toFixed(0)}%` : '0%';

                return (
                  <div 
                    key={idx}
                    className="bg-cp-surface border border-cp-border hover:border-cp-accent/30 rounded-3xl p-4 hover:shadow-sm transition-all duration-300 space-y-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                  >
                    {/* Header: Title and Percentage badge */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5 max-w-[200px] truncate">
                        <h4 className="font-display font-extrabold text-sm text-cp-text-primary tracking-tight leading-tight truncate">
                          {stat.subjectName || 'Subject'}
                        </h4>
                        <div className="flex items-center space-x-2 text-[10px] text-cp-text-secondary">
                          {stat.subjectCode && (
                            <span className="font-mono font-bold uppercase tracking-wider">{stat.subjectCode}</span>
                          )}
                          <span>•</span>
                          <span className="font-semibold text-cp-text-primary/70">{present} / {total} Hours</span>
                        </div>
                      </div>

                      <div className={`px-2.5 py-1 rounded-xl text-xs font-display font-extrabold border shrink-0 ${
                        isSafe 
                          ? 'bg-green-500/10 border-green-500/25 text-green-600' 
                          : 'bg-red-500/10 border-red-500/25 text-red-600'
                      }`}>
                        {percentageString}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-cp-border-light rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isSafe ? 'bg-green-600' : 'bg-red-600'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      ></div>
                    </div>

                    {/* Bottom Action Advice Row */}
                    <div className="text-[10px] pt-1 flex items-center justify-between border-t border-cp-border/40 text-cp-text-secondary font-medium">
                      {isSafe ? (
                        canMiss > 0 ? (
                          <div className="flex items-center text-green-600 font-semibold space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Can miss {canMiss} class{canMiss > 1 ? 'es' : ''}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-amber-600 font-semibold space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Maintain streak</span>
                          </div>
                        )
                      ) : (
                        needed > 0 && (
                          <div className="flex items-center text-red-500 font-semibold space-x-1 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Attend next {needed} class{needed > 1 ? 'es' : ''} to reach 75%</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation settings card for Attendance History */}
        <Link 
          to="/attendance/history"
          className="flex items-center justify-between p-3.5 bg-cp-surface hover:bg-cp-accent-light/50 border border-cp-border rounded-2xl transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-cp-accent/30"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-cp-accent-light rounded-xl flex items-center justify-center text-cp-accent border border-cp-border shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-cp-text-primary">Attendance History</p>
              <p className="text-[10px] text-cp-text-secondary font-medium mt-0.5">View your previous class records</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cp-text-secondary shrink-0" />
        </Link>

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

export default Attendance;
