
export const TIERS = [
  { name: "Bronze", minWager: 0, color: "#cd7f32" },
  { name: "Silver", minWager: 5000, color: "#c0c0c0" },
  { name: "Gold", minWager: 15000, color: "#ffd700" },
  { name: "Platinum", minWager: 50000, color: "#e5e4e2" },
  { name: "Diamond", minWager: 100000, color: "#b9f2ff" },
];

export const calculateTier = (wager: number) => {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (wager >= TIERS[i].minWager) {
      return {
        current: TIERS[i],
        next: TIERS[i + 1] || null,
        progress: TIERS[i + 1] ? ((wager - TIERS[i].minWager) / (TIERS[i + 1].minWager - TIERS[i].minWager)) * 100 : 100
      };
    }
  }
  return { current: TIERS[0], next: TIERS[1], progress: (wager / TIERS[1].minWager) * 100 };
};
