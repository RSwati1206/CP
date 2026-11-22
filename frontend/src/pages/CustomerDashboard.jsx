import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LeafletMap from '../components/LeafletMap';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Star, 
  Tag, 
  Calendar, 
  SlidersHorizontal, 
  ArrowRight, 
  Store,
  Phone,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Restaurants & Cafes',
  'Grocery & Supermarket',
  'Salons & Spas',
  'Fitness & Gym',
  'Electronics & Repair',
  'Healthcare & Pharmacy',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Discover Bengaluru's Best Local Spots</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Welcome back, {user ? user.name : 'Neighbor'}!
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Explore authentic local shops, support neighborhood entrepreneurs, and unlock exclusive discounts around Rajarajeshwari Nagar & Bengaluru.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Pilot Cluster: RNSIT & RR Nagar
            </span>
            <button 
              onClick={handleUseCurrentLocation}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg font-medium transition-colors"
            >
              Use My Live GPS
            </button>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations Section */}
      {recommendations.recommended_shops.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Personalized Recommendations</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Curated specifically for you based on your browsing patterns, ratings, and proximity.
              </p>
            </div>
            {recommendations.top_categories_affinity.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <span>Top Interests:</span>
                {recommendations.top_categories_affinity.map(([cat]) => (
                  <span key={cat} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {recommendations.recommended_shops.slice(0, 3).map((shop) => (
              <div 
                key={shop.id}
                className="group flex flex-col justify-between bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 transition-all duration-200 hover:shadow-md"
              >
                <div>
                  <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                    <img 
                      src={shop.image_url} 
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {shop.category}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 bg-blue-600/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                      <span className="truncate">{shop.recommendation_reason}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                      {shop.name}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{shop.average_rating || 'New'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {shop.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs">
                  <span className="font-medium text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {shop.distance_km} km away
                  </span>
                  <Link
                    to={`/business/${shop.id}`}
                    className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                  >
                    View Store <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Active Featured Deals Ribbon */}
          {recommendations.recommended_offers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Featured Local Deals For You
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {recommendations.recommended_offers.map((offer) => (
                  <div key={offer.id} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {offer.discount_code ? `CODE: ${offer.discount_code}` : 'SPECIAL DEAL'}
                      </span>
                      <p className="text-xs font-bold text-slate-900 truncate mt-1">{offer.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{offer.business_name}</p>
                    </div>
                    <Link
                      to={`/business/${offer.business_id}`}
                      className="shrink-0 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                      title="View deal"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Main Search, Map & Business Listings Section */}
      <section className="space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search shops, cuisines, services (e.g. 'cafe', 'haircut', 'organic', 'macbook repair')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="distance">Sort: Nearest</option>
                <option value="rating">Sort: Top Rated</option>
                <option value="name">Sort: A to Z</option>
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors shrink-0"
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
          <div className="lg:col-span-7 bg-white p-3 rounded-3xl border border-slate-200 shadow-sm sticky top-20">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm text-slate-800">Live Neighborhood Map</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {businesses.length} pins loaded
              </span>
            </div>

            <LeafletMap
              businesses={businesses}
              selectedBusinessId={selectedBusinessId}
              onSelectBusiness={(id) => {
                setSelectedBusinessId(id);
                // Scroll card into view
                const el = document.getElementById(`biz-card-${id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              centerCoords={userCoords}
              className="h-[520px] w-full rounded-2xl"
            />

            <div className="p-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>💡 Click any pin to inspect details</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span> You are here
              </span>
            </div>
          </div>

          {/* Business Cards List Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-slate-900 text-base">
                {selectedCategory === 'All' ? 'All Local Businesses' : selectedCategory} ({businesses.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Clustered in Bengaluru
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Searching businesses...</p>
              </div>
            ) : businesses.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-base mb-1">No businesses found</h4>
                <p className="text-xs max-w-xs mx-auto">
                  Try broadening your search keyword, adjusting the radius, or selecting a different category.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {businesses.map((b) => {
                  const isSelected = selectedBusinessId === b.id;
                  return (
                    <div
                      key={b.id}
                      id={`biz-card-${b.id}`}
                      onClick={() => setSelectedBusinessId(b.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex gap-3.5">
                        <img
                          src={b.image_url}
                          alt={b.name}
                          className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                                {b.category}
                              </span>
                              <h4 className="font-bold text-slate-900 text-sm truncate">
                                {b.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{b.average_rating || 'New'}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                            {b.address}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                            <span className="font-medium text-slate-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {b.distance_km} km away
                            </span>

                            {b.active_offers_count > 0 ? (
                              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                🎁 {b.active_offers_count} Deal{b.active_offers_count > 1 ? 's' : ''}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 truncate">
                          {b.opening_hours || 'Open Daily'}
                        </span>
                        <Link
                          to={`/business/${b.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                        >
                          View Details & Reviews <ArrowRight className="w-3 h-3" />
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

    </div>
  );
}
