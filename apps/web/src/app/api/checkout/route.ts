import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
export async function POST(req: NextRequest){
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if(!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const body = await req.json().catch(()=>({}));
  const priceId = body.priceId || "price_12345";
  try{
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/debug/checkout/success`,
      cancel_url: `${origin}/debug/checkout/cancel`
    });
    return NextResponse.json({ id: session.id, url: session.url });
  }catch(e:any){
    return NextResponse.json({ error: e.message || "Stripe error" }, { status: 500 });
  }
}
