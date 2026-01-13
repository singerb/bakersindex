import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Server } from "lucide-react";

const getColor = (tag: string) => {
  switch (tag) {
    case "Staging":
      return "bg-violet-700";
    case "Local":
      return "bg-green-700";
    default:
      return "bg-red-700";
      }
};

export function EnvTag() {
  const tag = import.meta.env.VITE_ENV_TAG;

  if (!tag) {
    return;
  }

  return (
    <Badge className={cn("fixed top-8 right-8 z-1000", getColor(tag))}><Server /> {tag}</Badge>
  );
}
