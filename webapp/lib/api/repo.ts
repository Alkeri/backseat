import 'server-only';
import clientPromise from '../mongodb';

export interface DBRepo {
  name: string;
}

export type DBRepos = DBRepo[];

export async function listDBRepos(): Promise<DBRepos> {
  const client = await clientPromise;
  const collection = client.db('backseat').collection('repos');
  const dbRepos = await collection
    .find({})
    .sort({ issueNumber: -1 })
    .limit(100)
    .toArray();

  return JSON.parse(JSON.stringify(dbRepos));
}
