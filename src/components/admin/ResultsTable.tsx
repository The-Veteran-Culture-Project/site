import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from 'astro:db';

export interface SurveyResult {
  id: string; // Change to string to match the database schema
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  military_score: number;
  civilian_score: number;
  strategy: string;
  demographics?: {
    age_range?: string;
    gender?: string;
    race?: string[];
    military_status?: string;
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
  };
}

interface Props {
  initialResults: SurveyResult[];
}

export function ResultsTable({ initialResults }: Props) {
  const [results] = useState<SurveyResult[]>(initialResults);

  if (!results.length) {
    return <div className="text-white">No results found.</div>;
  }

  return (
    <div className="rounded-md border border-gray-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">Timestamp</TableHead>
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="text-white">Email</TableHead>
            <TableHead className="text-white">Military Score</TableHead>
            <TableHead className="text-white">Civilian Score</TableHead>
            <TableHead className="text-white">Strategy</TableHead>
            <TableHead className="text-white">Demographics</TableHead>
            <TableHead className="text-white">Benefits</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={index}>
              <TableCell className="text-gray-300">
                {new Date(result.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-gray-300">
                {result.first_name} {result.last_name}
              </TableCell>
              <TableCell className="text-gray-300">{result.email}</TableCell>
              <TableCell className="text-gray-300">{result.military_score}</TableCell>
              <TableCell className="text-gray-300">{result.civilian_score}</TableCell>
              <TableCell className="text-gray-300">{result.strategy}</TableCell>
              <TableCell className="text-gray-300">
                <details className="cursor-pointer">
                  <summary>View Details</summary>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Age: {result.demographics?.age_range || 'N/A'}</p>
                    <p>Gender: {result.demographics?.gender || 'N/A'}</p>
                    <p>Race: {result.demographics?.race?.join(', ') || 'N/A'}</p>
                    <p>Military Status: {result.demographics?.military_status || 'N/A'}</p>
                    <p>Combat Experience: {result.demographics?.combat || 'N/A'}</p>
                  </div>
                </details>
              </TableCell>
              <TableCell className="text-gray-300">
                <details className="cursor-pointer">
                  <summary>View Details</summary>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Applied: {result.va_benefits?.has_applied || 'N/A'}</p>
                    <p>Benefits Used: {result.va_benefits?.benefits_used?.join(', ') || 'N/A'}</p>
                    <p>Disability Rating: {result.va_benefits?.has_disability_rating || 'N/A'}</p>
                    {result.va_benefits?.disability_rating && (
                      <p>Rating %: {result.va_benefits.disability_rating}</p>
                    )}
                    <p>Comfort Delay: {result.va_benefits?.comfort_delay || 'N/A'}</p>
                    <p>Decision Time: {result.va_benefits?.decision_time || 'N/A'}</p>
                    <p>VA Impact: {result.va_benefits?.va_healthcare || 'N/A'}</p>
                  </div>
                </details>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
