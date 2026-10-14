import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { AuditForm } from "@/components/admin/entity-forms";
import { auditToForm } from "@/lib/admin/form-values";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";

export default async function NewAuditPage(props: PageProps<"/admin/audits/new">) {
  const { brandId } = await props.searchParams;
  const brands = await listBrandOptionsAdmin();
  const pre = typeof brandId === "string" && brands.some((b) => b.id === brandId) ? brandId : "";
  return (
    <>
      <AdminHeader
        title="New accessibility audit"
        description="Count navigation steps from the brand homepage to its key sustainability evidence."
      />
      <Panel>
        <AuditForm
          id={null}
          initial={auditToForm(null, pre)}
          brands={brands.map((b) => ({ value: b.id, label: b.name }))}
        />
      </Panel>
    </>
  );
}
