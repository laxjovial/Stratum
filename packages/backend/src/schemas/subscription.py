from pydantic import BaseModel
import uuid
from datetime import datetime
from ..models.subscription import SubscriptionStatus

class SubscriptionBase(BaseModel):
    stripe_customer_id: str
    stripe_subscription_id: str
    status: SubscriptionStatus
    current_period_end: datetime

class SubscriptionCreate(SubscriptionBase):
    organization_id: uuid.UUID

class SubscriptionUpdate(BaseModel):
    status: SubscriptionStatus
    current_period_end: datetime

class Subscription(SubscriptionBase):
    id: uuid.UUID
    organization_id: uuid.UUID

    class Config:
        from_attributes = True
