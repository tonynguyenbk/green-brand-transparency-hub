import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { TargetForm } from "@/components/admin/entity-forms";
import { targetToForm } from "@/lib/admin/form-values";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { listSources } from "@/lib/services/evidence-service";

export default async function NewTargetPage(props: PageProps<"/admin/targets/new">) {
  const { brandId } = await props.searchParams;
  const brands = await listBrandOptionsAdmin();
  const pre = typeof brandId === "string" && brands.some((b) => b.id === brandId) ? brandId : "";
  const sources = await listSources(pre || undefined);
  return (
    <>
      <AdminHeader title="New target" />
      <Panel>
        <TargetForm
          id={null}
          initial={targetToForm(null, pre)}
          brands={brands.map((b) => ({ value: b.id, label: b.name }))}
          sources={sources.map((s) => ({ value: s.id, label: `${s.brand.name} — ${s.title}` }))}
        />
      </Panel>
    </>
  );
}
