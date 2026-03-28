"use client";

import Image from "next/image";
import { Plugs } from "@phosphor-icons/react";
import { getIntegrationLogo } from "@/lib/integration-logos";

interface Props {
  name: string;
}

export function IntegrationIcon({ name }: Props) {
  const logo = getIntegrationLogo(name);

  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-lg bg-white border border-enterprise-200/60 hover:border-enterprise-300/80 transition-[border-color] duration-200">
      {logo ? (
        <Image
          src={`/logos/integrations/${logo.slug}.svg`}
          alt=""
          width={22}
          height={22}
          className="shrink-0 opacity-70"
        />
      ) : (
        <Plugs
          weight="duotone"
          className="w-[22px] h-[22px] text-enterprise-400 shrink-0"
        />
      )}
      <span className="text-base text-enterprise-700 font-medium">{name}</span>
    </div>
  );
}
