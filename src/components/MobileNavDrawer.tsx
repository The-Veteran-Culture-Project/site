import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LinkInfo } from "@/types";

interface Props {
  links: LinkInfo[];
}

export const MobileNavDrawer = ({ links }: Props) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="md:hidden bg-transparent border-gray-600 text-white hover:bg-gray-800 hover:text-[#CBB87C]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-gray-900 border-gray-600" aria-describedby="drawer-description">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-white">Navigation</DrawerTitle>
            <DrawerDescription id="drawer-description" className="text-gray-300">
              Navigate to different sections of the site
            </DrawerDescription>
          </DrawerHeader>
          <nav className="flex flex-col space-y-4 p-4">
            {links.map((link, idx) => (
              <DrawerClose asChild key={idx}>
                <a href={link.path} className="text-lg text-white hover:text-[#CBB87C] hover:underline">
                  {link.name}
                </a>
              </DrawerClose>
            ))}
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
