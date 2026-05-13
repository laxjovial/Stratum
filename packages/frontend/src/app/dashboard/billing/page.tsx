'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '../../../lib/api';
import { CreditCard, Zap, ShieldCheck, CheckCircle2, ArrowRight, Loader2, History, LayoutPanelLeft, Wallet, Landmark, Copy, Check, Smartphone } from 'lucide-react';

interface Subscription {
  status: string;
  plan?: string;
  current_period_end: string | null;
  bank_details?: string | null;
  stellar_wallet?: string | null;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'stellar' | 'bank' | 'paystack'>('stripe');
  const [stellarIntent, setStellarIntent] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const api = useApi();

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await api.get('/billing/my-subscription');
      setSubscription(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleStellarPay = async () => {
    try {
      const intent = await api.post('/billing/stellar/create-payment-intent', { plan_id: 'pro' });
      setStellarIntent(intent);
      setPaymentMethod('stellar');
    } catch (err) {
      alert('Failed to initiate Stellar payment.');
    }
  };

  const handlePaystackPay = async () => {
    setIsProcessing(true);
    try {
      const response = await api.post('/billing/paystack/initialize', { plan_id: 'pro' });
      if (response.status && response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error(response.message || 'Paystack initialization failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Billing & Subscription</h1>
        <p className="text-gray-500 font-medium">Manage your organization's plan and payment methods.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Current Plan & Methods */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{subscription?.plan || 'Free Tier'}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{subscription?.status || 'Inactive'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-900">$49/mo</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Next: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="flex bg-gray-50 p-1.5 rounded-2xl space-x-1 overflow-x-auto scrollbar-hide">
              {[
                { id: 'stripe', icon: CreditCard, label: 'Card' },
                { id: 'paystack', icon: Smartphone, label: 'Paystack' },
                { id: 'stellar', icon: Wallet, label: 'Stellar' },
                { id: 'bank', icon: Landmark, label: 'Bank' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`flex-1 min-w-[100px] flex items-center justify-center space-x-2 py-3 rounded-xl font-black text-xs transition-all ${
                    paymentMethod === m.id ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'stripe' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-6 border border-gray-100 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-6 bg-gray-900 rounded flex items-center justify-center text-[8px] font-bold text-white italic">VISA</div>
                      <p className="text-sm font-bold text-gray-700">•••• 4242</p>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Default</span>
                  </div>
                </div>
                <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs hover:bg-gray-800 transition-all">
                  Manage in Stripe Portal
                </button>
              </div>
            )}

            {paymentMethod === 'paystack' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-8 text-center space-y-6 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                  <Smartphone className="w-12 h-12 text-emerald-200 mx-auto" />
                  <div className="space-y-2">
                    <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Local & International Payments</p>
                    <p className="text-xs text-emerald-600 font-medium">Pay securely via Paystack with your card, bank, or transfer.</p>
                  </div>
                  <button 
                    onClick={handlePaystackPay}
                    disabled={isProcessing}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <span>Secure Checkout with Paystack</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === 'stellar' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                {!stellarIntent ? (
                  <div className="p-8 text-center space-y-4 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <Wallet className="w-12 h-12 text-blue-200 mx-auto" />
                    <p className="text-sm font-bold text-blue-900">Pay with Lumens (XLM)</p>
                    <button 
                      onClick={handleStellarPay}
                      className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                    >
                      Generate Payment Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-gray-900 text-white rounded-3xl space-y-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Receiving Wallet</p>
                        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl">
                          <code className="text-xs truncate mr-4">{stellarIntent.receiving_address}</code>
                          <button onClick={() => copyToClipboard(stellarIntent.receiving_address)} className="p-2 hover:bg-white/10 rounded-lg">
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Required Memo (ID)</p>
                        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-blue-500/30">
                          <code className="text-sm font-black">{stellarIntent.memo}</code>
                          <button onClick={() => copyToClipboard(stellarIntent.memo)} className="p-2 hover:bg-white/10 rounded-lg">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                  <div className="flex items-center space-x-3 text-gray-900">
                    <Landmark className="w-6 h-6" />
                    <h3 className="font-black uppercase tracking-tight">Wire Instructions</h3>
                  </div>
                  <div className="space-y-3 pt-2">
                    {[
                      { label: 'Bank Name', value: 'Global Settlement Bank' },
                      { label: 'Account Holder', value: 'Stratum Technologies Inc.' },
                      { label: 'Account Number (IBAN)', value: 'DE89 3704 0044 0532 0130 00' },
                      { label: 'SWIFT / BIC', value: 'GBSBDEFF' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                        <span className="text-xs font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Plans Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white space-y-6 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black leading-tight tracking-tight uppercase">Power up your Org</h2>
              <p className="text-blue-100 text-sm font-medium leading-relaxed">
                Add more seats or unlock Advanced RAG with our Professional tier.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
