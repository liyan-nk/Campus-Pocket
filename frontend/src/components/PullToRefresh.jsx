import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const handleTouchStart = (e) => {
    // Only allow pull-down if scrolled to the absolute top
    if (window.scrollY === 0 && !refreshing) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPullingRef.current || refreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    
    // Only pull down
    if (diff > 0 && window.scrollY === 0) {
      if (e.cancelable) {
        e.preventDefault();
      }
      // Apply dragging resistance formula
      const dist = Math.min(diff * 0.4, 70);
      setPullDistance(dist);
    } else {
      isPullingRef.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    
    if (pullDistance >= 50 && onRefresh) {
      setRefreshing(true);
      setPullDistance(40);
      try {
        await onRefresh();
      } catch (e) {
        console.error('Refresh trigger failed:', e);
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[inherit]"
    >
      {/* PTR Loader Icon */}
      <div 
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-40"
        style={{
          transform: `translateY(${pullDistance}px)`,
          top: refreshing ? '10px' : '-35px',
          opacity: pullDistance > 10 || refreshing ? 1 : 0,
          transition: isPullingRef.current ? 'none' : 'transform 0.2s ease, opacity 0.2s ease'
        }}
      >
        <div className="bg-cp-surface border border-cp-border rounded-full p-2 shadow-md flex items-center justify-center">
          <Loader2 className={`w-4.5 h-4.5 text-cp-accent ${refreshing || pullDistance >= 50 ? 'animate-spin' : ''}`} />
        </div>
      </div>

      {/* Main wrapped elements */}
      <div 
        style={{
          transform: `translateY(${refreshing ? 40 : pullDistance}px)`,
          transition: isPullingRef.current ? 'none' : 'transform 0.2s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
