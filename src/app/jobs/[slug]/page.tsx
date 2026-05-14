import { Container } from "@/components/shared/Container";
import { Navbar } from "@/components/shared/Navbar";
import { JobDetail } from "@/components/jobs/JobDetail";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <Navbar />
      <div className="relative bg-enterprise-50 pb-16 pt-24 sm:pt-28">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 bg-gradient-radial from-purple-100/40 to-transparent blur-3xl" />
        <Container size="wide">
          <JobDetail slug={slug} />
        </Container>
      </div>
    </>
  );
}
