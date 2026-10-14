import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { SourceForm } from "@/components/admin/entity-forms";
import { deleteSourceAction } from "@/lib/admin/actions";
import { sourceToForm } from "@/lib/admin/form-values";
import { listBrandOptionsAdmin } from "@/lib/services/admin-service";
import { getSource } from "@/lib/services/evidence-service";

export default async function EditSourcePage(props: PageProps<"/admin/sources/[id]">) {
  const { id } = await props.params;
  const [source, brands] = await Promise.all([getSource(id), listBrandOptionsAdmin()]);
  if (!source) notFound();
  return (
    <>
      <AdminHeader
        title="Edit source"
        description={source.brand.name}
        actions={
          <Link
            href={`/admin/brands/${source.brandId}`}
            className="text-primary text-sm hover:underline"
          >
            Back to brand
          </Link>
        }
      />
      <Panel>
        <SourceForm
          id={source.id}
          initial={sourceToForm(source)}
          brands={brands.map((b) => ({ value: b.id, label: b.name }))}
        />
      </Panel>
      <Panel title="Danger zone">
        <ActionButton
          action={deleteSourceAction.bind(null, source.id)}
          variant="destructive"
          confirm="Delete this source and its evidence links?"
          redirectTo="/admin/sources"
        >
          Delete source
        </ActionButton>
      </Panel>
    </>
  );
}
