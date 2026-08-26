'use client';

import React, { useEffect } from 'react';

export default function ImageProtectionGuard() {
  useEffect(() => {
    // 1. Block Context Menu (Right-Click) globally on images and document
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Block Dragging images
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG' || e.target.tagName === 'CANVAS') {
        e.preventDefault();
        return false;
      }
    };

    // 3. Block Developer Tools & Inspect Shortcuts
    const handleKeyDown = (e) => {
      // F12 key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I or Cmd+Opt+I (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J or Cmd+Opt+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C or Cmd+Opt+C (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U or Cmd+Opt+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+S or Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
}
