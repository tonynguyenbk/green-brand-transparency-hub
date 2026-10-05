import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { BrandForm } from "@/components/admin/entity-forms";
import { brandToForm } from "@/lib/admin/form-values";
import { listIndustriesAdmin } from "@/lib/services/admin-service";

export default async function NewBrandPage() {
  const industries = await listIndustriesAdmin();
  return (
    <>
      <AdminHeader
        title="New brand"
        description="Brands start as drafts and are not public until published."
      />
      <Panel>
        <BrandForm
          id={null}
          initial={brandToForm(null)}
          industries={industries.map((i) => ({ value: i.id, label: i.name }))}
        />
      </Panel>
    </>
  );
}
