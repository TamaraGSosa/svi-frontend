import PageMeta from "@/components/common/PageMeta";
import { roleLabels } from "@/components/siv/StatusBadges";
import { SivCard } from "@/components/siv/ui/SivCard";
import {
  CheckIcon,
  ChevronRightIcon,
  LogOutIcon,
  MailIcon,
  MoonIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/siv/ui/SivIcons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

function ProfileSectionHeader({ title, aside }: { title: string; aside: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00D68F]" />
        <h2 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--siv-fg)]">
          {title}
        </h2>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--siv-muted)]">
        {aside}
      </span>
    </div>
  );
}

export default function UserProfiles() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <PageMeta
        title="Mi Perfil | SIV IA"
        description="Perfil del operador y configuración de cuenta SIV IA"
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna izquierda: Avatar + Identidad (Mobile ProfileHeader) */}
          <SivCard className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-dashed border-[#00D68F]/50">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] text-[var(--siv-muted)]">
                <UserIcon size={50} />
              </div>
              <span
                className={`absolute right-2 bottom-2 h-5 w-5 rounded-full border-2 border-[var(--siv-bg)] ${
                  user?.isActive ? "bg-[#00D68F]" : "bg-slate-400"
                }`}
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[var(--siv-fg)]">Mi perfil</h1>
            <div className="mt-2 h-1 w-10 rounded-full bg-[#00D68F]" />

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-4 py-2">
              <span className="font-mono text-xs text-[var(--siv-fg)]">
                ID: {user?.employeeCode ?? "—"}
              </span>
              <span className="font-mono text-[10px] font-semibold text-[#00A874] dark:text-[#00D68F]">
                • {user?.isActive ? "ACTIVO" : "INACTIVO"}
              </span>
            </div>

            <p className="mt-3 text-xs text-[var(--siv-muted)]">
              Turno: {user?.shift || "Sin turno asignado"}
            </p>
          </SivCard>

          {/* Columna derecha: Información personal + Cuenta */}
          <div className="space-y-6 lg:col-span-2">
            <div>
              <ProfileSectionHeader title="Información personal" aside="Confidencial" />
              <SivCard className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-[var(--siv-border)] px-5 py-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--siv-muted)]">
                      Nombre completo
                    </p>
                    <p className="mt-1.5 text-base font-semibold text-[var(--siv-fg)]">
                      {user?.fullName ?? "Usuario"}
                    </p>
                  </div>
                  {user?.isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-[#00D68F]/40 bg-[#00D68F]/10 px-2.5 py-1 text-xs font-medium text-[#00A874] dark:text-[#00D68F]">
                      <CheckIcon size={12} />
                      Verificado
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between border-b border-[var(--siv-border)] px-5 py-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--siv-muted)]">
                      Correo electrónico
                    </p>
                    <p className="mt-1.5 font-mono text-sm text-[var(--siv-fg)]">
                      {user?.email ?? "—"}
                    </p>
                  </div>
                  <MailIcon size={18} className="text-[var(--siv-muted)]" />
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--siv-muted)]">
                      Rol asignado
                    </p>
                    <p className="mt-1.5 text-base font-semibold text-[var(--siv-fg)]">
                      {user ? roleLabels[user.role] : "—"}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] text-[var(--siv-muted)]">
                    <ShieldIcon size={16} />
                  </div>
                </div>
              </SivCard>
            </div>

            <div>
              <ProfileSectionHeader title="Cuenta" aside="Acciones" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] text-[#00A874] dark:text-[#00D68F]">
                    <MoonIcon size={20} />
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--siv-fg)]">Modo oscuro</p>
                    <p className="mt-0.5 text-xs text-[var(--siv-muted)]">
                      {isDark ? "Tema oscuro activo" : "Tema claro activo"}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDark}
                    aria-label="Alternar modo oscuro"
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      isDark ? "bg-[#00D68F]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void logout()}
                  className="flex items-center rounded-[20px] border border-[#F0453F]/40 bg-[#F0453F]/10 p-4 text-left transition hover:bg-[#F0453F]/15"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#F0453F]/40 bg-[#F0453F]/15 text-[#F0453F]">
                    <LogOutIcon size={20} />
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--siv-fg)]">Cerrar sesión</p>
                    <p className="mt-0.5 text-xs text-[var(--siv-muted)]">
                      Finalizar guardia de monitoreo
                    </p>
                  </div>
                  <ChevronRightIcon size={18} className="text-[var(--siv-muted)]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
