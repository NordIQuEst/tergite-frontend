import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  allAdminProjectsQuery,
  currentUserQuery,
  refreshAllAdminQueries,
  refreshMyProjectsQueries,
} from "@/lib/api-client";
import { loadOrRedirectIfAuthErr } from "@/lib/utils";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  ErrorInfo,
  User,
  UserRole,
  type AppState,
  type AdminProject,
} from "../../../types";
import { AdminProjectsTable } from "./components/projects-table";
import { AdminProjectSummary } from "./components/project-summary";
import { Row, RowSelectionState } from "@tanstack/react-table";
import { useLoaderData } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreateProjectForm } from "./components/create-project-form";

export function AdminProjects() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const { currentUser } = useLoaderData() as AdminProjectsData;
  const { data: projects = [] } = useQuery(
    allAdminProjectsQuery({
      currentUser,
    })
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const selectedProjectIdx = useMemo(() => {
    const selectedEntries = Object.entries(rowSelection).filter(
      ([_k, v]) => v === true
    );
    if (selectedEntries.length > 0) {
      return parseInt(selectedEntries[0][0]);
    }
    return -1;
  }, [rowSelection]);

  const handleRowClick = useCallback(
    (row: Row<AdminProject>) => {
      if (!row.getIsSelected()) {
        row.toggleSelected();
        setRowSelection({ [row.id]: true });
      }
    },
    [setRowSelection]
  );

  const handleProjectDelete = useCallback(async () => {
    await refreshMyProjectsQueries(queryClient);
    await refreshAllAdminQueries(queryClient);
    // clear selected rows
    setRowSelection({});
  }, [queryClient, setRowSelection]);

  const handleProjectEdit = useCallback(async () => {
    await refreshMyProjectsQueries(queryClient);
    await refreshAllAdminQueries(queryClient);
  }, [queryClient]);

  const handleProjectCreate = useCallback(async () => {
    setIsCreating(false);
    const lastIndex = projects.length;
    await refreshMyProjectsQueries(queryClient);
    await refreshAllAdminQueries(queryClient);
    setRowSelection({ [`${lastIndex}`]: true });
  }, [queryClient, setIsCreating, setRowSelection, projects]);

  return (
    <main className="grid flex-1 items-start gap-4 grid-cols-1 p-4 sm:px-6 sm:py-0 md:gap-8 xl:grid-cols-5 2xl:grid-cols-4">
      <Card
        id="projects-table"
        className="col-span-1 mt-14  xl:pt-3 xl:col-span-3"
      >
        <CardHeader>
          <div className="flex justify-between">
            <CardDescription>Projects</CardDescription>
            <Button variant="default" onClick={() => setIsCreating(true)}>
              New
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <AdminProjectsTable
            data={projects}
            onRowSelectionChange={setRowSelection}
            rowSelection={rowSelection}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      {!isCreating && projects[selectedProjectIdx] && (
        <AdminProjectSummary
          project={projects[selectedProjectIdx]}
          className="order-first xl:order-none mt-14 col-span-1 xl:col-span-2 2xl:col-span-1"
          onDelete={handleProjectDelete}
          onEdit={handleProjectEdit}
        />
      )}

      {isCreating && (
        <CreateProjectForm
          className="order-first xl:order-none mt-14 col-span-1 xl:col-span-2 2xl:col-span-1"
          onCreate={handleProjectCreate}
          onCancel={() => setIsCreating(false)}
        />
      )}
    </main>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function loader(_appState: AppState, queryClient: QueryClient) {
  return loadOrRedirectIfAuthErr(async (): Promise<AdminProjectsData> => {
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

interface AdminProjectsData {
  currentUser: User;
}
