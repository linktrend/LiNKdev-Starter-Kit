"use client";
import { useState } from "react";
export default function Page(){
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|undefined>();
  const start = async () => {
    setLoading(true); setError(undefined);
    try{
      const res = await fetch("/api/checkout",{ method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || "Failed");
      if(data.url) window.location.href = data.url;
    }catch(e:any){ setError(e.message || "Error"); } finally{ setLoading(false); }
  };
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Stripe Checkout Debug</h1>
      <button className="px-4 py-2 rounded-xl border" onClick={start} disabled={loading}>{loading ? "Redirecting..." : "Start Test Checkout"}</button>
      {error ? <p className="text-red-600">{error}</p> : null}
    </main>
  );
}
