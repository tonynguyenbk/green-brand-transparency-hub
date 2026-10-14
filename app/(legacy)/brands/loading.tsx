import { Container } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="space-y-8 py-10" aria-busy="true">
      <span className="sr-only" role="status">
        Loading brands…
      </span>
      <div className="space-y-3 border-b pb-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    </Container>
  );
}
