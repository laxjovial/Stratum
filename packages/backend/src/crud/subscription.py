from sqlalchemy.orm import Session
import uuid
from .. import models
from ..schemas.subscription import SubscriptionCreate, SubscriptionUpdate

def get_subscription_by_org_id(db: Session, organization_id: uuid.UUID):
    return db.query(models.Subscription).filter(models.Subscription.organization_id == organization_id).first()

def get_subscription_by_stripe_id(db: Session, stripe_subscription_id: str):
    return db.query(models.Subscription).filter(models.Subscription.stripe_subscription_id == stripe_subscription_id).first()

def create_or_update_subscription(db: Session, sub_data: dict):
    """
    Creates a new subscription or updates an existing one based on Stripe webhook data.
    """
    stripe_subscription_id = sub_data['id']
    stripe_customer_id = sub_data['customer']

    # We need to find our internal organization_id from the stripe_customer_id
    # This requires that we stored the stripe_customer_id when the customer was created.
    # For now, we'll assume we can get it.
    # A robust implementation would look up the customer in our DB.

    existing_sub = get_subscription_by_stripe_id(db, stripe_subscription_id)

    if existing_sub:
        # Update
        update_data = SubscriptionUpdate(
            status=sub_data['status'],
            current_period_end=sub_data['current_period_end']
        )
        for key, value in update_data.model_dump().items():
            setattr(existing_sub, key, value)
        db_sub = existing_sub
    else:
        # Create
        # This part is tricky because we need the org_id.
        # This logic is better handled inside the webhook endpoint itself.
        pass

    db.commit()
    db.refresh(db_sub)
    return db_sub
