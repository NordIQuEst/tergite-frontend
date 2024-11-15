import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { DetailItem } from "@/components/ui/detail-item";
import { HealthStatus } from "@/components/ui/health-status";
import { deleteMyToken } from "@/lib/api-client";
import { cn, toRelative } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ExtendedAppToken } from "types";
import { TokenDeleteDialog } from "./delete-dialog";
import { TokenLifespanDialog } from "./lifespan-dialog";
import { SidebarPlaceholder } from "@/components/ui/sidebar-placeholder";

export function TokensSidebar(props: SidebarProps) {
  return props.token ? (
    <TokenSummary {...(props as TokenSummaryProps)} />
  ) : (
    <SidebarPlaceholder
      mainTitle="Token title"
      contentTitle="Token details"
      contentDetail="Click any row to show details here"
      className={props.className}
    />
  );
}

function TokenSummary({ token, className = "", onDelete }: TokenSummaryProps) {
  const tokenDeletion = useMutation({
    mutationFn: deleteMyToken,
    onSuccess: async () => {
      await onDelete(token.id);
    },
    throwOnError: true,
  });

  return (
    <Card id="token-summary" className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-start bg-muted/50 justify-between">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            {token.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold">Details</div>
          <ul className="grid gap-3">
            <DetailItem label="Project">{token.project_name}</DetailItem>

            <DetailItem label="Status">
              <HealthStatus isHealthy={!token.is_expired} />
            </DetailItem>

            <DetailItem label="Expires">
              {toRelative(token.expires_at)}
            </DetailItem>

            <DetailItem label="Project external ID">
              {token.project_ext_id}
            </DetailItem>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 border-t bg-muted/50 px-6 py-3">
        <TokenLifespanDialog token={token} isDisabled={token.is_expired} />
        <TokenDeleteDialog
          token={token}
          onDelete={() => tokenDeletion.mutate(token.id)}
          isDisabled={tokenDeletion.isPending}
        />
      </CardFooter>
    </Card>
  );
}

interface SidebarProps {
  token?: ExtendedAppToken;
  className?: string;
  onDelete: (id: string) => Promise<void>;
}

interface TokenSummaryProps extends SidebarProps {
  token: ExtendedAppToken;
}
