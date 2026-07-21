import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, Float, ForeignKey,
    func,
)
from sqlalchemy.orm import relationship
from server.app.db.database import Base


def _utcnow():
    """Timezone-aware UTC timestamp (replaces deprecated datetime.utcnow)."""
    return datetime.datetime.now(datetime.UTC)


# ── Core User & Auth Models ──────────────────────────────────────────────────

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    auth0_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    avatar = Column(Text, nullable=True)
    role = Column(String(50), nullable=False, default="operator")
    account_status = Column(String(50), nullable=False, default="active")
    email_verified = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True, default=_utcnow)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete

    def __repr__(self):
        return f"<User {self.email} role={self.role}>"


class RoleModel(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<Role {self.name}>"


class PermissionModel(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<Permission {self.code}>"


# ── Audit & Compliance ───────────────────────────────────────────────────────

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=True)
    user_email = Column(String(255), nullable=True)
    role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(255), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="SUCCESS")
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    def __repr__(self):
        return f"<AuditLog {self.action} by={self.user_email}>"


# ── Stadium Operations ───────────────────────────────────────────────────────

class IncidentModel(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(50), nullable=False, default="Medium")
    category = Column(String(100), nullable=False, default="General")
    status = Column(String(50), nullable=False, default="Open")
    location = Column(String(255), nullable=True)
    created_by = Column(String(255), nullable=False)
    assigned_to = Column(String(255), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    def __repr__(self):
        return f"<Incident #{self.id} {self.title} [{self.severity}]>"


class SystemConfigModel(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_by = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── Venue & Infrastructure Models ────────────────────────────────────────────

class VenueModel(Base):
    __tablename__ = "venues_v2"

    id = Column(Integer, primary_key=True, index=True)
    venue_code = Column(String(50), unique=True, nullable=False)  # e.g., 'metlife'
    name = Column(String(255), nullable=False)
    city = Column(String(255), nullable=False)
    country = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    timezone = Column(String(50), nullable=True)
    status = Column(String(50), default="operational")
    created_at = Column(DateTime, default=_utcnow)

    zones = relationship("ZoneModel", back_populates="venue")
    gates = relationship("GateModel", back_populates="venue")

    def __repr__(self):
        return f"<Venue {self.name} ({self.venue_code})>"


class ZoneModel(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), nullable=False)  # e.g., 'A', 'B', 'VIP'
    name = Column(String(100), nullable=True)
    venue_id = Column(Integer, ForeignKey("venues_v2.id"), nullable=False)
    capacity = Column(Integer, nullable=True)
    zone_type = Column(String(50), default="general")  # general, vip, field, concourse
    created_at = Column(DateTime, default=_utcnow)

    venue = relationship("VenueModel", back_populates="zones")

    def __repr__(self):
        return f"<Zone {self.code}>"


class GateModel(Base):
    __tablename__ = "gates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    venue_id = Column(Integer, ForeignKey("venues_v2.id"), nullable=False)
    gate_type = Column(String(50), default="entry")  # entry, exit, emergency
    status = Column(String(50), default="open")  # open, closed, congested
    throughput_per_min = Column(Integer, default=0)
    queue_length = Column(Integer, default=0)
    created_at = Column(DateTime, default=_utcnow)

    venue = relationship("VenueModel", back_populates="gates")

    def __repr__(self):
        return f"<Gate {self.name} [{self.status}]>"


class SensorModel(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(100), unique=True, nullable=False)
    sensor_type = Column(String(50), nullable=False)  # camera, thermal, crowd, air_quality
    location = Column(String(255), nullable=True)
    status = Column(String(50), default="online")  # online, offline, maintenance
    last_reading = Column(Float, nullable=True)
    last_heartbeat = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    def __repr__(self):
        return f"<Sensor {self.sensor_id} [{self.sensor_type}]>"


# ── AI & Analytics Models ────────────────────────────────────────────────────

class AIRecommendationModel(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    status = Column(String(50), default="pending")  # pending, approved, rejected, expired
    approved_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=_utcnow)
    resolved_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<AIRecommendation {self.title} [{self.status}]>"


class CrowdSnapshotModel(Base):
    __tablename__ = "crowd_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    venue_code = Column(String(50), nullable=False)
    zone_code = Column(String(10), nullable=True)
    density = Column(Float, nullable=False)  # persons/m²
    occupancy_pct = Column(Float, nullable=False)
    flow_rate = Column(Integer, default=0)  # fans/min
    timestamp = Column(DateTime, default=_utcnow, index=True)

    def __repr__(self):
        return f"<CrowdSnapshot {self.venue_code}/{self.zone_code} {self.density}p/m²>"


class EmergencyModel(Base):
    __tablename__ = "emergencies"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(50), nullable=False)  # NORMAL, ELEVATED, HIGH, CRITICAL
    reason = Column(Text, nullable=True)
    activated_by = Column(String(255), nullable=True)
    venue_code = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    activated_at = Column(DateTime, default=_utcnow)
    deactivated_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Emergency [{self.level}] active={self.is_active}>"

