import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

type LinkInfo = {
  name: string;
  path: string;
};

const links: LinkInfo[] = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];
export const Nav = () => {
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
    </div>
  );
};
