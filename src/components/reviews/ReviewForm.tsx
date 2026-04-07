"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRatingInput } from "@/components/reviews/StarRating";
import { cn } from "@/lib/utils";

type ReviewFormValue = {
  title: string;
  rating_overall: number;
  rating_effectiveness: number;
  rating_value: number;
  pros: string;
  cons: string;
  use_case?: string;
};

function textareaClassName() {
  return cn(
    "min-h-[120px] w-full rounded-lg border border-enterprise-200 bg-white px-4 py-3 text-sm text-enterprise-900 shadow-sm transition-all duration-300",
    "placeholder:text-enterprise-600/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
  );
}

const EMPTY_VALUE: ReviewFormValue = {
  title: "",
  rating_overall: 0,
  rating_effectiveness: 0,
  rating_value: 0,
  pros: "",
  cons: "",
  use_case: "",
};

export function ReviewForm({
  initialValue,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialValue?: Partial<ReviewFormValue>;
  submitLabel: string;
  onSubmit: (value: ReviewFormValue) => Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = useState<ReviewFormValue>({
    ...EMPTY_VALUE,
    ...initialValue,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setValue({
      ...EMPTY_VALUE,
      ...initialValue,
    });
  }, [initialValue]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (
      value.rating_overall < 1 ||
      value.rating_effectiveness < 1 ||
      value.rating_value < 1
    ) {
      setError("Please rate all three categories.");
      return;
    }

    if (value.pros.trim().length < 50 || value.cons.trim().length < 50) {
      setError("Both 'What went well' and 'What could improve' need at least 50 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(value);
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError("We couldn't save your review. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-enterprise-200 bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-enterprise-900">Share your review</h3>
        <p className="mt-1 text-sm text-enterprise-500">
          Your review will be moderated before it is published.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StarRatingInput
          label="Overall"
          helper="Your overall experience"
          value={value.rating_overall}
          onChange={(rating) =>
            setValue((current) => ({ ...current, rating_overall: rating }))
          }
        />
        <StarRatingInput
          label="Effectiveness"
          helper="Did the agent deliver on its promises?"
          value={value.rating_effectiveness}
          onChange={(rating) =>
            setValue((current) => ({ ...current, rating_effectiveness: rating }))
          }
        />
        <StarRatingInput
          label="Value"
          helper="Was it worth the cost and effort?"
          value={value.rating_value}
          onChange={(rating) =>
            setValue((current) => ({ ...current, rating_value: rating }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title">Title</Label>
        <Input
          id="review-title"
          value={value.title}
          onChange={(event) =>
            setValue((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Summarize your experience"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-use-case">Use case (optional)</Label>
        <Input
          id="review-use-case"
          value={value.use_case ?? ""}
          onChange={(event) =>
            setValue((current) => ({ ...current, use_case: event.target.value }))
          }
          placeholder="What did you use this agent for?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-pros">What went well</Label>
        <textarea
          id="review-pros"
          value={value.pros}
          onChange={(event) =>
            setValue((current) => ({ ...current, pros: event.target.value }))
          }
          className={textareaClassName()}
          placeholder="What worked well about this agent or your experience with the provider?"
          required
        />
        <p className="text-xs text-enterprise-400">
          At least 50 characters. {value.pros.trim().length}/50
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-cons">What could improve</Label>
        <textarea
          id="review-cons"
          value={value.cons}
          onChange={(event) =>
            setValue((current) => ({ ...current, cons: event.target.value }))
          }
          className={textareaClassName()}
          placeholder="What could be better? Any limitations other buyers should know about?"
          required
        />
        <p className="text-xs text-enterprise-400">
          At least 50 characters. {value.cons.trim().length}/50
        </p>
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
