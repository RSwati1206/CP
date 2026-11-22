import React from 'react';
import { Store, Heart, GraduationCap, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Col 1 */}
          <div>
            <div className="flex items-center gap-2.5 text-white font-bold text-lg mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Store className="w-4 h-4" />
              </div>
              <span>LocalMarket Analytics Portal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An affordable, unified platform empowering local shopkeepers with data analytics, 
              sentiment intelligence, and competitive insights, while helping local consumers discover 
              trusted neighborhood businesses and exclusive offers.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              Academic Project Synopsis
            </h4>
            <div className="text-xs space-y-1.5 text-slate-400">
              <p className="font-medium text-slate-300">RNS Institute of Technology (RNSIT)</p>
              <p>Department of Computer Science & Engineering</p>
              <p className="pt-1">
                <span className="text-slate-300 font-medium">Guide:</span> Dr. Prakash S, Associate Professor
              </p>
              <p>
                <span className="text-slate-300 font-medium">Project Team:</span> R. Swati [1IB25CS165], Priya Javalagi [1IB25CS160], Roshni [1IB25CS178], Piyush Bhati [1RN26CS840-T]
              </p>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Pilot Cluster: Bengaluru
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Serving Rajarajeshwari Nagar, RNSIT Campus, Kengeri, Banashankari, and Greater Bengaluru 
              with interactive Leaflet OpenStreetMap tiles, automated sentiment classification, and demand forecasting.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live & OpenStreetMap Connected
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Local Business Promotion and Market Analytics Portal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with React, Flask, PostgreSQL, Python ML & Leaflet
          </p>
        </div>
      </div>
    </footer>
  );
}
