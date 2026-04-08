import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DEFAULT_SITE_CONFIG,
  type SiteConfig,
  SITE_CONFIG_STORAGE_KEY,
  mergeSiteConfig,
} from '../siteConfig';
import { useAuth } from './AuthContext';

type SiteConfigContextValue = {
  config: SiteConfig;
  remoteReady: boolean;
  updateConfig: (partial: Partial<SiteConfig>) => void;
  resetConfig: () => void;
  saveError: string | null;
  clearSaveError: () => void;
};

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

const PERSIST_DEBOUNCE_MS = 500;

function loadStoredConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_CONFIG;
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    return mergeSiteConfig(parsed);
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

function persistLocal(config: SiteConfig) {
  try {
    localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* ignore */
  }
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const { apiOnline, canEditSite } = useAuth();
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [remoteReady, setRemoteReady] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSaveError = useCallback(() => setSaveError(null), []);

  const persistRemote = useCallback(
    async (next: SiteConfig) => {
      if (!apiOnline || !canEditSite) return;
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        const t = await res.text();
        setSaveError(t || res.statusText);
      } else {
        setSaveError(null);
      }
    },
    [apiOnline, canEditSite]
  );

  const scheduleRemotePersist = useCallback(
    (next: SiteConfig) => {
      if (!apiOnline || !canEditSite || !remoteReady) return;
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        persistTimer.current = null;
        void persistRemote(next);
      }, PERSIST_DEBOUNCE_MS);
    },
    [apiOnline, canEditSite, persistRemote, remoteReady]
  );

  useEffect(() => {
    setRemoteReady(false);
    if (!apiOnline) {
      setConfig(loadStoredConfig());
      setRemoteReady(true);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/site-config');
        if (cancelled) return;
        if (!res.ok) {
          setConfig(loadStoredConfig());
          setRemoteReady(true);
          return;
        }
        const data = (await res.json()) as SiteConfig;
        setConfig(mergeSiteConfig(data));
      } catch {
        if (!cancelled) setConfig(loadStoredConfig());
      } finally {
        if (!cancelled) setRemoteReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiOnline]);

  useEffect(() => {
    if (!remoteReady) return;
    if (!apiOnline) {
      persistLocal(config);
    }
  }, [config, remoteReady, apiOnline]);

  const updateConfig = useCallback(
    (partial: Partial<SiteConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...partial };
        if (!apiOnline) {
          persistLocal(next);
        } else {
          scheduleRemotePersist(next);
        }
        return next;
      });
    },
    [apiOnline, scheduleRemotePersist]
  );

  const resetConfig = useCallback(() => {
    if (persistTimer.current) {
      clearTimeout(persistTimer.current);
      persistTimer.current = null;
    }
    setConfig(DEFAULT_SITE_CONFIG);
    if (!apiOnline) {
      persistLocal(DEFAULT_SITE_CONFIG);
    } else if (canEditSite && remoteReady) {
      void persistRemote(DEFAULT_SITE_CONFIG);
    }
  }, [apiOnline, canEditSite, persistRemote, remoteReady]);

  const value = useMemo(
    () => ({
      config,
      remoteReady,
      updateConfig,
      resetConfig,
      saveError,
      clearSaveError,
    }),
    [config, remoteReady, updateConfig, resetConfig, saveError, clearSaveError]
  );

  return (
    <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfigContextValue {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error('useSiteConfig must be used within SiteConfigProvider');
  }
  return ctx;
}
