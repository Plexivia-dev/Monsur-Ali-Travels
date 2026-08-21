import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const workflowItems = [
  { client: "Imtiaz Ahmed", status: "Biometrics Completed", country: "Canada", date: "2026-08-21" },
  { client: "Zubaida Rahman", status: "Embassy Interview Scheduled", country: "USA", date: "2026-08-21" },
  { client: "Kamrul Hasan", status: "Document Verification Pending", country: "UK", date: "2026-08-20" },
  { client: "Nusrat Jahan", status: "Visa Issued Successfully", country: "Sweden", date: "2026-08-20" },
  { client: "Farhan Kabir", status: "Application Submitted", country: "Australia", date: "2026-08-19" },
  { client: "Sadia Islam", status: "Medical Checkup Done", country: "Germany", date: "2026-08-19" },
  { client: "Mahbub Alam", status: "Visa Refused", country: "Italy", date: "2026-08-18" },
  { client: "Roushan Ara", status: "Police Clearance Received", country: "Canada", date: "2026-08-18" },
]

const statusColors = {
  'Visa Issued Successfully': 'bg-green-100 text-green-700',
  'Visa Refused': 'bg-red-100 text-red-700',
  'Embassy Interview Scheduled': 'bg-blue-100 text-blue-700',
  'Biometrics Completed': 'bg-teal-100 text-teal-700',
  'Document Verification Pending': 'bg-amber-100 text-amber-700',
  'Application Submitted': 'bg-purple-100 text-purple-700',
  'Medical Checkup Done': 'bg-cyan-100 text-cyan-700',
  'Police Clearance Received': 'bg-indigo-100 text-indigo-700',
}

export default function VisaWorkflowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visa Workflows</h1>
        <p className="text-muted-foreground text-sm mt-1">Client status updates and visa processing pipeline.</p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Client Status Updates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {workflowItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{item.client}</span>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColors[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {item.country}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
