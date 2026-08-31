import { PaginationNav } from "@/components/pagination-nav";
import { ResourceForm } from "@/components/resource-form";
import { requireAdminPage } from "@/features/auth/require-admin-page";
import { connectDb } from "@/lib/db";
import { paginationInput, totalPages } from "@/lib/pagination";
import { User } from "@/models/User";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

export default async function Users({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdminPage();
  await connectDb();
  const params = await searchParams;
  const { page, skip } = paginationInput(params.page, PAGE_SIZE);
  const [items, total] = await Promise.all([
    User.find()
      .select("name email role active")
      .sort({ name: 1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    User.countDocuments(),
  ]);
  const pages = totalPages(total, PAGE_SIZE);
  return (
    <>
      <header>
        <div>
          <p className="eyebrow">Acceso</p>
          <h1>Usuarios</h1>
        </div>
      </header>
      <details className="panel">
        <summary>Nuevo usuario</summary>
        <ResourceForm
          endpoint="/api/users"
          fields={[
            { name: "name", label: "Nombre", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            {
              name: "password",
              label: "Contraseña temporal",
              type: "password",
              required: true,
            },
            {
              name: "role",
              label: "Rol",
              options: [
                { value: "INSTRUCTOR", label: "Instructor" },
                { value: "ADMIN", label: "Administrador" },
              ],
            },
          ]}
        />
      </details>
      <section className="panel">
        {items.length ? (
          items.map((item) => (
            <div className="list-row" key={String(item._id)}>
              <div>
                <strong>{String(item.name)}</strong>
                <small>{String(item.email)}</small>
              </div>
              <span className="badge">{String(item.role)}</span>
            </div>
          ))
        ) : (
          <p className="empty">No hay usuarios registrados.</p>
        )}
        <PaginationNav
          path="/users"
          page={page}
          pages={pages}
          total={total}
          searchParams={params}
        />
      </section>
    </>
  );
}
