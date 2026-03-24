import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../services/notifications';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data?.unread_count ?? 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const handleOpen = async () => {
    const opening = !isOpen;
    setIsOpen(opening);

    if (opening) {
      setLoading(true);
      try {
        const res = await getNotifications();
        // ← الحل: بنتعامل مع أي شكل للـ response
        const raw = res.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.results)
          ? raw.results
          : Array.isArray(raw?.data)
          ? raw.data
          : [];
        setNotifications(list);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'enrollment':  return '🎓';
      case 'new_content': return '📚';
      case 'reminder':    return '⏰';
      default:            return '🔔';
    }
  };

  const formatTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1)    return 'الآن';
    if (diff < 60)   return `${diff} دقيقة`;
    if (diff < 1440) return `${Math.floor(diff / 60)} ساعة`;
    return `${Math.floor(diff / 1440)} يوم`;
  };

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button className="bell-btn" onClick={handleOpen} aria-label="الإشعارات">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notif-dropdown-header">
            <h4>الإشعارات</h4>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="mark-all-btn">
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notif-empty">
                <div className="notif-spinner" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <span>🔔</span>
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                  onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                >
                  <span className="notif-icon">{getIcon(n.notification_type)}</span>
                  <div className="notif-content">
                    <p className="notif-title">{n.title}</p>
                    <p className="notif-message">{n.message}</p>
                    <span className="notif-time">{formatTime(n.created_at)}</span>
                  </div>
                  {!n.is_read && <span className="unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;