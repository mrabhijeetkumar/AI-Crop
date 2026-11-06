import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Menu,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  Moon,
  Sun,
  CloudRain,
  TrendingUp,
  Sprout,
  Droplets,
  CheckCheck,
  Trash2,
  Layers,
  Sparkles,
  AlertTriangle,
  Info,
  X,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFarm } from '../context/FarmContext.jsx';
import { useNotifications } from '../context/NotificationContext';

export function Topbar({
  onOpenMobileMenu,
  onToggleMobileSidebar,
  onToggleSidebar,
  isSidebarOpen,
  isMobileSidebarOpen,
  onOpenQuickAction,
  setActiveTab: setTabProp,
  searchQuery: searchQueryProp,
  setSearchQuery: setSearchQueryProp,
}) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const farm = useFarm();
  const notifContext = useNotifications();

  // Unified notifications and farm tab handling
  const notifications = notifContext?.notifications || farm?.notifications || [];
  const unreadCount =
    notifContext?.unreadCount ??
    farm?.unreadNotificationCount ??
    notifications.filter((n) => !n.read).length;
  const markAsRead = notifContext?.markAsRead || farm?.markNotificationAsRead;
  const markAllAsRead = notifContext?.markAllAsRead || farm?.markAllNotificationsAsRead;
  const deleteNotification = notifContext?.deleteNotification || farm?.deleteNotification;
  const clearAllNotifications = notifContext?.clearAllNotifications || farm?.clearAllNotifications;
  const setActiveTab = setTabProp || farm?.setActiveTab || (() => {});
  const openQuickAction = farm?.openQuickAction || onOpenQuickAction;

  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = searchQueryProp !== undefined ? searchQueryProp : internalSearchQuery;
  const setSearchQuery = setSearchQueryProp || setInternalSearchQuery;

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const [searchFocused, setSearchFocused] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredNotifications = notifications.filter((n) =>
    notifFilter === 'unread' ? !n.read : true
  );

  const getNotifIcon = (notif) => {
    const type = notif?.type || '';
    const cat = (notif?.category || '').toLowerCase();
    const title = (notif?.title || '').toLowerCase();

    if (type === 'critical' || type === 'warning' || title.includes('alert') || title.includes('disease')) {
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    }
    if (type === 'weather' || cat.includes('weather') || title.includes('rain') || title.includes('weather')) {
      return <CloudRain className="w-4 h-4 text-cyan-400" />;
    }
    if (type === 'market' || cat.includes('market') || title.includes('mandi') || title.includes('price')) {
      return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    }
    if (type === 'soil' || cat.includes('soil') || title.includes('npk')) {
      return <Layers className="w-4 h-4 text-amber-400" />;
    }
    if (type === 'crop' || cat.includes('task') || title.includes('crop')) {
      return <Sprout className="w-4 h-4 text-green-400" />;
    }
    if (type === 'irrigation' || title.includes('moisture') || title.includes('water')) {
      return <Droplets className="w-4 h-4 text-blue-400" />;
    }
    return <Sparkles className="w-4 h-4 text-purple-400" />;
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read && markAsRead) {
      markAsRead(notif.id);
    }
    if (notif.actionTab) {
      setActiveTab(notif.actionTab);
      setNotificationsOpen(false);
    }
  };

  const handleQuickAddClick = () => {
    if (onOpenQuickAction) {
      onOpenQuickAction();
    } else if (openQuickAction) {
      openQuickAction('field');
    }
  };

  // Search quick suggestions navigation
  const searchQuickActions = [
    { title: 'AI Crop Disease Scan', tab: 'ai_crop_analysis', tag: 'Diagnosis' },
    { title: 'Mandi Market Intelligence', tab: 'market_intelligence', tag: 'Live Rates' },
    { title: 'Weather & Microclimate', tab: 'weather', tag: 'Advisory' },
    { title: 'Precision Soil Health & NPK', tab: 'soil_health', tag: 'Sensors' },
    { title: 'My Farm Fields & Plots', tab: 'my_farm', tag: 'Estate' },
    { title: 'AI Farm Advisor Consultation', tab: 'ai_advisor', tag: 'Dr. Krishi' },
    { title: 'Seasonal Reports & PDF Exports', tab: 'reports', tag: 'Analytics' },
    { title: 'Settings & Farm Profile', tab: 'settings', tag: 'Configuration' },
  ];

  const filteredSearchSuggestions = searchQuickActions.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tab.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSelect = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSearchFocused(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (filteredSearchSuggestions.length > 0) {
        handleSearchSelect(filteredSearchSuggestions[0].tab);
      }
    } else if (e.key === 'Escape') {
      setSearchFocused(false);
    }
  };

  const mobileToggleHandler = onToggleSidebar || onToggleMobileSidebar || onOpenMobileMenu || (() => {});

  const currentUserName = user?.name || 'Abhijeet';
  const currentUserRole = user?.role || 'Senior Precision Farm Manager';
  const currentUserEmail = user?.email || 'abhijeet@agri-profit.in';
  const currentUserAvatar = user?.avatar || '';

  const activeUnreadCount = unreadCount > 0 ? unreadCount : (notifications.filter((n) => !n.read).length || 4);

  return (
    <header
      id="app-topbar"
      className="sticky top-0 z-40 h-[68px] w-full bg-slate-50/85 dark:bg-[#000000]/90 backdrop-blur-xl border-b border-slate-300/80 dark:border-white/[0.08] text-slate-900 dark:text-white shadow-xs transition-colors duration-200"
    >
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-14 h-full flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: 3-Lines Navigation Menu Button & Global Search Bar */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
        <button
          id="topbar-nav-menu-btn"
          onClick={mobileToggleHandler}
          className="w-10 h-10 rounded-full border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] hover:bg-slate-50 dark:hover:bg-[#181818] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 flex flex-col items-center justify-center gap-[4px] transition-all duration-200 cursor-pointer shadow-xs group shrink-0"
          aria-label="Toggle navigation drawer"
          title="Open Menu (3 lines)"
        >
          <span className="w-4 h-[2px] bg-slate-600 dark:bg-neutral-300 rounded-full transition-all duration-200 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400 group-hover:w-4.5" />
          <span className="w-4 h-[2px] bg-slate-600 dark:bg-neutral-300 rounded-full transition-all duration-200 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400" />
          <span className="w-4 h-[2px] bg-slate-600 dark:bg-neutral-300 rounded-full transition-all duration-200 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400 group-hover:w-4.5" />
        </button>

        {/* Brand Logo in Topbar */}
        <div
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0 mr-1 sm:mr-3"
          title="Go to Dashboard"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-xs">
            <Sprout className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="hidden sm:block leading-none">
            <span className="text-[15px] font-bold font-heading tracking-tight block text-slate-900 dark:text-white">
              AI Crop <span className="text-emerald-600 dark:text-emerald-400">Profit</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium">
              Precision Agro
            </span>
          </div>
        </div>

        <div ref={searchRef} className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            id="topbar-search-input"
            type="text"
            placeholder="Search fields, crops, mandi rates, soil health..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-10 pr-12 py-2 rounded-full border border-slate-300 dark:border-white/10 bg-white dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-[13px] outline-none focus:bg-white dark:focus:bg-[#0F0F0F] focus:border-emerald-500 dark:focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all duration-200"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-neutral-500 dark:hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium rounded-full border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none select-none">
              ⌘K
            </kbd>
          )}

          {/* Search Dropdown Panel */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white shadow-2xl p-2 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center justify-between border-b border-slate-100 dark:border-white/10 mb-1">
                <span>Quick Modules & Navigation</span>
                <span className="font-normal text-[9px] lowercase">Press Enter to select</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {filteredSearchSuggestions.length > 0 ? (
                  filteredSearchSuggestions.map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => handleSearchSelect(item.tab)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="font-medium truncate">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-neutral-400 shrink-0">
                        {item.tag}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 dark:text-neutral-500">
                    No modules matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Light / Dark Mode Toggle */}
        <button
          id="topbar-theme-toggle-btn"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] hover:bg-slate-50 dark:hover:bg-[#181818] hover:border-amber-400/50 text-amber-500 dark:text-amber-400 transition-all cursor-pointer flex items-center justify-center shadow-xs"
          aria-label="Toggle theme"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4.5 h-4.5 text-amber-400 animate-in spin-in-180" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-700 animate-in spin-in-180" />
          )}
        </button>

        {/* Live Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            id="topbar-notifications-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative w-10 h-10 rounded-full border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] hover:bg-slate-50 dark:hover:bg-[#181818] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-xs"
            aria-label="Notifications"
            title="System & Farm Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {activeUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {activeUnreadCount > 9 ? '9+' : activeUnreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Menu */}
          {notificationsOpen && (
            <div
              id="topbar-notifications-dropdown"
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white shadow-2xl p-3.5 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14px]">Notifications</span>
                  {activeUnreadCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                      {activeUnreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeUnreadCount > 0 && (
                    <button
                      id="notif-mark-all-read-btn"
                      onClick={markAllAsRead}
                      className="text-[11.5px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`text-[11.5px] font-medium px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    notifFilter === 'all'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('unread')}
                  className={`text-[11.5px] font-medium px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    notifFilter === 'unread'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  Unread ({activeUnreadCount})
                </button>
              </div>

              {/* Notifications List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="w-8 h-8 mx-auto opacity-30 text-emerald-500 mb-2" />
                    <p className="text-[13px] text-slate-500 dark:text-neutral-400 font-medium">No notifications right now</p>
                    <p className="text-[11.5px] text-slate-400 dark:text-neutral-500">Weather alerts and farm updates will appear here</p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                        !n.read
                          ? isDarkMode
                            ? 'bg-emerald-950/30 border-emerald-500/30 hover:bg-emerald-950/50'
                            : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
                          : isDarkMode
                          ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                          : 'bg-slate-50/80 border-slate-200/60 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 shrink-0 mt-0.5">
                          {getNotifIcon(n)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-semibold text-[13px] truncate text-emerald-700 dark:text-emerald-400">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-neutral-500 shrink-0">{n.time || n.timestamp}</span>
                          </div>
                          <p className="text-[12px] text-slate-600 dark:text-neutral-300 leading-snug line-clamp-2">{n.message}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (deleteNotification) deleteNotification(n.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-slate-400 dark:text-neutral-500 transition-opacity cursor-pointer"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Footer */}
              {notifications.length > 0 && (
                <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11.5px]">
                  <button
                    onClick={() => clearAllNotifications && clearAllNotifications()}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                  <span className="text-slate-400 dark:text-neutral-500 text-[11px] flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                    Synced with cloud DB
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <button
          id="topbar-quick-add-btn"
          onClick={handleQuickAddClick}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Quick Actions (Add Field, Add Farm, New Scan)"
        >
          <Plus className="w-5 h-5 stroke-[2.8]" />
        </button>

        {/* User Profile Chip / Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="topbar-user-profile-chip"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 py-1 px-1.5 pr-3.5 rounded-full border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] hover:bg-slate-50 dark:hover:bg-[#181818] shadow-xs transition-all select-none cursor-pointer group"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-emerald-950/30 dark:bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center shrink-0">
              {currentUserAvatar ? (
                <img
                  src={currentUserAvatar}
                  alt={currentUserName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  {currentUserName ? currentUserName.charAt(0) : 'A'}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] font-bold leading-tight text-slate-900 dark:text-white">
                {currentUserName}
              </span>
              <span className="text-[10px] leading-tight font-medium text-slate-500 dark:text-neutral-400">
                {currentUserRole}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-neutral-400 group-hover:text-slate-600 dark:group-hover:text-neutral-200 ${profileDropdownOpen ? 'rotate-180' : ''} transition-transform duration-200`} />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div
              id="topbar-profile-dropdown"
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white shadow-2xl p-2.5 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 mb-1">
                <p className="text-[13px] font-bold text-slate-900 dark:text-white">{currentUserName}</p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">{currentUserEmail}</p>
              </div>

              <button
                id="profile-dropdown-settings"
                onClick={() => {
                  setActiveTab('settings');
                  setProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Profile & Settings</span>
              </button>

              <button
                id="profile-dropdown-security"
                onClick={() => {
                  setActiveTab('settings');
                  setProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Database & Security</span>
              </button>

              <button
                id="profile-dropdown-estate"
                onClick={() => {
                  setActiveTab('farm');
                  setProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
              >
                <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>My Farm Estate</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-white/10" />

              {isAuthenticated ? (
                <button
                  id="profile-dropdown-logout"
                  onClick={() => {
                    logout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              ) : (
                <button
                  id="profile-dropdown-login"
                  onClick={() => {
                    if (openAuthModal) {
                      openAuthModal('login');
                    } else {
                      setActiveTab('settings');
                    }
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-all cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In / Switch User</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
  );
}

export default Topbar;

