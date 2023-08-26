import { Title, Text } from '@tremor/react';
import { listDBIssues } from '../lib/api/issue';

import Search from './search';
import IssuesTable from './issues';
import { listDDPrs } from '../lib/api/prs';
import PullRequestsTable from './pullRequests';

export const dynamic = 'force-dynamic';

export default async function IndexPage({
  searchParams
}: {
  searchParams: { q: string };
}) {
  const issues = await listDBIssues('org', 'repo');
  const pullRequests = await listDDPrs('org', 'repo');

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Issues</Title>
      <Text>A list of issues with AI-generated responses.</Text>
      {issues && <IssuesTable issues={issues} />}
      <Title>Pull Requests</Title>
      <Text>A list of pull requests with AI-generated responses.</Text>
      {pullRequests && <PullRequestsTable pullRequests={pullRequests} />}
    </main>
  );
}
