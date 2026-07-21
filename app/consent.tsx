"use client";

import { ReactNode, useEffect, useState } from "react";

type TcfData = {
  eventStatus?: string;
  gdprApplies?: boolean;
  listenerId?: number;
  purpose?: { consents?: Record<string, boolean> };
};

type ConsentPreferences = {
  advertising: boolean;
  analytics: boolean;
  personalization: boolean;
};

type TcfApi = (
  command: "addEventListener" | "removeEventListener",
  version: number,
  callback: (data: TcfData, success: boolean) => void,
  parameter?: number,
) => void;

type GoogleFc = {
  callbackQueue?: Array<Record<string, () => void> | (() => void)>;
  showRevocationMessage?: () => void;
};

declare global {
  interface Window {
    __tcfapi?: TcfApi;
    googlefc?: GoogleFc;
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useConsent() {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);

  useEffect(() => {
    let listenerId: number | undefined;

    function listen() {
      window.__tcfapi?.("addEventListener", 2, (data, success) => {
        if (!success) return;
        listenerId = data.listenerId;

        if (data.gdprApplies === false) {
          setPreferences({ advertising: true, analytics: true, personalization: true });
          return;
        }

        if (data.gdprApplies !== true || !["tcloaded", "useractioncomplete"].includes(data.eventStatus ?? "")) return;
        const purposes = data.purpose?.consents ?? {};
        setPreferences({
          advertising: purposes["1"] === true && purposes["2"] === true,
          personalization: purposes["1"] === true && purposes["3"] === true && purposes["4"] === true,
          analytics: purposes["1"] === true && purposes["7"] === true,
        });
      });
    }

    window.googlefc = window.googlefc ?? {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue ?? [];
    window.googlefc.callbackQueue.push({ CONSENT_API_READY: listen });
    listen();

    return () => {
      if (listenerId !== undefined) window.__tcfapi?.("removeEventListener", 2, () => undefined, listenerId);
    };
  }, []);

  return { preferences };
}

export function ConsentSettingsButton() {
  function openSettings() {
    window.googlefc = window.googlefc ?? {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue ?? [];
    if (window.googlefc.showRevocationMessage) {
      window.googlefc.showRevocationMessage();
    } else {
      window.googlefc.callbackQueue.push(() => window.googlefc?.showRevocationMessage?.());
    }
  }

  return <button className="privacy-settings" type="button" onClick={openSettings}>Privacy and cookie settings</button>;
}
