import { GccOnboardingForm } from "@/components/onboarding/GccOnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-lg">
        <GccOnboardingForm />
      </div>
    </div>
  );
}
