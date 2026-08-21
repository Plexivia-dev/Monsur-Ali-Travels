import { Bar, BarChart, Label, Pie, PieChart } from 'recharts'
import {
  TrendingUpIcon,
  BadgePercentIcon,
  DollarSignIcon,
  ShoppingBagIcon,
  ChartNoAxesCombinedIcon,
  CirclePercentIcon
} from 'lucide-react'

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import logo from '@/assets/logo.png'

const ACTION_COLORS = {
  CREATE: 'bg-green-500',
  UPDATE: 'bg-blue-500',
  SOFT_DELETE: 'bg-red-500',
  AUTH_LOGIN: 'bg-sky-500',
  STATUS_TRANSITION: 'bg-indigo-500',
}

const MetricsData = [
  {
    icons: <TrendingUpIcon className='size-5' />,
    title: 'Received',
    value: '11,548 BDT'
  },
  {
    icons: <BadgePercentIcon className='size-5' />,
    title: 'Bills',
    value: '1,326 BDT'
  },
  {
    icons: <DollarSignIcon className='size-5' />,
    title: 'New client',
    value: '17,356'
  },
  {
    icons: <ShoppingBagIcon className='size-5' />,
    title: 'Files Remaining',
    value: '248'
  }
]

const clientUpdates = [
  {
    id: 1,
    client: "Imtiaz Ahmed",
    status: "Biometrics Completed",
    country: "Canada",
    time: "10 mins ago"
  },
  {
    id: 2,
    client: "Zubaida Rahman",
    status: "Embassy Interview Scheduled",
    country: "USA",
    time: "2 hours ago"
  },
  {
    id: 3,
    client: "Kamrul Hasan",
    status: "Document Verification Pending",
    country: "UK",
    time: "4 hours ago"
  },
  {
    id: 4,
    client: "Nusrat Jahan",
    status: "Visa Issued Successfully",
    country: "Sweden",
    time: "Yesterday"
  }
]

export const SalesMetricsCard = ({ className }) => {
  const [liveLogs, setLiveLogs] = useState([])

  useEffect(() => {
    async function loadRecentLogs() {
      try {
        const res = await apiClient.get('/api/v1/admin/system/logs?limit=6')
        if (res.data?.status === 'success') {
          setLiveLogs(res.data.data || [])
        }
      } catch (err) {
        // silent fallback
      }
    }
    loadRecentLogs()
  }, [])

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Recent'
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className={`bg-white border border-gray-200 shadow-md ${className ?? ''}`}>
      <CardContent className="pt-6">
        <div className='grid gap-6 lg:grid-cols-5'>
          <div className='flex flex-col justify-between gap-7 lg:col-span-3'>
            <span className='text-lg font-semibold'>Sales metrics</span>
            <div className='flex items-center gap-3'>
              <img src={logo} alt="Logo" className="size-10.5 p-1 bg-white rounded-full object-contain shadow-sm shrink-0 border border-border" />
              <div className='flex flex-col gap-0.5'>
                <span className='text-xl font-bold text-foreground'>Monsur Ali Travels</span>
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              {MetricsData.map((metric, index) => (
                <Card key={index} className='bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow py-2'>
                  <CardContent className='flex items-center gap-3 px-4 py-2'>
                    <Avatar className='rounded-sm'>
                      <AvatarFallback className='bg-primary/10 text-primary shrink-0 rounded-sm'>
                        {metric.icons}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-muted-foreground text-sm font-medium'>{metric.title}</span>
                      <span className='text-lg font-medium'>{metric.value}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <Card className='bg-white border border-gray-200 shadow-sm flex flex-col gap-2 lg:col-span-2'>
            <CardHeader className='gap-1 flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-base font-semibold'>Latest Updates</CardTitle>
              <Link
                to="/admin/visa-workflows"
                className="text-xs font-medium text-primary hover:underline shrink-0"
              >
                View More →
              </Link>
            </CardHeader>
            <CardContent className='flex flex-col divide-y divide-border px-4 pb-4'>
              {clientUpdates.map((item) => (
                <div key={item.id} className='flex items-start justify-between py-3 gap-3'>
                  <div className='flex flex-col gap-0.5 min-w-0'>
                    <span className='text-sm font-semibold text-foreground truncate'>{item.client}</span>
                    <span className='text-xs text-muted-foreground truncate'>{item.status}</span>
                  </div>
                  <div className='flex flex-col items-end gap-0.5 shrink-0'>
                    <span className='text-[11px] font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5 whitespace-nowrap'>{item.country}</span>
                    <span className='text-[11px] text-muted-foreground whitespace-nowrap'>{item.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardContent>
        <Card className='bg-white border border-gray-200 shadow-sm'>
          <CardContent className='pt-5 pb-5 px-5'>
            <div className='flex items-center justify-between mb-4'>
              <span className='text-base font-semibold'>Live System Activity Logs</span>
              <Link
                to="/admin/activity-logs"
                className="text-xs font-medium text-primary hover:underline"
              >
                View More →
              </Link>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              {liveLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic col-span-2 py-2">No activity recorded yet.</p>
              ) : (
                liveLogs.map((log) => (
                  <div key={log.did || log._id} className='flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100/70 transition-colors'>
                    <div className={`size-2 rounded-full mt-1.5 shrink-0 ${ACTION_COLORS[log.action] || 'bg-primary'}`} />
                    <div className='flex flex-col gap-0.5 min-w-0'>
                      <span className='text-sm font-medium text-foreground truncate'>
                        {log.action} on {log.targetCollection}
                      </span>
                      <span className='text-xs text-muted-foreground truncate'>
                        {log.actionDetails?.name} ({log.actionDetails?.role}) · {formatTime(log.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default SalesMetricsCard
