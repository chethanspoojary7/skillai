import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store/AppContext'
import { Btn, Card, Confirm, DropdownSelect, Field, inputCls } from '../components/ui'
import type { Settings } from '../types'
export default function SettingsPage() {
  const { settings, saveSettings, resetDemo, toast, log } = useApp(); const [form, setForm] = useState<Settings>(settings); const [confirmReset, setConfirmReset] = useState(false)
  const lastSaved = useRef(JSON.stringify(settings))
  const hasChanges = JSON.stringify(form) !== JSON.stringify(settings)
  useEffect(() => { setForm(settings); lastSaved.current = JSON.stringify(settings) }, [settings])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', form.theme === 'dark')
    return () => { document.documentElement.classList.toggle('dark', settings.theme === 'dark') }
  }, [form.theme, settings.theme])
  const save = () => {
    if (!form.instituteName.trim() || !form.academicYear.trim()) { toast('error', 'Institute name and academic year are required.'); return }
    const updated = { ...form, instituteName: form.instituteName.trim(), academicYear: form.academicYear.trim() }
    const serialized = JSON.stringify(updated)
    if (serialized === JSON.stringify(settings) || serialized === lastSaved.current) return
    lastSaved.current = serialized
    saveSettings(updated)
    log({ actor: 'Director', action: 'Changed settings', recordType: 'System', recordId: 'Settings', description: 'Institute settings updated' })
    toast('success', 'Settings saved in this browser.')
  }
  const discardChanges = () => setForm(settings)
  return (
    <div className="space-y-5">
      <Card className="p-5"><h3 className="font-semibold">Institute settings</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Institute name"><input value={form.instituteName} onChange={e => setForm({ ...form, instituteName: e.target.value })} className={inputCls} required /></Field><Field label="Academic year"><input value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} className={inputCls} required /></Field><Field label="Default reporting period"><DropdownSelect ariaLabel="Default reporting period" value={form.reportingPeriod} onChange={reportingPeriod => setForm({ ...form, reportingPeriod })} options={['Monthly', 'Quarterly', 'Semester', 'Academic year'].map(item => ({ value: item, label: item }))} /></Field></div></Card>
      <Card className="p-5"><h3 className="font-semibold">Appearance</h3><div className="mt-4 grid gap-4 sm:grid-cols-3"><Field label="Theme"><DropdownSelect ariaLabel="Theme" value={form.theme} onChange={theme => setForm({ ...form, theme: theme as Settings['theme'] })} options={[{ value: 'light', label: 'Light mode' }, { value: 'dark', label: 'Dark mode' }]} /></Field><Field label="Sidebar preference"><DropdownSelect ariaLabel="Sidebar preference" value={form.sidebar} onChange={sidebar => setForm({ ...form, sidebar: sidebar as Settings['sidebar'] })} options={[{ value: 'expanded', label: 'Expanded' }, { value: 'collapsed', label: 'Collapsed' }]} /></Field><Field label="Density"><DropdownSelect ariaLabel="Density" value={form.density} onChange={density => setForm({ ...form, density: density as Settings['density'] })} options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]} /></Field></div><p className="mt-2 text-xs text-slate-500">Theme preview applies immediately. Save to keep the appearance and other settings after reload.</p></Card>
      <Card className="p-5"><h3 className="font-semibold">Notification preferences</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">{([['notifyApprovals', 'Approval alerts'], ['notifyDeadlines', 'Task deadline alerts'], ['notifyOverdue', 'Overdue alerts'], ['notifyPerformance', 'Performance alerts']] as const).map(([k, l]) => <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={form[k]} onChange={e => setForm({ ...form, [k]: e.target.checked })} className="h-4 w-4 accent-[#0F2A4A]" />{l}</label>)}</div></Card>
      <div className="flex flex-wrap gap-2"><Btn onClick={save} disabled={!hasChanges}>Save settings</Btn><Btn variant="secondary" onClick={discardChanges} disabled={!hasChanges}>Discard changes</Btn><Btn variant="danger" onClick={() => setConfirmReset(true)}>Reset Demo Data</Btn></div>
      <Confirm open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset all demo data?" text="This restores the original seed approvals, tasks, notifications and activity, and clears your demo changes from this browser." confirmLabel="Reset demo data" onConfirm={() => { resetDemo(); setConfirmReset(false); toast('success', 'Demo data reset to the original seed.') }} />
    </div>
  )
}
