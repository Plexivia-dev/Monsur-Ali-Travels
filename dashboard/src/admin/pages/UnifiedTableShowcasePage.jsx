import React, { useState, useMemo } from 'react';
import {
  UnifiedDataTable,
  DataTableColumnHeader,
} from '@/components/ui/unified-table';
import { HeaderTitle } from '@shared/components/common/HeaderTitle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Plane,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

// Sample dataset of Monsur Ali Travels Passenger & Visa Bookings
const SAMPLE_PILGRIMS_DATA = [
  {
    id: 'MAT-2026-001',
    passengerName: 'Mohammad Abdul Karim',
    passportNumber: 'A08492019',
    packageType: 'Umrah Premium VIP',
    country: 'Saudi Arabia',
    groupName: 'Dhaka Hajj Group A',
    totalAmount: 185000,
    paidAmount: 185000,
    paymentStatus: 'Paid',
    visaStatus: 'Issued',
    flightDate: '2026-09-15',
    hotel: 'Makkah Clock Royal Tower (5-Star)',
    phone: '+880 1711-234567',
    agentName: 'Sylhet Air Travels',
  },
  {
    id: 'MAT-2026-002',
    passengerName: 'Begum Fatema Khatun',
    passportNumber: 'A07381928',
    packageType: 'Umrah Economy Saver',
    country: 'Saudi Arabia',
    groupName: 'Chittagong Group 4',
    totalAmount: 125000,
    paidAmount: 75000,
    paymentStatus: 'Partial',
    visaStatus: 'Processing',
    flightDate: '2026-09-22',
    hotel: 'Al Kiswah Towers Makkah',
    phone: '+880 1819-876543',
    agentName: 'Direct Client',
  },
  {
    id: 'MAT-2026-003',
    passengerName: 'Kazi Nurul Islam',
    passportNumber: 'B09182374',
    packageType: 'Hajj Platinum Full-Board',
    country: 'Saudi Arabia',
    groupName: 'VIP Delegation 2026',
    totalAmount: 750000,
    paidAmount: 750000,
    paymentStatus: 'Paid',
    visaStatus: 'Issued',
    flightDate: '2026-11-01',
    hotel: 'Swissotel Al Maqam Makkah',
    phone: '+880 1912-349871',
    agentName: 'Gulshan Travel Guild',
  },
  {
    id: 'MAT-2026-004',
    passengerName: 'Shamsun Nahar Chowdhury',
    passportNumber: 'A10293847',
    packageType: 'Dubai 5D4N Tourist',
    country: 'UAE',
    groupName: 'Family Leisure Group',
    totalAmount: 95000,
    paidAmount: 0,
    paymentStatus: 'Unpaid',
    visaStatus: 'In Review',
    flightDate: '2026-10-05',
    hotel: 'JW Marriott Marquis Dubai',
    phone: '+880 1678-901234',
    agentName: 'Aviation Wings B2B',
  },
  {
    id: 'MAT-2026-005',
    passengerName: 'Tareq Mahmud Hossain',
    passportNumber: 'B11223344',
    packageType: 'Malaysia Professional Work Visa',
    country: 'Malaysia',
    groupName: 'Kuala Lumpur Tech Intake',
    totalAmount: 320000,
    paidAmount: 160000,
    paymentStatus: 'Partial',
    visaStatus: 'Submitted',
    flightDate: '2026-10-18',
    hotel: 'Grand Millennium KL',
    phone: '+880 1552-443322',
    agentName: 'Apex Manpower Global',
  },
  {
    id: 'MAT-2026-006',
    passengerName: 'Dr. Rafiqul Hassan',
    passportNumber: 'A14529871',
    packageType: 'Umrah Executive Deluxe',
    country: 'Saudi Arabia',
    groupName: 'Doctors Association Umrah',
    totalAmount: 210000,
    paidAmount: 210000,
    paymentStatus: 'Paid',
    visaStatus: 'Issued',
    flightDate: '2026-09-28',
    hotel: 'Fairmont Makkah Clock Royal',
    phone: '+880 1715-998877',
    agentName: 'Direct Client',
  },
  {
    id: 'MAT-2026-007',
    passengerName: 'Anowar Hossain Sarker',
    passportNumber: 'B08291034',
    packageType: 'Schengen Business Transit',
    country: 'Italy',
    groupName: 'Trade Fair Delegation',
    totalAmount: 165000,
    paidAmount: 165000,
    paymentStatus: 'Paid',
    visaStatus: 'Rejected',
    flightDate: '2026-10-12',
    hotel: 'Hilton Rome Eur La Lama',
    phone: '+880 1817-654321',
    agentName: 'Euro-Asia Travel Link',
  },
  {
    id: 'MAT-2026-008',
    passengerName: 'Mst. Rokeya Begum',
    passportNumber: 'A09384756',
    packageType: 'Umrah Economy Saver',
    country: 'Saudi Arabia',
    groupName: 'Dhaka Hajj Group B',
    totalAmount: 125000,
    paidAmount: 125000,
    paymentStatus: 'Paid',
    visaStatus: 'Issued',
    flightDate: '2026-09-15',
    hotel: 'Al Kiswah Towers Makkah',
    phone: '+880 1914-112233',
    agentName: 'Sylhet Air Travels',
  },
];

