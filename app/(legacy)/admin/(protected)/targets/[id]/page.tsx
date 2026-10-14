import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { TargetForm } from "@/components/admin/entity-forms";
import { deleteTargetAction } from "@/lib/admin/actions";
import { targetToForm } from "@/lib/admin/form-values";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { getTarget, listSources } from "@/lib/services/evidence-service";

export default async function EditTargetPage(props: PageProps<"/admin/targets/[id]">) {
  const { id } = await props.params;
  const target = await getTarget(id);
  if (!target) notFound();
  const [brands, sources] = await Promise.all([
    listBrandOptionsAdmin(),
    listSources(target.brandId),
  ]);
  return (
    <>
      <AdminHeader title="Edit target" />
      <Panel>
        <TargetForm
          id={target.id}
          initial={targetToForm(target)}
          brands={brands.map((b) => ({ value: b.id, label: b.name }))}
          sources={sources.map((s) => ({ value: s.id, label: s.title }))}
        />
      </Panel>
      <Panel title="Danger zone">
        <ActionButton
          action={deleteTargetAction.bind(null, target.id)}
          variant="destructive"
          confirm="Delete this target?"
          redirectTo="/admin/targets"
        >
          Delete target
        </ActionButton>
      </Panel>
    </>
  );
}
