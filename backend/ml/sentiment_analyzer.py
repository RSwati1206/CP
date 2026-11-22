import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# Seed training data tailored specifically to local business reviews
TRAINING_REVIEWS = [
    # Positive reviews
    ("The food was absolutely delicious and freshly prepared. Staff was courteous and friendly!", "positive"),
    ("Great haircut and wonderful spa service! Very clean and professional ambiance.", "positive"),
    ("Fresh vegetables, neatly organized store, and courteous cashier. Love shopping here!", "positive"),
    ("Excellent service! Quick delivery, genuine products, and reasonable pricing.", "positive"),
    ("Best coffee and sandwiches in the neighborhood. Cozy seating and high speed wifi.", "positive"),
    ("Doctor took time to explain everything thoroughly. Pharmacy was well stocked.", "positive"),
    ("Outstanding gym equipment and knowledgeable personal trainers. Great community!", "positive"),
    ("Fixed my laptop screen within two hours at an affordable price. Highly recommended!", "positive"),
    ("Authentic South Indian breakfast. The ghee roast dosa and filter coffee were top notch.", "positive"),
    ("Super discounts and friendly staff who helped me find exactly what I needed.", "positive"),
    ("Very pleasant experience, spotless hygiene, prompt service and great value for money.", "positive"),
    ("Loved the pastry selection! Freshly baked, perfect sweetness, beautiful packaging.", "positive"),
    ("Reliable repair work and transparent estimates. Saved my phone from water damage.", "positive"),
    ("Courteous staff, smooth checkout, wide variety of daily organic groceries.", "positive"),
    ("Top notch customer support, comfortable seating, and wonderful experience.", "positive"),
    ("Exceptional hospitality, hygienic surroundings, and delicious authentic meals.", "positive"),
    ("Stylist gave me the perfect makeover. Very attentive and skilled. 10/10!", "positive"),
    ("Warm vibes, great offers, and super tasty desserts. Will definitely visit again.", "positive"),
    ("Fast turnaround time, polite technicians, and fair charges. Completely satisfied.", "positive"),
    ("Fresh produce daily, generous discounts on groceries, and polite counter staff.", "positive"),

    # Negative reviews
    ("Terrible experience. Food was cold, stale and tasted bland. Very disappointing.", "negative"),
    ("Worst customer service. The staff was incredibly rude and arrogant.", "negative"),
    ("Overpriced items and expired products on the shelf. Poor hygiene standards.", "negative"),
    ("Waited over 45 minutes for our order. Manager did not care at all.", "negative"),
    ("Unprofessional stylist who completely ruined my haircut. Will never go back.", "negative"),
    ("Charged extra fees without informing. Misleading pricing and dishonest owner.", "negative"),
    ("Dirty equipment, crowded gym, and broken air conditioning. Total waste of money.", "negative"),
    ("They ruined my laptop! Inexperienced technicians and delayed pickup for days.", "negative"),
    ("Food was oily, unhygienic, and gave us an upset stomach. Do not recommend.", "negative"),
    ("Rude cashier, long checkout lines, and unorganized shelves. Terrible shop.", "negative"),
    ("Not worth the hype. Very slow service, cold food, and indifferent staff.", "negative"),
    ("No doctor available despite booking in advance. Complete waste of time.", "negative"),
    ("Scam offers. They refused to honor the discount voucher advertised online.", "negative"),
    ("Horrible smell, sticky tables, and stale food. Avoid this place.", "negative"),
    ("Extremely overpriced for mediocre quality. Staff lacked basic manners.", "negative"),
    ("Unresponsive contact number, closed during official working hours. Bad experience.", "negative"),
    ("Haircut was rushed, uneven, and stylist was chatting on phone the whole time.", "negative"),
    ("Low quality vegetables that rotted in two days. Highly disappointed.", "negative"),
    ("Unprofessional behavior, delayed repairs, and hidden charges. Stay away.", "negative"),
    ("Rude behavior by security and floor staff. Very poor management.", "negative"),
]

# High precision domain keywords
POSITIVE_WORDS = {
    'delicious', 'great', 'excellent', 'fresh', 'tasty', 'friendly', 'courteous', 
    'clean', 'spotless', 'hygienic', 'affordable', 'reasonable', 'quick', 'fast', 
    'prompt', 'outstanding', 'love', 'loved', 'best', 'authentic', 'wonderful', 
    'helpful', 'skilled', 'top notch', 'perfect', 'satisfied', 'warm', 'cozy', 
    'recommend', 'recommended', 'honest', 'transparent', 'polite', 'superb'
}

NEGATIVE_WORDS = {
    'terrible', 'worst', 'horrible', 'bad', 'poor', 'rude', 'arrogant', 'stale', 
    'cold', 'dirty', 'unhygienic', 'overpriced', 'expensive', 'ruined', 'waste', 
    'slow', 'delayed', 'unprofessional', 'disappointing', 'disappointed', 'scam', 
    'dishonest', 'cheat', 'avoid', 'broken', 'careless', 'useless', 'smell', 'blame'
}

class SentimentAnalyzer:
    def __init__(self):
        self.model = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, lowercase=True)),
            ('nb', MultinomialNB(alpha=0.5))
        ])
        self._train()

    def _train(self):
        texts = [item[0] for item in TRAINING_REVIEWS]
        labels = [item[1] for item in TRAINING_REVIEWS]
        self.model.fit(texts, labels)

    def clean_text(self, text):
        if not text:
            return ""
        text = text.lower().strip()
        text = re.sub(r'http\S+|www\S+', '', text)
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        return ' '.join(text.split())

    def analyze(self, text):
        cleaned = self.clean_text(text)
        if not cleaned:
            return {
                "sentiment": "positive",
                "confidence": 0.5,
                "keywords": []
            }

        # 1. Statistical prediction
        proba = self.model.predict_proba([cleaned])[0]
        classes = list(self.model.classes_)
        pos_idx = classes.index("positive")
        neg_idx = classes.index("negative")
        ml_pos_score = proba[pos_idx]
        ml_neg_score = proba[neg_idx]

        # 2. Rule & Lexicon inspection
        words = set(cleaned.split())
        matched_pos = [w for w in POSITIVE_WORDS if w in cleaned]
        matched_neg = [w for w in NEGATIVE_WORDS if w in cleaned]

        lexicon_pos_weight = len(matched_pos) * 0.25
        lexicon_neg_weight = len(matched_neg) * 0.25

        final_pos_score = ml_pos_score + lexicon_pos_weight - (lexicon_neg_weight * 0.5)
        final_neg_score = ml_neg_score + lexicon_neg_weight - (lexicon_pos_weight * 0.5)

        # Decide sentiment
        if final_pos_score >= final_neg_score:
            sentiment = "positive"
            total = final_pos_score + final_neg_score
            confidence = min(0.99, max(0.55, final_pos_score / total if total > 0 else 0.75))
            keywords = matched_pos[:5] if matched_pos else ["pleasant", "good"]
        else:
            sentiment = "negative"
            total = final_pos_score + final_neg_score
            confidence = min(0.99, max(0.55, final_neg_score / total if total > 0 else 0.75))
            keywords = matched_neg[:5] if matched_neg else ["dissatisfied", "concerns"]

        return {
            "sentiment": sentiment,
            "confidence": round(float(confidence), 2),
            "keywords": keywords
        }

# Global singleton instance for high performance
sentiment_analyzer = SentimentAnalyzer()
