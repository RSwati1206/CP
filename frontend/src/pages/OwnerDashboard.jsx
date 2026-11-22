import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LeafletMap from '../components/LeafletMap';
import DealBadge from '../components/DealBadge';
import ScrollReveal from '../components/ScrollReveal';

// Chart.js imports & registrations
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Users,
  Eye,
  Search,
  Star,
  Tag,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Percent,
  Check,
  Building2
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function OwnerDashboard() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'sentiment', 'demand', 'competitors', 'offers', 'profile'
  const [business, setBusiness] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Offers state
  const [offers, setOffers] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    discount_code: '',
    discount_percent: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_event: false,
    banner_url: ''
  });
  const [editingOfferId, setEditingOfferId] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    category: 'Restaurants & Cafes',
    description: '',
    address: '',
    city: 'Bengaluru',
    latitude: 12.8988,
    longitude: 77.5186,
    phone: '',
    email: '',
    website: '',
    opening_hours: '',
    image_url: '',
    tags: ''
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Fetch Owner's business and analytics
  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      const myBizRes = await api.getMyBusiness();
      if (myBizRes.business) {
        const b = myBizRes.business;
        setBusiness(b);
        setProfileForm({
          name: b.name || '',
          category: b.category || 'Restaurants & Cafes',
          description: b.description || '',
          address: b.address || '',
          city: b.city || 'Bengaluru',
          latitude: b.latitude || 12.8988,
          longitude: b.longitude || 77.5186,
          phone: b.phone || '',
          email: b.email || '',
          website: b.website || '',
          opening_hours: b.opening_hours || '',
          image_url: b.image_url || '',
          tags: Array.isArray(b.tags) ? b.tags.join(', ') : (b.tags || '')
        });

        // Load detailed analytics
        const analyticsRes = await api.getOwnerAnalytics(b.id);
        setAnalytics(analyticsRes);
        setOffers(analyticsRes.offers_performance || []);
      }
    } catch (err) {
      console.error("Failed to fetch owner data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  // Save profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    try {
      if (business) {
        await api.updateBusiness(business.id, profileForm);
        setProfileSuccessMsg('Business profile successfully updated!');
      } else {
        const res = await api.createBusiness(profileForm);
        setBusiness(res.business);
        setProfileSuccessMsg('Business profile successfully registered!');
      }
      fetchOwnerData();
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  // Create or Update Offer
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      if (editingOfferId) {
        await api.updateOffer(editingOfferId, offerForm);
      } else {
        await api.createOffer({
          ...offerForm,
          business_id: business.id
        });
      }
      setShowOfferModal(false);
      setEditingOfferId(null);
      setOfferForm({
        title: '',
        description: '',
        discount_code: '',
        discount_percent: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_event: false,
        banner_url: ''
      });
      fetchOwnerData();
    } catch (err) {
      alert(err.message || 'Failed to save offer');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (window.confirm("Are you sure you want to remove this promotion?")) {
      await api.deleteOffer(id);
      fetchOwnerData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Business Intelligence & Market Metrics...</p>
        </div>
      </div>
    );
  }

  // Fallback if no business created yet
  if (!business && activeTab !== 'profile') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-slate-900">Set Up Your Business Profile</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          To start promoting your shop, managing deals, and analyzing customer trends, create your business listing.
        </p>
        <button
          onClick={() => setActiveTab('profile')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          Create Business Profile Now
        </button>
      </div>
    );
  }

  // --- Chart Data Configurations ---

  // 1. Views & Searches Trend
  const trendData = {
    labels: analytics?.views_searches_trend?.labels || [],
    datasets: [
      {
        label: 'Store Views',
        data: analytics?.views_searches_trend?.views || [],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5
      },
      {
        label: 'Search Impressions',
        data: analytics?.views_searches_trend?.searches || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: true,
        tension: 0.35,
        borderWidth: 2
      }
    ]
  };

  // 2. Ratings Distribution
  const ratingsBarData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Reviews Count',
        data: analytics?.ratings_breakdown?.counts || [0, 0, 0, 0, 0],
        backgroundColor: ['#f87171', '#fb923c', '#facc15', '#a3e635', '#4ade80'],
        borderRadius: 8
      }
    ]
  };

  // 3. Sentiment Doughnut
  const sentimentDoughnutData = {
    labels: ['Positive Sentiment', 'Negative Sentiment'],
    datasets: [
      {
        data: [
          analytics?.sentiment_analytics?.positive_count || 1,
          analytics?.sentiment_analytics?.negative_count || 0
        ],
        backgroundColor: ['#10b981', '#f43f5e'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // 4. Sentiment Trend Line
  const sentimentTrendData = {
    labels: analytics?.sentiment_analytics?.trend?.labels || [],
    datasets: [
      {
        label: 'Positive Feedback',
        data: analytics?.sentiment_analytics?.trend?.positive || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Negative Feedback',
        data: analytics?.sentiment_analytics?.trend?.negative || [],
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.15)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  // 5. Time-of-Day Demand
  const timeDemandData = {
    labels: analytics?.demand_insights?.time_of_day?.labels || [],
    datasets: [
      {
        label: 'Customer Engagement',
        data: analytics?.demand_insights?.time_of_day?.data || [],
        backgroundColor: '#6366f1',
        borderRadius: 8
      }
    ]
  };

  // 6. Day-of-Week Demand
  const dayDemandData = {
    labels: analytics?.demand_insights?.day_of_week?.labels || [],
    datasets: [
      {
        label: 'Weekly Customer Traffic',
        data: analytics?.demand_insights?.day_of_week?.data || [],
        backgroundColor: '#0ea5e9',
        borderRadius: 8
      }
    ]
  };

  // 7. Competitor Radar
  const competitorRadarData = {
    labels: analytics?.competitor_comparison?.radar_chart?.labels || [],
    datasets: [
      {
        label: business?.name || 'Your Business',
        data: analytics?.competitor_comparison?.radar_chart?.your_business || [],
        backgroundColor: 'rgba(16, 185, 129, 0.25)',
        borderColor: '#10b981',
        pointBackgroundColor: '#10b981',
        borderWidth: 2
      },
      {
        label: 'Area Category Average',
        data: analytics?.competitor_comparison?.radar_chart?.category_average || [],
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderColor: '#94a3b8',
        pointBackgroundColor: '#94a3b8',
        borderWidth: 1.5
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Business Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <img 
            src={business?.image_url} 
            alt={business?.name} 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {business?.category}
              </span>
              <span className="text-xs text-slate-300 font-medium">📍 {business?.city}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {business?.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl truncate">
              {business?.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`/business/${business?.id}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-colors"
          >
            Preview Customer View ↗
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Analytics', icon: BarChart3 },
          { id: 'sentiment', label: 'Sentiment Intelligence', icon: MessageSquare },
          { id: 'demand', label: 'Trend & Demand Insights', icon: TrendingUp },
          { id: 'competitors', label: 'Competitor Benchmark', icon: Users },
          { id: 'offers', label: 'Offers & Promotions', icon: Tag },
          { id: 'profile', label: 'Store Profile & Map Pin', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & CORE ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Store Views</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{analytics?.kpis?.total_views || 0}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">↑ Past 14 days</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Search Impressions</span>
                <Search className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{analytics?.kpis?.search_appearances || 0}</p>
              <span className="text-[10px] text-indigo-600 font-semibold">Local customer queries</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Average Rating</span>
                <Star className="w-4 h-4 text-amber-500 fill-current" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{analytics?.kpis?.average_rating || 0}★</p>
              <span className="text-[10px] text-slate-500">{analytics?.kpis?.total_reviews || 0} customer reviews</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Positive Sentiment</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">
                {analytics?.sentiment_analytics?.positive_percentage || 0}%
              </p>
              <span className="text-[10px] text-slate-500">NLP classification</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Deals</span>
                <Tag className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{analytics?.kpis?.active_offers_count || 0}</p>
              <span className="text-[10px] text-slate-500">Live in search</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart 1: Store Views & Search Appearances Over Time */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Store Views & Search Impressions (Daily)</h3>
                  <p className="text-xs text-slate-400">Tracking daily customer discovery over the past two weeks</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <Line 
                  data={trendData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: { y: { beginAtZero: true } }
                  }} 
                />
              </div>
            </div>

            {/* Chart 2: Rating Distribution */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Ratings Distribution</h3>
                <p className="text-xs text-slate-400">Breakdown of customer star ratings (1 to 5)</p>
              </div>
              <div className="h-72 w-full flex items-center justify-center">
                <Bar 
                  data={ratingsBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>

          </div>

          {/* Offers Performance Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              Current Offers Performance
            </h3>
            
            {offers.length === 0 ? (
              <p className="text-xs text-slate-400">No active promotions created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Title</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Code / Discount</th>
                      <th className="py-2.5 px-3">Validity</th>
                      <th className="py-2.5 px-3">Customer Clicks</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {offers.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">{o.title}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.is_event ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {o.is_event ? 'Event' : 'Deal'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {o.discount_code ? `CODE: ${o.discount_code}` : `${o.discount_percent || 0}% Off`}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {o.start_date} to {o.end_date}
                        </td>
                        <td className="py-3 px-3 font-bold text-blue-600">
                          {o.clicks_count} clicks
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.is_valid ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {o.is_valid ? 'Active & Live' : 'Expired'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: SENTIMENT INTELLIGENCE */}
      {activeTab === 'sentiment' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-base">Python NLP Review Sentiment Analysis</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              Our automated text classifier analyzes the exact semantic polarity of incoming customer reviews. 
              Understand customer feelings regarding food taste, service speed, staff friendliness, and value for money.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Doughnut Chart */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Overall Positive vs Negative Breakdown</h4>
              <div className="h-64 flex items-center justify-center">
                <Doughnut data={sentimentDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <div className="flex items-center justify-around text-xs pt-2 border-t border-slate-100 font-bold">
                <span className="text-emerald-600">
                  👍 {analytics?.sentiment_analytics?.positive_count || 0} Positive ({analytics?.sentiment_analytics?.positive_percentage}%)
                </span>
                <span className="text-rose-600">
                  👎 {analytics?.sentiment_analytics?.negative_count || 0} Negative ({analytics?.sentiment_analytics?.negative_percentage}%)
                </span>
              </div>
            </div>

            {/* Sentiment Trend Over Time */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Sentiment Progression Over Time</h4>
              <p className="text-xs text-slate-400">Tracking sentiment shifts across review batches</p>
              <div className="h-64 w-full">
                <Line 
                  data={sentimentTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: TREND & DEMAND INSIGHTS */}
      {activeTab === 'demand' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-md space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Derived from Stored Search & View Logs
            </div>
            <h3 className="font-extrabold text-xl">Peak Customer Activity Insights</h3>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              Based on {analytics?.kpis?.total_views} view records and regional search patterns, your highest traffic window is <strong className="text-white underline">{analytics?.demand_insights?.peak_time_window}</strong>, and your most active engagement day is <strong className="text-white underline">{analytics?.demand_insights?.peak_day}</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Time of Day */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Customer Traffic by Time of Day
              </h4>
              <div className="h-64 w-full">
                <Bar 
                  data={timeDemandData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>

            {/* Day of Week */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                Customer Engagement by Day of Week
              </h4>
              <div className="h-64 w-full">
                <Bar 
                  data={dayDemandData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }}
                />
              </div>
            </div>

          </div>

          {/* Top Searched Categories in Area */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              Top Searched Categories Across Bengaluru Cluster
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {analytics?.demand_insights?.top_searched_categories?.map((c) => (
                <div key={c.category} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-xs font-bold text-slate-800 truncate">{c.category}</span>
                  <span className="text-[11px] font-semibold text-blue-600">{c.searches} search queries</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPETITOR BENCHMARK */}
      {activeTab === 'competitors' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              Competitor Benchmark: {business?.category} in Bengaluru
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              Compare your rating, review volume, sentiment health, active promotions, and customer interest against 
              neighboring businesses in the same category.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Radar Chart */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-900 text-sm text-center">Multi-Metric Radar Comparison</h4>
              <div className="h-72 flex items-center justify-center">
                <Radar data={competitorRadarData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Benchmark Averages Card */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Area Category Benchmark Averages</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category Avg Rating</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {analytics?.competitor_comparison?.category_averages?.avg_rating || 4.0}★
                    </span>
                    <span className="block text-[10px] text-slate-500">Your score: {business?.average_rating}★</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category Avg Sentiment</span>
                    <span className="text-lg font-extrabold text-emerald-600">
                      {analytics?.competitor_comparison?.category_averages?.avg_sentiment || 80}%
                    </span>
                    <span className="block text-[10px] text-slate-500">Your score: {analytics?.sentiment_analytics?.positive_percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Competitors List Table */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-h-60 overflow-y-auto">
                <h4 className="font-bold text-slate-800 text-xs mb-2">Nearby Rivals in {business?.category}</h4>
                <div className="space-y-2">
                  {analytics?.competitor_comparison?.competitor_list?.map((c) => (
                    <div 
                      key={c.id} 
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        c.is_current ? 'bg-emerald-50/70 border-emerald-300 font-bold' : 'bg-slate-50/50 border-slate-200'
                      }`}
                    >
                      <div>
                        <span className="text-slate-900 font-semibold">{c.name} {c.is_current && '(You)'}</span>
                        <span className="text-[10px] text-slate-400 block">{c.distance_km} km away</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-500 font-bold">★ {c.rating}</span>
                        <span className="text-slate-600 font-medium">{c.review_count} revs</span>
                        <span className="text-emerald-700 font-semibold">{c.positive_sentiment_pct}% pos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB 5: OFFERS & PROMOTIONS MANAGER */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Offer & Promotion Manager</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Create, edit, schedule, and expire special deals, discount coupons, and local events.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingOfferId(null);
                setOfferForm({
                  title: '',
                  description: '',
                  discount_code: '',
                  discount_percent: '',
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  is_event: false,
                  banner_url: ''
                });
                setShowOfferModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create New Promotion
            </button>
          </div>

          {/* Offers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <DealBadge 
                      status={offer.is_event ? 'event' : (offer.is_valid ? 'active' : 'expiring')}
                      label={offer.is_event ? 'Local Event' : (offer.discount_percent ? `${offer.discount_percent}% OFF` : 'Active Deal')}
                      code={offer.discount_code}
                    />

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      offer.is_valid ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {offer.is_valid ? 'Active & Live' : 'Expired'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{offer.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{offer.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Valid: {offer.start_date} to {offer.end_date}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingOfferId(offer.id);
                        setOfferForm({
                          title: offer.title || '',
                          description: offer.description || '',
                          discount_code: offer.discount_code || '',
                          discount_percent: offer.discount_percent || '',
                          start_date: offer.start_date || '',
                          end_date: offer.end_date || '',
                          is_event: !!offer.is_event,
                          banner_url: offer.banner_url || ''
                        });
                        setShowOfferModal(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Edit offer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Delete offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal for creating / editing offer */}
          {showOfferModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-base">
                  {editingOfferId ? 'Edit Promotion' : 'Create New Promotion / Event'}
                </h3>

                <form onSubmit={handleSaveOffer} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Promotion Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 20% Off Weekend Special on Pizzas"
                      value={offerForm.title}
                      onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Explain the offer terms, discounts, and customer perks..."
                      value={offerForm.description}
                      onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Discount Code (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. SUNSET20"
                        value={offerForm.discount_code}
                        onChange={(e) => setOfferForm({ ...offerForm, discount_code: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Discount % (Optional)</label>
                      <input
                        type="number"
                        placeholder="e.g. 20"
                        value={offerForm.discount_percent}
                        onChange={(e) => setOfferForm({ ...offerForm, discount_percent: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={offerForm.start_date}
                        onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                      <input
                        type="date"
                        required
                        value={offerForm.end_date}
                        onChange={(e) => setOfferForm({ ...offerForm, end_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="is_event"
                      checked={offerForm.is_event}
                      onChange={(e) => setOfferForm({ ...offerForm, is_event: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="is_event" className="font-semibold text-slate-700">
                      This is a local event (e.g. Live Music Night, Workshop)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowOfferModal(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                    >
                      Save Promotion
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 6: BUSINESS PROFILE & MAP PIN PICKER */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Business Profile & Map Pin Management</h3>
            <p className="text-xs text-slate-500 mt-1">
              Keep your contact details, operational hours, photos, and exact map coordinates up to date so customers discover you.
            </p>
          </div>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {profileSuccessMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="Restaurants & Cafes">Restaurants & Cafes</option>
                  <option value="Grocery & Supermarket">Grocery & Supermarket</option>
                  <option value="Salons & Spas">Salons & Spas</option>
                  <option value="Fitness & Gym">Fitness & Gym</option>
                  <option value="Electronics & Repair">Electronics & Repair</option>
                  <option value="Retail & Fashion">Retail & Fashion</option>
                  <option value="Bakery & Sweets">Bakery & Sweets</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Store Description
              </label>
              <textarea
                rows={3}
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Interactive Leaflet Pin Picker */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-600" /> Interactive Map Coordinates Pin Picker
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Click anywhere on the map or drag the pin to set your exact storefront coordinates.
                  </p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-600">
                  Lat: {profileForm.latitude?.toFixed(4)}, Lng: {profileForm.longitude?.toFixed(4)}
                </div>
              </div>

              <LeafletMap
                pickerMode={true}
                pickedCoords={{ lat: profileForm.latitude, lng: profileForm.longitude }}
                onCoordsPicked={(lat, lng) => {
                  setProfileForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
                }}
                centerCoords={{ lat: profileForm.latitude, lng: profileForm.longitude }}
                zoom={14}
                className="h-64 w-full rounded-2xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Sun: 9:00 AM - 10:00 PM"
                  value={profileForm.opening_hours}
                  onChange={(e) => setProfileForm({ ...profileForm, opening_hours: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Website / Social Page
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Storefront Photo URL
              </label>
              <input
                type="url"
                value={profileForm.image_url}
                onChange={(e) => setProfileForm({ ...profileForm, image_url: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tags & Keywords (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. cafe, rooftop, pizza, continental"
                value={profileForm.tags}
                onChange={(e) => setProfileForm({ ...profileForm, tags: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
