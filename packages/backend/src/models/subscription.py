import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as pgEnum
from sqlalchemy.dialects.postgresql import UUID as pgUUID
from .base import Base

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    INCOMPLETE = "incomplete"
    PAST_DUE = "past_due"
    TRIALING = "trialing"

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    organization_id = Column(pgUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, unique=True)

    stripe_customer_id = Column(String(255), nullable=False, unique=True, index=True)
    stripe_subscription_id = Column(String(255), nullable=False, unique=True, index=True)

    status = Column(pgEnum(SubscriptionStatus, name="subscription_status_enum"), nullable=False)

    current_period_end = Column(DateTime(timezone=True), nullable=False)

    def __repr__(self):
        return f"<Subscription(org_id='{self.organization_id}', status='{self.status}')>"
