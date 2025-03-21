import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  TableOptions,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { Fragment } from "react";
import { IconButton } from "../button";
import { ChevronLeft, ChevronRight, Filter, RefreshCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { DataFilterForm, DataTableFormConfig } from "./filter-form";
import { DataTableRow } from "./table-row";
import { Drawer, DrawerContent, DrawerTrigger } from "../drawer";
import { cn } from "@/lib/utils";
export type { DataTableFormConfig, DataTableFilterField } from "./filter-form";
export { SortHeader } from "./sort-header";

export function DataTable<TData, TValue>({
  columns,
  data,
  filterFormProps,
  onRefreshData,
  onRowClick,
  getDrawerContent,
  options = {},
}: Props<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const currentFiltersMap: {
    [k: string]: string | number | readonly string[] | undefined;
  } = React.useMemo(
    () =>
      columnFilters.reduce(
        (prev, curr) => ({ ...prev, [curr.id]: curr.value }),
        {}
      ),
    [columnFilters]
  );
  const isFiltered = columnFilters.length > 0;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    ...options,
    state: {
      sorting,
      columnFilters,
      ...(options.state || {}),
    },
  });

  const isFilterFormAvailable = !!filterFormProps;

  const onFilterSubmit = (values: object) => {
    for (const [key, value] of Object.entries(values)) {
      table.getColumn(key)?.setFilterValue(value);
    }
  };

  return (
    <div>
      <div className="flex">
        {onRefreshData && (
          <IconButton
            variant="outline"
            className={`ml-auto focus:mr-[1px] rounded-none  ${
              isFilterFormAvailable ? "" : "rounded-tr-md"
            }`}
            Icon={RefreshCcw}
            onClick={onRefreshData}
          />
        )}
        {isFilterFormAvailable && (
          <Popover>
            <PopoverTrigger asChild>
              <IconButton
                variant="outline"
                className={`${
                  onRefreshData ? "" : "ml-auto"
                } rounded-l-none rounded-br-none`}
                Icon={Filter}
                iconClassName={isFiltered ? "fill-secondary-foreground" : ""}
              />
            </PopoverTrigger>
            <PopoverContent>
              <DataFilterForm
                onSubmit={onFilterSubmit}
                onReset={() => setColumnFilters([])}
                fieldsConfig={filterFormProps}
                isFiltered={isFiltered}
                values={currentFiltersMap}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="border rounded-l-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        header.column.columnDef.meta?.headerClassName ?? ""
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  {getDrawerContent !== undefined ? (
                    <DetailDrawer row={row} getDrawerContent={getDrawerContent}>
                      <DataTableRow row={row} onClick={onRowClick} />
                    </DetailDrawer>
                  ) : (
                    <DataTableRow row={row} onClick={onRowClick} />
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <IconButton
          Icon={ChevronLeft}
          className="rounded-none rounded-bl-md disabled:text-muted-foreground disabled:bg-muted"
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        />
        <IconButton
          Icon={ChevronRight}
          variant="outline"
          className="rounded-none rounded-br-md disabled:text-muted-foreground disabled:bg-muted"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        />
      </div>
    </div>
  );
}

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterFormProps?: DataTableFormConfig;
  onRefreshData?: () => void;
  getDrawerContent?: (row: Row<TData>) => React.ReactElement;
  onRowClick?: (row: Row<TData>) => void;
  options?: Partial<TableOptions<TData>>;
}

function DetailDrawer<TData>({
  row,
  drawerClassName,
  getDrawerContent,
  children,
}: React.PropsWithChildren<DetailDrawerProps<TData>>) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className={cn("inset-y-0 right-0", drawerClassName)}>
        {getDrawerContent(row)}
      </DrawerContent>
    </Drawer>
  );
}

interface DetailDrawerProps<TData> {
  row: Row<TData>;
  drawerClassName?: string;
  getDrawerContent: (row: Row<TData>) => React.ReactElement;
}
