import { Card, Title, Text } from '@tremor/react';
import { listDBIssues, DBIssues } from '../../../lib/api/issue';

import IssuesTable from './issues_table';

export const dynamic = 'force-dynamic';

export default async function IndexPage({
  searchParams
}: {
  searchParams: { q: string };
}) {
  const issues = await listDBIssues('Alkeri', 'file-conversions');

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Issues</Title>
      <Text>Your issues are here.</Text>
      <Card className="mt-6">
        <IssuesTable issues={issues} />
      </Card>
    </main>
  );
}
