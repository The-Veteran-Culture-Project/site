import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LinkInfo } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";

type Props = {
  links: LinkInfo[];
};

export const MobileNavDrawer = ({ links }: Props) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Navigation</DrawerTitle>
          </DrawerHeader>
          <nav className="flex flex-col space-y-4 p-4">
            {links.map((link, idx) => (
              <DrawerClose asChild key={idx}>
                <a href={link.path} className="text-lg hover:underline">
                  {link.name}
                </a>
              </DrawerClose>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
