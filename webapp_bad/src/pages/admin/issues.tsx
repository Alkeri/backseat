import { Box } from "@chakra-ui/react";
import ComplexTable from "views/admin/dataTables/components/ComplexTable";
import { columnsDataComplex } from "views/admin/dataTables/variables/columnsData";
import tableDataComplex from "views/admin/dataTables/variables/tableDataComplex.json";
import React from ".pnpm/@types+react@18.0.11/node_modules/@types/react";
import AdminLayout from "layouts/admin";
import { TableData } from "views/admin/default/variables/columnsData";

export default function Issues() {
  return (
    <AdminLayout>
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex as unknown as TableData[]}
        />
      </Box>
    </AdminLayout>
  );
}