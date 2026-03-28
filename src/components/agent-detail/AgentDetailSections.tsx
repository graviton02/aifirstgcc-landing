"use client";

import { motion, type Variants } from "framer-motion";
import {
  Lightning,
  Plugs,
  Target,
  CaretRight,
} from "@phosphor-icons/react";
import type { Agent } from "@/lib/types";
import { IntegrationIcon } from "./IntegrationIcon";

interface Props {
  agent: Agent;
}

const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function AgentDetailSections({ agent }: Props) {
  const integrations = agent.integrations ?? [];
  const expectedOutcomes = agent.expected_outcomes ?? [];

  return (
    <div className="space-y-14">
      {/* Use Cases */}
      {agent.use_cases.length > 0 && (
        <div>
          <SectionHeader
            icon={<Lightning weight="duotone" className="w-4.5 h-4.5 text-enterprise-400" />}
            label="Use cases"
          />
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {agent.use_cases.map((uc, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-start gap-3 p-5 rounded-xl bg-enterprise-50/50 border border-enterprise-100/80"
              >
                <CaretRight
                  weight="bold"
                  className="w-4.5 h-4.5 text-primary mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-base font-medium text-enterprise-800 leading-relaxed">
                    {uc.title}
                  </p>
                  {uc.description && (
                    <p className="text-sm text-enterprise-500 mt-1">
                      {uc.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Integrations */}
      {integrations.length > 0 && (
        <div>
          <SectionHeader
            icon={<Plugs weight="duotone" className="w-4.5 h-4.5 text-enterprise-400" />}
            label="Integrations"
          />
          <motion.div
            className="flex flex-wrap gap-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {integrations.map((integration) => (
              <motion.div key={integration} variants={fadeUp}>
                <IntegrationIcon name={integration} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Expected Outcomes */}
      {expectedOutcomes.length > 0 && (
        <div>
          <SectionHeader
            icon={<Target weight="duotone" className="w-4.5 h-4.5 text-enterprise-400" />}
            label="Expected outcomes"
          />
          <motion.div
            className="space-y-0"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {expectedOutcomes.map((outcome, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-start gap-3 py-4 border-b border-enterprise-100/60 last:border-0"
              >
                <Target
                  weight="duotone"
                  className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0"
                />
                <p className="text-base text-enterprise-700 leading-relaxed">
                  {outcome}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      {icon}
      <span className="text-sm font-semibold text-enterprise-400 uppercase tracking-widest">
        {label}
      </span>
      <div className="h-px flex-1 bg-enterprise-200/60" />
    </div>
  );
}
