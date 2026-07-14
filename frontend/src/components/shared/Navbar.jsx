import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Avatar from '../ui/Avatar';
import Dropdown, { DropdownItem } from '../ui/Dropdown';
import Button from '../ui/Button';
import { 
  Menu, 
  X, 
  Compass, 
  Users, 
  LogOut, 
  Globe, 
  Bell, 
  Search,
  Building
} from 'lucide-react';
import { cn } from '@/utils/cn';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cityQuery, setCityQuery] = useState('');

  const [hideNavbar, setHideNavbar] = useState(false);

  // Monitor scroll state to toggle navbar shadow and details page visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Hide main navbar on details page when scrolled past gallery
      const isPropertiesDetails = location.pathname.includes('/properties/');
      if (isPropertiesDetails) {
        setHideNavbar(currentScrollY > 400);
      } else {
        setHideNavbar(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const getDashboardLink = (usr) => {
    const targetUser = usr || user;
    if (!targetUser) return '/login';
    if (targetUser.role === 'admin' || targetUser.role === 'moderator') return '/admin/dashboard';
    if (targetUser.role === 'owner') return '/owner/dashboard';
    if (targetUser.role === 'tenant') return '/tenant/dashboard';
    return '/profile';
  };

  const isActive = (path) => location.pathname === path;

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (!cityQuery.trim()) return;
    navigate(`/properties?city=${encodeURIComponent(cityQuery.trim())}`);
    setCityQuery('');
  };

  const getNavLinks = () => {
    if (!user) {
      // Guest
      return [
        { label: 'Stays', path: '/properties', icon: Compass },
        { label: 'Roommate Finder', path: '/roommates', icon: Users },
        { label: 'Become a Host', path: '/register?role=owner', icon: Building },
      ];
    }
    
    if (user.role === 'tenant') {
      return [
        { label: 'Stays', path: '/properties', icon: Compass },
        { label: 'Roommate Finder', path: '/roommates', icon: Users },
      ];
    }
    
    if (user.role === 'owner') {
      return [];
    }
    
    // Admin, Moderator:
    return [];
  };

  return (
    <nav
      className={cn(
        'sticky z-40 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-md transition-all duration-300 border-b border-transparent',
        hideNavbar ? 'top-[-85px]' : 'top-0',
        scrolled 
          ? 'shadow-premium-md border-secondary-200/40 dark:border-secondary-800/40 py-1' 
          : 'py-2'
      )}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className={cn(
          'flex justify-between items-center transition-all duration-300',
          scrolled ? 'h-[52px]' : 'h-[64px]'
        )}>
          <div className="flex items-center space-x-10 shrink-0">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 shrink-0 group">
              <span className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center text-secondary-900 font-extrabold text-2xl shadow-premium-sm transition-transform duration-300 group-hover:scale-105">
                S
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-secondary-900 dark:text-white">
                Stay<span className="text-primary-700 transition-colors group-hover:text-primary-600">Mate</span>
              </span>
            </Link>
 
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-10">
              {getNavLinks().map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
 
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'inline-flex items-center text-sm font-bold transition-all duration-200 hover:text-primary-650 dark:hover:text-primary-400 relative py-1.5 link-hover-underline',
                      active 
                        ? 'text-primary-650 dark:text-primary-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-650 dark:after:bg-primary-400 after:rounded-full after:scale-x-100' 
                        : 'text-secondary-600 dark:text-secondary-400'
                    )}
                  >
                    {Icon && <Icon className="h-4.5 w-4.5 mr-2 stroke-[1.8]" />}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Compact global search bar for Tenants - Center Aligned */}
          {user?.role === 'tenant' ? (
            <div className="hidden lg:flex justify-center items-center flex-grow mx-4">
              <form onSubmit={handleCitySearch} className="relative w-[450px] group">
                <input
                  type="text"
                  placeholder="Search city..."
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  className="w-full text-xs font-bold pl-5 pr-11 py-2 bg-secondary-50/50 hover:bg-secondary-100 dark:bg-secondary-950 dark:hover:bg-secondary-900 border border-secondary-200/60 dark:border-secondary-900 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-secondary-800 dark:text-secondary-100 placeholder-secondary-450 transition-all duration-200 h-[36px]"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-[4px] h-[28px] w-[28px] rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center text-secondary-900 hover:scale-105 active:scale-95 transition-all shadow-premium-sm"
                  title="Search"
                >
                  <Search className="h-3.5 w-3.5 text-secondary-900 stroke-[3]" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-grow" />
          )}
 
          <div className="hidden lg:flex items-center space-x-8 shrink-0">
            <ThemeToggle />

            {/* Notification Quick Icon */}
            {user && (
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className="p-2.5 rounded-full hover:bg-secondary-105 dark:hover:bg-secondary-800/80 text-secondary-600 dark:text-secondary-400 transition-colors relative"
                  title="Notifications"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="h-5 w-5 stroke-[1.8]" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary-600 animate-pulse" />
                </button>
              </div>
            )}

            {/* User Profile Menu */}
            {user ? (
              <Dropdown
                trigger={
                  <button className="flex items-center space-x-3 focus:outline-none group p-1 rounded-full border border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 hover:bg-secondary-100 dark:bg-secondary-900/50 dark:hover:bg-secondary-900 transition-all" aria-label="Open user menu">
                    <Avatar src={user.avatar} name={user.name} size="sm" className="border border-white/40 dark:border-secondary-800" />
                    <span className="text-sm font-extrabold text-secondary-800 dark:text-secondary-200 pr-2 max-w-[120px] truncate group-hover:text-primary-600 transition-colors">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                }
              >
                <div className="px-4 py-3 flex items-center space-x-3 border-b border-secondary-100 dark:border-secondary-800">
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-secondary-900 dark:text-white truncate leading-none">{user.name}</p>
                    <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 capitalize mt-1 tracking-wider">{user.role}</p>
                  </div>
                </div>
                <DropdownItem onClick={() => navigate('/profile')}>My Profile</DropdownItem>
                <DropdownItem onClick={() => navigate(getDashboardLink())}>Go to Dashboard</DropdownItem>
                <DropdownItem onClick={logout} danger className="border-t border-secondary-100 dark:border-secondary-800 flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownItem>
              </Dropdown>
            ) : (
              <div className="flex items-center space-x-3.5">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="primary" onClick={() => navigate('/register')} className="shadow-premium-sm">
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu triggers */}
          <div className="flex items-center lg:hidden space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-secondary-500 hover:bg-secondary-105 dark:hover:bg-secondary-800 focus:outline-none border border-secondary-200/50 dark:border-secondary-800"
            >
              {mobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 py-4 px-8 space-y-4 animate-fade-in">
          <div className="space-y-2">
            {getNavLinks().map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center px-4 py-2.5 rounded-[14px] text-base font-bold transition-colors',
                    active 
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400' 
                      : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                  )}
                >
                  {Icon && <Icon className="h-5 w-5 mr-3 text-secondary-400 stroke-[1.8]" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-secondary-200 dark:border-secondary-800 space-y-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 px-4 py-1">
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div>
                    <p className="text-sm font-extrabold text-secondary-900 dark:text-white leading-none">{user.name}</p>
                    <p className="text-xs text-secondary-450 truncate max-w-[200px] mt-1">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" size="sm" onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }} className="w-full">
                    My Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setMobileMenuOpen(false); navigate(getDashboardLink()); }} className="w-full">
                    Dashboard
                  </Button>
                </div>
                <Button variant="danger" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="w-full">
                  Sign In
                </Button>
                <Button variant="primary" onClick={() => { setMobileMenuOpen(false); navigate('/register'); }} className="w-full">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
