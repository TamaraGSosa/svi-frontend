import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { formatDateTime, SeverityBadge, yoloClassLabels } from "@/components/siv/StatusBadges";
import { BellIcon } from "@/components/siv/ui/SivIcons";
import { useAuth } from "@/context/AuthContext";
import { alertsService } from "@/services/alertsService";
import type { AlertSummary } from "@/types";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function NotificationDropdown() {
  const { isAuthenticated, subscribeRealtime } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);

  const loadRecent = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const items = await alertsService.listRecent(6);
      setAlerts(items);
    } catch {
      // ignore background notification errors
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  useEffect(() => {
    return subscribeRealtime((ev) => {
      if (ev.event === "alert.created" || ev.event === "alert.updated") {
        void loadRecent();
      }
    });
  }, [subscribeRealtime, loadRecent]);

  const pendingCount = alerts.filter(
    (a) => a.status === "pending_validation" || a.status === "pending",
  ).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Notificaciones de alertas"
        className="dropdown-toggle relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] text-[var(--siv-muted)] transition hover:text-[var(--siv-fg)]"
      >
        {pendingCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F0453F] px-1 font-mono text-[10px] font-bold text-white">
            {pendingCount}
          </span>
        ) : null}
        <BellIcon size={18} />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute inset-e-0 mt-3 flex w-80 flex-col rounded-2xl border border-[var(--siv-border)] bg-[var(--siv-surface)] p-3 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--siv-border)] px-2 pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--siv-fg)]">
            Alertas recientes
          </span>
          <Link
            to="/alerts"
            onClick={() => setIsOpen(false)}
            className="font-mono text-[11px] font-semibold text-[#00A874] hover:underline dark:text-[#00D68F]"
          >
            Ver todas →
          </Link>
        </div>

        <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="py-6 text-center text-xs text-[var(--siv-muted)]">
              Sin alertas recientes
            </p>
          ) : (
            alerts.map((a) => (
              <Link
                key={a.id}
                to={`/alerts/${a.id}`}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] p-2.5 transition hover:border-[#00D68F]/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--siv-fg)]">
                    {yoloClassLabels[a.primaryYoloClass] ?? a.primaryYoloClass}
                  </span>
                  <SeverityBadge severity={a.severity} />
                </div>
                <p className="mt-1 text-[11px] text-[var(--siv-muted)]">
                  {a.cameraName} • {a.location}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--siv-muted)]">
                  {formatDateTime(a.detectedAt)}
                </p>
              </Link>
            ))
          )}
        </div>
      </Dropdown>
    </div>
  );
}
