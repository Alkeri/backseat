import React from '.pnpm/@types+react@18.0.11/node_modules/@types/react';
import { ParsedUrlQuery } from 'querystring';
import clientPromise from 'lib/mongodb';
import { listDBIssues, DBIssue, DBIssues } from 'lib/api/issue';

import { Box, Text } from '@chakra-ui/react';

interface Params {
  org: string;
  repo: string;
  issues: DBIssues;
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  const { org, repo } = context.params;

  try {
    await clientPromise;
  } catch (e: any) {
    // cluster is still provisioning
    return {
      org: org,
      repo: repo,
      issues: []
    };
  }

  const issues = await listDBIssues(org, repo);

  return { props: { org, repo, issues } };
}

export default function Issues({ org, repo, issues }: Params) {
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text>{org}</Text>
      <Text>Repo ID: {repo}</Text>
      {issues.map((issue: DBIssue) => (
        <Text key={issue._id}>
          {' '}
          Issue ID: {issue._id} Issue Repo: {issue.repoName}{' '}
        </Text>
      ))}
    </Box>
  );
}
