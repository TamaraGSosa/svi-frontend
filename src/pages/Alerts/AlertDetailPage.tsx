import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import PageMeta from "@/components/common/PageMeta";
import { ProtectedImage } from "@/components/siv/ProtectedImage";
import {
  AlertStatusBadge,
  alertTypeLabels,
  formatDateTime,
  SeverityBadge,
  yoloClassLabels,
} from "@/components/siv/StatusBadges";
import { SivCard } from "@/components/siv/ui/SivCard";
import { SivGradientButton } from "@/components/siv/ui/SivGradientButton";
import { CheckIcon, TriangleAlertIcon } from "@/components/siv/ui/SivIcons";
import { alertsService } from "@/services/alertsService";
import type { Alert, ValidateAlertAction } from "@/types";

export default function AlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadAlert = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const data = await alertsService.getById(id);
      setAlert(data);
      setNotes(data.review?.notes ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la alerta.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadAlert();
  }, [loadAlert]);

  const handleValidate = async (action: ValidateAlertAction) => {
    if (!id) return;
    setValidating(true);
    setFeedback(null);
    setError(null);
    try {
      const updated = await alertsService.validate(id, action);
      setAlert(updated);
      setFeedback(
        action === "confirm"
          ? "Alerta confirmada como amenaza real."
          : "Alerta marcada como falso positivo.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo validar la alerta.");
    } finally {
      setValidating(false);
    }
  };

  const handleSaveNotes = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingNotes(true);
    setFeedback(null);
    setError(null);
    try {
      const updated = await alertsService.updateNotes(id, notes);
      setAlert(updated);
      setFeedback("Observaciones guardadas correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar las notas.");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Detalle de Alerta | SIV IA"
        description="Revisión de evidencia, protocolo y validación humana de alerta"
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/alerts"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#00A874] hover:underline dark:text-[#00D68F]"
          >
            ← Volver a Alertas
          </Link>
        </div>

        {loading ? (
          <div className="h-72 animate-pulse rounded-[20px] border border-[var(--siv-border)] bg-[var(--siv-surface)]" />
        ) : error && !alert ? (
          <div className="rounded-[20px] border border-[#F0453F]/50 bg-[#F0453F]/10 p-4 text-sm text-[#F0453F]">
            {error}
          </div>
        ) : alert ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Columna principal: Evidencia + Observaciones */}
            <div className="space-y-6 lg:col-span-2">
              <SivCard>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold text-[var(--siv-fg)]">
                        {yoloClassLabels[alert.primaryYoloClass] ?? alert.primaryYoloClass}
                      </h1>
                      <SeverityBadge severity={alert.severity} />
                      <AlertStatusBadge status={alert.status} />
                    </div>
                    <p className="mt-1 text-xs text-[var(--siv-muted)]">
                      {alertTypeLabels[alert.type]} • {alert.cameraName} ({alert.location})
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-3.5 py-2 text-right">
                    <span className="font-mono text-lg font-bold text-[#00B4D8]">
                      {Math.round(alert.confidence * 100)}%
                    </span>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--siv-muted)]">
                      Confianza YOLO
                    </p>
                  </div>
                </div>

                <ProtectedImage
                  src={alert.evidence.snapshotUrl}
                  alt={`Evidencia ${alert.id}`}
                  className="aspect-video w-full rounded-2xl border border-[var(--siv-border)]"
                  boxes={alert.evidence.boundingBox ? [alert.evidence.boundingBox] : []}
                />

                {alert.evidence.clipUrl ? (
                  <div className="mt-4">
                    <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--siv-muted)]">
                      Clip de video asociado
                    </p>
                    <video
                      src={alert.evidence.clipUrl}
                      controls
                      className="w-full rounded-xl border border-[var(--siv-border)] bg-black"
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[var(--siv-muted)]">
                  <span>Detectada: {formatDateTime(alert.detectedAt)}</span>
                  {alert.autoProtocol ? (
                    <span className="rounded-md border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-2.5 py-1 font-semibold text-[#00B4D8]">
                      Protocolo: {alert.autoProtocol}
                    </span>
                  ) : null}
                </div>
              </SivCard>

              {alert.detections && alert.detections.length > 0 ? (
                <SivCard>
                  <h2 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--siv-muted)]">
                    Detecciones relacionadas ({alert.detections.length})
                  </h2>
                  <div className="mt-3 divide-y divide-[var(--siv-border)] text-xs">
                    {alert.detections.map((d) => (
                      <div key={d.id} className="flex items-center justify-between py-2">
                        <span className="font-semibold text-[var(--siv-fg)]">
                          {yoloClassLabels[d.yoloClassName] ?? d.yoloClassName}
                        </span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-[#00B4D8]">{Math.round(d.confidence * 100)}%</span>
                          <span className="text-[var(--siv-muted)]">
                            {formatDateTime(d.detectedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SivCard>
              ) : null}

              <form onSubmit={handleSaveNotes}>
                <SivCard>
                  <h2 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--siv-muted)]">
                    Observaciones del operador
                  </h2>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escribí observaciones sobre esta alerta..."
                    className="mt-3 w-full rounded-2xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] p-3.5 text-sm text-[var(--siv-fg)] placeholder-[var(--siv-muted)] outline-none transition focus:border-[#00D68F]"
                  />
                  <div className="mt-4 flex justify-end">
                    <div className="w-full sm:w-56">
                      <SivGradientButton
                        type="submit"
                        disabled={savingNotes}
                        label={savingNotes ? "Guardando..." : "Guardar observaciones"}
                        className="h-11 text-sm"
                      />
                    </div>
                  </div>
                </SivCard>
              </form>
            </div>

            {/* Columna derecha: Validación humana y metadata */}
            <div className="space-y-4">
              <SivCard>
                <h2 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--siv-muted)]">
                  Validación humana
                </h2>

                {feedback ? (
                  <div className="mt-3 rounded-xl border border-[#00D68F]/40 bg-[#00D68F]/10 p-3 text-xs text-[#00A874] dark:text-[#00D68F]">
                    {feedback}
                  </div>
                ) : null}

                {error ? (
                  <div className="mt-3 rounded-xl border border-[#F0453F]/40 bg-[#F0453F]/10 p-3 text-xs text-[#F0453F]">
                    {error}
                  </div>
                ) : null}

                <div className="mt-4 space-y-2.5">
                  <button
                    type="button"
                    disabled={validating}
                    onClick={() => void handleValidate("confirm")}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#F0453F] px-4 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    <TriangleAlertIcon size={16} />
                    {validating ? "Procesando..." : "Confirmar amenaza"}
                  </button>
                  <button
                    type="button"
                    disabled={validating}
                    onClick={() => void handleValidate("false_positive")}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] px-4 text-xs font-bold text-[var(--siv-fg)] transition hover:border-[#00D68F]/40 disabled:opacity-50"
                  >
                    <CheckIcon size={16} />
                    Marcar como falso positivo
                  </button>
                </div>

                {alert.review ? (
                  <dl className="mt-5 space-y-2.5 border-t border-[var(--siv-border)] pt-4 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-[var(--siv-muted)]">Revisor</dt>
                      <dd className="font-semibold text-[var(--siv-fg)]">
                        {alert.review.reviewerName}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[var(--siv-muted)]">Turno</dt>
                      <dd className="text-[var(--siv-fg)]/85">
                        {alert.review.reviewerShift || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[var(--siv-muted)]">Revisada</dt>
                      <dd className="font-mono text-[var(--siv-fg)]/85">
                        {formatDateTime(alert.review.reviewedAt)}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </SivCard>

              {alert.reviewHistory && alert.reviewHistory.length > 0 ? (
                <SivCard>
                  <h2 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--siv-muted)]">
                    Historial de revisiones ({alert.reviewHistory.length})
                  </h2>
                  <div className="mt-3 space-y-2.5 text-xs">
                    {alert.reviewHistory.map((h) => (
                      <div
                        key={h.id}
                        className="rounded-xl border border-[var(--siv-border)] bg-[var(--siv-surface-alt)] p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[var(--siv-fg)]">{h.actorName}</span>
                          <span className="font-mono text-[10px] uppercase text-[#00B4D8]">
                            {h.decision ?? h.action}
                          </span>
                        </div>
                        {h.notes ? (
                          <p className="mt-1 text-[var(--siv-fg)]/85">{h.notes}</p>
                        ) : null}
                        <p className="mt-1 font-mono text-[10px] text-[var(--siv-muted)]">
                          {formatDateTime(h.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </SivCard>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
