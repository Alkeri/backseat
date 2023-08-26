'use client';

import { useState } from 'react';

import useSWR from 'swr';

import { DBIssue, DBIssues } from '../lib/api/issue';

import { Octokit } from 'octokit';
import Link from 'next/link';
import {
  Badge,
  Blockquote,
  Box,
  Card,
  Flex,
  Heading,
  Text
} from '@radix-ui/themes';

const getBadgeColor = (state: string) => {
  switch (state) {
    case 'open':
      return 'green';
    case 'closed':
      return 'red';
    case 'draft':
      return 'gray';
    default:
      return 'gray';
  }
};

const issueFetcher = async (args: string[]) => {
  const octokit = new Octokit({
    auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
  });

  const [owner, repo, issueNumber] = args;

  const { data } = await octokit.rest.issues.get({
    owner,
    repo,
    issue_number: issueNumber
  });

  return data;
};

const getWeight = (score: number) => {
  if (score > 0.8) {
    return 'bold';
  }

  if (score > 0.6) {
    return undefined;
  }

  return 'light';
};

const IssueComponent = ({ issue }: { issue: DBIssue }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const owner = issue.repoName.split('/')[0];
  const repo = issue.repoName.split('/')[1];
  const { data, error, isLoading } = useSWR(
    [owner, repo, issue.issueNumber],
    issueFetcher
  );

  if (isLoading || !data) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  const repoUrl = data.repository_url.replace(
    'api.github.com/repos',
    'github.com'
  );

  return (
    <Card style={{ margin: 2 }}>
      <Flex
        onClick={() => {
          setIsCollapsed(!isCollapsed);
        }}
        style={{ cursor: 'pointer' }}
        gap="2"
      >
        <Text>#{issue.issueNumber}</Text>
        <Text size="3" weight="bold" style={{ marginLeft: '2' }}>
          {data.title}
        </Text>

        <Badge color={getBadgeColor(data.state)}>{data.state}</Badge>

        <Box style={{ flex: 1 }} />

        <Link href={`${repoUrl}/issues/${issue.issueNumber}`} target="_blank">
          {issue.repoName}
        </Link>
      </Flex>

      {!isCollapsed && (
        <Box>
          {issue.draftResponse ? (
            <Box py="2">
              You should respond with:
              <Blockquote>
                {issue.draftResponse
                  .trim()
                  .split('\n')
                  .map((line) => (
                    <Box>{line}</Box>
                  ))}
              </Blockquote>
            </Box>
          ) : (
            <Box py="2">
              <Text>No draft response found.</Text>
            </Box>
          )}

          {issue.similarIssues && (
            <Flex gap="2" py="2">
              <Heading size="3">Related Issues</Heading>
              <Box style={{ flex: 1 }} />
              {issue.similarIssues.map((relatedIssue) => (
                <Link
                  href={`${repoUrl}/issues/${relatedIssue.issueNumber}`}
                  target="_blank"
                >
                  <Text weight={getWeight(relatedIssue.score)} color="blue">
                    #{relatedIssue.issueNumber}
                  </Text>
                </Link>
              ))}
            </Flex>
          )}
        </Box>
      )}
    </Card>
  );
};

export default async function IssuesTable({ issues }: { issues?: DBIssues }) {
  return (
    <Flex gap="3" direction="column" py="2">
      {issues?.map((issue: DBIssue) => (
        <IssueComponent issue={issue} key={issue._id} />
      ))}
    </Flex>
  );
}
