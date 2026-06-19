/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Award, Menu, X, LogIn, LogOut, RefreshCw, User } from "lucide-react";

interface HeaderProps {
  onReset: () => void;
  onOpenAuth: () => void;
  user: { email: string; displayName?: string } | null;
  onSignOut: () => void;
}

export default function Header({ onReset, onOpenAuth, user, onSignOut }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the drop-down on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (currentUser: { email: string; displayName?: string }) => {
    if (currentUser.displayName) {
      const parts = currentUser.displayName.trim().split(/\s+/);
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return currentUser.displayName.substring(0, 2).toUpperCase();
    }
    return currentUser.email ? currentUser.email.substring(0, 2).toUpperCase() : "CV";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass-nav">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Name */}
        <div 
          onClick={() => {
            onReset();
            setIsOpen(false);
          }} 
          className="flex cursor-pointer items-center space-x-2.5 transition active:scale-95"
          id="header-logo-container"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              CV Insight <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">AI</span>
            </span>
            <span className="block text-[9px] font-mono tracking-wider text-slate-400 uppercase">
              Recruiter-Grade Audit
            </span>
          </div>
        </div>

        {/* Stats/Badges & Burger Menu Dropdown */}
        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          <div className="hidden items-center space-x-1.5 rounded-full border border-blue-500/15 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300 sm:flex">
            <Award className="h-3 w-3" />
            <span>SmartSoftware powered</span>
          </div>

          {/* Simple Dynamic Burger Button with Transition */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 hover:border-white/15 transition duration-200 cursor-pointer focus:outline-none"
            aria-label="Toggle menu"
            id="burger-menu-btn"
          >
            {isOpen ? <X className="h-5 w-5 animate-spin-once" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Floating Dropdown List */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl z-50 text-left animate-in fade-in slide-in-from-top-1">
              
              {/* Conditional user identification */}
              {user && (
                <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-300">
                      {getInitials(user)}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-white leading-normal truncate">
                        {user.displayName || "Professional"}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 truncate leading-snug">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Options */}
              <button
                onClick={() => {
                  onReset();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-xs text-left transition cursor-pointer font-medium"
              >
                <RefreshCw className="h-4 w-4 text-emerald-400" />
                <span>New Resume Audit</span>
              </button>

              {/* Auth / Log Out button */}
              {user ? (
                <button
                  onClick={() => {
                    onSignOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs text-left transition cursor-pointer font-semibold mt-1"
                >
                  <LogOut className="h-4 w-4 text-red-400" />
                  <span>Sign Out Securely</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs text-left transition cursor-pointer font-semibold mt-1"
                >
                  <LogIn className="h-4 w-4 text-blue-400" />
                  <span>Access / Sign Up</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
