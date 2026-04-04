"use client";

import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { BriefCard } from "@/components/ai-pulse/BriefCard";
import { dailyBriefs } from "@/data/aiPulseBriefs";

const currentDate = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function AIPulseListingClient() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Header */}
      <header className="relative h-[50vh] min-h-[400px] bg-enterprise-950 overflow-hidden flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8"
          />

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-newspaper text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-4"
          >
            AI Pulse
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-newspaper text-xl md:text-2xl lg:text-3xl text-white/70 italic mb-8 max-w-3xl mx-auto"
          >
            Today in Agentic AI &amp; Enterprise Automation
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-white/60"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{currentDate}</span>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Daily Digest</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mt-8"
          />
        </Container>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <div className="h-8 bg-gradient-to-b from-enterprise-950 to-transparent" />
        </div>
      </header>

      {/* Brief cards grid */}
      <section className="py-16 md:py-24">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-newspaper text-3xl md:text-4xl font-bold text-enterprise-900 mb-4">
              Daily Briefs
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {dailyBriefs.map((brief, index) => (
              <BriefCard key={brief.slug} brief={brief} index={index} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
