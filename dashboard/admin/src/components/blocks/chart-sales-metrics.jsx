import { Bar, BarChart, Label, Pie, PieChart } from 'recharts'
import {
  TrendingUpIcon,
  BadgePercentIcon,
  DollarSignIcon,
  ShoppingBagIcon,
  ChartNoAxesCombinedIcon,
  CirclePercentIcon
} from 'lucide-react'

import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import logo from '@/assets/logo.png'

const salesPlanPercentage = 54
const totalBars = 24
const filledBars = Math.round((salesPlanPercentage * totalBars) / 100)

const salesChartData = Array.from({ length: totalBars }, (_, index) => {
  const date = new Date(2025, 5, 15)
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return {
    date: formattedDate,
    sales: index < filledBars ? 315 : 0.0001
  }
})

const salesChartConfig = {
  sales: {
    label: 'Sales'
  }
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

const revenueChartData = [
  { month: 'january', sales: 340, fill: 'var(--color-january)' },
  { month: 'february', sales: 200, fill: 'var(--color-february)' },
  { month: 'march', sales: 200, fill: 'var(--color-march)' }
]

const revenueChartConfig = {
  sales: {
    label: 'Sales'
  },
  january: {
    label: 'January',
    color: 'var(--primary)'
  },
  february: {
    label: 'February',
    color: 'color-mix(in oklab, var(--primary) 60%, transparent)'
  },
  march: {
    label: 'March',
    color: 'color-mix(in oklab, var(--primary) 20%, transparent)'
  }
}

export const SalesMetricsCard = ({ className }) => {
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
              <span className='text-base font-semibold'>Activity Logs</span>
              <Link
                to="/admin/activity-logs"
                className="text-xs font-medium text-primary hover:underline"
              >
                View More →
              </Link>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              {[
                { action: "Passport submitted", agent: "Rahim Uddin", time: "5 mins ago", type: "upload" },
                { action: "Visa approved", agent: "Nadia Islam", time: "18 mins ago", type: "success" },
                { action: "New file opened", agent: "Jalal Ahmed", time: "1 hour ago", type: "info" },
                { action: "Payment received", agent: "Meher Nigar", time: "2 hours ago", type: "payment" },
                { action: "Embassy form filled", agent: "Tariq Hassan", time: "3 hours ago", type: "form" },
                { action: "Document rejected", agent: "Shirin Akter", time: "Yesterday", type: "error" },
              ].map((log, i) => (
                <div key={i} className='flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors'>
                  <div className={`size-2 rounded-full mt-1.5 shrink-0 ${
                    log.type === 'success' ? 'bg-green-500' :
                    log.type === 'error' ? 'bg-red-500' :
                    log.type === 'payment' ? 'bg-amber-500' :
                    'bg-primary'
                  }`} />
                  <div className='flex flex-col gap-0.5 min-w-0'>
                    <span className='text-sm font-medium text-foreground'>{log.action}</span>
                    <span className='text-xs text-muted-foreground truncate'>{log.agent} · {log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default SalesMetricsCard
