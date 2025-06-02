import { motion } from "framer-motion";
import { Github, Twitter, Shield, Mail } from "lucide-react";
import { useState } from "react";
import { subscribeEmail } from "@/lib/mocks/mockData";
import { toast } from "sonner";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    try {
      await subscribeEmail(email);
      toast.success("Successfully subscribed to weekly updates!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const footerLinks = [
    {
      title: "Socials",
      links: [
        { name: "Twitch", url: "https://twitch.tv/archslots", external: true },
        { name: "Twitter", url: "https://twitter.com/archslots", external: true, icon: <Twitter className="w-4 h-4" /> },
      ]
    },
    {
      title: "Community",
      links: [
        { name: "Discord", url: "https://discord.gg/archslots", external: true },
      ]
    },
    {
      title: "Sign Up",
      links: [
        { name: "Join Shuffle", url: "https://shuffle.com/r/ARCH", external: true },
      ]
    },
    {
      title: "Tools",
      links: [
        { name: "Deposit Limits", url: "#", modal: true },
        { name: "Reality Check", url: "#", modal: true },
        { name: "Self-Exclusion", url: "#", modal: true },
        { name: "GambleAware", url: "https://www.begambleaware.org/", external: true },
        { name: "GamStop", url: "https://www.gamstop.co.uk/", external: true },
      ]
    }
  ];

  const legalLinks = [
    { name: "18+ Only", url: "#" },
    { name: "Play Responsibly", url: "#" },
    { name: "GambleAware", url: "https://www.begambleaware.org/" },
    { name: "GamStop", url: "https://www.gamstop.co.uk/" },
    { name: "Terms", url: "#" },
    { name: "Privacy", url: "#" },
    { name: "Contact", url: "#" },
  ];

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

  return (
    <motion.footer
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="bg-[#0d1220] border-t border-white/10 pt-24 pb-20 min-h-[45vh]"
    >
      <div className="container mx-auto px-4">
        {/* Newsletter Signup */}
        <motion.div
          variants={itemVariants}
          className="max-w-md mx-auto mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-arch-green" />
            <h3 className="text-lg font-semibold">Stay Updated</h3>
          </div>
          <form onSubmit={handleEmailSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-arch-green"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="px-6 py-2 bg-arch-green text-arch-black font-semibold rounded-lg hover:bg-arch-green/80 transition-colors disabled:opacity-50"
            >
              {isSubscribing ? "..." : "Subscribe"}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2">
            Get weekly leaderboard results & exclusive bonuses
          </p>
        </motion.div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#8f71ff' }}>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.url}
                      {...(link.external ? {
                        target: "_blank",
                        rel: "noopener noreferrer"
                      } : {})}
                      className="text-gray-400 hover:text-arch-green transition-colors flex items-center gap-2"
                      onClick={link.modal ? (e) => {
                        e.preventDefault();
                        toast.info(`TODO: Open ${link.name} modal form`);
                      } : undefined}
                    >
                      {link.icon}
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Center Section with GambleAware and Disclaimer */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          {/* GambleAware Logo */}
          <div className="w-24 h-12 mx-auto mb-4 bg-white/10 rounded flex items-center justify-center">
            <Shield className="w-6 h-6 text-gray-400" />
          </div>
          
          <p className="text-sm text-gray-500 max-w-4xl mx-auto leading-relaxed">
            We do not take responsibility for any losses from gambling in casinos and betting sites 
            which are linked or promoted on our website(s). As a player, you are responsible for your bets.
          </p>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="border-t border-white/10 pt-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © 2025 archslots – All Rights Reserved
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 text-xs uppercase text-gray-600">
              {legalLinks.map((link, index) => (
                <span key={link.name} className="flex items-center">
                  <a
                    href={link.url}
                    {...(link.url.startsWith('http') ? {
                      target: "_blank",
                      rel: "noopener noreferrer"
                    } : {})}
                    className="hover:text-arch-green transition-colors"
                  >
                    {link.name}
                  </a>
                  {index < legalLinks.length - 1 && (
                    <span className="mx-2 text-gray-700">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Developer Attribution */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-6 pt-4 border-t border-white/5"
        >
          <a
            href="https://github.com/archslots"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-arch-green transition-colors flex items-center justify-center gap-2"
          >
            <Github className="w-4 h-4" />
            <span className="text-sm">Developed by ArchSlots</span>
          </a>
        </motion.div>
      </div>
    </motion.footer>
  );
};
