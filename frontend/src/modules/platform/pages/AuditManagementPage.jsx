import React, { useEffect, useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { AuditTable } from '../components/PlatformWidgets';
import SEOHead from '../components/SEOHead';
import Button from '@/components/ui/Button';
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export const AuditManagementPage = () => {
  const { audits, auditTotal, fetchAudits, loading } = usePlatform();
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [status, setStatus] = useState('');
  const [ip, setIp] = useState('');

  const limit = 15;

  const loadAudits = (targetPage = page) => {
    fetchAudits({
      page: targetPage,
      limit,
      action: action.trim() || undefined,
      status: status || undefined,
      ip: ip.trim() || undefined
    });
  };

  useEffect(() => {
    loadAudits(1);
    setPage(1);
  }, [status]); // Reload on status toggle directly

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadAudits(1);
  };

  const handleReset = () => {
    setAction('');
    setStatus('');
    setIp('');
    setPage(1);
    fetchAudits({ page: 1, limit });
  };

  const handlePageChange = (direction) => {
    let nextPage = page;
    if (direction === 'prev' && page > 1) nextPage = page - 1;
    if (direction === 'next' && page < Math.ceil(auditTotal / limit)) nextPage = page + 1;
    setPage(nextPage);
    loadAudits(nextPage);
  };

  const exportToCSV = () => {
    if (audits.length === 0) return;

    const headers = ['Action', 'Actor Name', 'Actor Email', 'Timestamp', 'IP Address', 'Device', 'Browser', 'Status'];
    const rows = audits.map(log => [
      log.action,
      log.userId?.name || 'Guest',
      log.userId?.email || 'N/A',
      new Date(log.timestamp).toISOString(),
      log.ip,
      log.device,
      log.browser,
      log.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `StayMate_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(auditTotal / limit) || 1;

  return (
    <div className="space-y-6">
      <SEOHead 
        title="Audit Logs Console" 
        description="Filter, inspect, and export StayMate system audit log action events." 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-secondary-100 dark:border-secondary-900 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-secondary-900 dark:text-white">Audit Management</h1>
          <p className="text-xs text-secondary-450 mt-0.5">SaaS security audit trail logs</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={exportToCSV} 
            disabled={audits.length === 0}
            size="sm" 
            variant="outline" 
            className="text-[10px] font-bold py-1.5 px-4 inline-flex items-center border-secondary-200"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-primary-500" /> Export CSV
          </Button>
          <Button 
            onClick={() => loadAudits(page)} 
            size="sm" 
            variant="outline" 
            className="p-2 border-secondary-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Options Form */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-secondary-50/20 border border-secondary-200/50 rounded-[20px]">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">Filter Action</label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. AUTH_LOGIN, VISIT_APPROVED"
            className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-secondary-950 border border-secondary-200/60 dark:border-secondary-900 rounded-[12px] focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">IP Address</label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="e.g. 127.0.0.1"
            className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-secondary-950 border border-secondary-200/60 dark:border-secondary-900 rounded-[12px] focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">Event Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-secondary-950 border border-secondary-200/60 dark:border-secondary-900 rounded-[12px] focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <Button 
            type="submit" 
            size="sm" 
            variant="primary"
            className="w-full justify-center rounded-[12px] text-[11px] font-bold h-9"
            leftIcon={<Search className="h-3.5 w-3.5" />}
          >
            Search
          </Button>
          <Button 
            type="button" 
            onClick={handleReset}
            size="sm" 
            variant="secondary" 
            className="w-full justify-center rounded-[12px] text-[11px] font-bold h-9"
          >
            Reset
          </Button>
        </div>
      </form>

      {/* Audit Data Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      ) : audits.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-secondary-200 rounded-[20px]">
          <p className="text-xs text-secondary-400 font-semibold">No audit logs found matching selected criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AuditTable logs={audits} />

          {/* Simple Pagination Footer */}
          <div className="flex items-center justify-between px-2 pt-2 text-xs font-bold text-secondary-500">
            <span>Showing Page {page} of {totalPages} ({auditTotal} total events)</span>
            <div className="flex space-x-2">
              <Button
                onClick={() => handlePageChange('prev')}
                disabled={page === 1}
                size="sm"
                variant="outline"
                className="py-1 px-3 border-secondary-200"
              >
                <ChevronLeft className="h-4 w-4 mr-0.5" /> Previous
              </Button>
              <Button
                onClick={() => handlePageChange('next')}
                disabled={page === totalPages}
                size="sm"
                variant="outline"
                className="py-1 px-3 border-secondary-200"
              >
                Next <ChevronRight className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditManagementPage;
