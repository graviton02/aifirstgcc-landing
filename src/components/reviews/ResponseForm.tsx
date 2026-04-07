"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function textareaClassName() {
  return cn(
    "min-h-[120px] w-full rounded-lg border border-enterprise-200 bg-white px-4 py-3 text-sm text-enterprise-900 shadow-sm transition-all duration-300",
    "placeholder:text-enterprise-600/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
  );
}

export function ResponseForm({
  initialBody,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialBody?: string;
  submitLabel: string;
  onSubmit: (body: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [body, setBody] = useState(initialBody ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setBody(initialBody ?? "");
  }, [initialBody]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (body.trim().length < 20) {
      setError("Response must be at least 20 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(body);
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError("We couldn't save your response. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-enterprise-200 bg-enterprise-50/60 p-4">
      <div>
        <h4 className="text-sm font-semibold text-enterprise-900">Provider response</h4>
        <p className="mt-1 text-xs text-enterprise-500">
          Your response will be published shortly after submission.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="provider-response">Response</Label>
        <textarea
          id="provider-response"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className={textareaClassName()}
          placeholder="Share your perspective on this review."
          required
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
