import React from 'react';
import { Link } from 'react-router-dom';
import BizConnectLogo from './BizConnectLogo';
import { MapPin, Compass, BarChart3, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Col 1: BizConnect Brand & Mission */}
          <div>
            <div className="flex items-center gap-2.5 text-white font-bold text-lg mb-3">
              <BizConnectLogo className="w-7 h-7" showText={false} />
              <span className="font-extrabold text-white text-base">BizConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering local businesses with transparent market intelligence, active promotion management, 
              and demand forecasting, while helping neighborhood customers discover trusted shops and exclusive deals.
            </p>
          </div>

          {/* Col 2: Platform Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400" />
              Platform Hubs
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>→</span> Explore Local Spots & Map
                </Link>
              </li>
              <li>
                <Link to="/dashboard/customer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>→</span> Customer Deals & Hub
                </Link>
              </li>
              <li>
                <Link to="/dashboard/owner" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>→</span> Business Owner Analytics
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>→</span> Admin Moderation Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Pilot Cluster & Live Status */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Pilot Cluster: Bengaluru
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Actively connecting Rajarajeshwari Nagar, RNSIT Campus, Kengeri, and Greater Bengaluru 
              with interactive Leaflet OpenStreetMap discovery and automated sentiment intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live & OpenStreetMap Connected
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 BizConnect. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Empowering Local Commerce with Real-time Discovery & Market Intelligence
          </p>
        </div>
      </div>
    </footer>
  );
}
