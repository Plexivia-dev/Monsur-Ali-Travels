import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { Loader2 } from 'lucide-react'

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
  const [workflowItems, setWorkflowItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCases() {
      try {
        const res = await apiClient.get('/api/v1/admin/cases?limit=20')
        if (res.data?.status === 'success') {
          setWorkflowItems(res.data.data || [])
        }
      } catch (err) {
        // silent fallback
      } finally {
        setLoading(false)
      }
    }
    loadCases()
  }, [])

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
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : workflowItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No active visa workflows found.
              </div>
            ) : (
              workflowItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground">
                      {item.candidateId?.name || item.client || 'Unknown Client'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColors[item.workflowStatus || item.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {item.workflowStatus || item.status || 'Pending'}
                    </span>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {item.country || 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
