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
          <TableHeaderCell>issue Repo</TableHeaderCell>
          <TableHeaderCell>Issue Repo ID</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {issues.map((issue: DBIssue) => (
          <TableRow key={issue._id}>
            <TableCell>{issue.issueNumber}</TableCell>
            <TableCell>
              <Text>{issue.repoName}</Text>
            </TableCell>
            <TableCell>
              <Text>{issue.repoId}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
