import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const logs = [
  { action: "Passport submitted", agent: "Rahim Uddin", time: "5 mins ago", type: "upload" },
  { action: "Visa approved", agent: "Nadia Islam", time: "18 mins ago", type: "success" },
  { action: "New file opened", agent: "Jalal Ahmed", time: "1 hour ago", type: "info" },
  { action: "Payment received", agent: "Meher Nigar", time: "2 hours ago", type: "payment" },
  { action: "Embassy form filled", agent: "Tariq Hassan", time: "3 hours ago", type: "form" },
  { action: "Document rejected", agent: "Shirin Akter", time: "Yesterday", type: "error" },
  { action: "Biometric done", agent: "Karim Molla", time: "Yesterday", type: "info" },
  { action: "Police clearance received", agent: "Anisur Rahman", time: "2 days ago", type: "upload" },
  { action: "Medical report uploaded", agent: "Farzana Begum", time: "2 days ago", type: "upload" },
  { action: "Visa refused", agent: "Rokibul Hasan", time: "3 days ago", type: "error" },
  { action: "Application resubmitted", agent: "Sonia Akter", time: "3 days ago", type: "form" },
  { action: "Interview scheduled", agent: "Nur Alam", time: "4 days ago", type: "info" },
]

const dotColor = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  payment: 'bg-amber-500',
  upload: 'bg-blue-500',
  form: 'bg-indigo-500',
  info: 'bg-primary',
}

const badgeColor = {
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  payment: 'bg-amber-100 text-amber-700',
  upload: 'bg-blue-100 text-blue-700',
  form: 'bg-indigo-100 text-indigo-700',
  info: 'bg-primary/10 text-primary',
}

export default function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">All recent admin and agent activity across the system.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {logs.map((log, i) => (
          <Card key={i} className="shadow-none ring-1 ring-foreground/10 hover:shadow-sm transition-shadow">
            <CardContent className="flex items-start gap-4 pt-4 pb-4">
              <div className={`size-2.5 rounded-full mt-1.5 shrink-0 ${dotColor[log.type]}`} />
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-sm font-semibold text-foreground">{log.action}</span>
                <span className="text-xs text-muted-foreground">{log.agent}</span>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${badgeColor[log.type]}`}>
                  {log.type}
                </span>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">{log.time}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
