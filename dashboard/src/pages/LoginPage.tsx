import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, CalendarDays, Eye, EyeOff, Loader2, LockKeyhole, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { Btn, Field, inputCls, Modal } from '../components/ui'
const schema = z.object({ email: z.string().email('Enter a valid email address'), password: z.string().min(4, 'Password must be at least 4 characters') })
type Form = z.infer<typeof schema>
export default function LoginPage() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })
  const [show, setShow] = useState(false); const [loading, setLoading] = useState(false); const [forgot, setForgot] = useState(false); const [forgotDone, setForgotDone] = useState(false); const [forgotEmail, setForgotEmail] = useState('')
  const { login, toast } = useApp(); const nav = useNavigate()
  const submit = (data: Form) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (data.email === 'director@demo.institute' && data.password === 'demo1234') { login(); toast('success', 'Welcome back, Director. Demo session started.'); nav('/') }
      else toast('error', 'Those demo credentials do not match. Use director@demo.institute / demo1234, or tap “Use demo login”.')
    }, 900)
  }
  return (
    <div className="login-screen">
      <header className="login-brand">
        <span className="login-brand-icon"><Building2 size={19} /></span>
        <span><strong>Director’s Office</strong><small>Institute Management</small></span>
      </header>
      <main className="login-main">
        <section className="login-intro">
          <span className="login-eyebrow">INSTITUTE MANAGEMENT</span>
          <h1>Everything your institute needs, in one place.</h1>
          <p>Review approvals, support your teams, and keep daily operations moving with a clear view of your institute.</p>
          <div className="login-highlights">
            <span><Building2 size={15} /> Institute-wide overview</span>
            <span><Users size={15} /> Staff and department tools</span>
            <span><CalendarDays size={15} /> Tasks, events and approvals</span>
          </div>
        </section>
        <form onSubmit={handleSubmit(submit)} className="login-card">
          <div className="login-card-heading">
            <span className="login-card-icon"><LockKeyhole size={18} /></span>
            <div><h2>Welcome back</h2><p>Sign in to your director account</p></div>
          </div>
          <div className="login-fields">
            <Field label="Email or username" error={errors.email?.message}><input {...register('email')} className={inputCls} placeholder="director@demo.institute" autoComplete="email" /></Field>
            <Field label="Password" error={errors.password?.message}><div className="relative"><input {...register('password')} type={show ? 'text' : 'password'} className={`${inputCls} pr-11`} placeholder="••••••••" /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
            <div className="login-options"><label><input type="checkbox" /> Remember me</label><button type="button" onClick={() => setForgot(true)}>Forgot password?</button></div>
            <Btn type="submit" className="login-submit w-full" disabled={loading}>{loading && <Loader2 className="animate-spin" size={18} />} {loading ? 'Signing in…' : 'Sign in'}</Btn>
            <button type="button" className="login-demo" onClick={() => { setValue('email', 'director@demo.institute'); setValue('password', 'demo1234') }}>Use demo login</button>
            <div className="login-demo-note"><strong>Demo account</strong><span>director@demo.institute <i>·</i> demo1234</span></div>
          </div>
        </form>
      </main>
      <footer className="login-footer"><span>© {new Date().getFullYear()} Director’s Office</span><span>Demo authentication · No real account required</span></footer>
      <Modal open={forgot} onClose={() => setForgot(false)} title="Forgot password — demo flow">
        {forgotDone ? <div><p className="text-sm text-slate-600 dark:text-slate-300">If this were a real institute account, a reset link would be sent to <strong>{forgotEmail}</strong>. In this frontend demo, no email is sent and no password is changed.</p><div className="mt-5 flex justify-end"><Btn onClick={() => { setForgot(false); setForgotDone(false) }}>Done</Btn></div></div>
        : <form onSubmit={e => { e.preventDefault(); if (forgotEmail.includes('@')) setForgotDone(true); else toast('error', 'Enter a valid email address.') }} className="space-y-4"><Field label="Work email"><input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className={inputCls} placeholder="you@demo.institute" /></Field><div className="flex justify-end gap-2"><Btn variant="secondary" onClick={() => setForgot(false)}>Cancel</Btn><Btn type="submit">Send reset link (demo)</Btn></div></form>}
      </Modal>
    </div>
  )
}
