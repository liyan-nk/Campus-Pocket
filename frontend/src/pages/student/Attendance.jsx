import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { 
  AlertCircle, CheckCircle2, BarChart2, Clock, ChevronRight 
} from 'lucide-react';
import { getCachedData, setCachedData } from '../../utils/dataCache';

const Attendance = () => {
  const { user } = useAuth();
  
  // Summary states
  const [summary, setSummary] = useState(() => getCachedData('attendanceSummary'));
  const [loading, setLoading] = useState(!getCachedData('attendanceSummary'));
  const [error, setError] = useState('');

  const fetchAttendanceSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/attendance/summary`, { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
        setCachedData('attendanceSummary', data);
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

  useEffect(() => {
    fetchAttendanceSummary();
  }, []);

  if (loading) {
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
              <p className="text-base font-display font-extrabold text-green-700 leading-tight">{safeCount} {safeCount === 1 ? 'Subject' : 'Subjects'}</p>
              <p className="text-[8px] text-green-600/70 font-semibold uppercase leading-none mt-0.5">At or Above 75%</p>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl text-center space-y-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Need Attention</p>
              <p className="text-base font-display font-extrabold text-amber-700 leading-tight">{attentionCount} {attentionCount === 1 ? 'Subject' : 'Subjects'}</p>
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

                // Fetch subject code
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
                        <p className={`font-display font-extrabold text-xs ${aboveCriteria ? 'text-green-600' : 'text-amber-500'}`}>
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
                          <p className="text-[9px] text-amber-600 font-semibold flex items-center bg-amber-500/5 p-1 px-2 rounded-lg border border-amber-500/10">
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

    </div>
  );
};

export default Attendance;
