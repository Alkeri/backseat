'use client';

import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text
} from '@tremor/react';

import useSWR from 'swr';

import { DBIssue, DBIssues } from '../lib/api/issue';

import { Octokit } from 'octokit';
import Link from 'next/link';
import { Card } from '@radix-ui/themes';

const issueFetcher = async (
  owner: string,
  repo: string,
  issueNumber: number
) => {
  const octokit = new Octokit({
    auth: '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'
  });

  const { data } = await octokit.request(
    'GET /repos/{owner}/{repo}/issues/{issue_number}',
    {
      owner,
      repo,
      issue_number: issueNumber
    }
  );

  return data;
};

const IssueComponent = ({ issue }: { issue: DBIssue }) => {
  const [owner, repo] = issue.repoName.split('/');
  const { data, error, isLoading } = useSWR(
    [owner, repo, issue.issueNumber],
    issueFetcher
  );

  if (isLoading || !data) {
    return (
      <TableRow>
        <TableCell>
          <Text>Loading...</Text>
        </TableCell>
      </TableRow>
    );
  }

  if (error) {
    return (
      <TableRow>
        <TableCell>
          <Text>Error: {error}</Text>
        </TableCell>
      </TableRow>
    );
  }

  console.log(data);

  const repoUrl = data.repository_url.replace(
    'api.github.com/repos',
    'github.com'
  );

  return (
    <Card style={{ margin: 2 }}>
      <Link href={repoUrl} target="_blank">
        {issue.repoName}
      </Link>
      <Link href={`${repoUrl}/issues/${issue.issueNumber}`} target="_blank">
        {data.title}
      </Link>
    </Card>
  );
};

export default async function IssuesTable({
  issues: issues
}: {
  issues: DBIssues;
}) {
  return (
    <div>
      {issues.map((issue: DBIssue) => (
        <IssueComponent issue={issue} key={issue._id} />
      ))}
    </div>
  );
}
