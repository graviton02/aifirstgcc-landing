import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Send, CheckCircle2, Mail, Users, TrendingUp, Shield } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitEarlyAccess } from '@/lib/supabase'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  organization: z.string().min(1, 'Organization is required'),
  role: z.string().min(1, 'Role is required'),
})

type FormData = z.infer<typeof formSchema>

// Simulated waitlist count (replace with real data from Supabase)
const BASE_WAITLIST_COUNT = 847

export function InterestCapture() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(BASE_WAITLIST_COUNT)

  // Simulate growing waitlist (in production, fetch from Supabase)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setWaitlistCount(prev => prev + 1)
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await submitEarlyAccess(data)
      setIsSubmitted(true)
      setWaitlistCount(prev => prev + 1)
      reset()
      toast.success('Welcome to the AI-First GCC movement!', {
        description: "We'll notify you when the platform launches.",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="signup" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-enterprise-50 via-purple-50/30 to-blue-50/30 pointer-events-none" />

      {/* Decorative mesh pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='none' stroke='%236366f1' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-gradient-radial from-purple-200/50 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-gradient-radial from-blue-200/50 to-transparent blur-3xl pointer-events-none" />

      <Toaster position="top-center" richColors />

      <Container size="narrow" className="relative">
        <AnimatedSection className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-glow"
          >
            <Mail className="w-7 h-7" />
          </motion.div>

          <h2 className="font-display text-display-sm sm:text-display-md text-enterprise-900 mb-4">
            Be Part of the
            <br />
            <span className="text-gradient">AI-First GCC Movement</span>
          </h2>
          <p className="text-enterprise-600 text-lg max-w-md mx-auto">
            Join the early access list and be first to know when we launch.
          </p>
        </AnimatedSection>

        {/* Live waitlist counter */}
        <AnimatedSection delay={0.15} className="mb-8">
          <motion.div
            className="flex items-center justify-center gap-6 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-enterprise-200 shadow-sm">
              <div className="relative">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <span className="text-sm font-semibold text-enterprise-900">
                <motion.span
                  key={waitlistCount}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block"
                >
                  {waitlistCount.toLocaleString()}
                </motion.span>
                + on waitlist
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Growing daily</span>
            </div>
          </motion.div>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto p-8 rounded-2xl bg-white shadow-card text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-emerald-100 text-emerald-600"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold text-enterprise-900 mb-2">
                  You're #{waitlistCount} on the list!
                </h3>
                <p className="text-enterprise-600 mb-6">
                  We'll send you exclusive updates and early access information.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setIsSubmitted(false)}
                  className="text-sm"
                >
                  Add another email
                </Button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-md mx-auto"
              >
                {/* Form card with gradient border */}
                <div className="gradient-border p-8 bg-white rounded-2xl shadow-card">
                  <div className="space-y-5">
                    {/* Email field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-enterprise-800">
                        Email address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        {...register('email')}
                        className={errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500"
                        >
                          {errors.email.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Organization field */}
                    <div className="space-y-2">
                      <Label htmlFor="organization" className="text-enterprise-800">
                        Your organization <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="organization"
                        type="text"
                        placeholder="Acme Inc."
                        {...register('organization')}
                        className={errors.organization ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                      />
                      {errors.organization && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500"
                        >
                          {errors.organization.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Role field */}
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-enterprise-800">
                        Your role <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="role"
                        type="text"
                        placeholder="GCC Leader, VP Technology..."
                        {...register('role')}
                        className={errors.role ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
                      />
                      {errors.role && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500"
                        >
                          {errors.role.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Submit button */}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isLoading}
                      className="w-full mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          Count Me In
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Trust indicators */}
                  <div className="mt-6 pt-5 border-t border-enterprise-100">
                    <div className="flex items-center justify-center gap-4 text-xs text-enterprise-500">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        No spam ever
                      </span>
                      <span className="w-1 h-1 rounded-full bg-enterprise-300" />
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Unsubscribe anytime
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent signups ticker */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-center"
                >
                  <RecentSignups />
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </AnimatedSection>
      </Container>
    </section>
  )
}

// Recent signups component for social proof
function RecentSignups() {
  const recentSignups = [
    { name: 'VP of Technology', company: 'Fortune 500 Bank', time: '2 min ago' },
    { name: 'GCC Director', company: 'Global Auto OEM', time: '5 min ago' },
    { name: 'Head of AI', company: 'Tech Giant', time: '12 min ago' },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % recentSignups.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-6 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-enterprise-500"
        >
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          <span className="font-medium text-enterprise-700">{recentSignups[currentIndex].name}</span>
          {' from '}
          <span className="text-enterprise-600">{recentSignups[currentIndex].company}</span>
          {' joined '}
          <span className="text-enterprise-400">{recentSignups[currentIndex].time}</span>
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
