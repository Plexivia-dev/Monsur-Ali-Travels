import React, { useState } from 'react';
import { useAgencyData } from '../../api/hooks';
import { usePortalStore } from '../../store/usePortalStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Building2,
  UserPlus,
  CreditCard,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  FileText,
  Phone,
  Mail,
  MapPin,
  Users,
  X,
  ArrowUpRight,
  Receipt,
  Download,
  Calendar
} from 'lucide-react';

export const ClientManagement = ({ initialTab = 'all-clients' }) => {
  const { data: agencyData } = useAgencyData();
  const addToast = usePortalStore((state) => state.addToast);

  // Active tab inside Client Management module: 'add-client' | 'all-clients' | 'payments'
  const [activeTab, setActiveTab] = useState(
    initialTab === 'clients-add' || initialTab === 'add-client'
      ? 'add-client'
      : initialTab === 'clients-payments' || initialTab === 'payments'
      ? 'payments'
      : 'all-clients'
  );

  // Sync tab if prop changes
  React.useEffect(() => {
    if (initialTab === 'clients-add' || initialTab === 'add-client') {
      setActiveTab('add-client');
    } else if (initialTab === 'clients-payments' || initialTab === 'payments') {
      setActiveTab('payments');
    } else {
      setActiveTab('all-clients');
    }
  }, [initialTab]);

  // Mock Clients State
  const [clients, setClients] = useState(
    agencyData?.clientContracts || [
      { id: 'CONT-101', clientName: 'Metro Builders & Infra', industry: 'Construction', contact: 'Robert Vance', email: 'robert@metrobuilders.com', phone: '+1 555-0101', workersDeployed: 45, hourlyRate: 28, margin: '20%', status: 'Active', location: 'Dhaka North' },
      { id: 'CONT-102', clientName: 'Apex Logistics Hub', industry: 'Warehousing', contact: 'Elena Rostova', email: 'elena@apexlogistics.com', phone: '+1 555-0102', workersDeployed: 38, hourlyRate: 24, margin: '18%', status: 'Active', location: 'Chittagong Port' },
      { id: 'CONT-103', clientName: 'Global Tech Park Facility', industry: 'Facility Mgt', contact: 'Sameer Khan', email: 'skhan@globaltech.com', phone: '+1 555-0103', workersDeployed: 26, hourlyRate: 22, margin: '17.5%', status: 'Active', location: 'Gazipur' },
      { id: 'CONT-104', clientName: 'Summit Manufacturing Ltd', industry: 'Industrial Assembly', contact: 'Marcus Brody', email: 'mbrody@summitmfg.com', phone: '+1 555-0104', workersDeployed: 52, hourlyRate: 30, margin: '19%', status: 'Active', location: 'Narayanganj' },
      { id: 'CONT-105', clientName: 'Harbor Freight Terminals', industry: 'Dock Operations', contact: 'Sarah Jenkins', email: 'sarah@harborfreight.com', phone: '+1 555-0105', workersDeployed: 23, hourlyRate: 32, margin: '19.5%', status: 'Review', location: 'Chittagong Port' }
    ]
  );

  // Mock Payments State
  const [payments, setPayments] = useState([
    { id: 'PAY-CL01', client: 'Metro Builders & Infra', invoiceId: 'INV-AG01', amount: 24600, date: '2026-08-04', method: 'ACH Wire', ref: 'ACH-789012', status: 'Completed' },
    { id: 'PAY-CL02', client: 'Summit Manufacturing Ltd', invoiceId: 'INV-AG03', amount: 31200, date: '2026-08-06', method: 'ACH Wire', ref: 'ACH-789044', status: 'Completed' },
    { id: 'PAY-CL03', client: 'Apex Logistics Hub', invoiceId: 'INV-AG02', amount: 18200, date: '2026-08-14', method: 'Bank Transfer', ref: 'TRF-992101', status: 'Processing' },
    { id: 'PAY-CL04', client: 'Global Tech Park Facility', invoiceId: 'INV-AG04', amount: 11400, date: '2026-08-22', method: 'Cheque Deposit', ref: 'CHK-440192', status: 'Pending' },
    { id: 'PAY-CL05', client: 'Harbor Freight Terminals', invoiceId: 'INV-AG05', amount: 14700, date: '2026-07-20', method: 'ACH Wire', ref: 'ACH-110488', status: 'Overdue' }
  ]);

  // Form State for Add New Client
  const [formData, setFormData] = useState({
    clientName: '',
    industry: 'Construction',
    contact: '',
    email: '',
    phone: '',
    hourlyRate: '25',
    margin: '18%',
    workersNeeded: '10',
    location: '',
    paymentTerms: 'Net 30',
    notes: ''
  });

  // Modal State for Client Details
  const [selectedClient, setSelectedClient] = useState(null);

  // Modal State for Record Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    client: 'Metro Builders & Infra',
    invoiceId: 'INV-AG06',
    amount: '15000',
    method: 'ACH Wire',
    ref: ''
  });

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Handle New Client Form Submit
  const handleAddClientSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.contact) {
      addToast && addToast('Please enter Client Name and Contact Person', 'error');
      return;
    }

    const newClient = {
      id: `CONT-${100 + clients.length + 1}`,
      clientName: formData.clientName,
      industry: formData.industry,
      contact: formData.contact,
      email: formData.email || `${formData.clientName.toLowerCase().replace(/\s+/g, '')}@agency-client.com`,
      phone: formData.phone || '+1 555-0999',
      workersDeployed: parseInt(formData.workersNeeded) || 0,
      hourlyRate: parseFloat(formData.hourlyRate) || 25,
      margin: formData.margin.includes('%') ? formData.margin : `${formData.margin}%`,
      status: 'Active',
      location: formData.location || 'Dhaka Central'
    };

    setClients([newClient, ...clients]);
    if (addToast) addToast(`Client "${formData.clientName}" successfully added!`, 'success');
    
    // Reset Form & Switch to All Clients view
    setFormData({
      clientName: '',
      industry: 'Construction',
      contact: '',
      email: '',
      phone: '',
      hourlyRate: '25',
      margin: '18%',
      workersNeeded: '10',
      location: '',
      paymentTerms: 'Net 30',
      notes: ''
    });
    setActiveTab('all-clients');
  };

  // Handle Record Payment Submit
  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    const newPay = {
      id: `PAY-CL0${payments.length + 1}`,
      client: paymentForm.client,
      invoiceId: paymentForm.invoiceId || `INV-AG${10 + payments.length}`,
      amount: parseFloat(paymentForm.amount) || 10000,
      date: new Date().toISOString().split('T')[0],
      method: paymentForm.method,
      ref: paymentForm.ref || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Completed'
    };
    setPayments([newPay, ...payments]);
    setShowPaymentModal(false);
    if (addToast) addToast(`Payment of $${newPay.amount.toLocaleString()} recorded for ${newPay.client}!`, 'success');
  };

  // Filtered Clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* TAB 1: ADD NEW CLIENTS FORM */}
      {/* ========================================================================= */}
      {activeTab === 'add-client' && (
        <Card className="max-w-4xl mx-auto border border-border shadow-md">
          <CardHeader className="border-b border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle icon={UserPlus}>Add New Client Contract</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Register a new client enterprise account for contractor deployments and invoicing.
                </p>
              </div>
              <Badge variant="outline" className="border-sky-500/30 text-sky-500 bg-sky-500/10">
                New Enterprise Registration
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAddClientSubmit} className="space-y-6">
              {/* Section 1: Company Profile */}
              <div>
                <h3 className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Company Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Client / Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Infra & Builders"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    >
                      <option value="Construction">Construction & Infrastructure</option>
                      <option value="Warehousing">Warehousing & Logistics</option>
                      <option value="Facility Mgt">Facility & Building Management</option>
                      <option value="Industrial Assembly">Industrial & Manufacturing</option>
                      <option value="Dock Operations">Maritime & Dock Operations</option>
                      <option value="IT & Electrical">IT & Electrical Installations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Primary Contact Person <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe (Procurement Manager)"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. billing@acmeinfra.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +880 1711-009988"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Deployment Region / Site Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dhaka Industrial Zone"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Billing & Commercial Terms */}
              <div className="pt-3 border-t border-border">
                <h3 className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Commercial Terms & Billing Rates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Hourly Billing Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      placeholder="28"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Agency Commission Margin (%)
                    </label>
                    <input
                      type="text"
                      placeholder="18.5%"
                      value={formData.margin}
                      onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Initial Required Workers
                    </label>
                    <input
                      type="number"
                      placeholder="15"
                      value={formData.workersNeeded}
                      onChange={(e) => setFormData({ ...formData, workersNeeded: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Invoice Payment Terms
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    >
                      <option value="Net 15">Net 15 Days</option>
                      <option value="Net 30">Net 30 Days</option>
                      <option value="Net 60">Net 60 Days</option>
                      <option value="Due on Receipt">Due Immediately on Receipt</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Contract Notes / Special Requirements
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Safety certifications required for all deployed crew"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('all-clients')}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-sky-600 hover:bg-sky-500 text-white">
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Save & Register Client
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL CLIENTS LIST & DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'all-clients' && (
        <div className="space-y-4">
          {/* Top Quick Summary Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Total Enterprise Clients</p>
                <p className="text-lg font-bold text-foreground">{clients.length}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Deployed Contractors</p>
                <p className="text-lg font-bold text-foreground">
                  {clients.reduce((acc, curr) => acc + (curr.workersDeployed || 0), 0)}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Avg Billing Rate</p>
                <p className="text-lg font-bold text-foreground">
                  ${(clients.reduce((acc, curr) => acc + (curr.hourlyRate || 0), 0) / (clients.length || 1)).toFixed(1)}/hr
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Avg Agency Margin</p>
                <p className="text-lg font-bold text-foreground">18.9%</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Table Search & Filter Controls */}
          <Card border shadow-xs>
            <CardHeader className="py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by client name, contact, or industry..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-background border border-input rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Industry Filter */}
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-background border border-input rounded-lg text-xs outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="All">All Industries</option>
                  <option value="Construction">Construction</option>
                  <option value="Warehousing">Warehousing</option>
                  <option value="Facility Mgt">Facility Mgt</option>
                  <option value="Industrial Assembly">Industrial Assembly</option>
                  <option value="Dock Operations">Dock Operations</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-background border border-input rounded-lg text-xs outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Review">Under Review</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('add-client')}
                  className="bg-sky-600 hover:bg-sky-500 text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add New Client
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 text-muted-foreground border-b border-border">
                      <th className="py-3 px-4 font-semibold">Client Name</th>
                      <th className="py-3 px-4 font-semibold">Industry</th>
                      <th className="py-3 px-4 font-semibold">Contact Person</th>
                      <th className="py-3 px-4 font-semibold text-center">Workers Deployed</th>
                      <th className="py-3 px-4 font-semibold text-right">Bill Rate / Margin</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No client records match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs shrink-0">
                                {client.clientName.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{client.clientName}</p>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-muted-foreground" /> {client.location || 'Dhaka North'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <Badge variant="outline" className="font-medium text-[10px]">
                              {client.industry}
                            </Badge>
                          </td>

                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-foreground">{client.contact || 'N/A'}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" /> {client.phone}
                              </p>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[11px]">
                              <Users className="w-3 h-3" />
                              {client.workersDeployed}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <p className="font-bold text-foreground">${client.hourlyRate}/hr</p>
                            <p className="text-[10px] text-sky-500 font-medium">{client.margin} margin</p>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant="outline"
                              className={
                                client.status === 'Active'
                                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 font-semibold'
                                  : 'bg-amber-500/15 text-amber-500 border-amber-500/30 font-semibold'
                              }
                            >
                              {client.status}
                            </Badge>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedClient(client)}
                              className="text-xs text-sky-500 hover:text-sky-400 hover:bg-sky-500/10"
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAYMENTS & REMITTANCE DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Payments Received</p>
                <p className="text-2xl font-bold text-emerald-500 mt-1">$74,000</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> August 2026 Remittances
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending Invoices</p>
                <p className="text-2xl font-bold text-amber-500 mt-1">$29,600</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> 2 Invoices Awaiting Settlement
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Overdue Remittances</p>
                <p className="text-2xl font-bold text-rose-500 mt-1">$14,700</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-500" /> Harbor Freight Terminals
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Payments Directory Table */}
          <Card border shadow-xs>
            <CardHeader className="py-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
              <div>
                <CardTitle icon={Receipt}>Client Payment Transactions</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Audit log of received client remittances, wire transfers, and pending billing receipts.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowPaymentModal(true)}
                className="bg-sky-600 hover:bg-sky-500 text-white"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Record Client Payment
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 text-muted-foreground border-b border-border">
                      <th className="py-3 px-4 font-semibold">Payment Ref</th>
                      <th className="py-3 px-4 font-semibold">Client Enterprise</th>
                      <th className="py-3 px-4 font-semibold">Invoice Ref</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount</th>
                      <th className="py-3 px-4 font-semibold">Method & Date</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-foreground font-semibold">
                          {p.id}
                        </td>

                        <td className="py-3 px-4 font-medium text-foreground">{p.client}</td>

                        <td className="py-3 px-4 text-muted-foreground font-mono">{p.invoiceId}</td>

                        <td className="py-3 px-4 text-right font-bold text-foreground">
                          ${p.amount.toLocaleString()}
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{p.method}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" /> {p.date} • {p.ref}
                          </p>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant="outline"
                            className={
                              p.status === 'Completed'
                                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                                : p.status === 'Processing' || p.status === 'Pending'
                                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                            }
                          >
                            {p.status}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addToast && addToast(`Receipt downloaded for ${p.id}`, 'info')}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CLIENT DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedClient.clientName}</h3>
                  <p className="text-xs text-muted-foreground">{selectedClient.industry} Sector</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Contract ID</p>
                  <p className="font-semibold text-foreground font-mono">{selectedClient.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Status</p>
                  <Badge variant="outline" className="bg-emerald-500/15 text-emerald-500 text-[10px]">
                    {selectedClient.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Workers Deployed</p>
                  <p className="font-bold text-emerald-500">{selectedClient.workersDeployed} Contractors</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">Bill Rate & Margin</p>
                  <p className="font-bold text-foreground">${selectedClient.hourlyRate}/hr ({selectedClient.margin})</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-500" /> Contact Info
                </p>
                <p className="text-muted-foreground">Contact Person: <span className="text-foreground font-medium">{selectedClient.contact}</span></p>
                <p className="text-muted-foreground">Email: <span className="text-foreground font-medium">{selectedClient.email}</span></p>
                <p className="text-muted-foreground">Phone: <span className="text-foreground font-medium">{selectedClient.phone}</span></p>
                <p className="text-muted-foreground">Location: <span className="text-foreground font-medium">{selectedClient.location}</span></p>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-border bg-muted/20 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedClient(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECORD PAYMENT MODAL */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold text-foreground">Record Client Payment</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">Select Client Enterprise</label>
                <select
                  value={paymentForm.client}
                  onChange={(e) => setPaymentForm({ ...paymentForm, client: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-1 focus:ring-sky-500 outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.clientName}>
                      {c.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Invoice ID / Statement Ref</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-AG02"
                  value={paymentForm.invoiceId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Amount Received ($)</label>
                <input
                  type="number"
                  required
                  placeholder="18200"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-1 focus:ring-sky-500 outline-none"
                >
                  <option value="ACH Wire">ACH Wire Transfer</option>
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cheque Deposit">Cheque Deposit</option>
                  <option value="Credit Card">Corporate Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  placeholder="e.g. ACH-9901822"
                  value={paymentForm.ref}
                  onChange={(e) => setPaymentForm({ ...paymentForm, ref: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-sky-600 hover:bg-sky-500 text-white">
                  Confirm & Save Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
