import { Box, Text } from "@chakra-ui/react";
import ComplexTable from "views/admin/dataTables/components/ComplexTable";
import { columnsDataComplex } from "views/admin/dataTables/variables/columnsData";
import tableDataComplex from "views/admin/dataTables/variables/tableDataComplex.json";
import React from "react";
import AdminLayout from "layouts/admin";
import { TableData } from "views/admin/default/variables/columnsData";
import { ParsedUrlQuery } from "querystring";
import clientPromise from "lib/mongodb";
import { listDBIssues, DBIssue, DBIssues } from "lib/api/issue";

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
      issues: [],
    };
  }

  const issues = await listDBIssues(org, repo);

  return { props: { org, repo, issues } };
}

export default function Issues({ org, repo, issues }: Params) {
  return (
    <AdminLayout>
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Text>{org}</Text>
        <Text>Repo ID: {repo}</Text>
        {issues.map((issue: DBIssue) => (
          <Text>
            {" "}
            Issue ID: {issue._id} Issue Title: {issue.issueNumber}{" "}
          </Text>
        ))}

        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex as unknown as TableData[]}
        />
      </Box>
    </AdminLayout>
  );
}
