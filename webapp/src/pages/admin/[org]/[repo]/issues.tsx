import { Box, Text } from "@chakra-ui/react";
import ComplexTable from "views/admin/dataTables/components/ComplexTable";
import { columnsDataComplex } from "views/admin/dataTables/variables/columnsData";
import tableDataComplex from "views/admin/dataTables/variables/tableDataComplex.json";
import React from "react";
import AdminLayout from "layouts/admin";
import { TableData } from "views/admin/default/variables/columnsData";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { GetStaticProps } from "next";
import clientPromise from "lib/mongodb";

interface Params extends ParsedUrlQuery {
  org: string;
  repo: string;
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  try {
    await clientPromise;
  } catch (e: any) {
    // cluster is still provisioning
    return {
      org: "org",
      repo: "repo",
    };
  }
  // Fetch data based on postId
  const { org, repo } = context.params;
  // const post = await fetch(`https://api.example.com/posts/${postId}`).then(res => res.json());

  // Pass post data to the page via props
  return { props: { org, repo } };
}

export default function Issues({ org, repo }: Params) {
  return (
    <AdminLayout>
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Text>
          {" "}
          Org ID: {org} Repo ID: {repo}{" "}
        </Text>
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex as unknown as TableData[]}
        />
      </Box>
    </AdminLayout>
  );
}
