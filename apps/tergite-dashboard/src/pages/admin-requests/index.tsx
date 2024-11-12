import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  allUserRequestsQuery,
  currentUserQuery,
  refreshAllAdminQueries,
  refreshMyProjectsQueries,
} from "@/lib/api-client";
import { loadOrRedirectIfAuthErr } from "@/lib/utils";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useLoaderData } from "react-router-dom";
import {
  ErrorInfo,
  User,
  UserRequestStatus,
  UserRole,
  type AppState,
  type UserRequest,
} from "../../../types";
import { AdminRequestsTable } from "./components/requests-table";
import { RequestsSidebar } from "./components/requests-sidebar";
import { Row, RowSelectionState } from "@tanstack/react-table";

export function AdminRequests() {
  const queryClient = useQueryClient();
  const { currentUser } = useLoaderData() as AdminRequestsData;
  const { data: requests = [] } = useQuery(
    allUserRequestsQuery({
      status: UserRequestStatus.PENDING,
      currentUser,
    })
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedRequestIdx = useMemo(() => {
    const selectedEntries = Object.entries(rowSelection).filter(
      ([_k, v]) => v === true
    );
    if (selectedEntries.length > 0) {
      return parseInt(selectedEntries[0][0]);
    }
    return -1;
  }, [rowSelection]);

  const handleRowClick = useCallback(
    (row: Row<UserRequest>) => {
      if (!row.getIsSelected()) {
        row.toggleSelected();
        setRowSelection({ [row.id]: true });
      }
    },
    [setRowSelection]
  );

  const handleRequestReaction = useCallback(async () => {
    await refreshAllAdminQueries(queryClient);
    await refreshMyProjectsQueries(queryClient);
    // clear selected rows
    setRowSelection({});
  }, [queryClient, setRowSelection]);

  return (
    <main className="grid flex-1 items-start gap-4 grid-cols-1 p-4 sm:px-6 sm:py-0 md:gap-8 xl:grid-cols-4">
      <Card className="col-span-1 mt-14 xl:col-span-3">
        <CardHeader>
          <CardDescription>Pending User requests</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminRequestsTable
            data={requests}
            onRowSelectionChange={setRowSelection}
            rowSelection={rowSelection}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      <RequestsSidebar
        request={requests[selectedRequestIdx]}
        className="order-first xl:order-none mt-14 col-span-1"
        onApproval={handleRequestReaction}
        onRejection={handleRequestReaction}
      />
    </main>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function loader(_appState: AppState, queryClient: QueryClient) {
  return loadOrRedirectIfAuthErr(async (): Promise<AdminRequestsData> => {
    const cachedCurrentUser = queryClient.getQueryData(
      currentUserQuery.queryKey
    );
    const currentUser =
      cachedCurrentUser ?? (await queryClient.fetchQuery(currentUserQuery));

    if (!currentUser.roles.includes(UserRole.ADMIN)) {
      const error = new Error("user should be an admin") as ErrorInfo;
      error.status = 403;
      throw error;
    }

    return { currentUser };
  });
}

interface AdminRequestsData {
  currentUser: User;
}
