import {
  TrendingUpIcon,
  ReceiptTextIcon,
  UsersIcon,
  BriefcaseIcon,
} from 'lucide-react'

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import logo from '@/assets/logo.png'

const STAGE_LABELS = {
  INTAKE: 'Intake / New',
  ENTRY: 'Entry',
  PROCESSING: 'Processing',
  UNDER_PROCESS: 'Under Process',
  OFFER_LETTER: 'Offer Letter Approved',
  APPROVED_OFFER_LETTER: 'Offer Letter Approved',
  SUBMITTED_EMBASSY_BSF: 'Submitted (Embassy/BSF)',
  COMPLETED_DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
}

export const SalesMetricsCard = ({ className }) => {
  const [metrics, setMetrics] = useState({
    received: 0,
    bills: 0,
    newClients: 0,
    filesRemaining: 0,
  })
  const [caseUpdates, setCaseUpdates] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const overviewRes = await apiClient.get('/api/v1/admin/dashboard/overview')
        if (!isMounted) return

        const overview = overviewRes.data?.data || {}
        setMetrics({
          received: overview.totalReceived ?? overview.billing?.totalPaid ?? 0,
          bills: overview.totalBilled ?? overview.billing?.totalBilled ?? 0,
          newClients: overview.totalClients ?? 0,
          filesRemaining: overview.filesRemaining ?? 0,
        })

        if (overview.latestUpdates && Array.isArray(overview.latestUpdates)) {
          setCaseUpdates(overview.latestUpdates)
        }
      } catch (err) {
        console.error('Failed to load overview data', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent'
    const d = new Date(dateStr)
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const dynamicMetricsData = [
    {
      icons: <TrendingUpIcon className="size-5" />,
      title: 'Total Received',
      value: `${metrics.received.toLocaleString()} BDT`,
      accent: 'text-emerald-600 bg-emerald-50',
    },
    {
      icons: <ReceiptTextIcon className="size-5" />,
      title: 'Total Bills',
      value: `${metrics.bills.toLocaleString()} BDT`,
      accent: 'text-rose-600 bg-rose-50',
    },
    {
      icons: <UsersIcon className="size-5" />,
      title: 'Total Clients',
      value: metrics.newClients.toLocaleString(),
      accent: 'text-blue-600 bg-blue-50',
    },
    {
      icons: <BriefcaseIcon className="size-5" />,
      title: 'Files In-Process',
      value: metrics.filesRemaining.toLocaleString(),
      accent: 'text-amber-600 bg-amber-50',
    },
  ]

  return (
    <Card className={`bg-white border border-black/10 shadow-sm ${className ?? ''}`}>
      <CardContent className="pt-6">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Column: Agency Branding & 4 Primary KPI Cards */}
          <div className="flex flex-col justify-between gap-6 lg:col-span-3">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Logo"
                className="size-11 p-1 bg-white rounded-xl object-contain shadow-xs shrink-0 border border-black/10"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-black tracking-tight">Monsur Ali Travels</span>
                <span className="text-xs text-black/50 font-medium">Enterprise Management & Operations</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {dynamicMetricsData.map((metric, index) => (
                <Card
                  key={index}
                  className="bg-white border border-black/10 shadow-xs hover:border-black/20 hover:shadow-sm transition-all py-1.5"
                >
                  <CardContent className="flex items-center gap-3.5 px-4 py-3">
                    <Avatar className="rounded-lg h-10 w-10">
                      <AvatarFallback className={`${metric.accent} shrink-0 rounded-lg`}>
                        {metric.icons}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="text-black/60 text-xs font-medium truncate">{metric.title}</span>
                      <span className="text-lg font-bold text-black tracking-tight truncate">
                        {isLoading ? '-' : metric.value}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column: Latest Updates for Case Files */}
          <Card className="bg-white border border-black/10 shadow-xs flex flex-col lg:col-span-2">
            <CardHeader className="gap-1 flex flex-row items-center justify-between pb-3 px-5 pt-4 border-b border-black/5">
              <CardTitle className="text-sm font-semibold text-black">Latest Updates</CardTitle>
              <Link
                to="/admin/cases"
                className="text-xs font-medium text-primary hover:underline shrink-0"
              >
                View All Files →
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-black/5 px-5 py-2">
              {caseUpdates.length === 0 ? (
                <p className="text-xs text-black/50 italic py-4 text-center">
                  {isLoading ? 'Loading updates...' : 'No case files recorded yet.'}
                </p>
              ) : (
                caseUpdates.map((item) => (
                  <div key={item._id || item.did || item.id} className="flex items-start justify-between py-2.5 gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-black truncate">
                        {item.applicantName || item.caseNumber || 'Unnamed Case'}
                      </span>
                      <span className="text-[11px] text-black/50 truncate">
                        {item.caseNumber} · {STAGE_LABELS[item.status] || item.status || 'INTAKE'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/[0.05] text-black/80 rounded-md px-2 py-0.5 whitespace-nowrap">
                        {item.caseType || 'GENERAL'}
                      </span>
                      <span className="text-[10px] text-black/40 whitespace-nowrap">
                        {formatDate(item.updatedAt || item.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export default SalesMetricsCard

