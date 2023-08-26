import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text
} from '@tremor/react';

import { DBIssue, DBIssues } from '../lib/api/issue';
import Link from 'next/link';

export default async function IssuesTable({
  issues: issues
}: {
  issues: DBIssues;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Issue Number</TableHeaderCell>
          <TableHeaderCell>Issue Repository</TableHeaderCell>
          <TableHeaderCell>Issue Analyzer Status</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {issues.map((issue: DBIssue) => (
          <TableRow key={issue._id}>
            <TableCell><a target="_blank" href={`https://github.com/${issue.repoName}/issues/${issue.issueNumber}`}><span>{issue.issueNumber} <img src="/icons8-new-tab.svg" alt="My SVG" style={{display:"inline"}} /></span></a></TableCell>
            <TableCell>
              <Text>{issue.repoName}</Text>
            </TableCell>
            <TableCell>
              <Text>{issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
