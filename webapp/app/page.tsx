import { Card, Title, Text } from '@tremor/react';
import { queryBuilder } from '../lib/planetscale';
import { listDBIssues, DBIssues } from '../lib/api/issue';

import Search from './search';
import ReposTable from './repos_table';

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
      <Title>Issues</Title>
      <Text>Your repos are here.</Text>
      <Search />
      <Card className="mt-6">
        <ReposTable issues={issues} />
      </Card>
    </main>
  );
}
