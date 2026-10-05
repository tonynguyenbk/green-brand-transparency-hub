import Link from "next/link";
import { Container } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="py-24">
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <p className="tabular text-muted-foreground font-serif text-6xl font-semibold">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          This page or brand profile does not exist, or it has not been published yet.
        </p>
        <Button asChild>
          <Link href="/brands">Browse brands</Link>
        </Button>
      </div>
    </Container>
  );
}
