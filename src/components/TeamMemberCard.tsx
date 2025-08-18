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
      className="w-full bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/80 transition-colors"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardHeader className="flex flex-col items-center text-center space-y-4">
        <div
          className="relative h-40 w-40 md:h-48 md:w-48 rounded-full overflow-hidden"
          role="img"
          aria-label={`Avatar of ${name}`}
        >
          <Avatar
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out h-40 w-40 md:h-48 md:w-48 ${
              isHovering && avatar2 ? "opacity-0" : "opacity-100"
            }`}
          >
            <AvatarImage 
              alt={`${name}'s primary avatar`} 
              src={avatar}
              className="object-cover w-full h-full"
            />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {avatar2 && (
            <Avatar
              className={`absolute inset-0 transition-opacity duration-300 ease-in-out h-40 w-40 md:h-48 md:w-48 ${
                !isHovering ? "opacity-0" : "opacity-100"
              }`}
            >
              <AvatarImage 
                alt={`${name}'s secondary avatar`} 
                src={avatar2}
                className="object-cover w-full h-full"
              />
              <AvatarFallback>
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="flex flex-col space-y-1 pt-2">
          <h3 className="text-xl font-semibold text-zinc-100">{name}</h3>
          <p className="text-primary font-medium">{title}</p>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <p className="text-zinc-300 leading-relaxed text-center">{bio}</p>
      </CardContent>
    </Card>
  );
}