// Status badge helper
function renderStatusBadge(status) {
  switch (status) {
    case 'Issued':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1">
          <CheckCircle2 className="size-3" /> Issued
        </Badge>
      );
    case 'Processing':
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 gap-1">
          <Clock className="size-3" /> Processing
        </Badge>
      );
    case 'Submitted':
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1">
          <Clock className="size-3" /> Submitted
        </Badge>
      );
    case 'In Review':
      return (
        <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 gap-1">
          <Clock className="size-3" /> In Review
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="size-3" /> Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

// Payment badge helper
function renderPaymentBadge(status) {
  switch (status) {
    case 'Paid':
      return <Badge className="bg-emerald-600 text-white">Full Paid</Badge>;
    case 'Partial':
      return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">Partial</Badge>;
    case 'Unpaid':
      return <Badge variant="destructive">Unpaid</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function UnifiedTableShowcasePage() {
  const [data] = useState(SAMPLE_PILGRIMS_DATA);
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [simulateEmpty, setSimulateEmpty] = useState(false);

  // TanStack Column Definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Case / File ID" />,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-primary text-xs">
            {row.getValue('id')}
          </span>
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: 'passengerName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Passenger Name" />,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="space-y-0.5">
              <div className="font-bold text-foreground hover:text-primary transition-colors">
                {item.passengerName}
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>{item.phone}</span>
                <span>•</span>
                <span className="font-medium text-foreground/80">{item.agentName}</span>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        accessorKey: 'passportNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Passport No." />,
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-sky-600 dark:text-sky-400 text-xs">
            {row.getValue('passportNumber')}
          </span>
        ),
      },
      {
        accessorKey: 'packageType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Package / Destination" />,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <div className="font-semibold text-foreground text-xs">{item.packageType}</div>
              <div className="text-[10px] text-muted-foreground">{item.country}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'visaStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Visa Status" />,
        cell: ({ row }) => renderStatusBadge(row.getValue('visaStatus')),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'totalAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount (BDT)" />,
        cell: ({ row }) => {
          const total = row.getValue('totalAmount');
          const paid = row.original.paidAmount;
          return (
            <div>
              <div className="font-bold text-foreground">৳{total.toLocaleString('en-BD')}</div>
              <div className="text-[10px] text-muted-foreground">
                Paid: ৳{paid.toLocaleString('en-BD')}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'paymentStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Payment" />,
        cell: ({ row }) => renderPaymentBadge(row.getValue('paymentStatus')),
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'flightDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Flight Date" />,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(row.getValue('flightDate')).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right text-xs uppercase font-semibold text-muted-foreground">Action</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toast.info(`Viewing passenger profile: ${row.original.passengerName}`);
              }}
              className="h-7 px-2 text-xs font-semibold cursor-pointer"
            >
              <Eye className="size-3.5 mr-1" />
              View
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  );

  // Faceted filter options
  const facetedFilters = [
    {
      columnId: 'visaStatus',
      title: 'Visa Status',
      options: [
        { label: 'Issued', value: 'Issued', icon: CheckCircle2 },
        { label: 'Processing', value: 'Processing', icon: Clock },
        { label: 'Submitted', value: 'Submitted', icon: Clock },
        { label: 'In Review', value: 'In Review', icon: Clock },
        { label: 'Rejected', value: 'Rejected', icon: XCircle },
      ],
    },
    {
      columnId: 'paymentStatus',
      title: 'Payment Status',
      options: [
        { label: 'Paid', value: 'Paid' },
        { label: 'Partial', value: 'Partial' },
        { label: 'Unpaid', value: 'Unpaid' },
      ],
    },
  ];

  // Bulk Actions
  const bulkActions = [
    {
      label: 'Bulk Approve Visa',
      icon: CheckCircle2,
      variant: 'default',
      onClick: (selected) => {
        toast.success(`Approved ${selected.length} pilgrim visa application(s)!`);
      },
    },
    {
      label: 'Send Flight Notification',
      icon: Plane,
      variant: 'outline',
      onClick: (selected) => {
        toast.info(`SMS/Email flight alerts dispatched to ${selected.length} passenger(s).`);
      },
    },
  ];

  // Expandable sub-row render
  const renderSubComponent = ({ row }) => {
    const item = row.original;
    const dueAmount = item.totalAmount - item.paidAmount;

    return (
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-xs animate-in fade-in">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span className="font-bold text-xs text-foreground uppercase tracking-wider">
              Pilgrim & Case Milestone Dossier: {item.passengerName} ({item.id})
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            Assigned Agent: {item.agentName}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Accommodations & Hotel
            </span>
            <p className="font-semibold text-foreground">{item.hotel}</p>
            <p className="text-muted-foreground text-[11px]">Group: {item.groupName}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Financial Summary
            </span>
            <div className="flex justify-between text-muted-foreground text-[11px]">
              <span>Package Cost:</span>
              <span className="font-bold text-foreground">৳{item.totalAmount.toLocaleString('en-BD')}</span>
            </div>
            <div className="flex justify-between text-emerald-600 text-[11px] font-semibold">
              <span>Paid To Date:</span>
              <span>৳{item.paidAmount.toLocaleString('en-BD')}</span>
            </div>
            <div className="flex justify-between text-amber-600 text-[11px] font-bold border-t border-border/60 pt-1">
              <span>Remaining Balance:</span>
              <span>৳{dueAmount.toLocaleString('en-BD')}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Flight & Visa Milestones
            </span>
            <p className="font-semibold text-foreground">Departure: {item.flightDate}</p>
            <p className="text-muted-foreground text-[11px]">Passport: {item.passportNumber}</p>
            <div className="pt-1">
              {renderStatusBadge(item.visaStatus)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <HeaderTitle
        variant="general"
        icon={Sparkles}
        title="Unified DataTable Showcase"
        badge="TanStack Table Suite"
        subtitle="Enterprise headless table suite with multi-sorting, global/faceted search, column pinning, row selection, expandable rows, and CSV/JSON export."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={simulateLoading ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSimulateLoading(!simulateLoading)}
              className="text-xs font-semibold cursor-pointer h-8 bg-slate-800/80 hover:bg-slate-800 text-sky-400 border-sky-500/20"
            >
              <RefreshCw className={`size-3.5 mr-1.5 ${simulateLoading ? 'animate-spin' : ''}`} />
              {simulateLoading ? 'Loading Mode (ON)' : 'Simulate Loading'}
            </Button>

            <Button
              variant={simulateEmpty ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSimulateEmpty(!simulateEmpty)}
              className="text-xs font-semibold cursor-pointer h-8 bg-slate-800/80 hover:bg-slate-800 text-sky-400 border-sky-500/20"
            >
              {simulateEmpty ? 'Empty State (ON)' : 'Simulate Empty'}
            </Button>
          </div>
        }
      />

      {/* Main Table Instance */}
      <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
        <CardHeader className="bg-muted/15 border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Hajj & Umrah Pilgrims & Passenger Records
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Live interactive TanStack Table instance displaying 8 records with full filtering, sorting, expandable accordions, and bulk actions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <UnifiedDataTable
            columns={columns}
            data={simulateEmpty ? [] : data}
            isLoading={simulateLoading}
            loadingRowCount={5}
            enablePagination={true}
            pageSize={5}
            pageSizeOptions={[5, 10, 20, 50]}
            enableSorting={true}
            enableRowSelection={true}
            enableExpanding={true}
            renderSubComponent={renderSubComponent}
            enableToolbar={true}
            searchPlaceholder="Search passenger name, passport, package..."
            facetedFilters={facetedFilters}
            bulkActions={bulkActions}
            enableExport={true}
            exportFilename="pilgrim-visa-records"
            emptyTitle="No Passenger Bookings Found"
            emptyDescription="There are currently no pilgrim or passenger records matching your query."
            emptyAction={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSimulateEmpty(false)}
                className="text-xs font-semibold cursor-pointer"
              >
                Reset Filter & Load Sample Data
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
