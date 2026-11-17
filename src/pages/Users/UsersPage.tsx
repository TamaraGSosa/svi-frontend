import { type FormEvent, useCallback, useEffect, useState } from "react";
import PageMeta from "@/components/common/PageMeta";
import { roleLabels } from "@/components/siv/StatusBadges";
import { useAuth } from "@/context/AuthContext";
import { usersService } from "@/services/usersService";
import type { User, UserRole } from "@/types";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const canList = currentUser?.role === "admin" || currentUser?.role === "supervisor";
  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [employeeCode, setEmployeeCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("operator");
  const [shift, setShift] = useState("Guardia turno 1");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!canList) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await usersService.list(1, 50);
      setUsers(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [canList]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await usersService.create({
        employeeCode: employeeCode.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
        shift: shift.trim(),
        isVerified: true,
      });
      setModalOpen(false);
      setEmployeeCode("");
      setFullName("");
      setEmail("");
      setPassword("");
      await loadUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo crear el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (target: User) => {
    try {
      await usersService.update(target.id, { isActive: !target.isActive });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado.");
    }
  };

  const handleRoleChange = async (target: User, nextRole: UserRole) => {
    try {
      await usersService.update(target.id, { role: nextRole });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el rol.");
    }
  };

  if (!canList) {
    return (
      <div className="rounded-2xl border border-[#F0453F]/40 bg-[#F0453F]/10 p-6 text-sm text-[#F0453F]">
        Esta sección requiere rol de supervisor o administrador.
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Gestión de Usuarios | SIV IA"
        description="Administración de cuentas y roles de SIV IA"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {total} usuario(s) registrado(s) • Control RBAC
            </p>
          </div>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setModalOpen(true);
              }}
              className="rounded-xl bg-[#00D68F] px-4 py-2 text-xs font-bold text-[#0B0F17] hover:bg-[#00c080]"
            >
              + Nuevo usuario
            </button>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-[#F0453F]/40 bg-[#F0453F]/10 p-4 text-sm text-[#F0453F]">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-[#1E293B] dark:bg-[#111826]">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500 dark:border-[#1E293B] dark:bg-[#172033] dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Legajo</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Turno</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#1E293B]">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-mono text-xs text-[#00B4D8]">
                        {u.employeeCode}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {u.fullName}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">
                        {u.shift || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && u.id !== currentUser?.id ? (
                          <select
                            value={u.role}
                            onChange={(e) => void handleRoleChange(u, e.target.value as UserRole)}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-800 dark:border-[#1E293B] dark:bg-[#172033] dark:text-white"
                          >
                            <option value="operator">Operador</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="admin">Administrador</option>
                          </select>
                        ) : (
                          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                            {roleLabels[u.role]}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && u.id !== currentUser?.id ? (
                          <button
                            type="button"
                            onClick={() => void handleToggleActive(u)}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                              u.isActive
                                ? "border-[#00D68F]/30 bg-[#00D68F]/10 text-[#00D68F]"
                                : "border-[#F0453F]/30 bg-[#F0453F]/10 text-[#F0453F]"
                            }`}
                          >
                            {u.isActive ? "Activo" : "Inactivo"}
                          </button>
                        ) : (
                          <span
                            className={`text-xs font-semibold ${
                              u.isActive ? "text-[#00D68F]" : "text-[#F0453F]"
                            }`}
                          >
                            {u.isActive ? "Activo" : "Inactivo"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1E293B] bg-[#111826] p-6 text-white shadow-2xl">
            <h2 className="text-lg font-bold">Nuevo usuario</h2>
            {formError ? (
              <div className="mt-3 rounded-xl border border-[#F0453F]/40 bg-[#F0453F]/10 p-3 text-xs text-[#F0453F]">
                {formError}
              </div>
            ) : null}
            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Legajo</label>
                  <input
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="OP-010"
                    className="w-full rounded-xl border border-[#1E293B] bg-[#172033] px-3 py-2 text-sm text-white outline-none focus:border-[#00D68F]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">Rol</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-[#1E293B] bg-[#172033] px-3 py-2 text-sm text-white outline-none focus:border-[#00D68F]"
                  >
                    <option value="operator">Operador</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Nombre completo</label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-[#1E293B] bg-[#172033] px-3 py-2 text-sm text-white outline-none focus:border-[#00D68F]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#1E293B] bg-[#172033] px-3 py-2 text-sm text-white outline-none focus:border-[#00D68F]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Contraseña (mín. 8 caracteres)
                </label>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#1E293B] bg-[#172033] px-3 py-2 text-sm text-white outline-none focus:border-[#00D68F]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">Turno</label>
                <input
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full rounded-xl border border-[#1E293B] bg-[#172033] px-3 py-2 text-sm text-white outline-none focus:border-[#00D68F]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#1E293B] px-4 py-2 text-xs font-semibold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#00D68F] px-4 py-2 text-xs font-bold text-[#0B0F17] disabled:opacity-60"
                >
                  {saving ? "Creando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
