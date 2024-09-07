import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/ModeToggle";
import { LinkInfo } from "@/types";

interface Props {
  links: LinkInfo[];
}

export const Nav = ({ links }: Props) => {
  return (
    <div className="flex text-center">
      <NavigationMenu>
        <NavigationMenuList>
          {links.map((link, idx) => {
            return (
              <NavigationMenuItem className="flex p-0 m-0" key={idx}>
                <a className={navigationMenuTriggerStyle()} href={link.path}>
                  {link.name}
                </a>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <ModeToggle />
    </div>
  );
};
