import { Card, Title, Text } from '@tremor/react';
import { queryBuilder } from '../lib/planetscale';
import { listDBIssues, DBIssues } from '../lib/api/issue';

import Search from './search';
import IssuesTable from './table';

export const dynamic = 'force-dynamic';

export default async function IndexPage({
  searchParams
}: {
  searchParams: { q: string };
}) {
  const search = searchParams.q ?? '';
  const issues = await listDBIssues('org', 'repo');

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Users</Title>
      <Text>
        A list of users retrieved from a MySQL database (PlanetScale).
      </Text>
      <Search />
      <Card className="mt-6">
        <IssuesTable issues={issues} />
      </Card>
    </main>
  );
}
