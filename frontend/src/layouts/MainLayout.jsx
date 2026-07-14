import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Github, Twitter, Linkedin, Facebook, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Standard user viewport layout with main navigation and premium footer aligned to grid.
 */
const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.newsletterEmail.value;
    if (email) {
      toast.success(`Subscribed successfully with ${email}!`);
      e.target.reset();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Main Page View */}
      <main className="flex-grow max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-8 w-full animate-fade-in">
        {!['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname) && !location.pathname.startsWith('/properties/') && (
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl border border-secondary-200/60 dark:border-secondary-800 text-secondary-500 hover:text-secondary-800 dark:hover:text-white hover:bg-secondary-50 dark:hover:bg-secondary-805 transition-all duration-200 shrink-0 shadow-premium-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-white dark:bg-secondary-900 border-t border-secondary-200/40 dark:border-secondary-800/80 transition-colors shrink-0">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Column 1: Info and Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="h-9 w-9 rounded-xl bg-primary-500 flex items-center justify-center text-secondary-900 font-extrabold text-2xl shadow-premium-sm">
                  S
                </span>
                <span className="text-xl font-extrabold tracking-tight text-secondary-900 dark:text-white">
                  Stay<span className="text-primary-700">Mate</span>
                </span>
              </div>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 leading-relaxed font-medium">
                StayMate simplifies accommodation search and roommate matching for students and young working professionals.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="text-secondary-400 hover:text-primary-600 transition-colors" aria-label="Twitter">
                  <Twitter className="h-4 w-4 stroke-[1.8]" />
                </a>
                <a href="#" className="text-secondary-400 hover:text-primary-600 transition-colors" aria-label="Facebook">
                  <Facebook className="h-4 w-4 stroke-[1.8]" />
                </a>
                <a href="#" className="text-secondary-400 hover:text-primary-600 transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4 stroke-[1.8]" />
                </a>
                <a href="#" className="text-secondary-400 hover:text-primary-600 transition-colors" aria-label="GitHub">
                  <Github className="h-4 w-4 stroke-[1.8]" />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h5 className="font-extrabold text-xs text-secondary-800 dark:text-secondary-200 uppercase tracking-widest mb-5">
                Explore
              </h5>
              <ul className="space-y-3.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Find Stays</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Find Roommates</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Verified Host details</a></li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div>
              <h5 className="font-extrabold text-xs text-secondary-800 dark:text-secondary-200 uppercase tracking-widest mb-5">
                Support
              </h5>
              <ul className="space-y-3.5 text-xs font-semibold text-secondary-500 dark:text-secondary-400">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="space-y-4">
              <h5 className="font-extrabold text-xs text-secondary-800 dark:text-secondary-200 uppercase tracking-widest mb-3">
                Join our newsletter
              </h5>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 leading-relaxed font-medium">
                Receive curated property recommendations and flatmate tips once a week.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  name="newsletterEmail"
                  placeholder="Enter email"
                  required
                  className="py-2.5 text-xs bg-secondary-50/50 border-secondary-200"
                />
                <Button type="submit" variant="primary" size="sm" className="px-4 shrink-0 font-bold">
                  Join
                </Button>
              </form>
            </div>
          </div>

          <div className="border-t border-secondary-200/50 dark:border-secondary-800/80 pt-8 text-center text-[10px] text-secondary-400 dark:text-secondary-500 font-bold uppercase tracking-wider">
            <p>© {new Date().getFullYear()} StayMate Inc. Made with passion for students and professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
