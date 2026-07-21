import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class PermissionSchema(BaseModel):
    code: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RoleSchema(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    avatar: Optional[str] = None
    role: str = "operator"
    account_status: str = "active"

class UserCreate(UserBase):
    auth0_id: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None

class UserUpdateRole(BaseModel):
    role: str

class UserResponse(UserBase):
    id: int
    auth0_id: str
    email_verified: bool = False
    last_login: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    permissions: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    role: Optional[str] = None
    action: str
    resource: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str
    details: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str = "Medium"
    category: str = "General"
    location: Optional[str] = None
    assigned_to: Optional[str] = None

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None

class IncidentResponse(IncidentCreate):
    id: int
    status: str
    created_by: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class SystemConfigUpdate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
