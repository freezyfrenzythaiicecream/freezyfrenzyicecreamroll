import React, { useCallback, useRef, useState } from 'react';
import { RotateCcw, Upload } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import { isReplaceableImageUrl, resolveImageUrl } from '../imageUrls';

type EditablePhotoProps = {
  /** Default bundled URL when no override is stored. */
  canonicalSrc: string;
  /**
   * Config key for `imageOverrides` (defaults to `canonicalSrc`).
   * Use per-slot keys (e.g. `menu:12`) when several places share the same default image.
   */
  overrideKey?: string;
  alt: string;
  imgClassName: string;
  className?: string;
};

async function uploadSiteAsset(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/site-assets', {
    method: 'POST',
    body: fd,
    credentials: 'include',
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || res.statusText);
  }
  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error('Upload succeeded but no URL returned');
  return data.url;
}

const EditablePhoto: React.FC<EditablePhotoProps> = ({
  canonicalSrc,
  overrideKey,
  alt,
  imgClassName,
  className = 'relative group',
}) => {
  const { config, updateConfig, remoteReady } = useSiteConfig();
  const { canEditSite, apiOnline } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const mapKey = overrideKey ?? canonicalSrc;

  const showReplace =
    Boolean(canEditSite && apiOnline && remoteReady && isReplaceableImageUrl(canonicalSrc));

  const displaySrc = resolveImageUrl(canonicalSrc, config.imageOverrides, overrideKey);
  const hasOverride = Boolean(config.imageOverrides[mapKey]);

  const applyOverride = useCallback(
    (url: string) => {
      updateConfig({
        imageOverrides: { ...config.imageOverrides, [mapKey]: url },
      });
    },
    [mapKey, config.imageOverrides, updateConfig]
  );

  const clearOverride = useCallback(() => {
    const next = { ...config.imageOverrides };
    delete next[mapKey];
    updateConfig({ imageOverrides: next });
  }, [mapKey, config.imageOverrides, updateConfig]);

  const onPick: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErr(null);
    setBusy(true);
    try {
      const url = await uploadSiteAsset(file);
      applyOverride(url);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <img src={displaySrc} alt={alt} className={imgClassName} />
      {showReplace ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            aria-hidden
            onChange={onPick}
            disabled={busy}
          />
          <div
            className="absolute top-2 left-2 z-30 flex flex-wrap items-center gap-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-lg bg-black/70 text-white text-xs font-medium px-2 py-1 hover:bg-black/85 disabled:opacity-50"
              aria-label={`Replace image: ${alt}`}
            >
              <Upload className="w-3.5 h-3.5 shrink-0" aria-hidden />
              {busy ? 'Uploading…' : 'Replace'}
            </button>
            {hasOverride ? (
              <button
                type="button"
                onClick={clearOverride}
                disabled={busy}
                className="inline-flex items-center gap-1 rounded-lg bg-white/90 text-gray-900 text-xs font-medium px-2 py-1 border border-gray-200 hover:bg-white disabled:opacity-50"
                aria-label={`Revert to original image: ${alt}`}
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden />
                Original
              </button>
            ) : null}
          </div>
          {err ? (
            <p className="absolute bottom-2 left-2 right-2 z-30 text-xs text-red-100 bg-red-900/80 rounded px-2 py-1">
              {err}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default EditablePhoto;
