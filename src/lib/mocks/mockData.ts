
// Mock data for features - TODO: Replace with real API calls

export const mockWins = [
  { id: 1, username: "CryptoKing", game: "Blackjack", amount: "1,250.00", timestamp: new Date() },
  { id: 2, username: "SlotMaster", game: "Roulette", amount: "890.50", timestamp: new Date() },
  { id: 3, username: "LuckyPlayer", game: "Slots", amount: "2,100.75", timestamp: new Date() },
  { id: 4, username: "HighRoller", game: "Poker", amount: "750.25", timestamp: new Date() },
  { id: 5, username: "BetBeast", game: "Baccarat", amount: "1,500.00", timestamp: new Date() },
  { id: 6, username: "SpinWinner", game: "Slots", amount: "3,200.80", timestamp: new Date() },
  { id: 7, username: "CardShark", game: "Blackjack", amount: "680.40", timestamp: new Date() },
  { id: 8, username: "ReelDealer", game: "Slots", amount: "1,950.60", timestamp: new Date() },
];

export const mockClips = [
  { id: 1, title: "Epic Win Streak", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: "/placeholder.svg" },
  { id: 2, title: "Jackpot Moment", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: "/placeholder.svg" },
  { id: 3, title: "Crazy Bonus Round", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: "/placeholder.svg" },
];

export const mockArchives = [
  {
    week: "Dec 23-29, 2024",
    winners: [
      { rank: 1, username: "TopPlayer", wager: 15420.80, prize: "$5,000" },
      { rank: 2, username: "SecondPlace", wager: 12890.45, prize: "$3,000" },
      { rank: 3, username: "ThirdPlace", wager: 9876.20, prize: "$1,500" },
    ]
  },
  {
    week: "Dec 16-22, 2024",
    winners: [
      { rank: 1, username: "WeeklyChamp", wager: 14250.60, prize: "$5,000" },
      { rank: 2, username: "RunnerUp", wager: 11340.30, prize: "$3,000" },
      { rank: 3, username: "BronzeMedal", wager: 8950.75, prize: "$1,500" },
    ]
  },
];

// TODO: Replace with Supabase function
export const fetchBoard = async (timeframe: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data based on timeframe
  const baseData = [
    { username: "CryptoKing", campaignCode: "ARCH", deposit: 2840.50, lifetimeWagered: 15420.80 },
    { username: "SlotMaster99", campaignCode: "ARCH", deposit: 2134.75, lifetimeWagered: 12890.45 },
    { username: "LuckyGambler", campaignCode: "ARCH", deposit: 1892.30, lifetimeWagered: 9876.20 },
  ];
  
  return baseData.map((player, index) => ({
    ...player,
    rank: index + 1,
    thisWeekWager: timeframe === 'daily' ? player.deposit * 0.3 : 
                   timeframe === 'monthly' ? player.deposit * 3 : player.deposit
  }));
};

// TODO: Replace with real Supabase call
export const subscribeEmail = async (email: string) => {
  console.log('TODO: Subscribe email to newsletter:', email);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};
