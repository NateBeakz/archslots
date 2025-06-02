import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const SignupCTA = () => {
  const variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.8, 0.25, 1],
        staggerChildren: 0.12
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleSignupClick = () => {
    window.open("https://shuffle.com/r/ARCH", "_blank");
  };

  return (
    <motion.section
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className="px-4"
    >
      <div className="container mx-auto">
        <motion.div
          variants={itemVariants}
          className="max-w-5xl mx-auto bg-gradient-to-br from-[#3b2d6f]/60 to-[#452c58]/60 backdrop-blur-sm rounded-xl border border-white/10 p-6 md:p-12 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(59, 45, 111, 0.6), rgba(69, 44, 88, 0.6))",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}
        >
          <motion.h2 
            variants={itemVariants}
            className="text-2xl md:text-4xl font-bold text-center mb-3 md:mb-4"
            style={{ color: '#c2b9ff' }}
          >
            Join Shuffle in 60 Seconds
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-center text-gray-300 mb-6 md:mb-8 text-sm md:text-base"
          >
            Sign up now with my affiliate code to be instantly entered into weekly giveaways.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8"
          >
            <div className="text-center p-4">
              <div className="bg-arch-green/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-arch-green font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Visit Shuffle.com</h3>
              <p className="text-sm text-gray-400">Navigate to shuffle.com & begin your signup.</p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-arch-purple/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-arch-purple font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Use my code</h3>
              <p className="text-sm text-gray-400">Use code <span className="text-arch-green font-mono">ARCH</span> in the sign-up phase.</p>
            </div>
            
            <div className="text-center p-4">
              <div className="bg-yellow-400/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-400 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Start Playing</h3>
              <p className="text-sm text-gray-400">Deposit, start playing & you have a chance of winning prizes!</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="text-center"
          >
            <div className="text-gray-400 mb-4">Or click here</div>
            <motion.button
              onClick={handleSignupClick}
              className="bg-gradient-to-r from-[#7b55ff] to-[#ff4381] px-8 py-4 rounded-full text-white font-semibold flex items-center gap-2 mx-auto transition-all duration-300 hover:scale-105"
              style={{ transitionDelay: '75ms' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign up now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};
