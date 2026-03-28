"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { getErrorMessage } from "@/lib/report-error";
import { Loader2, CheckCircle, XCircle, LogIn } from "lucide-react";
import Link from "next/link";

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <ActivateLayout>
          <div className="flex items-center justify-center gap-2 py-12 text-enterprise-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        </ActivateLayout>
      }
    >
      <ActivateContent />
    </Suspense>
  );
}

function ActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const validation = useQuery(api.claims.validateMagicLink, token ? { token } : "skip");
  const activateClaim = useMutation(api.claims.activateClaim);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState("");

  // Auto-activate when signed in + valid token
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !validation || !validation.valid || activating || activated) return;

    const doActivate = async () => {
      setActivating(true);
      try {
        await activateClaim({ token });

        // Best effort: provider routing now falls back to Convex state, so activation
        // should still succeed even if Clerk metadata is temporarily unavailable.
        for (let attempt = 0; attempt < 3; attempt++) {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
          try {
            const res = await fetch("/api/set-role", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: "provider" }),
            });
            if (res.ok) {
              break;
            }
          } catch {
            // Ignore and continue to the fallback routing path.
          }
        }

        await user?.reload();
        setActivated(true);
        setTimeout(() => router.push("/dashboard"), 2000);
      } catch (err: any) {
        setError(getErrorMessage(err, "Activation failed. Please try again."));
      } finally {
        setActivating(false);
      }
    };
    doActivate();
  }, [isLoaded, isSignedIn, validation, token, activateClaim, activating, activated, router]);

  if (!token) {
    return (
      <ActivateLayout>
        <ErrorCard message="No activation token provided." />
      </ActivateLayout>
    );
  }

  if (validation === undefined || !isLoaded) {
    return (
      <ActivateLayout>
        <div className="flex items-center justify-center gap-2 py-12 text-enterprise-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Validating your link...
        </div>
      </ActivateLayout>
    );
  }

  if (!validation.valid) {
    return (
      <ActivateLayout>
        <ErrorCard message={validation.error} />
      </ActivateLayout>
    );
  }

  if (activated) {
    return (
      <ActivateLayout>
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-enterprise-900 mb-2">Profile Activated</h2>
          <p className="text-enterprise-600">
            Welcome to <span className="font-medium">{validation.company_name}</span>!
            Redirecting to your dashboard...
          </p>
        </div>
      </ActivateLayout>
    );
  }

  if (activating) {
    return (
      <ActivateLayout>
        <div className="flex items-center justify-center gap-2 py-12 text-enterprise-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          Activating your profile...
        </div>
      </ActivateLayout>
    );
  }

  if (error) {
    return (
      <ActivateLayout>
        <ErrorCard message={error} />
      </ActivateLayout>
    );
  }

  // Not signed in — prompt to sign up
  const redirectUrl = `/claim/activate?token=${token}`;
  return (
    <ActivateLayout>
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-enterprise-900 mb-2">
          Welcome to {validation.company_name}
        </h2>
        <p className="text-enterprise-600 mb-6">
          Sign up to access your company dashboard and manage your profile on Orbys360.
        </p>
        <Link
          href={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Create Your Account
        </Link>
        <p className="text-sm text-enterprise-500 mt-4">
          Already have an account?{" "}
          <Link href={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`} className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </ActivateLayout>
  );
}

function ActivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-lg">
          {children}
        </div>
      </div>
    </>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="text-center py-4">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-7 h-7 text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-enterprise-900 mb-2">Activation Failed</h2>
      <p className="text-enterprise-600 mb-6">{message}</p>
      <Link
        href="/directory"
        className="text-primary hover:underline text-sm"
      >
        Browse the directory
      </Link>
    </div>
  );
}
