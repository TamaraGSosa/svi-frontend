import { useEffect, useState } from "react";
import { fetchAuthorizedImageBlobUrl } from "@/services/apiClient";
import type { BoundingBox } from "@/types";

interface ProtectedImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  boxes?: BoundingBox[];
}

export function ProtectedImage({ src, alt, className = "", boxes = [] }: ProtectedImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(src));
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    if (!src) {
      setObjectUrl(null);
      setLoading(false);
      setFailed(false);
      return;
    }

    let revoked = false;
    let createdUrl: string | null = null;
    setLoading(true);
    setFailed(false);

    fetchAuthorizedImageBlobUrl(src)
      .then((url) => {
        if (revoked) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        createdUrl = url;
        setObjectUrl(url);
        if (!url) setFailed(true);
      })
      .catch(() => {
        if (!revoked) setFailed(true);
      })
      .finally(() => {
        if (!revoked) setLoading(false);
      });

    return () => {
      revoked = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-900/80 text-xs text-slate-400 ${className}`}
      >
        Cargando evidencia...
      </div>
    );
  }

  if (failed || !objectUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-900/80 text-xs text-slate-500 ${className}`}
      >
        Sin imagen disponible
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={objectUrl} alt={alt} className="h-full w-full object-cover" />
      {boxes.map((box, idx) => (
        <div
          key={`${box.label}-${idx}`}
          style={{
            left: `${box.x * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.width * 100}%`,
            height: `${box.height * 100}%`,
          }}
          className="pointer-events-none absolute border-2 border-[#F0453F] bg-[#F0453F]/10"
        >
          <span className="absolute -top-5 left-0 rounded bg-[#F0453F] px-1.5 py-0.5 text-[10px] font-bold text-white">
            {box.label}
          </span>
        </div>
      ))}
    </div>
  );
}
