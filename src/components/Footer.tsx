/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Cpu, Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-8 mt-auto relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center space-x-2 text-slate-400">
            <Cpu className="h-4 w-4 text-blue-400 animate-pulse" />
            <span className="text-xs font-semibold font-mono">Powered by SmartSoftware solutions</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-400 font-mono">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs">Secure AES-256 data transit. No document retention.</span>
          </div>

          <p className="text-xs text-slate-500 font-mono">
            &copy; {new Date().getFullYear()} SmartSoftware solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
