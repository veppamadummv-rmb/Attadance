"use client";
import { useState } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TeacherLogin({ adminSignInPath }: { adminSignInPath: string }) {
  const [nic, setNic] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true); setError("");
    const response = await fetch("/api/teacher-login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ nic, phone }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) { setError(data.error || "Unable to login"); return; }
    window.location.reload();
  };

  return <main className="login-shell"><section className="login-card teacher-login-card"><div className="brand-mark">SL</div><p className="eyebrow">TEACHER LOGIN</p><h1>School Loan Board</h1><p className="intro">Enter the NIC number and phone number registered by your school administrator.</p><div className="link-form"><Label>NIC Number</Label><Input autoComplete="username" value={nic} onChange={e=>setNic(e.target.value)} placeholder="Enter your NIC number"/><Label>Phone Number</Label><Input type="tel" autoComplete="current-password" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Enter your phone number" onKeyDown={e=>{if(e.key==="Enter")login()}}/>{error&&<p className="error">{error}</p>}<Button onClick={login} disabled={loading}><LogIn/>{loading?"Checking…":"Teacher Login"}</Button></div><div className="login-divider"><span>Administrator</span></div><a className="admin-login-link" href={adminSignInPath} target="_top"><ShieldCheck size={17}/> Admin Login</a><p className="privacy">Teachers can view only their own deposits, loans and recovery records.</p></section></main>;
}
