import { Container } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="space-y-8 py-10" aria-busy="true">
      <span className="sr-only" role="status">
        Loading brand profile…
      </span>
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>
        <Skeleton className="h-56 rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </Container>
  );
}
