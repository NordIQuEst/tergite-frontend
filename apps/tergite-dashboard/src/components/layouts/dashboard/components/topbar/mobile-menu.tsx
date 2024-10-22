import { Logo } from "@/components/ui/logo";
import { NavItem } from "@/components/ui/nav-item";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  PanelLeft,
  HomeIcon,
  Cpu,
  HardHat,
  HelpingHand,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export function MobileMenu({ pendingRequestsCount, isUserAdmin }: Props) {
  const [isAdminOpen, setIsAdminOpen] = useState(true);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        data-testid="mobile-menu"
        side="left"
        className="sm:max-w-xs"
      >
        <SheetTitle>
          <Logo />
        </SheetTitle>

        <nav className="grid gap-6 text-lg font-medium">
          <NavItem to="/" Icon={HomeIcon} text="Dashboard" isBig={true} />
          <NavItem to="/devices" Icon={Cpu} text="Devices" isBig={true} />
          {isUserAdmin && (
            <Collapsible
              open={isAdminOpen}
              onOpenChange={setIsAdminOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex text-lg font-medium gap-4 h-9 px-2 justify-start rounded-sm transition-colors text-muted-foreground active:text-accent-foreground hover:text-foreground w-full`}
                >
                  <Settings2 className="h-5 w-5 font-medium" />
                  Admin
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col gap-6 my-6 ml-4 -mr-4">
                <NavItem
                  Icon={HelpingHand}
                  to="/admin-requests"
                  isBig={true}
                  text="Requests"
                >
                  {!!pendingRequestsCount && (
                    <Badge variant="default">{pendingRequestsCount}</Badge>
                  )}
                </NavItem>
                <NavItem
                  Icon={HardHat}
                  to="/admin-projects"
                  isBig={true}
                  text="Projects"
                />
              </CollapsibleContent>
            </Collapsible>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

interface Props {
  pendingRequestsCount: number;
  isUserAdmin: boolean;
}
