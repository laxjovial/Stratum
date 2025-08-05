import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.firebase import get_current_user
from ..crud import user as crud_user, subscription as crud_subscription
from ..db.database import get_db
from .. import models

router = APIRouter(
    prefix="/billing",
    tags=["Billing"],
)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

class CheckoutSessionRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str

class PortalSessionRequest(BaseModel):
    return_url: str

@router.post("/create-checkout-session", dependencies=[Depends(get_current_user)])
def create_checkout_session(
    request_data: CheckoutSessionRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        # This is a simplified flow. A real app would check if a customer object
        # already exists for this user/organization.
        customer = stripe.Customer.create(email=db_user.email, metadata={"organization_id": str(db_user.organization_id)})

        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=['card'],
            line_items=[{'price': request_data.price_id, 'quantity': 1}],
            mode='subscription',
            success_url=request_data.success_url,
            cancel_url=request_data.cancel_url,
        )
        return {"sessionId": checkout_session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-portal-session", dependencies=[Depends(get_current_user)])
def create_portal_session(
    request_data: PortalSessionRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    sub = crud_subscription.get_subscription_by_org_id(db, organization_id=db_user.organization_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")

    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=sub.stripe_customer_id,
            return_url=request_data.return_url,
        )
        return {"url": portal_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # This is where you would create the subscription record in your database
        # crud_subscription.create_or_update_subscription(db, session['subscription'])
        print(f"Checkout session completed: {session['id']}")
    elif event['type'] in ['customer.subscription.updated', 'customer.subscription.deleted', 'customer.subscription.created']:
        subscription = event['data']['object']
        # This is where you would update the subscription status in your database
        # crud_subscription.create_or_update_subscription(db, subscription)
        print(f"Subscription updated: {subscription['id']}, Status: {subscription['status']}")
    else:
        print(f"Unhandled event type {event['type']}")

    return Response(status_code=200)
