from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Offer(Base):
    __tablename__ = 'offers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    business_id = Column(Integer, ForeignKey('businesses.id'), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    discount_code = Column(String(50), nullable=True)
    discount_percent = Column(Float, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_event = Column(Boolean, default=False, nullable=False)  # True if event, False if deal/offer
    banner_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    clicks_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    business = relationship("Business", back_populates="offers")
    clicks = relationship("OfferClick", back_populates="offer", cascade="all, delete-orphan")

    def is_currently_valid(self):
        now = datetime.utcnow()
        return self.is_active and self.start_date <= now <= self.end_date

    def to_dict(self):
        return {
            "id": self.id,
            "business_id": self.business_id,
            "business_name": self.business.name if self.business else None,
            "business_category": self.business.category if self.business else None,
            "title": self.title,
            "description": self.description,
            "discount_code": self.discount_code,
            "discount_percent": self.discount_percent,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "is_event": self.is_event,
            "banner_url": self.banner_url,
            "is_active": self.is_active,
            "is_valid": self.is_currently_valid(),
            "clicks_count": self.clicks_count,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
