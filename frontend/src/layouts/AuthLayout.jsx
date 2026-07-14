import React from 'react';
import { Outlet, Link } from 'react-router-dom';

/**
 * Split-screen layout wrapper for registration and logins
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-white dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100 transition-colors">
      {/* Forms Area (Left Column) */}
      <div className="flex-1 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-16 xl:px-20 bg-secondary-50/40 dark:bg-secondary-950">
        <div className="mx-auto w-full max-w-md bg-white dark:bg-secondary-900 p-5 sm:p-10 border border-secondary-200/50 dark:border-secondary-800/80 rounded-[24px] shadow-premium-lg transition-colors">
          {/* Logo link */}
          <div className="mb-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <span className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center text-secondary-900 font-extrabold text-2xl shadow-premium-sm transition-transform duration-300 group-hover:scale-105">
                S
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-secondary-900 dark:text-white">
                Stay<span className="text-primary-700 transition-colors group-hover:text-primary-600">Mate</span>
              </span>
            </Link>
          </div>

          <Outlet />
        </div>
      </div>

      {/* Visual illustration Column (Right Column - hidden on mobile/tablet) */}
      <div className="hidden lg:block relative flex-1 bg-primary-950">
        {/* Background gradient overlay overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-950 via-primary-900 to-secondary-950 opacity-90 z-10" />
        <img
          className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
          src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
          alt="Modern shared bedroom flat layout"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-16 text-white">
          {/* Top part: branding logo or floating badge */}
          <div className="flex justify-between items-start">
            <Link to="/" className="flex items-center space-x-3 group">
              <span className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center text-secondary-900 font-extrabold text-2xl shadow-premium-sm transition-transform duration-300 group-hover:scale-105">
                S
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Stay<span className="text-primary-400">Mate</span>
              </span>
            </Link>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Verified Members
            </div>
          </div>

          {/* Bottom part: info block with a floating card widget */}
          <div className="max-w-2xl space-y-6">
            {/* Floating glassmorphic widget card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-premium-lg flex items-center gap-4 max-w-sm animate-fade-in">
              <div className="h-11 w-11 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 shrink-0">
                <svg className="h-6 w-6 stroke-[1.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-white uppercase tracking-wider">Verified Badging</p>
                <p className="text-[11px] text-primary-200/90 leading-normal font-medium">Every roommate profile and listing is verified by our team.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black leading-tight tracking-tight">
                Find your perfect stay.<br />
                Find your perfect roommate.
              </h2>
              <p className="text-primary-200/90 text-sm leading-relaxed font-medium max-w-lg">
                StayMate brings verified listings and compatible roommates under a single ecosystem, designed for students and working professionals.
              </p>
              <div className="w-12 h-1 bg-primary-500 rounded mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
