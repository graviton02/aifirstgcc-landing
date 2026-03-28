"use client";

import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm flex-wrap"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <CaretRight
                weight="bold"
                className="w-3 h-3 text-enterprise-300 shrink-0"
              />
            )}
            {isLast || !item.href ? (
              <span className="text-enterprise-500 truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-enterprise-400 hover:text-enterprise-600 transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
