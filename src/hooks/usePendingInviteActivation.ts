"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getErrorMessage, reportHandledError } from "@/lib/report-error";

type ActivationResult =
  | { status: "accepted"; company_id: string }
  | { status: "already_active"; company_id: string }
  | { status: "none" }
  | { status: "no_email" }
  | { status: "conflict"; message: string };

export function usePendingInviteActivation() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const acceptPendingInvite = useMutation(api.companyMembers.acceptPendingInvite);
  const processedUserIdRef = useRef<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoaded) return;

    if (!isSignedIn || !user?.id) {
      processedUserIdRef.current = null;
      setIsResolving(false);
      setError("");
      return;
    }

    if (processedUserIdRef.current === user.id) {
      setIsResolving(false);
      return;
    }

    processedUserIdRef.current = user.id;
    setIsResolving(true);
    setError("");

    const resolveInvite = async () => {
      let shouldReloadUser = false;

      try {
        const result = (await acceptPendingInvite({})) as ActivationResult;

        if (result.status === "accepted" || result.status === "already_active") {
          try {
            const response = await fetch("/api/set-role", {
              method: "POST",
            });

            if (response.ok) {
              shouldReloadUser = true;
            }
          } catch (error) {
            reportHandledError(error, {
              tags: {
                area: "client",
                feature: "pending-invite-activation",
                operation: "set-role",
              },
              userId: user.id,
            });
            // Provider routing also falls back to Convex membership state.
          }
        } else if (result.status === "conflict") {
          setError(result.message);
        }

        if (shouldReloadUser) {
          await user.reload();
        }
      } catch (err: any) {
        reportHandledError(err, {
          tags: {
            area: "client",
            feature: "pending-invite-activation",
            operation: "accept-pending-invite",
          },
          userId: user.id,
        });
        setError(getErrorMessage(err, "We couldn't activate your team invite."));
      } finally {
        setIsResolving(false);
      }
    };

    void resolveInvite();
  }, [authLoaded, isSignedIn, user, acceptPendingInvite]);

  return { isResolving, error };
}
