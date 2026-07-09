import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Calendar, Award, ListTodo, User } from 'lucide-react';

const StudentLayout = () => {
  return (
    <div className="mobile-container bg-cp-bg">
      
      {/* Scrollable page body */}
      <div className="flex-grow overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto h-[calc(4.5rem+env(safe-area-inset-bottom))] bg-cp-surface/95 backdrop-blur-md border-t border-cp-border flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] z-40 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
        
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-2xl transition-all duration-300 ${
              isActive ? 'text-cp-accent' : 'text-cp-text-secondary hover:text-cp-text-primary'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wide uppercase">Home</span>
        </NavLink>

        <NavLink
          to="/timetable"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-2xl transition-all duration-300 ${
              isActive ? 'text-cp-accent' : 'text-cp-text-secondary hover:text-cp-text-primary'
            }`
          }
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wide uppercase">Schedule</span>
        </NavLink>

        <NavLink
          to="/attendance"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-2xl transition-all duration-300 ${
              isActive ? 'text-cp-accent' : 'text-cp-text-secondary hover:text-cp-text-primary'
            }`
          }
        >
          <Award className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wide uppercase">Tracker</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-2xl transition-all duration-300 ${
              isActive ? 'text-cp-accent' : 'text-cp-text-secondary hover:text-cp-text-primary'
            }`
          }
        >
          <ListTodo className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wide uppercase">Tasks</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-2xl transition-all duration-300 ${
              isActive ? 'text-cp-accent' : 'text-cp-text-secondary hover:text-cp-text-primary'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wide uppercase">Profile</span>
        </NavLink>

      </nav>
    </div>
  );
};

export default StudentLayout;
