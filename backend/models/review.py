from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Review(Base):
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True, autoincrement=True)
    business_id = Column(Integer, ForeignKey('businesses.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    title = Column(String(150), nullable=True)
    comment = Column(Text, nullable=False)
    sentiment = Column(String(20), default='positive', nullable=False)  # 'positive', 'negative'
    sentiment_score = Column(Float, default=0.5, nullable=False)  # Confidence score (0.0 to 1.0)
    is_flagged = Column(Boolean, default=False, nullable=False)
    is_hidden = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    business = relationship("Business", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

    def to_dict(self):
        return {
            "id": self.id,
            "business_id": self.business_id,
            "business_name": self.business.name if self.business else None,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else "Anonymous Customer",
            "rating": self.rating,
            "title": self.title,
            "comment": self.comment,
            "sentiment": self.sentiment,
            "sentiment_score": round(self.sentiment_score, 2),
            "is_flagged": self.is_flagged,
            "is_hidden": self.is_hidden,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
