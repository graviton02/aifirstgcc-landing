import { ConvexError } from "convex/values";

export type AppErrorData = {
  code: string;
  message: string;
  status: number;
};

export function appError(
  code: string,
  message: string,
  status = 400
): never {
  throw new ConvexError({
    code,
    message,
    status,
  });
}
