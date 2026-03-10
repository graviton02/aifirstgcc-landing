import { ClaimForm } from "@/components/claim/ClaimForm";
import { Navbar } from "@/components/shared/Navbar";

interface Props { params: Promise<{ slug: string }> }

export default async function ClaimPage({ params }: Props) {
  const { slug } = await params;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-enterprise-50 flex items-center justify-center px-4 pt-24">
        <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-lg">
          <ClaimForm companySlug={slug} />
        </div>
      </div>
    </>
  );
}
