import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/config";
export async function POST(req: NextRequest){
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
