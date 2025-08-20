import { useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from 'astro:db';
import { convertResultsToCSV, downloadCSV } from "@/lib/csvUtils";
import { Checkbox } from "@/components/ui/checkbox";

export interface SurveyResult {
  id: string; // Change to string to match the database schema
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  military_score: number;
  civilian_score: number;
  strategy: string;
  subscribe?: boolean | number | string; // Allow all possible types
  story_opt_in?: boolean | number | string; // Allow all possible types
  demographics?: {
    age_range?: string;
    gender?: string;
    gender_self_described?: string;
    race?: string[];
    military_status?: string;
    years_since_separation?: string;
    branch?: string;
    mos?: string;
    combat?: string;
  };
  va_benefits?: {
    has_applied?: string;
    benefits_used?: string[];
    has_disability_rating?: string;
    disability_rating?: string;
    comfort_delay?: string;
    decision_time?: string;
    va_healthcare?: string;
    va_experience?: string;
  };
}

interface Props {
  initialResults: SurveyResult[];
}

export function ResultsTable({ initialResults }: Props) {
  const [results, setResults] = useState<SurveyResult[]>(initialResults);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);
  const { toast } = useToast(); // Get toast function from the hook

  // We no longer need the individual delete function as we're using bulk delete
  
  // Toggle select all rows
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelectedRows: Record<string, boolean> = {};
    if (newSelectAll) {
      // Select all rows
      results.forEach(result => {
        newSelectedRows[result.id] = true;
      });
    }
    setSelectedRows(newSelectedRows);
  };
  
  // Toggle select single row
  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev => {
      const newSelected = { ...prev };
      if (newSelected[id]) {
        delete newSelected[id];
      } else {
        newSelected[id] = true;
      }
      
      // Check if all are selected to update selectAll state
      if (Object.keys(newSelected).length === results.length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
      
      return newSelected;
    });
  };
  
  // Get selected rows count
  const selectedCount = Object.keys(selectedRows).length;
  
  // Get selected results
  const getSelectedResults = () => {
    return results.filter(result => selectedRows[result.id]);
  };
  
  // Download selected rows as CSV
  const downloadSelectedAsCSV = () => {
    try {
      const selectedResults = getSelectedResults();
      console.log(`Processing ${selectedResults.length} selected survey results for CSV download`);
      const csvContent = convertResultsToCSV(selectedResults);
      console.log("CSV content first 100 chars:", csvContent.substring(0, 100));
      console.log("CSV content contains newlines:", csvContent.includes('\r\n'));
      console.log("Number of rows in CSV:", csvContent.split('\r\n').length);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadCSV(csvContent, `selected-survey-results-${timestamp}.csv`);
      
      toast({
        title: "Success",
        description: `${selectedResults.length} survey result(s) downloaded as CSV`,
      });
    } catch (error) {
      console.error('Error generating CSV:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate CSV file",
        variant: "destructive",
      });
    }
  };
  
  // Delete selected rows
  const deleteSelectedRows = async () => {
    const selectedIds = Object.keys(selectedRows);
    if (selectedIds.length === 0) return;
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected survey response(s)? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setBulkActionInProgress(true);
      
      // Delete each selected row
      const deletePromises = selectedIds.map(async (id) => {
        const response = await fetch('/api/delete-survey', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || `Failed to delete survey response ${id}`);
        }
        
        return id;
      });
      
      // Wait for all deletions to complete
      const deletedIds = await Promise.all(deletePromises);
      
      // Remove deleted rows from state
      setResults(prevResults => prevResults.filter(result => !deletedIds.includes(result.id)));
      
      // Clear selection
      setSelectedRows({});
      setSelectAll(false);
      
      toast({
        title: "Success",
        description: `${deletedIds.length} survey response(s) deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting survey responses:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete selected responses",
        variant: "destructive",
      });
    } finally {
      setBulkActionInProgress(false);
    }
  };

  if (!results.length) {
    return <div className="text-white">No results found.</div>;
  }

  return (
    <div>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white w-[50px]">
                <Checkbox 
                  checked={selectAll} 
                  onCheckedChange={toggleSelectAll} 
                  id="select-all" 
                  aria-label="Select all rows"
                />
              </TableHead>
              <TableHead className="text-white">Timestamp</TableHead>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Story Share</TableHead>
              <TableHead className="text-white">Military Score</TableHead>
              <TableHead className="text-white">Civilian Score</TableHead>
              <TableHead className="text-white">Strategy</TableHead>
              <TableHead className="text-white">Demographics</TableHead>
              <TableHead className="text-white">Benefits</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index} className={selectedRows[result.id] ? "bg-gray-800/50" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedRows[result.id] || false}
                    onCheckedChange={() => toggleSelectRow(result.id)}
                    id={`select-${result.id}`}
                    aria-label={`Select ${result.first_name} ${result.last_name}`}
                  />
                </TableCell>
                <TableCell className="text-gray-300">
                  {new Date(result.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-gray-300">
                  {result.first_name} {result.last_name}
                </TableCell>
                <TableCell className="text-gray-300">{result.email}</TableCell>
                <TableCell className="text-gray-300">
                  {/* Super explicit check for any kind of truthy value */}
                  {(result.story_opt_in === true || 
                    result.story_opt_in === 1 || 
                    String(result.story_opt_in) === "1" || 
                    String(result.story_opt_in).toLowerCase() === "true") 
                    ? "✅ Yes" : "❌ No"}
                </TableCell>
                <TableCell className="text-gray-300">{result.military_score}</TableCell>
                <TableCell className="text-gray-300">{result.civilian_score}</TableCell>
                <TableCell className="text-gray-300">{result.strategy}</TableCell>
                <TableCell className="text-gray-300">
                  <details className="cursor-pointer">
                    <summary>View Details</summary>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>Age: {result.demographics?.age_range || 'N/A'}</p>
                      <p>Gender: {result.demographics?.gender || 'N/A'}</p>
                      <p>Race: {Array.isArray(result.demographics?.race) 
                        ? result.demographics?.race?.join(', ') 
                        : 'N/A'}</p>
                      <p>Military Status: {result.demographics?.military_status || 'N/A'}</p>
                      <p>Years Since Separation: {result.demographics?.years_since_separation || 'N/A'}</p>
                      <p>Branch: {result.demographics?.branch || 'N/A'}</p>
                      <p>MOS: {result.demographics?.mos || 'N/A'}</p>
                      <p>Combat Experience: {result.demographics?.combat || 'N/A'}</p>
                    </div>
                  </details>
                </TableCell>
                <TableCell className="text-gray-300">
                  <details className="cursor-pointer">
                    <summary>View Details</summary>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>Applied: {result.va_benefits?.has_applied || 'N/A'}</p>
                      <p>Benefits Used: {Array.isArray(result.va_benefits?.benefits_used) 
                        ? result.va_benefits?.benefits_used?.join(', ') 
                        : 'N/A'}</p>
                      <p>Disability Rating: {result.va_benefits?.has_disability_rating || 'N/A'}</p>
                      {result.va_benefits?.disability_rating && (
                        <p>Rating %: {result.va_benefits.disability_rating}</p>
                      )}
                      <p>Comfort Delay: {result.va_benefits?.comfort_delay || 'N/A'}</p>
                      <p>Decision Time: {result.va_benefits?.decision_time || 'N/A'}</p>
                      <p>Disability Payment Impact: {result.va_benefits?.va_healthcare || 'N/A'}</p>
                      {result.va_benefits?.va_experience && (
                        <p>Impact Description: {result.va_benefits.va_experience}</p>
                      )}
                    </div>
                  </details>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
