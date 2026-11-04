import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Btn, Card, Field, inputCls } from '../components/ui'
export default function ProfilePage() {
  const { profile, saveProfile, toast } = useApp(); const nav = useNavigate(); const [form, setForm] = useState(profile)
  return (
    <div className="space-y-5">
      <Card className="p-6"><div className="flex flex-wrap items-center gap-4"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0F2A4A] text-2xl font-bold text-white">{form.name.split(' ').map(x => x[0]).slice(0, 2).join('')}</span><div><h2 className="text-xl font-bold">{form.name}</h2><p className="text-sm text-slate-500">{form.designation} · {form.email}</p><p className="text-sm text-slate-500">{form.office}</p></div></div>
        <form onSubmit={e => { e.preventDefault(); saveProfile(form); toast('success', 'Profile updated locally (demo).') }} className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <Field label="Full name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Designation"><input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className={inputCls} /></Field>
          <Field label="Email"><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} type="email" /></Field>
          <Field label="Phone (demo)"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputCls} /></Field>
          <div className="sm:col-span-2"><Field label="Office"><input value={form.office} onChange={e => setForm({ ...form, office: e.target.value })} className={inputCls} /></Field></div>
          <div className="flex flex-wrap gap-2 sm:col-span-2"><Btn type="submit">Save profile</Btn><Btn variant="secondary" onClick={() => nav('/settings')}>Appearance settings</Btn></div>
        </form>
        <p className="mt-4 text-xs text-slate-500">Sample profile data, editable locally. This is not connected to any directory or authentication server.</p></Card>
    </div>
  )
}
