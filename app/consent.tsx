"use client";

import { createContext, ReactNode, useContext, useMemo, useState, useSyncExternalStore } from "react";

type ConsentPreferences = {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  personalization: boolean;
  version: 1;
  updatedAt: string;
};

type ConsentContextValue = {
  preferences: ConsentPreferences | null;
  openSettings: () => void;
};

const STORAGE_KEY = "reelsave-consent-v1";
const ConsentContext = createContext<ConsentContextValue | null>(null);

function createPreferences(values: Pick<ConsentPreferences, "analytics" | "advertising" | "personalization">): ConsentPreferences {
  return { necessary: true, version: 1, updatedAt: new Date().toISOString(), ...values };
}

function readPreferences(raw: string | null) {
  try {
    const value = JSON.parse(raw ?? "null") as Partial<ConsentPreferences> | null;
    if (!value || value.version !== 1) return null;
    return createPreferences({
      analytics: value.analytics === true,
      advertising: value.advertising === true,
      personalization: value.personalization === true && value.advertising === true,
    });
  } catch {
    return null;
  }
}

function subscribeToConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("reelsave:consent", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("reelsave:consent", callback);
  };
}

function subscribeToHydration() {
  return () => undefined;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const storedPreferences = useSyncExternalStore(
    subscribeToConsent,
    () => localStorage.getItem(STORAGE_KEY),
    () => null,
  );
  const ready = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const preferences = useMemo(() => readPreferences(storedPreferences), [storedPreferences]);

  function save(next: ConsentPreferences) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSettingsOpen(false);
    window.dispatchEvent(new CustomEvent("reelsave:consent", { detail: next }));
  }

  const dialogOpen = ready && (!preferences || settingsOpen);

  return (
    <ConsentContext.Provider value={{ preferences, openSettings: () => setSettingsOpen(true) }}>
      {children}
      {dialogOpen && (
        <ConsentDialog
          initial={preferences}
          managing={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSave={save}
        />
      )}
    </ConsentContext.Provider>
  );
}

function ConsentDialog({ initial, managing, onClose, onSave }: {
  initial: ConsentPreferences | null;
  managing: boolean;
  onClose: () => void;
  onSave: (value: ConsentPreferences) => void;
}) {
  const [details, setDetails] = useState(managing);
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false);
  const [advertising, setAdvertising] = useState(initial?.advertising ?? false);
  const [personalization, setPersonalization] = useState(initial?.personalization ?? false);

  function toggleAdvertising(value: boolean) {
    setAdvertising(value);
    if (!value) setPersonalization(false);
  }

  return (
    <div className="consent-backdrop" role="presentation">
      <section className="consent-dialog" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <div className="consent-mark" aria-hidden="true">↓</div>
        <h2 id="consent-title">Your privacy choices</h2>
        <p>ReelSave uses essential browser storage to remember your choices. With your permission, advertising partners may store or access device information to deliver and measure ads.</p>

        {details ? (
          <div className="consent-options">
            <ConsentOption title="Necessary" description="Required for privacy choices and core site functions." checked disabled onChange={() => undefined} />
            <ConsentOption title="Analytics" description="Helps us understand site usage and improve reliability." checked={analytics} onChange={setAnalytics} />
            <ConsentOption title="Advertising" description="Allows advertising scripts to load and measure ads." checked={advertising} onChange={toggleAdvertising} />
            <ConsentOption title="Personalized ads" description="Allows ads to be selected using activity or interests." checked={personalization} disabled={!advertising} onChange={setPersonalization} />
          </div>
        ) : (
          <ul className="consent-summary">
            <li>Advertising and content measurement</li>
            <li>Store or access information on a device</li>
          </ul>
        )}

        <p className="consent-note">You can withdraw consent at any time from Privacy settings. See our <a href="/privacy/">Privacy Policy</a>.</p>
        <div className="consent-actions">
          {details ? (
            <button className="consent-primary" type="button" onClick={() => onSave(createPreferences({ analytics, advertising, personalization }))}>Save choices</button>
          ) : (
            <button className="consent-primary" type="button" onClick={() => onSave(createPreferences({ analytics: true, advertising: true, personalization: true }))}>Accept all</button>
          )}
          <button type="button" onClick={() => onSave(createPreferences({ analytics: false, advertising: false, personalization: false }))}>Reject non-essential</button>
          {!details && <button type="button" onClick={() => setDetails(true)}>Manage options</button>}
          {managing && <button type="button" onClick={onClose}>Cancel</button>}
        </div>
      </section>
    </div>
  );
}

function ConsentOption({ title, description, checked, disabled = false, onChange }: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={`consent-option ${disabled ? "disabled" : ""}`}>
      <span><strong>{title}</strong><small>{description}</small></span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent must be used inside ConsentProvider");
  return context;
}

export function ConsentSettingsButton() {
  const { openSettings } = useConsent();
  return <button className="privacy-settings" type="button" onClick={openSettings}>Privacy settings</button>;
}
