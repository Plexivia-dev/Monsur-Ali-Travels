import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { Loader2, Eye, FolderOpen } from 'lucide-react'
import { CaseDetailDrawer } from '@/components/workflow/CaseDetailDrawer'
import { HeaderTitle } from '@shared/components/common/HeaderTitle'

const statusColors = {
  'Visa Issued Successfully': 'bg-green-100 text-green-700',
  'Visa Refused': 'bg-red-100 text-red-700',
  'Embassy Interview Scheduled': 'bg-blue-100 text-blue-700',
  'Biometrics Completed': 'bg-teal-100 text-teal-700',
  'Document Verification Pending': 'bg-amber-100 text-amber-700',
  'Application Submitted': 'bg-purple-100 text-purple-700',
  'Medical Checkup Done': 'bg-cyan-100 text-cyan-700',
  'Police Clearance Received': 'bg-indigo-100 text-indigo-700',
  'ENTRY': 'bg-black/[0.04] text-black',
  'PROCESSING': 'bg-sky-100 text-sky-700',
  'APPROVED_OFFER_LETTER': 'bg-emerald-100 text-emerald-700',
  'SUBMITTED_EMBASSY_BSF': 'bg-amber-100 text-amber-700',
  'COMPLETED_DELIVERED': 'bg-emerald-100 text-emerald-800',
}

export default function VisaWorkflowsPage() {
  const navigate = useNavigate()
  const [workflowItems, setWorkflowItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCaseDid, setSelectedCaseDid] = useState(null)

  const loadCases = async () => {
    try {
      const res = await apiClient.get('/api/v1/client/cases?limit=50')
      if (res.data?.status === 'success') {
        setWorkflowItems(res.data.data || res.data.cases || [])
      }
    } catch (err) {
      // silent fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [])

  return (
    <div className="space-y-6">
      <HeaderTitle
        variant="general"
        icon={FolderOpen}
        title="Visa Workflows"
        subtitle="Client status updates, dossier records, and visa processing pipeline."
      />

      <Card className="bg-white border border-black/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Client Status Updates & Case Dossiers</CardTitle>
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
                <div
                  key={item.did || item._id}
                  onClick={() => navigate(`/admin/visa-workflows/${item.did || item._id}`)}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      <FolderOpen className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.applicantName || item.clientId?.name || item.client || 'Client File'}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.caseNumber || 'CASE'} • {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColors[item.workflowStatus || item.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {item.workflowStatus || item.status || 'Pending'}
                    </span>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {item.destinationCountry || item.country || item.caseType?.toUpperCase() || 'Overseas'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/visa-workflows/${item.did || item._id}`);
                      }}
                      className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="View Workflow"
                    >
                      <Eye className="size-4 text-primary" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Case Detail & Dossier Drawer */}
      <CaseDetailDrawer
        caseDid={selectedCaseDid}
        isOpen={Boolean(selectedCaseDid)}
        onClose={() => setSelectedCaseDid(null)}
        onRefresh={loadCases}
      />
    </div>
  )
}
