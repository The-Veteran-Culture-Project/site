import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Props = {
  name: string;
  title: string;
  bio: string;
  avatar: string;
};

export const TeamMemberCard = ({ name, title, bio, avatar }: Props) => {
  console.log(avatar);
  return (
    <Card className="w-full max-w-md flex flex-grow flex-col m-6 drop-shadow-md">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-24 w-24">
          <AvatarImage alt={name} src={avatar} />
          <AvatarFallback>
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
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
};
