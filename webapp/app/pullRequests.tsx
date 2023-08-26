'use client';

import { useState } from 'react';

import useSWR from 'swr';

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
import { DBPullRequest } from '../lib/api/prs';

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

const pullRequestFetcher = async (args: any[]) => {
  console.log(process.env.GITHUB_TOKEN);
  const octokit = new Octokit({
    auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
  });

  const [owner, repo, issueNumber] = args;

  const { data } = await octokit.request(
    'GET /repos/{owner}/{repo}/pulls/{pull_number}',
    {
      owner,
      repo,
      pull_number: issueNumber
    }
  );

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

const PullRequestComponent = ({ pr }: { pr: DBPullRequest }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const owner = pr.repoName.split('/')[0];
  const repo = pr.repoName.split('/')[1];
  const { data, error, isLoading } = useSWR(
    [owner, repo, pr.issueNumber],
    pullRequestFetcher
  );
  if (isLoading || !data) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <Card style={{ margin: 2 }}>
      <Flex
        onClick={() => {
          setIsCollapsed(!isCollapsed);
        }}
        style={{ cursor: 'pointer' }}
        gap="2"
      >
        <Text>#{pr.issueNumber}</Text>
        <Text size="3" weight="bold">
          {data.title}
        </Text>

        <Badge color={getBadgeColor(data.state)}>{data.state}</Badge>

        <Box style={{ flex: 1 }} />

        <Link href={`${data.html_url}/pulls/${pr.issueNumber}`} target="_blank">
          {pr.repoName}
        </Link>
      </Flex>

      {!isCollapsed && (
        <Box>
          {pr.draftResponse ? (
            <Box py="2">
              You should respond with:
              <Blockquote>
                {pr.draftResponse
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
        </Box>
      )}
    </Card>
  );
};

export default async function PullRequestsTable({
  pullRequests
}: {
  pullRequests?: DBPullRequest[];
}) {
  return (
    <Flex gap="3" direction="column" py="2">
      {pullRequests?.map((pr) => (
        <PullRequestComponent pr={pr} key={pr._id} />
      ))}
    </Flex>
  );
}
