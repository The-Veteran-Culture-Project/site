import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { convertSubscribersToCSV, downloadCSV, type Subscriber as SubscriberType } from '../../lib/csvUtils';
import { useToast } from '../../hooks/use-toast';

interface Subscriber extends SubscriberType {}

interface MarketingSubscribersTableProps {
  subscribers: Subscriber[];
}

export default function MarketingSubscribersTable({ subscribers }: MarketingSubscribersTableProps) {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [allSelected, setAllSelected] = useState(false);
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);
  const { toast } = useToast();

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  useEffect(() => {
    // Update allSelected state when all rows are manually selected
    if (subscribers.length > 0 && selectedCount === subscribers.length) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
  }, [selectedCount, subscribers.length]);

  const toggleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      setSelectedRows({});
      setAllSelected(false);
    } else {
      // Select all
      const newSelected: Record<string, boolean> = {};
      subscribers.forEach(subscriber => {
        newSelected[subscriber.id] = true;
      });
      setSelectedRows(newSelected);
      setAllSelected(true);
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getSelectedSubscribers = () => {
    return subscribers.filter(subscriber => selectedRows[subscriber.id]);
  };

  // Download selected rows as CSV
  const downloadSelectedAsCSV = () => {
    try {
      const selectedSubscribers = getSelectedSubscribers();
      console.log(`Processing ${selectedSubscribers.length} selected subscribers for CSV download`);
      const csvContent = convertSubscribersToCSV(selectedSubscribers);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadCSV(csvContent, `marketing-subscribers-${timestamp}.csv`);
      
      toast({
        title: "Success",
        description: `${selectedSubscribers.length} subscriber(s) downloaded as CSV`,
      });
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast({
        title: "Error",
        description: "Failed to download CSV file",
        variant: "destructive",
      });
    }
  };

  // Delete selected rows
  const deleteSelectedRows = async () => {
    const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id]);
    if (selectedIds.length === 0) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedIds.length} subscriber(s)? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    setBulkActionInProgress(true);
    
    try {
      // Delete each selected subscriber
      for (const id of selectedIds) {
        await fetch('/api/delete-marketing-subscriber', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
      }
      
      // Show success message
      toast({
        title: "Success",
        description: `${selectedIds.length} subscriber(s) deleted successfully`,
      });
      
      // Reset selection
      setSelectedRows({});
      setAllSelected(false);
      
      // Force page reload to refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscribers",
        variant: "destructive",
      });
    } finally {
      setBulkActionInProgress(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">
            {selectedCount > 0 ? `${selectedCount} ${selectedCount === 1 ? 'row' : 'rows'} selected` : "Select rows using checkboxes"}
          </span>
          <div className="text-sm text-gray-400">
            Use the <span className="text-white font-medium">Select All</span> checkbox to quickly select all rows
          </div>
        </div>
        
        {selectedCount > 0 && (
          <div className="flex gap-4">
            <Button
              onClick={() => downloadSelectedAsCSV()}
              disabled={bulkActionInProgress}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex-1"
            >
              Download as CSV
            </Button>
            <Button
              onClick={() => deleteSelectedRows()}
              disabled={bulkActionInProgress}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex-1"
            >
              {bulkActionInProgress ? "Processing..." : "Delete Selected"}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {subscribers.length > 0 ? (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="bg-gray-900 hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={!!selectedRows[subscriber.id]}
                        onCheckedChange={() => toggleRowSelection(subscriber.id)}
                        aria-label={`Select row ${subscriber.id}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-200">{subscriber.email}</td>
                    <td className="px-4 py-3 text-gray-300">{subscriber.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(subscriber.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{subscriber.source || "website"}</td>
                  </tr>
                ))
              ) : (
                <tr className="bg-gray-900">
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No subscribers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4 text-right text-sm text-gray-400">
        Total: {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
