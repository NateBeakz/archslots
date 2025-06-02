
import { useMobile } from "@/hooks/useMobile";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const MobileStickyCTA = () => {
  const isMobile = useMobile();

  const copyCodeAndOpen = async () => {
    try {
      await navigator.clipboard.writeText("ARCH");
      toast.success("Code ARCH copied to clipboard!");
      window.open("https://shuffle.com/r/ARCH", "_blank");
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  if (!isMobile) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-0 inset-x-0 bg-gradient-to-r from-[#7b55ff] to-[#ff4381] px-6 py-4 flex items-center justify-between shadow-xl z-50"
    >
      <span className="text-sm font-semibold tracking-wide text-white">Use code ARCH</span>
      <button 
        onClick={copyCodeAndOpen}
        className="bg-black/20 backdrop-blur px-4 py-2 rounded-full text-white text-sm font-medium hover:bg-black/30 transition-colors"
      >
        Copy & Sign Up →
      </button>
    </motion.div>
  );
};
