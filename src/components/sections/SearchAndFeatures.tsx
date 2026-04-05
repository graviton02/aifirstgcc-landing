"use client"

import { Search, GitCompareArrows, ListChecks, Zap } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { StaggerContainer, StaggerItem } from '@/components/shared/AnimatedSection'

const features = [
  { icon: Search, text: "500+ AI Agents, One Search" },
  { icon: GitCompareArrows, text: "Compare Before You Commit" },
  { icon: ListChecks, text: "Your Evaluation Pipeline" },
  { icon: Zap, text: "Skip the Sales Maze" },
]

export function SearchAndFeatures() {
  return (
    <section className="py-16 bg-gradient-to-b from-enterprise-50 to-white">
      <Container>
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.1}>
          {features.map((feature) => (
            <StaggerItem key={feature.text}>
              <div className="p-6 rounded-2xl bg-white border border-enterprise-100 shadow-sm text-center">
                <feature.icon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-enterprise-800">{feature.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </section>
  )
}
