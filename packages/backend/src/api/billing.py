import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.auth import get_current_user
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

class StellarPaymentRequest(BaseModel):
    plan_id: str

@router.get("/my-subscription")
def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get the subscription details for the currently logged-in user's organization.
    """
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    sub = crud_subscription.get_subscription_by_org_id(db, organization_id=db_user.organization_id)
    if not sub:
        return {"status": "inactive", "plan": "Free", "current_period_end": None}
    
    # Include bank details from organization if applicable
    org = db_user.organization
    return {
        **sub.__dict__,
        "bank_details": org.bank_details if org else None,
        "stellar_wallet": org.stellar_wallet if org else None
    }

@router.post("/paystack/initialize")
def initialize_paystack(
    request: StellarPaymentRequest, # Reusing plan_id schema
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    import requests
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    paystack_key = os.getenv("PAYSTACK_SECRET_KEY")
    if not paystack_key:
        raise HTTPException(status_code=503, detail="Paystack not configured")

    # In a real app, amount would be based on the plan_id
    amount = 500000 # 5,000 NGN in kobo
    
    headers = {
        "Authorization": f"Bearer {paystack_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "email": db_user.email,
        "amount": amount,
        "callback_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard/billing?status=success",
        "metadata": {
            "organization_id": str(db_user.organization_id),
            "plan_id": request.plan_id
        }
    }
    
    response = requests.post("https://api.paystack.co/transaction/initialize", json=payload, headers=headers)
    return response.json()

@router.post("/stellar/create-payment-intent")
def create_stellar_intent(
    request: StellarPaymentRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    from ..core.stellar import stellar_service
    db_user = crud_user.get_user_by_firebase_uid(db, firebase_uid=current_user["uid"])
    
    memo = stellar_service.generate_memo()
    # In a real app, you'd store this memo in the Subscription record
    # to track the pending payment.
    
    return {
        "receiving_address": os.getenv("STELLAR_RECEIVING_ADDRESS", "G..."),
        "memo": memo,
        "amount_xlm": 100.0, # Example amount
        "instruction": "Please send XLM to the address above with the specified memo."
    }

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
