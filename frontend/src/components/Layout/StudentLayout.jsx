import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Calendar, Award, ListTodo, User } from 'lucide-react';

const StudentLayout = () => {
  return (
    <div className="mobile-container">
      
      {/* Scrollable page body */}
      <div className="flex-grow overflow-y-auto pb-24">
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="absolute bottom-0 left-0 right-0 h-18 bg-white/95 backdrop-blur-md border-t border-gray-150 flex items-center justify-around px-2 z-40">
        
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-1 w-14 h-14 rounded-2xl transition-all duration-300 ${
              isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
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
              isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
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
              isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
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
              isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
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
              isActive ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
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
