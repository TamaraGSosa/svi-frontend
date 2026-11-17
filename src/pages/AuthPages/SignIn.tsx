import { type FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
} from "@/components/siv/ui/SivIcons";
import { SivGradientButton } from "@/components/siv/ui/SivGradientButton";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/types";

export default function SignIn() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotInfoOpen, setForgotInfoOpen] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Ingresá tu correo electrónico y contraseña.");
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: cleanEmail, password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo iniciar sesión. Verificá la conexión con el backend.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Iniciar sesión | SIV IA"
        description="Acceso al Sistema de Videovigilancia Inteligente SIV IA"
      />

      <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#0B0F17] text-white">
        {/* Resplandor superior idéntico a la versión móvil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-gradient-to-b from-[#00D68F]/[0.12] via-[#00B4D8]/[0.04] to-transparent"
        />

        <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-[460px] rounded-[28px] border border-[#1E293B] bg-[#111826] px-7 pb-8 pt-9 shadow-[0_24px_64px_rgba(0,0,0,0.55)] sm:px-9 sm:pb-9 sm:pt-10">
            {/* Identidad centrada */}
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-[#00D68F]/50 bg-[#172033] text-[#00D68F] shadow-[0_0_28px_rgba(0,214,143,0.12)]">
                <ShieldCheckIcon size={38} />
              </div>

              <span className="mt-5 font-display text-lg tracking-[6px] text-white">
                SVI
              </span>
              <h1 className="mt-1 text-3xl font-medium tracking-tight text-white">
                Bienvenido
              </h1>
              <p className="mt-1.5 font-display text-[12px] tracking-wide text-white/90">
                Sistema de Videovigilancia Inteligente
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-normal text-white/90"
                >
                  Correo electrónico
                </label>
                <div className="flex h-14 items-center rounded-2xl border border-[#1E293B] bg-[#172033] px-4 transition-colors focus-within:border-[#00D68F]">
                  <MailIcon size={18} className="shrink-0 text-[#64748B]" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operador@seguridad.com"
                    className="ml-3 w-full bg-transparent text-base text-white placeholder-[#64748B] outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-normal text-white/90"
                >
                  Contraseña
                </label>
                <div className="flex h-14 items-center rounded-2xl border border-[#1E293B] bg-[#172033] px-4 transition-colors focus-within:border-[#00D68F]">
                  <LockIcon size={18} className="shrink-0 text-[#64748B]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="ml-3 w-full bg-transparent text-base text-white placeholder-[#64748B] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    className="ml-2 shrink-0 rounded-lg p-1 text-[#64748B] transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="rounded-xl border border-[#F0453F]/50 bg-[#F0453F]/10 px-3.5 py-2.5 text-xs text-[#F0453F]"
                >
                  {error}
                </div>
              ) : null}

              <div className="pt-2">
                <SivGradientButton
                  type="submit"
                  disabled={submitting}
                  label={submitting ? "Ingresando..." : "Iniciar sesión"}
                  icon={<ArrowRightIcon size={18} className="text-[#0B0F17]" />}
                />
              </div>
            </form>

            <div className="mt-6 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setForgotInfoOpen((v) => !v)}
                className="text-sm text-[#00D68F] underline underline-offset-4 transition-opacity hover:opacity-85"
              >
                ¿Olvidaste tu contraseña?
              </button>

              {forgotInfoOpen ? (
                <div className="mt-3 w-full rounded-xl border border-[#1E293B] bg-[#172033] px-4 py-3 text-center text-xs text-slate-300">
                  Contactá al administrador del sistema para restablecer tus credenciales de acceso.
                </div>
              ) : null}
            </div>
          </div>
        </main>

        <footer className="relative z-10 border-t border-[#1E293B] py-5 text-center">
          <p className="text-xs text-[#64748B]">
            Acceso restringido a personal autorizado
          </p>
        </footer>
      </div>
    </>
  );
}
