"use client";

import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { useState } from "react";
import styles from "./BrandShowcase.module.css";

const brands = [
  {
    id: "openmesh",
    label: "Vendor marketplace",
    name: "OpenMesh360",
    tagline: null,
    statement: "Find the partners that can move your GCC forward.",
    description:
      "A curated marketplace for discovering, evaluating and connecting with GCC-ready vendors.",
    details: ["Curated provider network", "Capability-led discovery", "Faster partner evaluation"],
    logo: "/brand-showcase/openmesh360-mark.svg",
    logoAlt: "OpenMesh360 symbol",
    href: "https://openmesh360.com",
  },
  {
    id: "orbys",
    label: "Knowledge platform",
    name: "Orbys360",
    tagline: "AI Knowledge Base for GCCs",
    statement: "Make sense of what is next for global capability centers.",
    description:
      "Research, frameworks, playbooks and AI intelligence for leaders building the next generation of GCCs.",
    details: ["GCC research and signals", "AI agent intelligence", "Practical transformation playbooks"],
    logo: "/aifirstgcclogo.svg",
    logoAlt: "Orbys360 symbol",
    href: "/orbys360",
  },
  {
    id: "gccworx",
    label: "GCC copilot",
    name: "GCCWorx360",
    tagline: null,
    statement: "Turn fragmented operating data into confident decisions.",
    description:
      "An intelligent cockpit that helps GCC leaders understand performance, anticipate risks and decide what to do next.",
    details: ["Ask your GCC", "Decision-ready intelligence", "Recommendations across every function"],
    logo: "/brand-showcase/gccworx-logo.png",
    logoAlt: "GCCWorx360 symbol",
    href: null,
  },
] as const;

export function BrandShowcase() {
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  return (
    <main className={styles.page}>
      <section className={styles.panels} aria-label="Explore our platforms">
        {brands.map((brand) => {
          const isActive = activeBrand === brand.id;
          const isQuiet = activeBrand !== null && !isActive;

          return (
            <article
              key={brand.id}
              id={brand.id}
              className={`${styles.panel} ${styles[brand.id]} ${isActive ? styles.active : ""} ${isQuiet ? styles.quiet : ""}`}
              onMouseEnter={() => setActiveBrand(brand.id)}
              onMouseLeave={() => setActiveBrand(null)}
              onFocus={() => setActiveBrand(brand.id)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setActiveBrand(null);
              }}
            >
              <div className={styles.ambient} aria-hidden="true" />
              <div className={styles.grid} aria-hidden="true" />

              <div className={styles.panelTop}>
                <span className={styles.label}>{brand.label}</span>
              </div>

              <div className={styles.logoStage}>
                <div className={styles.logoHalo} aria-hidden="true" />
                <div className={styles.logoCard}>
                  <Image
                    src={brand.logo}
                    alt={brand.logoAlt}
                    width={168}
                    height={168}
                    priority
                    className={styles.logo}
                  />
                  <strong className={styles.brandName}>{brand.name}</strong>
                  <span
                    className={`${styles.brandTagline} ${brand.tagline ? "" : styles.taglineSpacer}`}
                    aria-hidden={!brand.tagline}
                  >
                    {brand.tagline ?? "Reserved tagline space"}
                  </span>
                </div>
              </div>

              <div className={styles.content}>
                <p className={styles.statement}>{brand.statement}</p>
                <p className={styles.description}>{brand.description}</p>

                <ul className={styles.details} aria-label={`${brand.name} highlights`}>
                  {brand.details.map((detail) => (
                    <li key={detail}>
                      <Check aria-hidden="true" />
                      {detail}
                    </li>
                  ))}
                </ul>

                {brand.href ? (
                  <a
                    className={styles.cta}
                    href={brand.href}
                    target={brand.href.startsWith("http") ? "_blank" : undefined}
                    rel={brand.href.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={`Visit ${brand.name}`}
                  >
                    Visit {brand.name}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : (
                  <span className={styles.comingSoon} role="status">
                    Coming soon
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
