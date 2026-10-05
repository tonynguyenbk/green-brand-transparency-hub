import { Container } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="space-y-6 py-12" aria-busy="true">
      <span className="sr-only" role="status">
        Loading…
      </span>
      <Skeleton className="h-10 w-2/3 max-w-xl" />
      <Skeleton className="h-5 w-full max-w-2xl" />
      <div className="grid gap-5 md:grid-cols-3">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </Container>
  );
}
