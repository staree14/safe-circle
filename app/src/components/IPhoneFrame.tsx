import { useEffect, useState } from "react";

export function IPhoneStatusBar() {
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, "0");
      // 12-hour format or standard iOS style
      h = h % 12 || 12;
      setTime(`${h}:${m}`);
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ios-status-bar" aria-hidden="true">
      {/* Left: Clock */}
      <span className="ios-time">{time}</span>

      {/* Center: Dynamic Island (camera cutout) */}
      <div className="dynamic-island">
        <span className="island-sensor" />
        <span className="island-camera" />
      </div>

      {/* Right: Signal, Wi-Fi, Battery */}
      <div className="ios-status-icons">
        {/* Cellular signal bars */}
        <svg className="ios-signal" width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="8" width="3" height="3" rx="0.8" />
          <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.8" />
          <rect x="9" y="3" width="3" height="8" rx="0.8" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.8" />
        </svg>

        {/* Wi-Fi icon */}
        <svg className="ios-wifi" width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm-3.8-3a5.4 5.4 0 0 1 7.6 0 .8.8 0 0 1-1.1 1.1 3.8 3.8 0 0 0-5.4 0 .8.8 0 0 1-1.1-1.1Zm-3-3a9.6 9.6 0 0 1 13.6 0 .8.8 0 0 1-1.1 1.1 8 8 0 0 0-11.4 0 .8.8 0 0 1-1.1-1.1Z" />
        </svg>

        {/* Battery pill */}
        <div className="ios-battery">
          <div className="battery-shell">
            <div className="battery-fill" />
          </div>
          <div className="battery-cap" />
        </div>
      </div>
    </div>
  );
}

export function IPhoneHomeIndicator() {
  return (
    <div className="ios-home-indicator" aria-hidden="true">
      <span className="home-bar" />
    </div>
  );
}
