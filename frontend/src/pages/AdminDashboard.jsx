import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Building2,
  Users,
  MessageSquare,
  Tag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Search,
  Filter,
  Check,
  Ban,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('businesses'); // 'businesses', 'users', 'reviews', 'metrics'
  const [metrics, setMetrics] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [m, b, u, r] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminBusinesses(),
        api.getAdminUsers(),
        api.getAdminReviews()
      ]);
      setMetrics(m);
      setBusinesses(b.businesses || []);
      setUsersList(u.users || []);
      setReviewsList(r.reviews || []);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Business status actions
  const handleToggleBusinessStatus = async (bizId, currentSuspended) => {
    try {
      await api.updateBusinessStatus(bizId, { is_suspended: !currentSuspended });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  // User status action
  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      await api.toggleUserStatus(userId, !currentActive);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update user');
    }
  };

  // Review moderation
  const handleToggleReviewHide = async (reviewId, currentHidden) => {
    try {
      await api.moderateReview(reviewId, { is_hidden: !currentHidden });
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to moderate review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Permanently delete this customer review?")) {
      try {
        await api.deleteReview(reviewId);
        fetchAdminData();
      } catch (err) {
        alert(err.message || 'Failed to delete review');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-purple-800/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-400/20">
            <ShieldCheck className="w-4 h-4" /> System Administrator Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            BizConnect Control & Moderation Center
          </h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Oversee all registered merchants, customers, content moderation, and platform activity metrics across BizConnect.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <Activity className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.total_users || 0}</p>
          <span className="text-[10px] text-slate-500">{metrics?.owners_count} owners / {metrics?.customers_count} customers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Businesses</span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{metrics?.total_businesses || 0}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{metrics?.active_businesses} active</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Reviews</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{metrics?.total_reviews || 0}</p>
          <span className="text-[10px] text-slate-500">Sentiment analyzed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Deals</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics?.total_offers || 0}</p>
          <span className="text-[10px] text-slate-500">Offers & events</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Search Queries</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{metrics?.total_searches || 0}</p>
          <span className="text-[10px] text-slate-500">In demand engine</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Store Views</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{metrics?.total_views || 0}</p>
          <span className="text-[10px] text-slate-500">Store visits logged</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 gap-2 pb-1">
        {[
          { id: 'businesses', label: `Businesses (${businesses.length})`, icon: Building2 },
          { id: 'users', label: `Users (${usersList.length})`, icon: Users },
          { id: 'reviews', label: `Review Moderation (${reviewsList.length})`, icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BUSINESSES MANAGEMENT */}
      {activeTab === 'businesses' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">All Registered Businesses</h3>
              <p className="text-xs text-slate-500">Approve new listings or suspend non-compliant merchants.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Business Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Owner Info</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Listing Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{b.name}</div>
                      <div className="text-[10px] text-slate-400">{b.address}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{b.owner_name}</div>
                      <div className="text-[10px] text-slate-400">{b.owner_email}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-500">
                      ★ {b.average_rating || 0}
                    </td>
                    <td className="py-3 px-3">
                      {b.is_suspended ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Active & Approved
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleBusinessStatus(b.id, b.is_suspended)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          b.is_suspended
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {b.is_suspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">User Accounts</h3>
              <p className="text-xs text-slate-500">Manage customer and merchant accounts.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">User Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3 text-slate-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'business_owner'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            u.is_active
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Customer Review Moderation</h3>
              <p className="text-xs text-slate-500">
                Inspect NLP sentiment scores and hide or delete offensive/inappropriate reviews.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {reviewsList.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{r.user_name}</span>
                    <span className="text-[10px] text-slate-400">on {r.business_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      r.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {r.sentiment} ({r.sentiment_score * 100}%)
                    </span>
                    <span className="text-amber-500 font-bold text-xs">★ {r.rating}</span>
                  </div>
                  {r.title && <h5 className="font-bold text-slate-800 text-xs">{r.title}</h5>}
                  <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleReviewHide(r.id, r.is_hidden)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      r.is_hidden
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    {r.is_hidden ? 'Unhide' : 'Hide from Public'}
                  </button>

                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
