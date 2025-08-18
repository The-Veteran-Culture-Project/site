import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
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
                <a className={`${navigationMenuTriggerStyle()} text-white hover:text-[#CBB87C] hover:bg-gray-800 bg-transparent border-none`} href={link.path}>
                  {link.name}
                </a>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};
