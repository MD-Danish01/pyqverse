"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
}: BottomSheetProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

 useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match the transition-duration from CSS

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaY = touchEndY - touchStartY.current;
    const deltaX = Math.abs(touchEndX - touchStartX.current);

    // If swipe is more vertical than horizontal and swiped down > 50px, close
    if (deltaY > 50 && deltaY > deltaX) {
      onClose();
    }
  };

  if (!isOpen && !isAnimating) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-40" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet Container */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white shadow-lg transition-transform duration-300 ease-out max-h-[70vh] ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        {title && (
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
};
