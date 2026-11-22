from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Business(Base):
    __tablename__ = 'businesses'

    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    address = Column(String(255), nullable=False)
    city = Column(String(100), default='Bengaluru', nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String(50), nullable=True)
    email = Column(String(150), nullable=True)
    website = Column(String(255), nullable=True)
    opening_hours = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True)
    is_approved = Column(Boolean, default=True, nullable=False)
    is_suspended = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="businesses")
    offers = relationship("Offer", back_populates="business", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="business", cascade="all, delete-orphan")
    view_logs = relationship("ViewLog", back_populates="business", cascade="all, delete-orphan")

    def to_dict(self, include_analytics_summary=False):
        avg_rating = 0.0
        review_count = len(self.reviews) if self.reviews else 0
        if review_count > 0:
            avg_rating = round(sum(r.rating for r in self.reviews) / review_count, 1)

        data = {
            "id": self.id,
            "owner_id": self.owner_id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "address": self.address,
            "city": self.city,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "phone": self.phone,
            "email": self.email,
            "website": self.website,
            "opening_hours": self.opening_hours,
            "image_url": self.image_url,
            "tags": [t.strip() for t in self.tags.split(",")] if self.tags else [],
            "is_approved": self.is_approved,
            "is_suspended": self.is_suspended,
            "average_rating": avg_rating,
            "review_count": review_count,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
        return data
