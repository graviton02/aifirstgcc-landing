import { Navbar } from "@/components/shared/Navbar";

interface Props { params: Promise<{ slug: string }> }

export default async function ThoughtLeadershipArticlePage({ params }: Props) {
  const { slug } = await params;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold text-enterprise-900 mb-4">Article</h1>
        <p className="text-enterprise-600">Article: {slug}</p>
        <p className="text-enterprise-500 mt-4">Content migration in progress.</p>
      </main>
    </>
  );
}
