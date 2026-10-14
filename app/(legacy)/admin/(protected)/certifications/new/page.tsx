import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { CertificationForm } from "@/components/admin/entity-forms";
import { certificationToForm } from "@/lib/admin/form-values";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { listSources } from "@/lib/services/evidence-service";

export default async function NewCertificationPage(props: PageProps<"/admin/certifications/new">) {
  const { brandId } = await props.searchParams;
  const brands = await listBrandOptionsAdmin();
  const pre = typeof brandId === "string" && brands.some((b) => b.id === brandId) ? brandId : "";
  const sources = await listSources(pre || undefined);
  return (
    <>
      <AdminHeader title="New certification" />
      <Panel>
        <CertificationForm
          id={null}
          initial={certificationToForm(null, pre)}
          brands={brands.map((b) => ({ value: b.id, label: b.name }))}
          sources={sources.map((s) => ({ value: s.id, label: `${s.brand.name} — ${s.title}` }))}
        />
      </Panel>
    </>
  );
}
