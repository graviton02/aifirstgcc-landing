import { useMutation } from "convex/react";
import { FunctionReference } from "convex/server";
import { useCallback, useState } from "react";

type MutateCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
};

export function useWrappedMutation<Args extends Record<string, unknown>, Result>(
  mutation: FunctionReference<"mutation", "public", Args, Result>
) {
  const rawMutate = useMutation(mutation) as unknown as (args: Args) => Promise<Result>;
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (args: Args, callbacks?: MutateCallbacks<Result>) => {
      setIsPending(true);
      setError(null);
      try {
        const result = await rawMutate(args);
        callbacks?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        callbacks?.onError?.(error);
        throw error;
      } finally {
        setIsPending(false);
        callbacks?.onSettled?.();
      }
    },
    [rawMutate]
  );

  return { mutate, isPending, error };
}

// Map Convex _id to id for frontend consumption
export function mapDoc<T extends { _id: string }>(
  doc: T | null
): (Omit<T, "_id"> & { id: string }) | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return { ...rest, id: _id } as Omit<T, "_id"> & { id: string };
}

export function mapDocs<T extends { _id: string }>(
  docs: T[]
): (Omit<T, "_id"> & { id: string })[] {
  return docs.map((d) => mapDoc(d)!);
}
