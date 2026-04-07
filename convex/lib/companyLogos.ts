import type { MutationCtx, QueryCtx } from "../_generated/server";
type LogoReaderCtx =
  | Pick<QueryCtx, "storage">
  | Pick<MutationCtx, "storage">;

type LogoRecord = {
  logo_storage_id?: string;
  logo_url?: string | null;
};

export async function resolveLogoUrl(
  ctx: LogoReaderCtx,
  logoStorageId?: string,
  fallbackUrl?: string | null
) {
  if (!logoStorageId) {
    return fallbackUrl ?? undefined;
  }

  try {
    const storageUrl = await ctx.storage.getUrl(logoStorageId as any);
    return storageUrl ?? fallbackUrl ?? undefined;
  } catch {
    return fallbackUrl ?? undefined;
  }
}

export async function withResolvedLogoUrl<T extends LogoRecord>(
  ctx: LogoReaderCtx,
  record: T
): Promise<T & { logo_url?: string }>;
export async function withResolvedLogoUrl<T extends LogoRecord>(
  ctx: LogoReaderCtx,
  record: T | null
): Promise<(T & { logo_url?: string }) | null>;
export async function withResolvedLogoUrl<T extends LogoRecord>(
  ctx: LogoReaderCtx,
  record: T | null
) {
  if (!record) {
    return null;
  }

  return {
    ...record,
    logo_url: await resolveLogoUrl(
      ctx,
      record.logo_storage_id,
      record.logo_url
    ),
  };
}
