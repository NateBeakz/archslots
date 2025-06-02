import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { mockArchives } from "@/lib/mocks/mockData";

export const PastWinnersAccordion = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
      className="py-16 md:py-24 px-4"
    >
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
          <span className="gradient-text">Past Winners Archive</span>
        </h2>
        
        <Accordion type="single" collapsible className="space-y-3">
          {mockArchives.map((archive, index) => (
            <AccordionItem 
              key={index} 
              value={`week-${index}`}
              className="glass rounded-lg border border-white/10"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex justify-between items-center w-full">
                  <span className="text-lg font-semibold">{archive.week}</span>
                  <span className="text-sm text-gray-400">{archive.winners.length} winners</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3">
                  {archive.winners.map((winner) => (
                    <div key={winner.rank} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-arch-green font-mono">#{winner.rank}</span>
                        <span className="font-semibold">{winner.username}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-arch-green font-bold">{winner.prize}</div>
                        <div className="text-xs text-gray-400">${winner.wager.toLocaleString()} wagered</div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {/* TODO: Replace with real archived_leaderboards data */}
        <p className="text-center text-gray-400 text-sm mt-6">
          TODO: Connect to archived_leaderboards table in Supabase
        </p>
      </div>
    </motion.section>
  );
};
