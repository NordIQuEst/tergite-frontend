import { useContext, useMemo } from "react";
import { IconButton } from "./button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppStateContext } from "@/lib/app-state";

export function DarkToggleBtn({ className = "" }: Props) {
  const { isDark, toggleIsDark } = useContext(AppStateContext);
  const iconCls = useMemo(() => (isDark ? Sun : Moon), [isDark]);

  return (
    <IconButton
      Icon={iconCls}
      onClick={toggleIsDark}
      variant="outline"
      className={cn("rounded-full overflow-hidden focus:mr-[1px]", className)}
    />
  );
}

interface Props {
  className?: string;
}
