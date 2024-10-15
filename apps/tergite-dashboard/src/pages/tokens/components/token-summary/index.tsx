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
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ExtendedAppToken } from "types";
import { TokenDeleteDialog } from "./delete-dialog";

export function TokenSummary({ token, className = "", onDelete }: Props) {
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
              {token.expires_at.toRelative()}{" "}
              {/* TODO: add a button to allow extension of this token */}
            </DetailItem>

            <DetailItem label="Project external ID">
              {token.project_ext_id}
            </DetailItem>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
        <TokenDeleteDialog
          token={token}
          onDelete={() => tokenDeletion.mutate(token.id)}
          isDisabled={tokenDeletion.isPending}
        />
      </CardFooter>
    </Card>
  );
}

interface Props {
  token: ExtendedAppToken;
  className?: string;
  onDelete: (id: string) => Promise<void>;
}
