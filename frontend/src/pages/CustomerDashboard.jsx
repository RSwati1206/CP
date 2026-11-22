import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LeafletMap from '../components/LeafletMap';
import DealBadge from '../components/DealBadge';
import FloatingDeals from '../components/FloatingDeals';
import ScrollReveal from '../components/ScrollReveal';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Star, 
  Tag, 
  ArrowRight, 
  Store,
  ChevronRight,
  Flame
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Restaurants & Cafes',
  'Grocery & Supermarket',
  'Salons & Spas',
  'Fitness & Gym',
  'Electronics & Repair',
  'Retail & Fashion',
  'Bakery & Sweets'
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState('15');
  const [sortBy, setSortBy] = useState('distance');
  
  // Coordinates (default: RNSIT / RR Nagar Bengaluru)
  const [userCoords, setUserCoords] = useState({ lat: 12.8988, lng: 77.5186 });
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);

  // Recommendations
  const [recommendations, setRecommendations] = useState({
    recommended_shops: [],
    recommended_offers: [],
    top_categories_affinity: []
  });

  // Fetch businesses
  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await api.getBusinesses({
        category: selectedCategory === 'All' ? '' : selectedCategory,
        search: searchQuery,
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        radius: radiusKm,
        sort: sortBy
      });
      setBusinesses(res.businesses || []);
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      const res = await api.getRecommendations({
        latitude: userCoords.lat,
        longitude: userCoords.lng
      });
      setRecommendations(res);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [selectedCategory, radiusKm, sortBy]);

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBusinesses();
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn("Geolocation denied or unavailable, keeping Bengaluru default:", err);
        }
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      
      {/* Floating Ambient Deals of the Day */}
      <FloatingDeals offers={recommendations.recommended_offers} />

      {/* Welcome Banner - Refined Deep Teal to Emerald Gradient */}
      <ScrollReveal direction="down" duration={600}>
        <div className="relative rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-950 dark:from-teal-950 dark:via-emerald-950 dark:to-slate-950 text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-teal-700/40 dark:border-teal-800/40">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-teal-100">Discover Bengaluru's Best Local Spots</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 text-white">
              Welcome back, {user ? user.name : 'Neighbor'}!
            </h1>
            
            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed font-normal">
              Explore authentic local shops, support neighborhood entrepreneurs, and unlock exclusive discounts around Rajarajeshwari Nagar & Bengaluru.
            </p>
            
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 text-teal-200 font-medium">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Pilot Cluster: RNSIT & RR Nagar
              </span>
              <button 
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-1.5 bg-teal-600/40 hover:bg-teal-600/60 text-white px-3.5 py-1.5 rounded-xl font-semibold border border-teal-400/30 backdrop-blur-sm transition-all cursor-pointer shadow-xs"
              >
                Use My Live GPS
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Personalized Recommendations Section */}
      {recommendations.recommended_shops.length > 0 && (
        <ScrollReveal direction="up" duration={600}>
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Personalized Recommendations
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Curated specifically for you based on your browsing patterns, ratings, and proximity.
                </p>
              </div>

              {recommendations.top_categories_affinity.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Top Interests:</span>
                  {recommendations.top_categories_affinity.map(([cat]) => (
                    <span 
                      key={cat} 
                      className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-[11px] border border-slate-200/60 dark:border-slate-700"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations Grid with Staggered Scroll Animation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {recommendations.recommended_shops.slice(0, 3).map((shop, idx) => (
                <ScrollReveal key={shop.id} delay={100} staggerIndex={idx} duration={500}>
                  <div 
                    className="group flex flex-col justify-between h-full bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div>
                      <div className="relative h-40 rounded-xl overflow-hidden mb-3.5 shadow-xs">
                        <img 
                          src={shop.image_url} 
                          alt={shop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          {shop.category}
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-blue-600/95 dark:bg-blue-700/95 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          <span className="truncate">{shop.recommendation_reason}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-2">
                          {shop.name}
                        </h3>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-700/50">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{shop.average_rating || 'New'}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                        {shop.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700/80 text-xs mt-2">
                      <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                        {shop.distance_km} km away
                      </span>
                      <Link
                        to={`/business/${shop.id}`}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        View Store <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Active Featured Deals Ribbon with DealBadge */}
            {recommendations.recommended_offers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Featured Local Deals For You
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {recommendations.recommended_offers.map((offer) => (
                    <div 
                      key={offer.id} 
                      className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between hover:shadow-sm transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <DealBadge 
                          size="sm" 
                          discount={offer.discount_percent} 
                          code={offer.discount_code} 
                        />
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1.5">{offer.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">📍 {offer.business_name}</p>
                      </div>
                      <Link
                        to={`/business/${offer.business_id}`}
                        className="shrink-0 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-2xs"
                        title="View deal"
                        aria-label={`View deal: ${offer.title}`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </ScrollReveal>
      )}

      {/* Main Search, Map & Business Listings Section */}
      <ScrollReveal direction="up" duration={600}>
        <section className="space-y-6">
          
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search shops, artisan cafes, bakeries, supermarkets (e.g. 'cafe', 'dosa', 'organic', 'sourdough')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="3">Within 3 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="15">Within 15 km (Greater Area)</option>
                  <option value="50">All Bengaluru</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="distance">Sort: Nearest</option>
                  <option value="rating">Sort: Top Rated</option>
                  <option value="name">Sort: A to Z</option>
                </select>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Synchronized Leaflet Map and Business List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Map Column (Interactive Leaflet Map) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-3.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-20 transition-colors">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">Live Neighborhood Map</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  {businesses.length} pins loaded
                </span>
              </div>

              <LeafletMap
                businesses={businesses}
                selectedBusinessId={selectedBusinessId}
                onSelectBusiness={(id) => {
                  setSelectedBusinessId(id);
                  const el = document.getElementById(`biz-card-${id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                centerCoords={userCoords}
                className="h-[520px] w-full rounded-2xl"
              />

              <div className="p-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>💡 Click any pin to inspect deals & reviews</span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block animate-pulse"></span> You are here
                </span>
              </div>
            </div>

            {/* Business Cards List Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {selectedCategory === 'All' ? 'All Local Businesses' : selectedCategory} ({businesses.length})
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Bengaluru Pilot Cluster
                </span>
              </div>

              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Discovering shops near you...</p>
                </div>
              ) : businesses.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 text-slate-500">
                  <Store className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">No businesses found</h4>
                  <p className="text-xs max-w-xs mx-auto text-slate-500 dark:text-slate-400">
                    Try broadening your search query or selecting a different category.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                  {businesses.map((b, idx) => {
                    const isSelected = selectedBusinessId === b.id;
                    return (
                      <div
                        key={b.id}
                        id={`biz-card-${b.id}`}
                        onClick={() => setSelectedBusinessId(b.id)}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/20'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 shadow-xs'
                        }`}
                      >
                        <div className="flex gap-3.5">
                          <img
                            src={b.image_url}
                            alt={b.name}
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                                  {b.category}
                                </span>
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">
                                  {b.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-700/50">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                <span>{b.average_rating || 'New'}</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                              {b.address}
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                              <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {b.distance_km} km away
                              </span>

                              {b.active_offers_count > 0 ? (
                                <DealBadge size="sm" discount={b.active_offers_count * 10} label={`${b.active_offers_count} Deal${b.active_offers_count > 1 ? 's' : ''}`} />
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                            {b.opening_hours || 'Open Daily'}
                          </span>
                          <Link
                            to={`/business/${b.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                          >
                            View Details <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </section>
      </ScrollReveal>

    </div>
  );
}
