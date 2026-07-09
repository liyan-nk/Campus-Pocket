import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api';
import { Award, AlertCircle, Percent, CheckCircle2, XCircle, BarChart2 } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAttendanceSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/student/attendance/summary`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        setError('Failed to load attendance summary.');
      }
    } catch (err) {
      setError('Connection error. Failed to load attendance.');
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

  return (
    <div className="p-5 space-y-6">
      
      {/* Header */}
      <div>
        <p className="text-cp-text-secondary text-xs font-bold uppercase tracking-wider">Attendance Tracker</p>
        <h2 className="text-2xl font-display font-extrabold text-cp-text-primary tracking-tight">Overview</h2>
      </div>

      {/* Error alert logger */}
      {error && (
        <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-start space-x-3 text-sm text-red-500">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* OVERALL ATTENDANCE SUMMARY STATISTICS */}
      {summary && (
        <div className="space-y-4">
          
          {/* Main overview card */}
          <div className="bg-cp-accent text-cp-text-on-accent rounded-3xl p-6 shadow-md border border-cp-border/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cp-text-on-accent/60">
                Overall attendance
              </span>
              <p className="text-3xl font-display font-extrabold tracking-tight">
                {summary.overallPercentage}%
              </p>
              <p className="text-xs text-cp-text-on-accent/60 font-medium">
                {summary.overallPercentage >= 75.0 
                  ? 'Meeting college requirements' 
                  : 'Below 75% attendance criteria'}
              </p>
            </div>
            
            {/* Circle progress overlay */}
            <div className="w-16 h-16 bg-cp-text-on-accent/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-cp-text-on-accent/15 relative">
              <Percent className="w-6 h-6 text-cp-text-on-accent" />
            </div>
          </div>

          {/* Quick Counter Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cp-surface border border-cp-border p-4 rounded-2xl text-center space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <p className="text-[10px] font-bold text-cp-text-secondary uppercase tracking-wider">Total</p>
              <p className="text-lg font-display font-extrabold text-cp-text-primary">{summary.totalClasses}</p>
              <p className="text-[9px] text-cp-text-secondary font-medium leading-none">Classes Marked</p>
            </div>

            <div className="bg-cp-surface border border-cp-border p-4 rounded-2xl text-center space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Present</p>
              <p className="text-lg font-display font-extrabold text-green-600">{summary.totalPresent}</p>
              <p className="text-[9px] text-cp-text-secondary font-medium leading-none">Attended</p>
            </div>

            <div className="bg-cp-surface border border-cp-border p-4 rounded-2xl text-center space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Absent</p>
              <p className="text-lg font-display font-extrabold text-red-600">{summary.totalAbsent}</p>
              <p className="text-[9px] text-cp-text-secondary font-medium leading-none">Missed</p>
            </div>
          </div>

        </div>
      )}

      {/* SUBJECTS ATTENDANCE STATS CARDS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-cp-text-secondary uppercase tracking-wider">Subject Analysis</h3>
        
        {summary?.stats?.length === 0 ? (
          <div className="text-center py-16 bg-cp-surface border border-cp-border rounded-3xl text-sm text-cp-text-secondary space-y-2 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <BarChart2 className="w-8 h-8 mx-auto text-cp-text-secondary/55" />
            <p>No classes marked yet.</p>
            <p className="text-xs text-cp-text-secondary font-medium">Mark class attendance from the dashboard checklist.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {summary?.stats?.map((subj) => {
              const aboveCriteria = subj.percentage >= 75.0;

              return (
                <div 
                  key={subj.subject} 
                  className="bg-cp-surface border border-cp-border rounded-3xl p-5 space-y-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-cp-accent/30 transition-all duration-300"
                >
                  {/* Title and stats summary */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-extrabold text-sm text-cp-text-primary tracking-tight">
                        {subj.subject}
                      </h4>
                      <p className="text-xs text-cp-text-secondary font-mono font-medium mt-0.5">
                        Present: {subj.present} / Total: {subj.total}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-display font-extrabold text-sm ${aboveCriteria ? 'text-green-600' : 'text-amber-500'}`}>
                        {subj.percentage}%
                      </p>
                      <p className="text-[9px] text-cp-text-secondary font-bold uppercase tracking-wider">
                        {aboveCriteria ? 'Safe' : 'Shortage'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Indicator Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-cp-accent-light rounded-full overflow-hidden border border-cp-border/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          aboveCriteria ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${subj.percentage}%` }}
                      ></div>
                    </div>
                    
                    {!aboveCriteria && (
                      <p className="text-[10px] text-amber-600 font-medium flex items-center">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" />
                        Attendance below 75%. Try not to miss classes.
                      </p>
                    )}
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

export default Attendance;
