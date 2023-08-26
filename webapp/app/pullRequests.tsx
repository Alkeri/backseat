'use client';

import { useState } from 'react';

import useSWR from 'swr';

import { DBIssue, DBIssues } from '../lib/api/issue';

import { Octokit } from 'octokit';
import Link from 'next/link';
import { Blockquote, Box, Card, Flex, Heading, Text } from '@radix-ui/themes';
import { DBPullRequest } from '../lib/api/prs';

const issueFetcher = async (
  owner: string,
  repo: string,
  issueNumber: number
) => {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
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
  const [owner, repo] = issue.repoName.split('/');
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
      >
        <Text size="3" weight="bold">
          {data.title}
        </Text>

        <Box style={{ flex: 1 }} />

        <Link href={`${repoUrl}/issues/${issue.issueNumber}`} target="_blank">
          {issue.repoName}
        </Link>
      </Flex>

      {!isCollapsed && (
        <Box>
          {issue.draftResponse ? (
            <Box py="2">
              You should response with:
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

export default async function PullRequestsTable({
  pullRequests
}: {
  pullRequests?: DBPullRequest[];
}) {
  return (
    <Flex gap="3" direction="column" py="2">
      {pullRequests?.map((pr) => (
        <>{pr._id}</>
      ))}
    </Flex>
  );
}
