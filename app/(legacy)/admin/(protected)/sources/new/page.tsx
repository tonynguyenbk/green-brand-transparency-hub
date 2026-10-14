import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { SourceForm } from "@/components/admin/entity-forms";
import { sourceToForm } from "@/lib/admin/form-values";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";

export default async function NewSourcePage(props: PageProps<"/admin/sources/new">) {
  const { brandId } = await props.searchParams;
  const brands = await listBrandOptionsAdmin();
  const pre = typeof brandId === "string" && brands.some((b) => b.id === brandId) ? brandId : "";
  return (
    <>
      <AdminHeader
        title="New source"
        description="Record where evidence was found. Never invent URLs — use the exact public address."
      />
      <Panel>
        <SourceForm
          id={null}
          initial={sourceToForm(null, pre)}
          brands={brands.map((b) => ({ value: b.id, label: b.name }))}
        />
      </Panel>
    </>
  );
}
