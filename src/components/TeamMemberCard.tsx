import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Props {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  avatar2?: string;
}

export function TeamMemberCard({ name, title, bio, avatar, avatar2 }: Props) {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <Card
      className="w-full max-w-md flex grow flex-col drop-shadow-md transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-muted"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <div
          className="relative h-24 w-24 md:h-32 md:w-32"
          role="img"
          aria-label={`Avatar of ${name}`}
        >
          <Avatar
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out h-24 w-24 md:h-32 md:w-32 ${
              isHovering ? "opacity-0" : "opacity-100"
            }`}
          >
            <AvatarImage alt={`${name}'s primary avatar`} src={avatar} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <Avatar
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out h-24 w-24 md:h-32 md:w-32 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          >
            <AvatarImage alt={`${name}'s secondary avatar`} src={avatar2} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">{name}</h2>
          <p className="text-md text-muted-foreground font-semibold">{title}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground font-display">{bio}</p>
      </CardContent>
    </Card>
  );
}
