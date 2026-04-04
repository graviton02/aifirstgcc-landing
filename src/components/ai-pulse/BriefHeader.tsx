import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { Container } from '@/components/shared/Container'

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function BriefHeader({ date, headline }: { date: string; headline?: string }) {
  return (
    <header className="relative min-h-[30vh] bg-enterprise-950 overflow-hidden flex items-center justify-center pt-28 pb-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.1),transparent_50%)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <Container size="narrow" className="relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link
            href="/ai-pulse"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AI Pulse
          </Link>

          <div className="flex items-center gap-4 text-white/50 text-sm mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(date)}
            </span>
            <span className="w-px h-4 bg-white/20" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Daily Brief
            </span>
          </div>

          {headline && (
            <h1 className="font-newspaper text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {headline}
            </h1>
          )}
        </motion.div>
      </Container>

      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </div>
    </header>
  )
}
