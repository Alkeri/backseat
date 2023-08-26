import 'server-only';
import clientPromise from '../mongodb';

import { Octokit, App } from 'octokit';

export interface DBIssue {
  _id: string;
  issueNumber: number;
  repoId: number;
  type: string;
  repoName: string;
  draftResponse: string;
  similarIssues: {
    issueNumber: number;
    repoId: number;
    issueType: string;
    score: number;
  }[];
}

export type DBIssues = DBIssue[];

export async function listDBIssues(
  org: string,
  repo: string
): Promise<DBIssues> {
  const client = await clientPromise;
  const collection = client.db('backseat').collection('issues');
  const dbIssues = await collection
    .find({})
    .sort({ issueNumber: -1 })
    .limit(100)
    .toArray();

  const issues = JSON.parse(JSON.stringify(dbIssues));

  return issues;
}
