import 'server-only';
import clientPromise from '../mongodb';

import { Octokit, App } from 'octokit';

export interface DBPullRequest {
  _id: string;
  issueNumber: number;
  repoId: number;
  type: string;
  repoName: string;
  draftResponse: string;
}

export async function listDDPrs(
  org: string,
  repo: string
): Promise<DBPullRequest[]> {
  const client = await clientPromise;
  const collection = client.db('backseat').collection('pull_requests');
  const dbPullRequests = await collection
    .find({})
    .sort({ issueNumber: -1 })
    .limit(100)
    .toArray();

  const prs = JSON.parse(JSON.stringify(dbPullRequests));

  return prs;
}
