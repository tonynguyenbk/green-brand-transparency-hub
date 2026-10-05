import { AdminHeader, AdminTable, RowLink } from "@/components/admin/admin-ui";
import { listStudies } from "@/lib/services/research-service";
import { humanizeEnum } from "@/lib/validation/enums";

export default async function AdminResearchPage() {
  const studies = await listStudies();
  return (
    <>
      <AdminHeader
        title="Research studies"
        description="Consumer experiment foundation: control vs Transparency Hub condition, 5-point Likert constructs."
      />
      <AdminTable
        head={["Study", "Status", "Conditions", "Started responses"]}
        empty={studies.length === 0}
      >
        {studies.map((s) => (
          <tr key={s.id}>
            <td className="px-4 py-2.5">
              <RowLink href={`/admin/research/${s.id}`}>{s.title}</RowLink>
            </td>
            <td className="px-4 py-2.5">{humanizeEnum(s.status)}</td>
            <td className="px-4 py-2.5">{s.conditions.map((c) => c.key).join(" · ")}</td>
            <td className="tabular px-4 py-2.5">{s._count.responses}</td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
