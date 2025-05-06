"use client";
import { columns, Key } from "./columns";
import DataTable from "./data-table";

const APIKeys = ({ data }: { data: Key[] }) => {
  return <DataTable columns={columns} data={data} />;
};

export default APIKeys;
