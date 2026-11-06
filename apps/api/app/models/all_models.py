import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    shops = relationship("Shop", back_populates="owner")


class Shop(Base):
    __tablename__ = "shops"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    language = Column(String(10), default="en", nullable=False)
    brand_kit = Column(JSON, default=dict, nullable=False)  # logo_url, watermark_opacity, position
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="shops")
    products = relationship("Product", back_populates="shop")
    jobs = relationship("Job", back_populates="shop")
    credit_ledgers = relationship("CreditLedger", back_populates="shop")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shop_id = Column(String(36), ForeignKey("shops.id"), nullable=False, index=True)
    storage_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=True)
    mime_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    analysis = Column(JSON, nullable=True)  # type, stones, metal_colour, pattern, quality_score, etc.
    cutout_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shop_id = Column(String(36), ForeignKey("shops.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    jewellery_type = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    metal = Column(String(50), nullable=True)
    purity = Column(String(20), nullable=True)
    price = Column(Float, nullable=True)
    primary_asset_id = Column(String(36), ForeignKey("assets.id"), nullable=True)
    tags = Column(JSON, default=list, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    shop = relationship("Shop", back_populates="products")


class ModelProfile(Base):
    __tablename__ = "model_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shop_id = Column(String(36), ForeignKey("shops.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    gender = Column(String(20), default="female", nullable=False)
    skin_tone = Column(String(20), nullable=False)
    face_shape = Column(String(20), nullable=False)
    age_group = Column(String(20), nullable=False)
    region = Column(String(50), nullable=True)
    base_portrait_url = Column(String(500), nullable=True)
    is_brand_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shop_id = Column(String(36), ForeignKey("shops.id"), nullable=False, index=True)
    idempotency_key = Column(String(100), unique=True, index=True, nullable=True)
    asset_id = Column(String(36), ForeignKey("assets.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True)
    status = Column(String(30), default="pending", nullable=False, index=True)
    target_angles = Column(JSON, nullable=False)  # list of angles ["front", "left", ...]
    model_options = Column(JSON, nullable=False)  # gender, skin_tone, face_shape, age_group
    style_options = Column(JSON, default=dict, nullable=False)  # outfit, background, pose
    credits_reserved = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    shop = relationship("Shop", back_populates="jobs")
    images = relationship("JobImage", back_populates="job")


class JobImage(Base):
    __tablename__ = "job_images"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False, index=True)
    angle = Column(String(30), nullable=False)
    storage_path = Column(String(500), nullable=False)
    resolution = Column(String(10), default="HD", nullable=False)  # HD or 4K
    fidelity_score = Column(Integer, nullable=True)
    fidelity_report = Column(JSON, nullable=True)
    prompt_version = Column(String(50), nullable=False)
    tokens_used = Column(Integer, default=0, nullable=False)
    latency_ms = Column(Integer, default=0, nullable=False)
    attempt = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    job = relationship("Job", back_populates="images")


class CreditLedger(Base):
    __tablename__ = "credit_ledger"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shop_id = Column(String(36), ForeignKey("shops.id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # positive for grant/refund, negative for usage
    balance_after = Column(Integer, nullable=False)
    entry_type = Column(String(30), nullable=False)  # signup_bonus, reserve, commit, refund, purchase
    reference_id = Column(String(100), nullable=True, index=True)  # job_id or payment_id
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    shop = relationship("Shop", back_populates="credit_ledgers")


class Preset(Base):
    __tablename__ = "presets"

    id = Column(String(50), primary_key=True)
    category = Column(String(50), nullable=False, index=True)  # skin_tone, face_shape, etc.
    name_en = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=False)
    description_en = Column(Text, nullable=True)
    description_hi = Column(Text, nullable=True)
    metadata_json = Column(JSON, default=dict, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shop_id = Column(String(36), ForeignKey("shops.id"), nullable=False, index=True)
    plan_id = Column(String(50), nullable=False)
    status = Column(String(30), default="active", nullable=False)
    current_period_start = Column(DateTime, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shop_id = Column(String(36), ForeignKey("shops.id"), nullable=False, index=True)
    razorpay_order_id = Column(String(100), unique=True, index=True, nullable=True)
    razorpay_payment_id = Column(String(100), unique=True, index=True, nullable=True)
    amount_paise = Column(Integer, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    status = Column(String(30), default="created", nullable=False)
    credits_awarded = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    shop_id = Column(String(36), nullable=True, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    details = Column(JSON, default=dict, nullable=False)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

