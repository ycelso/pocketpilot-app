'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export default function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  className = '' 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        currentY.current = startY.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        currentY.current = e.touches[0].clientY;
        const distance = Math.max(0, currentY.current - startY.current);
        
        if (distance > 0) {
          e.preventDefault();
          setPullDistance(distance);
          setIsPulling(distance > threshold);
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isPulling && pullDistance > threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull to refresh failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setPullDistance(0);
      setIsPulling(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, threshold, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        transform: `translateY(${Math.min(pullDistance * 0.5, threshold * 0.5)}px)`,
        transition: isRefreshing ? 'transform 0.3s ease' : 'none'
      }}
    >
      {/* Pull indicator */}
      <div 
        className={`absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity duration-200 ${
          pullDistance > 0 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          height: `${Math.min(pullDistance * 0.5, 60)}px`,
          transform: `translateY(-${Math.min(pullDistance * 0.5, 60)}px)`
        }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw 
            className={`w-5 h-5 transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{ 
              transform: isRefreshing ? 'rotate(360deg)' : `rotate(${rotation}deg)`
            }}
          />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Actualizando...' : 'Desliza para actualizar'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
