import { AdminHeader, CandidateNotice, Panel } from "@/components/admin/admin-ui";
import { ClaimForm } from "@/components/admin/entity-forms";
import { claimToForm } from "@/lib/admin/form-values";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";

export default async function NewClaimPage(props: PageProps<"/admin/claims/new">) {
  const { brandId } = await props.searchParams;
  const brands = await listBrandOptionsAdmin();
  const preselected =
    typeof brandId === "string" && brands.some((b) => b.id === brandId) ? brandId : "";
  return (
    <>
      <AdminHeader
        title="New claim"
        description="Record the exact wording. New claims start as candidates."
      />
      <CandidateNotice />
      <Panel>
        <ClaimForm
          id={null}
          initial={claimToForm(null, preselected)}
          brands={brands.map((b) => ({ value: b.id, label: b.name }))}
        />
      </Panel>
    </>
  );
}
