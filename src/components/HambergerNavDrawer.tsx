import { useEffect, useState } from "react";
import { Menu, Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { LinkInfo } from "@/types";

type Props = {
  links: LinkInfo[];
};
export const HamburgerNavDrawer = ({ links }: Props) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
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
            <div className="flex items-center space-x-2">
              <Sun className="h-4  w-4" />
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
              />
              <Moon className="h-4 w-4" />
              <span className="sr-only">Toggle dark mode</span>
            </div>
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
