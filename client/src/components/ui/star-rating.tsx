
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export const StarRating = ({ value, onChange, readonly = false, size = "md" }: StarRatingProps) => {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <Star
          key={star}
          className={cn(
            "cursor-pointer transition-colors",
            star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
            readonly ? "cursor-default" : "hover:text-yellow-400",
            size === "sm" ? "h-4 w-4" : "h-6 w-6"
          )}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  );
};
