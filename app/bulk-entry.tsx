"use client";
import { useEffect, useMemo, useState } from "react";
import { Save, Sheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Teacher = { id:number; name:string; nic:string };
type Row = { teacherId:number; deposit:string; loan:string; loanRecovery:string; festivalLoan:string; festivalRecovery:string };
const blank=(id:number):Row=>({teacherId:id,deposit:"",loan:"",loanRecovery:"",festivalLoan:"",festivalRecovery:""});
export default function BulkEntry({teachers,onDone}:{teachers:Teacher[];onDone:()=>void}){
 const [month,setMonth]=useState(new Date().toISOString().slice(0,7)),[rows,setRows]=useState<Row[]>(()=>teachers.map(t=>blank(t.id))),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
 useEffect(()=>setRows(teachers.map(t=>blank(t.id))),[teachers]);
 const total=useMemo(()=>rows.reduce((s,r)=>s+[r.deposit,r.loan,r.loanRecovery,r.festivalLoan,r.festivalRecovery].reduce((a,v)=>a+(Number(v)||0),0),0),[rows]);
 const change=(id:number,key:keyof Row,value:string)=>setRows(v=>v.map(r=>r.teacherId===id?{...r,[key]:value}:r));
 const save=async()=>{setSaving(true);setMessage("");const payload={month,rows:rows.map(r=>({teacherId:r.teacherId,deposit:Number(r.deposit)||0,loan:Number(r.loan)||0,loanRecovery:Number(r.loanRecovery)||0,festivalLoan:Number(r.festivalLoan)||0,festivalRecovery:Number(r.festivalRecovery)||0}))};const res=await fetch("/api/transactions/bulk",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const data=await res.json();setSaving(false);if(!res.ok){setMessage(data.error||"Unable to save amounts");return}setMessage(`${data.saved} amounts saved successfully`);setRows(teachers.map(t=>blank(t.id)));await onDone()};
 return <section className="panel bulk-panel"><div className="panel-title"><div><h2><Sheet size={20}/> Monthly Bulk Entry</h2><p>Enter all teacher amounts in one Excel-style form</p></div><div className="month-field"><Label>Entry month</Label><Input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></div></div><div className="bulk-scroll"><table className="bulk-table"><thead><tr><th>Teacher</th><th>NIC</th><th>Deposit</th><th>Regular Loan</th><th>Loan Recovery</th><th>Festival Loan</th><th>Festival Recovery</th></tr></thead><tbody>{teachers.map(t=>{const r=rows.find(x=>x.teacherId===t.id)||blank(t.id);return <tr key={t.id}><td><strong>{t.name}</strong></td><td>{t.nic}</td>{(["deposit","loan","loanRecovery","festivalLoan","festivalRecovery"] as const).map(k=><td key={k}><Input aria-label={`${t.name} ${k}`} type="number" min="0" step="0.01" placeholder="0" value={r[k]} onChange={e=>change(t.id,k,e.target.value)}/></td>)}</tr>})}</tbody></table></div>{!teachers.length&&<div className="empty-card">Add teachers before entering monthly amounts.</div>}<div className="bulk-footer"><div><span>Total entered</span><strong>LKR {total.toLocaleString("en-LK")}</strong>{message&&<p className={message.includes("successfully")?"save-success":"error"}>{message}</p>}</div><Button disabled={saving||!teachers.length} onClick={save}><Save/>{saving?"Saving…":"Save All Amounts"}</Button></div></section>
}
