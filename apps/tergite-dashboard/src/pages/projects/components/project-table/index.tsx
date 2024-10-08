import { DataTable } from "@/components/ui/data-table";

import { User, type Project } from "types";

import { getColumns } from "./columns";
import { filterFormProps } from "./filter-form";
import { OnChangeFn, Row, RowSelectionState } from "@tanstack/react-table";
import { useMemo } from "react";

export function ProjectsTable({
  data,
  onRowSelectionChange,
  rowSelection,
  onRowClick,
  currentUser,
}: Props) {
  const columns = useMemo(() => getColumns({ currentUser }), [currentUser]);
  return (
    <DataTable
      columns={columns}
      data={data}
      filterFormProps={filterFormProps}
      options={{
        enableMultiRowSelection: false,
        onRowSelectionChange,
        state: { rowSelection },
      }}
      onRowClick={onRowClick}
    />
  );
}

interface Props {
  data: Project[];
  currentUser: User;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  rowSelection?: RowSelectionState;
  onRowClick: (row: Row<Project>) => void;
}
