/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Lock, Mail, User, ShieldAlert, CheckCircle } from "lucide-react";
import { auth } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";

interface AuthModalProps {
  onClose: () => void;
  isOpen: boolean;
  onAuthSuccess: (user: { email: string; displayName?: string } | null) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorText(null);
    setSuccessText(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      
      setSuccessText(`Logged in successfully with Google!`);
      const sessionUser = { email: u.email || "", displayName: u.displayName || "Google Professional" };
      localStorage.setItem("local_current_user", JSON.stringify(sessionUser));
      
      onAuthSuccess(sessionUser);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrorText(err.message || "Could not complete Google authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error("Email and password are required.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error("Please enter your full name.");
        }

        // Firebase Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await updateProfile(userCredential.user, {
          displayName: fullName.trim()
        });

        const sessionUser = { 
          email: normalizedEmail, 
          displayName: fullName.trim() 
        };
        localStorage.setItem("local_current_user", JSON.stringify(sessionUser));

        setSuccessText(`Welcome ${fullName.trim()}! Your account is safe and active.`);
        onAuthSuccess(sessionUser);
        
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        // Firebase Login path
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const displayName = userCredential.user.displayName || "Active Professional";

        const sessionUser = { 
          email: normalizedEmail, 
          displayName 
        };
        localStorage.setItem("local_current_user", JSON.stringify(sessionUser));

        setSuccessText(`Welcome back, ${displayName}!`);
        onAuthSuccess(sessionUser);

        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      let msg = err.message || "An authentication error occurred.";
      if (err.code === "auth/email-already-in-use") {
        msg = "An account already exists with this email address.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        msg = "Incorrect email address or wrong password.";
      } else if (err.message && err.message.includes("auth/operation-not-allowed")) {
        msg = "Email/Password sign-in has not been enabled in the Firebase Console yet. Please ensure this provider is enabled or use Google Single Sign-On.";
      }
      setErrorText(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="glass rounded-2xl w-full max-w-md border border-white/10 overflow-hidden relative shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="h-10 w-10 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {isSignUp ? "Create CV Insight AI Account" : "Access Candidate Portal"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Store analysis history, compare scores, and apply premium ATS templates.
          </p>
        </div>

        {/* Info alerts */}
        {errorText && (
          <div className="mb-4 p-3 bg-red-500/15 border border-red-500/20 text-red-200 text-xs rounded-xl flex items-start gap-2 text-left">
            <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        {successText && (
          <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-200 text-xs rounded-xl flex items-start gap-2 text-left">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successText}</span>
          </div>
        )}

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Your Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="E.g. Ian Kariri"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950/40 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-600"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ian@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950/40 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950/40 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Authenticating securely..." : isSignUp ? "Sign Up Free" : "Sign In Securely"}
          </button>
        </form>

        {/* Brand Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 text-slate-400 font-mono text-[10px]">Or continue with federated ID</span>
          </div>
        </div>

        {/* Google Single Sign-On Access */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-100 hover:text-white font-bold text-xs rounded-xl transition duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Single Sign-On with Google</span>
        </button>

        {/* Toggle between In/Up */}
        <div className="mt-5 text-center text-xs text-slate-400">
          <span>{isSignUp ? "Already registered?" : "New to CareerPath AI?"} </span>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorText(null);
            }}
            className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline focus:outline-none"
          >
            {isSignUp ? "Sign In Area" : "Register Credentials"}
          </button>
        </div>

      </div>
    </div>
  );
}
