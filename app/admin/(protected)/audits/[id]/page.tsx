import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { AuditForm } from "@/components/admin/entity-forms";
import { deleteAuditAction } from "@/lib/admin/actions";
import { auditToForm } from "@/lib/admin/form-values";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { getAudit } from "@/lib/services/evidence-service";

export default async function EditAuditPage(props: PageProps<"/admin/audits/[id]">) {
  const { id } = await props.params;
  const [audit, brands] = await Promise.all([getAudit(id), listBrandOptionsAdmin()]);
  if (!audit) notFound();
  return (
    <>
      <AdminHeader title="Edit accessibility audit" />
      <Panel>
        <AuditForm
          id={audit.id}
          initial={auditToForm(audit)}
          brands={brands.map((b) => ({ value: b.id, label: b.name }))}
        />
      </Panel>
      <Panel title="Danger zone">
        <ActionButton
          action={deleteAuditAction.bind(null, audit.id)}
          variant="destructive"
          confirm="Delete this audit?"
          redirectTo="/admin/audits"
        >
          Delete audit
        </ActionButton>
      </Panel>
    </>
  );
}
