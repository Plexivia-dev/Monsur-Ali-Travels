import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import {
  Cloud,
  Database,
  HardDrive,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  Loader2,
  Layers,
  ArrowDownCircle,
  Eye,
  XCircle,
  AlertCircle,
  FolderArchive,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { UnifiedModal } from '@shared/components/common/UnifiedModal';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

// Renders the Cloudflare R2 Storage sync, data transfer report, and orphan purge dashboard
const StorageSyncPage = () => {
  const [overview, setOverview] = useState(null);
  const [batches, setBatches] = useState([]);
  const [syncLogs, setSyncLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'logs'
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [purgingBatchDid, setPurgingBatchDid] = useState(null);
  const [cancellingBatchDid, setCancellingBatchDid] = useState(null);

  // Fetch Storage Overview & Stats
  const fetchOverview = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/admin/storage/overview');
      if (res.data?.data) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load storage overview:', err);
    }
  }, []);

  // Fetch Orphan Batches
  const fetchBatches = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/admin/storage/cleanup-batches?limit=50');
      if (res.data?.data) {
        setBatches(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load cleanup batches:', err);
    }
  }, []);

  // Fetch Sync Logs
  const fetchSyncLogs = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/v1/admin/storage/sync-logs?limit=50');
      if (res.data?.data) {
        setSyncLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load sync logs:', err);
    }
  }, []);

  // Initial load
  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchOverview(), fetchBatches(), fetchSyncLogs()]);
    setLoading(false);
  }, [fetchOverview, fetchBatches, fetchSyncLogs]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Manual Reconciliation / Sync to R2
  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await apiClient.post('/api/v1/admin/storage/sync');
      if (res.data?.success) {
        const result = res.data.data;
        toast.success(
          `Sync completed! Scanned ${result.localFilesScanned || 0} local files, uploaded ${result.filesUploadedToR2 || 0} to Cloudflare R2.`
        );
        await loadAllData();
      } else {
        toast.error(res.data?.message || 'Sync failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger storage sync.');
    } finally {
      setSyncing(false);
    }
  };

  // Handle Manual Orphan Detection Scan
  const handleTriggerOrphanScan = async () => {
    setDetecting(true);
    try {
      const res = await apiClient.post('/api/v1/admin/storage/detect-orphans');
      if (res.data?.success) {
        const result = res.data.data;
        if (result.orphanCount > 0) {
          toast.warning(
            `Found ${result.orphanCount} unused/orphan files! Batch created for admin review.`
          );
        } else {
          toast.success('No orphan files detected. Storage is clean!');
        }
        await loadAllData();
      } else {
        toast.error(res.data?.message || 'Orphan scan failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger orphan detection.');
    } finally {
      setDetecting(false);
    }
  };

  // View specific batch details (file list)
  const handleViewBatchDetails = async (batchDid) => {
    try {
      const res = await apiClient.get(`/api/v1/admin/storage/cleanup-batches/${batchDid}`);
      if (res.data?.data) {
        setSelectedBatch(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load batch details.');
    }
  };

  const [batchToPurge, setBatchToPurge] = useState(null);

  // Approve & Purge Orphan Batch
  const handleApprovePurge = (batchDid) => {
    setBatchToPurge(batchDid);
  };

  const executeApprovePurge = async () => {
    if (!batchToPurge) return;
    const batchDid = batchToPurge;

    setPurgingBatchDid(batchDid);
    try {
      const res = await apiClient.post(`/api/v1/admin/storage/cleanup-batches/${batchDid}/approve`);
      if (res.data?.success) {
        const d = res.data.data;
        toast.success(`Purge completed! Removed ${d.deletedFromDiskCount} files from disk and ${d.deletedFromR2Count} from R2.`);
        setSelectedBatch(null);
        setBatchToPurge(null);
        await loadAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to purge batch.');
    } finally {
      setPurgingBatchDid(null);
    }
  };

  // Cancel Batch
  const handleCancelBatch = async (batchDid) => {
    setCancellingBatchDid(batchDid);
    try {
      const res = await apiClient.post(`/api/v1/admin/storage/cleanup-batches/${batchDid}/cancel`);
      if (res.data?.success) {
        toast.info('Batch cancelled. No files were deleted.');
        setSelectedBatch(null);
        await loadAllData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel batch.');
    } finally {
      setCancellingBatchDid(null);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never / N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-card p-6 md:p-7 rounded-2xl border border-border/80 shadow-xs relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-primary text-white uppercase tracking-wider shadow-2xs">
              Storage Engine
            </span>
            <span
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full border ${
                overview?.r2Configured
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-black/[0.04] text-black/70 border-black/15'
              }`}
            >
              <span
                className={`size-2 rounded-full ${
                  overview?.r2Configured ? 'bg-emerald-500 animate-pulse' : 'bg-black/40'
                }`}
              ></span>
              {overview?.r2Configured ? 'Cloudflare R2 Connected' : 'Local Disk Only'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight mt-2.5">
            Storage & Cloud Sync
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
            Cloudflare R2 Object Storage, Storage Health, Data Transfer, and Automated Cleanups
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh statistics"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleTriggerOrphanScan}
            disabled={detecting || loading}
            className="flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {detecting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <AlertTriangle className="size-3.5 text-amber-600" />
            )}
            <span>{detecting ? 'Scanning...' : 'Scan Unused Files'}</span>
          </button>

          <button
            onClick={handleTriggerSync}
            disabled={syncing || loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {syncing ? <Loader2 className="size-3.5 animate-spin text-white" /> : <Cloud className="size-3.5" />}
            <span>{syncing ? 'Syncing...' : 'Sync to R2 Now'}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Storage Used */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Total Storage Used
            </span>
            <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <HardDrive className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black font-mono text-foreground tracking-tight">
              {overview ? `${overview.totalLocalMB} MB` : '...'}
            </div>
            <div className="text-xs text-muted-foreground mt-1.5 flex items-center justify-between font-medium">
              <span>{overview ? `${overview.localFilesCount} Total Files` : 'Scanning files...'}</span>
              <span className="font-bold text-foreground font-mono">{overview ? `${overview.totalLocalGB} GB` : ''}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Cumulative Data Transferred */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Data Synced
            </span>
            <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Cloud className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black font-mono text-foreground tracking-tight">
              {overview ? `${overview.cumulativeStats?.totalFilesUploaded || 0} Files` : '...'}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">
              {overview?.cumulativeStats?.totalSyncRuns || 0} Runs ({overview?.cumulativeStats?.successfulRuns || 0} Successful)
            </p>
          </div>
        </div>

        {/* Card 3: Last Sync Report */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Last Sync
            </span>
            <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm font-bold text-foreground truncate">
              {overview?.lastSyncLog ? formatDate(overview.lastSyncLog.createdAt) : 'Never Synced'}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  overview?.lastSyncLog?.status === 'Success'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {overview?.lastSyncLog?.status || 'No Log'}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {overview?.lastSyncLog
                  ? `${overview.lastSyncLog.durationMs}ms (${overview.lastSyncLog.triggeredBy})`
                  : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Orphan Cleanup Queue */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Orphan Pending
            </span>
            <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="size-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black font-mono text-foreground flex items-center gap-2 tracking-tight">
              <span>{overview?.pendingBatchesCount || 0}</span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Batches</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium">
              {overview?.lastBatch?.orphanCount
                ? `${overview.lastBatch.orphanCount} unused files detected`
                : 'No pending cleanups'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Storage Breakdown Grid */}
      {overview?.categories && (
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="size-4 text-primary" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              Storage Distribution by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {Object.entries(overview.categories).map(([key, cat]) => (
              <div
                key={key}
                className="p-4 rounded-2xl bg-muted/20 border border-border/60 hover:border-primary/40 flex flex-col justify-between transition-all shadow-xs group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform"></span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-black font-mono text-foreground">
                    {cat.count} <span className="text-xs font-semibold text-muted-foreground font-sans">files</span>
                  </span>
                  <div className="text-xs font-bold text-primary font-mono mt-1">
                    {formatBytes(cat.bytes)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2">
        <button
          onClick={() => setActiveTab('batches')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'batches'
              ? 'bg-primary/10 text-primary border border-primary/30 shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
          }`}
        >
          <Trash2 className="size-3.5" />
          <span>Orphan File Cleanups</span>
          {overview?.pendingBatchesCount > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
              {overview.pendingBatchesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-primary/10 text-primary border border-primary/30 shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
          }`}
        >
          <Clock className="size-3.5" />
          <span>Sync & Transfer History</span>
        </button>
      </div>

      {/* TAB 1: Orphan Cleanup Batches */}
      {activeTab === 'batches' && (
        <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {batches.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <FolderArchive className="size-12 mx-auto mb-3 opacity-30" />
                <p className="text-base font-semibold">No orphan cleanup batches found.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click "Scan Unused Files" above to check for unreferenced documents in MongoDB.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Batch Number</th>
                      <th className="py-3 px-4">Detected At</th>
                      <th className="py-3 px-4">Orphan Files</th>
                      <th className="py-3 px-4">Reclaimable Size</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {batches.map((batch) => {
                      const isPending = batch.status === 'Pending_Review';
                      const isPurged = batch.status === 'Purged';
                      const isCancelled = batch.status === 'Cancelled';

                      return (
                        <tr key={batch.did} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                            {batch.batchNumber}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">
                            {formatDate(batch.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-foreground">
                            {batch.orphanCount} files
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-primary">
                            {formatBytes(batch.totalReclaimableBytes)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                                isPending
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                  : isPurged
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                  : 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/30'
                              }`}
                            >
                              {batch.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewBatchDetails(batch.did)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-2xs"
                              >
                                <Eye className="size-3.5" />
                                <span>Inspect</span>
                              </button>

                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApprovePurge(batch.did)}
                                    disabled={purgingBatchDid === batch.did}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                  >
                                    {purgingBatchDid === batch.did ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="size-3.5" />
                                    )}
                                    <span>Purge</span>
                                  </button>

                                  <button
                                    onClick={() => handleCancelBatch(batch.did)}
                                    disabled={cancellingBatchDid === batch.did}
                                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/40 hover:border-rose-500/80 transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    <XCircle className="size-3.5" />
                                    <span>Cancel</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Sync & Transfer History Logs */}
      {activeTab === 'logs' && (
        <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
          <CardContent className="p-0">
            {syncLogs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Clock className="size-12 mx-auto mb-3 opacity-30" />
                <p className="text-base font-semibold">No sync logs recorded yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sync operations will log reconciliation statistics here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Trigger Source</th>
                      <th className="py-3 px-4">Local Files Scanned</th>
                      <th className="py-3 px-4">Uploaded to R2</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {syncLogs.map((log) => (
                      <tr key={log.did} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-foreground">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                          {log.triggeredBy}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          {log.localFilesScanned} files
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-emerald-600">
                            +{log.filesUploadedToR2} files
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {log.durationMs} ms
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                              log.status === 'Success'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inspect Batch File List Modal */}
      {selectedBatch && (
        <UnifiedModal
          isOpen={Boolean(selectedBatch)}
          onClose={() => setSelectedBatch(null)}
          title={`Batch Details: ${selectedBatch.batchNumber}`}
          subtitle={`${selectedBatch.orphanCount} files (${formatBytes(selectedBatch.totalReclaimableBytes)}) detected at ${formatDate(selectedBatch.createdAt)}`}
          icon={FolderArchive}
          maxWidth="max-w-3xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-black/70">
                Status: <strong className="text-black">{selectedBatch.status}</strong>
              </span>

              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="cancel"
                  onClick={() => setSelectedBatch(null)}
                  className="cursor-pointer"
                >
                  Close
                </Button>

                {selectedBatch.status === 'Pending_Review' && (
                  <Button
                    onClick={() => handleApprovePurge(selectedBatch.did)}
                    disabled={purgingBatchDid === selectedBatch.did}
                    variant="destructive"
                    className="flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {purgingBatchDid === selectedBatch.did ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    <span>Approve & Purge Files</span>
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-2">
            {selectedBatch.orphanFiles?.map((file, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black/[0.02] border border-black/10 flex items-center justify-between text-xs gap-3"
              >
                <div className="overflow-hidden">
                  <div className="font-semibold text-black truncate">{file.fileName}</div>
                  <div className="font-mono text-black/50 text-[11px] truncate">{file.localPath}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-black">{formatBytes(file.sizeBytes)}</span>
                  <div className="text-[11px] text-amber-600 font-semibold">Unreferenced</div>
                </div>
              </div>
            ))}
          </div>
        </UnifiedModal>
      )}
      {/* Confirm Purge Dialog */}
      <ConfirmDeleteDialog
        open={Boolean(batchToPurge)}
        onOpenChange={(open) => {
          if (!open && !purgingBatchDid) setBatchToPurge(null);
        }}
        title="Approve & Purge Orphan Files?"
        description="Are you sure you want to permanently delete these unused files from local disk and Cloudflare R2? This action cannot be undone."
        confirmText="Yes, Purge Files"
        cancelText="Cancel"
        isDeleting={Boolean(purgingBatchDid)}
        onConfirm={executeApprovePurge}
      />
    </div>
  );
};

export default StorageSyncPage;
