"""
FitBuddy - SQLite & SQLAlchemy Database Models
Defines schema and ORM mappings for Users, Workout Plans, Feedback Logs,
Nutrition & Recovery Recommendations, and Workout Session Logs.
"""

from datetime import datetime
import json
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    primary_goal = Column(String, nullable=False) # fat_loss, muscle_gain, mobility_flexibility, general_health
    experience_level = Column(String, default='intermediate')
    workout_intensity = Column(String, default='medium') # low, medium, high
    days_per_week = Column(Integer, default=4)
    minutes_per_session = Column(Integer, default=45)
    equipment_json = Column(Text, default='[]')
    limitations_json = Column(Text, default='[]')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan", order_by="desc(WorkoutPlan.generated_at)")
    feedbacks = relationship("FeedbackLog", back_populates="user", cascade="all, delete-orphan", order_by="desc(FeedbackLog.created_at)")
    nutrition_recs = relationship("NutritionRecommendation", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "age": self.age,
            "gender": self.gender,
            "weight_kg": self.weight_kg,
            "height_cm": self.height_cm,
            "primary_goal": self.primary_goal,
            "experience_level": self.experience_level,
            "workout_intensity": self.workout_intensity,
            "days_per_week": self.days_per_week,
            "minutes_per_session": self.minutes_per_session,
            "availableEquipment": json.loads(self.equipment_json or '[]'),
            "limitations": json.loads(self.limitations_json or '[]'),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class WorkoutPlan(Base):
    __tablename__ = 'workout_plans'

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    title = Column(String, nullable=False)
    overview = Column(Text)
    intensity = Column(String, default='medium') # low, medium, high
    split_type = Column(String)
    generated_at = Column(DateTime, default=datetime.utcnow)
    weekly_schedule_json = Column(Text, nullable=False) # JSON array of 7 days
    wellness_guide_json = Column(Text) # JSON wellness guidance
    progression_strategy = Column(Text)
    motivational_mantra = Column(String)
    adaptation_history_json = Column(Text, default='[]')

    # Relationships
    user = relationship("User", back_populates="plans")
    feedbacks = relationship("FeedbackLog", back_populates="plan", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "overview": self.overview,
            "intensity": self.intensity,
            "splitType": self.split_type,
            "generatedAt": self.generated_at.isoformat() if self.generated_at else None,
            "weeklySchedule": json.loads(self.weekly_schedule_json or '[]'),
            "wellnessGuide": json.loads(self.wellness_guide_json or '{}'),
            "progressionStrategy": self.progression_strategy,
            "motivationalMantra": self.motivational_mantra,
            "adaptationHistory": json.loads(self.adaptation_history_json or '[]'),
        }

class FeedbackLog(Base):
    """Tracks feedback-based workout plan modifications."""
    __tablename__ = 'feedback_logs'

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    plan_id = Column(String, ForeignKey('workout_plans.id'), nullable=False)
    feedback_text = Column(Text, nullable=False)
    adaptation_type = Column(String, default='intensity') # intensity, injury, schedule, fatigue, equipment
    target_intensity = Column(String, nullable=True) # low, medium, high
    target_day_number = Column(Integer, nullable=True)
    adaptation_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")
    plan = relationship("WorkoutPlan", back_populates="feedbacks")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "plan_id": self.plan_id,
            "feedback_text": self.feedback_text,
            "adaptation_type": self.adaptation_type,
            "target_intensity": self.target_intensity,
            "target_day_number": self.target_day_number,
            "adaptation_summary": self.adaptation_summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class NutritionRecommendation(Base):
    """Stores AI-generated nutrition and recovery recommendations."""
    __tablename__ = 'nutrition_recommendations'

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    plan_id = Column(String, ForeignKey('workout_plans.id'), nullable=True)
    daily_calories = Column(Integer, default=2200)
    protein_grams = Column(Integer, default=150)
    carbs_grams = Column(Integer, default=220)
    fats_grams = Column(Integer, default=65)
    hydration_liters = Column(Float, default=3.0)
    meal_timing_protocol = Column(Text)
    supplement_guidance = Column(Text)
    sleep_recovery_protocol = Column(Text)
    active_recovery_protocol = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="nutrition_recs")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "plan_id": self.plan_id,
            "daily_calories": self.daily_calories,
            "protein_grams": self.protein_grams,
            "carbs_grams": self.carbs_grams,
            "fats_grams": self.fats_grams,
            "hydration_liters": self.hydration_liters,
            "meal_timing_protocol": self.meal_timing_protocol,
            "supplement_guidance": self.supplement_guidance,
            "sleep_recovery_protocol": self.sleep_recovery_protocol,
            "active_recovery_protocol": self.active_recovery_protocol,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class WorkoutSession(Base):
    """Logs individual workout sessions completed by users."""
    __tablename__ = 'workout_sessions'

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    plan_id = Column(String, ForeignKey('workout_plans.id'), nullable=True)
    day_number = Column(Integer, nullable=False)
    day_title = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=45)
    perceived_rpe = Column(Float, default=7.0)
    calories_burned = Column(Integer, default=320)
    intensity = Column(String, default='medium')
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "plan_id": self.plan_id,
            "day_number": self.day_number,
            "day_title": self.day_title,
            "duration_minutes": self.duration_minutes,
            "perceived_rpe": self.perceived_rpe,
            "calories_burned": self.calories_burned,
            "intensity": self.intensity,
            "notes": self.notes,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }

# SQLAlchemy Database Connection and Session Factory
DATABASE_URL = "sqlite:///fitbuddy.db"

def get_engine(db_url: str = DATABASE_URL):
    return create_engine(db_url, echo=False, connect_args={"check_same_thread": False})

def init_db(engine=None):
    if engine is None:
        engine = get_engine()
    Base.metadata.create_all(engine)
    return engine

def get_session(engine=None):
    if engine is None:
        engine = get_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()
