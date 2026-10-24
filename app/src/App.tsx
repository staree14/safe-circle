import { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { BottomNav, Icon } from "./components/ui";
import { IPhoneHomeIndicator, IPhoneStatusBar } from "./components/IPhoneFrame";
import { CalculatorDecoy } from "./components/CalculatorDecoy";
import { useOnline } from "./lib/geo";
import { useStore } from "./store";
import Home, { Notifications, Sos } from "./pages/Home";
import { ActiveJourney, JourneySetup } from "./pages/Journey";
import { ReportChoose, ReportForm, ReportSaved } from "./pages/Report";
import { EvidenceDetail, Vault } from "./pages/Vault";
import Capture from "./pages/Capture";
import { Contacts, IncidentDetail, Incidents, Places } from "./pages/People";
import Profile from "./pages/Profile";

const HIDE_NAV = [/^\/sos/, /^\/report\/new/, /^\/capture/];

export default function App() {
  const { pathname } = useLocation();
  const { toastMsg, decoyActive, setDecoyActive } = useStore();
  const online = useOnline();
  const screen = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    screen.current?.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    const on = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      setTyping(
        ["INPUT", "TEXTAREA"].includes(t.tagName) &&
          !["checkbox", "file", "radio"].includes((t as HTMLInputElement).type)
      );
    };
    const off = () => setTyping(false);
    document.addEventListener("focusin", on);
    document.addEventListener("focusout", off);
    return () => {
      document.removeEventListener("focusin", on);
      document.removeEventListener("focusout", off);
    };
  }, []);

  const showNav = !HIDE_NAV.some((r) => r.test(pathname)) && !typing && !decoyActive;
  const isDarkPage = pathname.startsWith("/sos") || decoyActive;

  return (
    <div className="phone-stage">
      {/* Phone chassis with physical frame and volume/power buttons */}
      <div className={`phone-chassis ${isDarkPage ? "theme-dark" : "theme-light"}`}>
        {/* Hardware buttons on phone border */}
        <div className="phone-btn btn-action" title="Action Button" />
        <div className="phone-btn btn-vol-up" title="Volume Up" />
        <div className="phone-btn btn-vol-down" title="Volume Down" />
        <div className="phone-btn btn-power" title="Power Button" />

        {/* Screen inner area */}
        <div className="phone-viewport">
          <a href="#main" className="skip">
            Skip to content
          </a>

          {/* Top iOS Status Bar with Dynamic Island camera cutout */}
          <IPhoneStatusBar />

          {decoyActive ? (
            <CalculatorDecoy onUnlock={() => setDecoyActive(false)} />
          ) : (
            <>
              {!online && (
                <div className="offline-bar" role="status">
                  <Icon name="wifioff" size={16} />
                  You're offline. Saved data still works; maps need a connection.
                </div>
              )}

              {/* Scrollable Screen Content */}
              <main className="screen-scroll" ref={screen} id="main" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sos" element={<Sos />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/journey" element={<JourneySetup />} />
              <Route path="/journey/active" element={<ActiveJourney />} />
              <Route path="/report" element={<ReportChoose />} />
              <Route path="/report/new" element={<ReportForm />} />
              <Route path="/report/saved/:id" element={<ReportSaved />} />
              <Route path="/vault" element={<Vault />} />
              <Route path="/vault/:id" element={<EvidenceDetail />} />
              <Route path="/capture" element={<Capture />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/places" element={<Places />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/incident/:id" element={<IncidentDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="*"
                element={
                  <div className="page center-page">
                    <h1>Page not found</h1>
                    <Link className="link" to="/">
                      Back to home
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>

          {/* Bottom navigation bar */}
          {showNav && <BottomNav />}
            </>
          )}

          {/* Bottom iOS Home Indicator */}
          <IPhoneHomeIndicator />

          {/* Floating Toast notification */}
          <div
            className={`toast ${toastMsg ? "show" : ""}`}
            role="status"
            aria-live="polite"
          >
            {toastMsg}
          </div>
        </div>
      </div>
    </div>
  );
}
