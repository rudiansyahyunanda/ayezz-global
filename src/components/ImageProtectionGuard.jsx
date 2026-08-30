'use client';

import React, { useEffect, useState } from 'react';

export default function ImageProtectionGuard() {
  const [isBlackout, setIsBlackout] = useState(false);

  useEffect(() => {
    let blackoutTimer = null;

    const triggerBlackout = () => {
      setIsBlackout(true);

      // Attempt to clear clipboard so pasted screenshot is blank
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {});
        }
      } catch (err) {
        // Ignore clipboard permission errors
      }

      if (blackoutTimer) clearTimeout(blackoutTimer);
      blackoutTimer = setTimeout(() => {
        setIsBlackout(false);
      }, 3000);
    };

    // 1. Detect PrintScreen and OS Screenshot Shortcuts
    const handleKeyDown = (e) => {
      // PrintScreen Key
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        triggerBlackout();
        e.preventDefault();
        return false;
      }

      // Windows + Shift + S or Ctrl + Shift + S (Snipping Tool)
      if ((e.key === 's' || e.key === 'S') && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        triggerBlackout();
      }

      // Mac Screenshot Shortcuts: Cmd + Shift + 3 / 4 / 5
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        triggerBlackout();
      }

      // Block Developer Tools & View Source
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && ['U', 'u', 'S', 's', 'P', 'p'].includes(e.key))
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        triggerBlackout();
      }
    };

    // Block Context Menu (Right-Click) & Image Dragging
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
      if (blackoutTimer) clearTimeout(blackoutTimer);
    };
  }, []);

  // Dynamically add/remove blackout class to body
  useEffect(() => {
    if (isBlackout) {
      document.body.classList.add('screenshot-blackout');
    } else {
      document.body.classList.remove('screenshot-blackout');
    }
  }, [isBlackout]);

  return null;
}
