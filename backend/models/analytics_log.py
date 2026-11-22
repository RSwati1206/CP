from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class SearchLog(Base):
    __tablename__ = 'search_logs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    query = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    hour_of_day = Column(Integer, nullable=False)   # 0 to 23
    day_of_week = Column(Integer, nullable=False)   # 0 (Mon) to 6 (Sun)

    user = relationship("User", back_populates="search_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "query": self.query,
            "category": self.category,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "hour_of_day": self.hour_of_day,
            "day_of_week": self.day_of_week
        }

class ViewLog(Base):
    __tablename__ = 'view_logs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    business_id = Column(Integer, ForeignKey('businesses.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    hour_of_day = Column(Integer, nullable=False)   # 0 to 23
    day_of_week = Column(Integer, nullable=False)   # 0 (Mon) to 6 (Sun)

    business = relationship("Business", back_populates="view_logs")
    user = relationship("User", back_populates="view_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "business_id": self.business_id,
            "user_id": self.user_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "hour_of_day": self.hour_of_day,
            "day_of_week": self.day_of_week
        }

class OfferClick(Base):
    __tablename__ = 'offer_clicks'

    id = Column(Integer, primary_key=True, autoincrement=True)
    offer_id = Column(Integer, ForeignKey('offers.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    offer = relationship("Offer", back_populates="clicks")

    def to_dict(self):
        return {
            "id": self.id,
            "offer_id": self.offer_id,
            "user_id": self.user_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
