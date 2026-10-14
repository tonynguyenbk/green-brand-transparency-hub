import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { CertificationForm } from "@/components/admin/entity-forms";
import { deleteCertificationAction } from "@/lib/admin/actions";
import { certificationToForm } from "@/lib/admin/form-values";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { getCertification, listSources } from "@/lib/services/evidence-service";

export default async function EditCertificationPage(
  props: PageProps<"/admin/certifications/[id]">,
) {
  const { id } = await props.params;
  const cert = await getCertification(id);
  if (!cert) notFound();
  const [brands, sources] = await Promise.all([listBrandOptionsAdmin(), listSources(cert.brandId)]);
  return (
    <>
      <AdminHeader title="Edit certification" />
      <Panel>
        <CertificationForm
          id={cert.id}
          initial={certificationToForm(cert)}
          brands={brands.map((b) => ({ value: b.id, label: b.name }))}
          sources={sources.map((s) => ({ value: s.id, label: s.title }))}
        />
      </Panel>
      <Panel title="Danger zone">
        <ActionButton
          action={deleteCertificationAction.bind(null, cert.id)}
          variant="destructive"
          confirm="Delete this certification?"
          redirectTo="/admin/certifications"
        >
          Delete certification
        </ActionButton>
      </Panel>
    </>
  );
}
