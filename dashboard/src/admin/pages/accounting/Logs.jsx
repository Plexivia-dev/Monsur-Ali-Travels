import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { Loader2, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await apiClient.get('/api/v1/admin/system/logs?type=PAYMENT&limit=50');
        if (res.data?.status === 'success') {
          setLogs(res.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load accounting logs.');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.actionDetails?.name?.toLowerCase().includes(term) ||
      log.targetCollection?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Accounting Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Audit trail of all financial actions and transactions.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search financial logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <Card className="bg-white border border-gray-200 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/40 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Timestamp</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                      No accounting logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id || log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground bg-gray-100 px-2.5 py-1 rounded-md text-xs">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {log.actionDetails?.name || 'System User'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {log.targetCollection || 'Financial'}
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
  );
}
