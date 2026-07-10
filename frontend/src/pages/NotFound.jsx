import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Map } from 'lucide-react';

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBackToCampus = () => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/cp-control');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-cp-bg flex flex-col items-center justify-center p-6 text-center select-none">
      
      {/* 404 Themed Content Card */}
      <div className="bg-cp-surface border border-cp-border rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-sm flex flex-col items-center">
        
        {/* Animated map icon */}
        <div className="w-14 h-14 bg-cp-accent-light rounded-2xl flex items-center justify-center border border-cp-border text-cp-accent animate-bounce">
          <Map className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display font-extrabold text-3xl text-cp-text-primary tracking-tight leading-none">
            404
          </h1>
          <p className="text-xs font-bold text-cp-accent uppercase tracking-wider">
            Looks like you skipped this class 😅
          </p>
          <p className="text-[10px] text-cp-text-secondary font-medium px-4">
            This page doesn't exist in Campus Pocket.
          </p>
        </div>

        {/* Redirect action button */}
        <button
          onClick={handleBackToCampus}
          className="w-full py-3 bg-cp-accent hover:opacity-90 active:scale-98 text-cp-text-on-accent font-display font-bold text-xs rounded-2xl transition-all shadow-md cursor-pointer border border-transparent"
        >
          Back to Campus
        </button>

      </div>

    </div>
  );
};

export default NotFound;
