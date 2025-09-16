"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Page(){
  const supabase = supabaseBrowser();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [user,setUser]=useState<any>(null);
  const [msg,setMsg]=useState<string>("");

  useEffect(()=>{ supabase.auth.getUser().then(({data})=>setUser(data.user)); },[]);

  async function signup(){
    setMsg("");
    const { error } = await supabase.auth.signUp({ email, password });
    setMsg(error ? error.message : "Signup request sent");
  }
  async function signin(){
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? error.message : "Signed in");
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }
  async function signout(){
    setMsg("");
    await supabase.auth.signOut();
    setUser(null);
    setMsg("Signed out");
  }

  return (
    <main className="p-8 space-y-6 max-w-md">
      <h1 className="text-2xl font-semibold">Supabase Auth Debug</h1>
      <div className="space-y-2">
        <input className="border rounded-xl px-3 py-2 w-full" placeholder="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="border rounded-xl px-3 py-2 w-full" type="password" placeholder="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl border" onClick={signup}>Sign up</button>
          <button className="px-4 py-2 rounded-xl border" onClick={signin}>Sign in</button>
          <button className="px-4 py-2 rounded-xl border" onClick={signout}>Sign out</button>
        </div>
      </div>
      <pre className="text-sm whitespace-pre-wrap">{user ? JSON.stringify(user, null, 2) : "No user"}</pre>
      {msg ? <p>{msg}</p> : null}
    </main>
  );
}
