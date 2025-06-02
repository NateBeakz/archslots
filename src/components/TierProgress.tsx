
import { calculateTier } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface TierProgressProps {
  wager: number;
}

export const TierProgress = ({ wager }: TierProgressProps) => {
  const tierInfo = calculateTier(wager);
  const remaining = tierInfo.next ? tierInfo.next.minWager - wager : 0;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 mt-1">
        <Badge 
          style={{ backgroundColor: `${tierInfo.current.color}20`, borderColor: tierInfo.current.color }}
          className="text-xs px-2 py-0.5"
        >
          {tierInfo.current.name}
        </Badge>
        
        {tierInfo.next && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-1 max-w-20">
                <Progress 
                  value={tierInfo.progress} 
                  className="h-2 bg-[#1e2235]"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                ${remaining.toLocaleString()} to reach {tierInfo.next.name}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
