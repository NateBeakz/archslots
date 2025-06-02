
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { fetchBoard } from "@/lib/mocks/mockData";
import { LeaderboardTable } from "./LeaderboardTable";

export const LeaderboardTabs = () => {
  const [activeTab, setActiveTab] = useState("weekly");

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', activeTab],
    queryFn: () => fetchBoard(activeTab),
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-[#1a1a2e]/50 border border-white/10">
        <TabsTrigger value="daily" className="data-[state=active]:bg-arch-green data-[state=active]:text-arch-black">
          Daily
        </TabsTrigger>
        <TabsTrigger value="weekly" className="data-[state=active]:bg-arch-green data-[state=active]:text-arch-black">
          Weekly
        </TabsTrigger>
        <TabsTrigger value="monthly" className="data-[state=active]:bg-arch-green data-[state=active]:text-arch-black">
          Monthly
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="mt-6">
        <LeaderboardTable 
          data={leaderboardData || []}
          isLoading={isLoading}
        />
      </TabsContent>
    </Tabs>
  );
};
