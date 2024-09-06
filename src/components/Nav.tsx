import "@/styles/global.css";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
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
    <div className="flex">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem className="flex">
            {links.map((link) => {
              return (
                <NavigationMenuLink className="flex p-4 align-middle">
                  <a
                    className="mr-4 sm:ml-4 text-slate-50 hover:text-purple-400"
                    href={`${link.path}`}
                  >
                    {link.name}
                  </a>
                </NavigationMenuLink>
              );
            })}
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
    // <div className="flex flex-auto text-slate-200 justify-start sm:justify-end m-4 font-bold">
    //   {links.map((link) => {
    //     return (
    //       <a
    //         className="mr-4 sm:ml-4 hover:text-purple-400"
    //         href={`${link.path}`}
    //       >
    //         {link.name}
    //       </a>
    //     );
    //   })}
    // </div>
  );
};
