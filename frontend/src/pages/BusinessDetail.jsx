import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LeafletMap from '../components/LeafletMap';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Tag, 
  Calendar, 
  Share2, 
  Check, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Sparkles,
  ArrowLeft,
  Send,
  AlertCircle
} from 'lucide-react';

export default function BusinessDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deals'); // 'deals', 'events', 'reviews'

  // Review submission state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [classifiedSentimentResult, setClassifiedSentimentResult] = useState(null);

  // Social share state
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.getBusinessDetail(id);
      setBusiness(res.business);
    } catch (err) {
      console.error("Failed to load business:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setReviewError("Please log in to submit a review.");
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccessMsg('');

    try {
      const res = await api.createReview({
        business_id: parseInt(id),
        rating: parseInt(rating),
        title: reviewTitle,
        comment: reviewComment
      });

      setClassifiedSentimentResult(res.sentiment_insights);
      setReviewSuccessMsg("Thank you! Your review was analyzed by our NLP sentiment engine and posted successfully.");
      setReviewComment('');
      setReviewTitle('');
      
      // Refresh business details to show new review
      fetchDetail();
    } catch (err) {
      setReviewError(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share && business) {
      navigator.share({
        title: business.name,
        text: `Check out ${business.name} in Bengaluru on LocalMarket Portal!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      setShareModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Business Listing Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">The requested shop may have been removed or suspended.</p>
        <Link to="/explore" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">
          Return to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Navigation back */}
      <div>
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Business Explorer
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="relative h-64 sm:h-80 w-full">
          <img 
            src={business.image_url} 
            alt={business.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {business.category}
                </span>
                <span className="bg-emerald-500/90 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  Verified Local Business
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                {business.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 mt-1.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                {business.address}, {business.city}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleNativeShare}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share Store
              </button>
            </div>
          </div>
        </div>

        {/* Quick Contact & Info Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/50 p-4 border-t border-slate-100 text-xs">
          <div className="p-2 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Hours</span>
              <span className="font-semibold text-slate-800">{business.opening_hours || 'Mon-Sat: 9am-9pm'}</span>
            </div>
          </div>

          <div className="p-2 flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
              <a href={`tel:${business.phone}`} className="font-semibold text-slate-800 hover:text-blue-600">
                {business.phone || '+91 80 2860 1122'}
              </a>
            </div>
          </div>

          <div className="p-2 flex items-center gap-2.5">
            <Star className="w-4 h-4 text-amber-500 fill-current shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Community Rating</span>
              <span className="font-semibold text-slate-800">{business.average_rating} / 5.0 ({business.reviews?.length || 0} reviews)</span>
            </div>
          </div>

          <div className="p-2 flex items-center gap-2.5">
            <ThumbsUp className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Sentiment Score</span>
              <span className="font-semibold text-indigo-700">{business.positive_sentiment_pct || 90}% Positive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Deals, Events, Reviews) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs header */}
          <div className="flex border-b border-slate-200 gap-4">
            <button
              onClick={() => setActiveTab('deals')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'deals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Tag className="w-4 h-4" />
              Active Offers & Deals ({business.offers?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'events'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Upcoming Local Events ({business.events?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Customer Reviews ({business.reviews?.length || 0})
            </button>
          </div>

          {/* Tab 1: Deals & Offers */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              {business.offers?.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">No active discount deals currently scheduled.</p>
                  <p className="text-xs text-slate-400 mt-1">Check back soon for festive and seasonal specials!</p>
                </div>
              ) : (
                business.offers.map((offer) => (
                  <div key={offer.id} className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                          {offer.discount_percent ? `${offer.discount_percent}% OFF` : 'SPECIAL OFFER'}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Valid until {new Date(offer.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{offer.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{offer.description}</p>
                    </div>

                    {offer.discount_code && (
                      <div className="shrink-0 flex flex-col items-center gap-1 bg-white p-3 rounded-xl border border-emerald-300 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Coupon Code</span>
                        <span className="text-sm font-mono font-extrabold text-emerald-700 tracking-wider">
                          {offer.discount_code}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Upcoming Events */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {business.events?.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">No upcoming local events scheduled right now.</p>
                </div>
              ) : (
                business.events.map((ev) => (
                  <div key={ev.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(ev.start_date).toLocaleDateString()} - {new Date(ev.end_date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{ev.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Customer Reviews & Ratings */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Sentiment & Star Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <span className="text-4xl font-extrabold text-slate-900">{business.average_rating}</span>
                  <span className="text-sm text-slate-400 font-semibold"> / 5.0</span>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-500 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(business.average_rating) ? 'fill-current' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Based on {business.reviews?.length || 0} verified customer reviews
                  </span>
                </div>

                <div className="w-full sm:w-64 bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <ThumbsUp className="w-3.5 h-3.5" /> Positive
                    </span>
                    <span>{business.positive_sentiment_pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div style={{ width: `${business.positive_sentiment_pct}%` }} className="bg-emerald-500 h-full" />
                    <div style={{ width: `${100 - business.positive_sentiment_pct}%` }} className="bg-rose-400 h-full" />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    Classified via Python NLP Sentiment Classifier
                  </p>
                </div>
              </div>

              {/* Write Review Form */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-base mb-1">Write a Customer Review</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Share your experience to help local neighbors. Your review will be automatically analyzed for sentiment.
                </p>

                {reviewSuccessMsg && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> {reviewSuccessMsg}
                    </p>
                    {classifiedSentimentResult && (
                      <div className="text-[11px] text-emerald-700 pt-1">
                        Detected Sentiment: <strong className="uppercase">{classifiedSentimentResult.sentiment}</strong> (Confidence: {classifiedSentimentResult.confidence * 100}%)
                      </div>
                    )}
                  </div>
                )}

                {reviewError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                    {reviewError}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setRating(s)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${s <= rating ? 'fill-current text-amber-500' : 'text-slate-300'}`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">{rating} of 5 Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Review Headline (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Delicious food and fast service!"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Feedback</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Write your honest thoughts about service quality, cleanliness, staff politeness, pricing..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingReview ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Review
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {business.reviews?.map((r) => (
                  <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-xs text-slate-600 flex items-center justify-center">
                          {r.user_name ? r.user_name[0] : 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{r.user_name}</p>
                          <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                          r.sentiment === 'positive'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {r.sentiment === 'positive' ? <ThumbsUp className="w-2.5 h-2.5" /> : <ThumbsDown className="w-2.5 h-2.5" />}
                          {r.sentiment}
                        </span>

                        <div className="flex items-center text-amber-500 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{r.rating}</span>
                        </div>
                      </div>
                    </div>

                    {r.title && (
                      <h4 className="text-xs font-bold text-slate-800">{r.title}</h4>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Right Column: About, Map & Social Share */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* About Section */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">About This Business</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{business.description}</p>

            {business.tags?.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Specialties & Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {business.tags.map((tag) => (
                    <span key={tag} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Map Pin Location */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" /> Location Pin
              </span>
              <span className="text-[10px] text-slate-500">{business.city}</span>
            </div>

            <LeafletMap
              businesses={[business]}
              centerCoords={{ lat: business.latitude, lng: business.longitude }}
              zoom={14}
              className="h-56 w-full rounded-2xl"
            />

            <p className="text-[11px] text-slate-500 font-medium">{business.address}</p>
          </div>

          {/* Social Share Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-3xl border border-blue-200/60 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-blue-600" /> Share with Friends & Neighbors
            </h4>
            <p className="text-xs text-slate-600">
              Spread the word about this local business on WhatsApp, Facebook, or copy a direct link.
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Link Copied!' : 'Copy Link'}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out ${business.name} in Bengaluru: ${window.location.href}`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
