
import { useState, useEffect } from "react";

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentDay = now.getUTCDay();
      const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
      
      const nextMonday = new Date(now);
      nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
      nextMonday.setUTCHours(0, 0, 0, 0);
      
      const difference = nextMonday.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Week has ended, trigger reset logic here
        console.log("Week ended! Triggering reset...");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1 font-mono text-arch-green">
      <div className="bg-arch-green/10 px-2 py-1 rounded border border-arch-green/20">
        {String(timeLeft.days).padStart(2, '0')}d
      </div>
      <span>:</span>
      <div className="bg-arch-green/10 px-2 py-1 rounded border border-arch-green/20">
        {String(timeLeft.hours).padStart(2, '0')}h
      </div>
      <span>:</span>
      <div className="bg-arch-green/10 px-2 py-1 rounded border border-arch-green/20">
        {String(timeLeft.minutes).padStart(2, '0')}m
      </div>
      <span>:</span>
      <div className="bg-arch-green/10 px-2 py-1 rounded border border-arch-green/20">
        {String(timeLeft.seconds).padStart(2, '0')}s
      </div>
    </div>
  );
};
