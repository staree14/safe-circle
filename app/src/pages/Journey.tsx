import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MapView, { type MapMarker } from "../components/MapView";
import { Avatar, Button, Chip, Confirm, DemoTag, EmptyState, Field, Icon, Notice, Sheet, TopBar } from "../components/ui";
import { DEMO_CENTER, DEMO_CENTER_LABEL, MODES, geocode, getRoute, pointAlong, useInterval, useLocation, useOnline, type GeoResult, type LatLng, type RouteInfo, type TravelMode } from "../lib/geo";
import { useStore } from "../store";
import { SafeSpotModal, type SafeSpotItem } from "../components/SafeSpotModal";

const fmtClock = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

export const NEARBY_SAFE_SPOTS: SafeSpotItem[] = [
  {
    id: "spot-mall-1",
    name: "Garuda Shopping Mall & Complex",
    category: "mall",
    categoryLabel: "Shopping Complex",
    icon: "🛍️",
    kind: "safe_mall",
    pos: [12.9715, 77.6105],
    distance: "320m",
    walkMin: 4,
    address: "Magrath Road, Ashok Nagar",
    crowdLevel: "Crowded Area (500+ footfall)",
    safetyHighlights: [
      "High public crowd & well-lit concourse",
      "24/7 Uniformed security guards at all gates",
      "Full CCTV coverage across exterior corridors",
      "Help desk with emergency phone access",
    ],
    phone: "080-40698888",
    desc: "Vibrant shopping mall with active public crowds, multiple staffed entrances, security desks, and brightly lit corridors.",
  },
  {
    id: "spot-police-1",
    name: "Cubbon Park Police Assistance Station",
    category: "police",
    categoryLabel: "Police Station",
    icon: "👮",
    kind: "safe_police",
    pos: [12.9754, 77.6075],
    distance: "250m",
    walkMin: 3,
    address: "Kasturba Road / Cubbon Park Outpost",
    crowdLevel: "High Authority & Patrols",
    safetyHighlights: [
      "24/7 Armed officer front desk",
      "Dedicated Women Safety Assistance Officer",
      "Immediate police vehicle patrol dispatch",
      "Direct emergency hotline 112 terminal",
    ],
    phone: "112",
    desc: "Official round-the-clock police station with dedicated women safety desk, armed guards, and direct emergency patrol response.",
  },
  {
    id: "spot-bus-1",
    name: "Shivajinagar Central Bus Terminus",
    category: "bus",
    categoryLabel: "Bus Stop & Depot",
    icon: "🚏",
    kind: "safe_bus",
    pos: [12.9835, 77.6042],
    distance: "480m",
    walkMin: 6,
    address: "Shivajinagar Transit Depot",
    crowdLevel: "Continuous Public Transit",
    safetyHighlights: [
      "Constantly crowded public bus platform",
      "24-hour BMTC night bus operations",
      "Transit security officers on patrol",
      "CCTV surveillance cameras throughout",
    ],
    phone: "080-22952522",
    desc: "Major bustling transit terminal with frequent public buses, high commuter presence, transit security, and bright floodlighting.",
  },
  {
    id: "spot-metro-1",
    name: "MG Road Metro Transit Station",
    category: "metro",
    categoryLabel: "Metro Transit",
    icon: "🚇",
    kind: "safe_metro",
    pos: [12.9756, 77.6068],
    distance: "390m",
    walkMin: 5,
    address: "MG Road Boulevard Metro Entrance",
    crowdLevel: "Continuous Passenger Traffic",
    safetyHighlights: [
      "CISF security guards & baggage scanners",
      "Complete CCTV surveillance on all levels",
      "Emergency passenger help points on platforms",
      "Well-patrolled entrance with high visibility",
    ],
    phone: "1800-425-12345",
    desc: "Guarded rapid transit station featuring CISF security personnel, baggage scanners, emergency contact points, and high foot traffic.",
  },
  {
    id: "spot-pharmacy-1",
    name: "Apollo 24/7 Pharmacy & Store",
    category: "pharmacy",
    categoryLabel: "24/7 Store",
    icon: "💊",
    kind: "safe_pharmacy",
    pos: [12.9732, 77.6120],
    distance: "450m",
    walkMin: 5,
    address: "Residency Road junction",
    crowdLevel: "Staffed & Brightly Lit",
    safetyHighlights: [
      "Open 24 hours non-stop (night staff on duty)",
      "Uniformed security guard at the door",
      "High-lumen storefront illumination",
      "Direct emergency phone available",
    ],
    phone: "1860-500-0101",
    desc: "Always-open commercial pharmacy with multiple staff members on the floor, bright LED street lighting, and a night guard.",
  },
  {
    id: "spot-hospital-1",
    name: "Bowring Emergency Hospital",
    category: "hospital",
    categoryLabel: "Emergency Hospital",
    icon: "🏥",
    kind: "safe_hospital",
    pos: [12.9698, 77.6105],
    distance: "620m",
    walkMin: 8,
    address: "Hospital Road, Tasker Town",
    crowdLevel: "Medical & Guarded Authority",
    safetyHighlights: [
      "24/7 Staffed Emergency Trauma Ward",
      "Guarded entry gates with active security",
      "Immediate medical & triage personnel",
      "Round-the-clock ambulance service",
    ],
    phone: "080-25591325",
    desc: "Government hospital with 24/7 active emergency admissions, secure gates, security personnel, and paramedics available.",
  },
];

export function JourneySetup() {
  const nav = useNavigate();
  const { contacts, places, journey, setJourney, toast } = useStore();
  const online = useOnline();
  const loc = useLocation();
  const [start, setStart] = useState<{ label: string; pos: LatLng }>({ label: DEMO_CENTER_LABEL, pos: DEMO_CENTER });
  const [dest, setDest] = useState<{ label: string; pos: LatLng } | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [mode, setMode] = useState<TravelMode>("walking");
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routing, setRouting] = useState(false);
  const [pick, setPick] = useState(false);
  const [showSafeSpots, setShowSafeSpots] = useState(true);
  const [share, setShare] = useState<string[]>(() => contacts.filter((c) => c.journeyAlerts).map((c) => c.id));
  const [interval, setIntervalMin] = useState(15);
  const [center, setCenter] = useState<LatLng>(DEMO_CENTER);
  const [selectedSpot, setSelectedSpot] = useState<SafeSpotItem | null>(null);
  const [spotFilter, setSpotFilter] = useState<string>("all");

  useEffect(() => {
    if (loc.status === "ok" && loc.pos) { setStart({ label: "Current location (GPS)", pos: loc.pos }); setCenter(loc.pos); }
  }, [loc.status, loc.pos]);

  useEffect(() => {
    if (!dest) { setRoute(null); return; }
    const ac = new AbortController(); setRouting(true);
    getRoute(start.pos, dest.pos, mode, ac.signal).then((r) => { setRoute(r); setRouting(false); }).catch((e) => { if (e.name !== "AbortError") setRouting(false); });
    return () => ac.abort();
  }, [start.pos, dest, mode]);

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true); setSearchErr(""); setResults([]);
    try { const r = await geocode(query.trim()); setResults(r); if (!r.length) setSearchErr("No matches. Try a fuller address or drop a pin on the map."); }
    catch { setSearchErr(online ? "Address search is unavailable right now. You can drop a pin on the map instead." : "You're offline. Drop a pin on the map or choose a saved place."); }
    setSearching(false);
  };
  const choose = (label: string, pos: LatLng) => { setDest({ label, pos }); setQuery(label); setResults([]); setPick(false); };
  
  const filteredSpots = useMemo(() => {
    if (spotFilter === "all") return NEARBY_SAFE_SPOTS;
    return NEARBY_SAFE_SPOTS.filter((s) => s.category === spotFilter);
  }, [spotFilter]);

  const safeSpotMarkers: MapMarker[] = showSafeSpots
    ? NEARBY_SAFE_SPOTS.map((s) => ({
        pos: s.pos,
        kind: s.kind,
        label: `${s.name} (${s.categoryLabel})`,
        safeSpotId: s.id,
      }))
    : [];

  const markers: MapMarker[] = [
    { pos: start.pos, kind: loc.status === "ok" ? "me" : "demo", label: start.label },
    ...(dest ? [{ pos: dest.pos, kind: "dest" as const, label: dest.label }] : []),
    ...safeSpotMarkers,
  ];
  const eta = route ? new Date(Date.now() + route.etaMin * 60000) : null;

  const handleMarkerClick = (m: MapMarker) => {
    if (m.safeSpotId) {
      const found = NEARBY_SAFE_SPOTS.find((s) => s.id === m.safeSpotId);
      if (found) {
        setSelectedSpot(found);
        setCenter(found.pos);
      }
    }
  };

  const handleRouteToSpot = (spot: SafeSpotItem) => {
    choose(spot.name, spot.pos);
    setSelectedSpot(null);
    setCenter(spot.pos);
    toast(`Routing safe walking path to ${spot.name}`);
  };

  const begin = () => {
    if (!dest || !route) return;
    setJourney({ active: true, startLabel: start.label, start: start.pos, destLabel: dest.label, dest: dest.pos, mode, route, startedAt: new Date().toISOString(), interval, shareWith: share, status: "on-track", lastCheckIn: new Date().toISOString() });
    toast("Safe journey started (demo: contacts are not actually notified)");
    nav("/journey/active");
  };

  return (
    <div className="page flush">
      <TopBar title="Safe Journey & Shelters" back="/" right={<span className="icon-btn ghost" title="Location is only used when you tap locate"><Icon name="lock" size={19} /></span>} />
      <div className="journey-map">
        <MapView center={center} markers={markers} route={route?.path} routeEstimated={route?.estimated}
          onPick={pick ? (p) => choose(`Dropped pin (${p[0].toFixed(4)}, ${p[1].toFixed(4)})`, p) : undefined}
          onMarkerClick={handleMarkerClick}
          onLocate={() => { loc.request(); setCenter(loc.pos ?? DEMO_CENTER); }} locStatus={loc.status} height="100%"
          note={loc.status === "ok" ? "Live GPS · Tap any safe spot pin to view & navigate" : "Tap safe spots (Mall, Police, Bus Stop) to view & route"} />
        <div className="float-fields">
          <div className="float-field"><Icon name="pin" size={20} /><input aria-label="Start location" value={start.label} readOnly /><button type="button" className="mini" onClick={() => { loc.request(); }} aria-label="Use my current location"><Icon name="locate" size={18} /></button></div>
          <form className="float-field" onSubmit={(e) => { e.preventDefault(); void search(); }}>
            <Icon name="map" size={20} /><input aria-label="Destination" placeholder="Search destination" value={query} onChange={(e) => setQuery(e.target.value)} />
            {query ? <button type="button" className="mini" aria-label="Clear destination" onClick={() => { setQuery(""); setDest(null); setResults([]); }}><Icon name="x" size={17} /></button> : <button type="submit" className="mini" aria-label="Search"><Icon name="search" size={18} /></button>}
          </form>
          <div className="float-row">
            <label className="mode-select"><span className="sr">Travel mode</span><select value={mode} onChange={(e) => setMode(e.target.value as TravelMode)}>{MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select><Icon name="down" size={16} /></label>
            <button type="button" className={`pick-btn ${pick ? "on" : ""}`} onClick={() => setPick(!pick)} aria-pressed={pick}><Icon name="pin" size={16} />{pick ? "Tap map…" : "Pick"}</button>
            <button type="button" className={`pick-btn ${showSafeSpots ? "safe-on" : ""}`} onClick={() => setShowSafeSpots(!showSafeSpots)} aria-pressed={showSafeSpots} title="Toggle safe shelters & police stations"><Icon name="shield" size={15} />{showSafeSpots ? "Safe spots" : "Shelters"}</button>
          </div>
          {(results.length > 0 || searching || searchErr) && (
            <ul className="suggest" role="listbox">
              {searching && <li className="muted"><span className="spinner" /> Searching…</li>}
              {searchErr && <li className="err">{searchErr}</li>}
              {results.map((r) => <li key={r.label}><button type="button" onClick={() => choose(r.label.split(",").slice(0, 3).join(","), r.pos)}><Icon name="pin" size={16} />{r.label}</button></li>)}
            </ul>
          )}
        </div>
      </div>

      <div className="panel">
        {journey?.active && <Notice tone="info">A journey is already in progress. <Link className="link" to="/journey/active">Resume it</Link>. Starting a new one replaces it.</Notice>}

        {/* Nearby Safe Havens Section */}
        <div className="safe-havens-section">
          <div className="safe-havens-head">
            <div className="safe-head-title">
              <span className="safe-shield-badge">🛡️</span>
              <div>
                <b>Clickable Safe Spots &amp; Havens</b>
                <small>Shopping malls, police, bus stops &amp; crowded zones</small>
              </div>
            </div>
            <span className="safe-count-pill">{filteredSpots.length} verified</span>
          </div>

          {/* Category Filter Chips */}
          <div className="safe-filter-chips" role="tablist" aria-label="Safe spot category filters">
            {[
              { id: "all", label: "All Safe Spots", icon: "✨" },
              { id: "mall", label: "Malls & Crowds", icon: "🛍️" },
              { id: "police", label: "Police Post", icon: "👮" },
              { id: "bus", label: "Bus Stops", icon: "🚏" },
              { id: "metro", label: "Metro Hubs", icon: "🚇" },
              { id: "pharmacy", label: "24/7 Stores", icon: "💊" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`safe-filter-chip ${spotFilter === cat.id ? "active" : ""}`}
                onClick={() => setSpotFilter(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Safe Spots Horizontal Cards Carousel */}
          <div className="safe-spots-carousel" role="region" aria-label="Nearby safe spots carousel">
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                className="safe-spot-card"
                onClick={() => {
                  setSelectedSpot(spot);
                  setCenter(spot.pos);
                }}
              >
                <div className="spot-card-top">
                  <span className={`spot-card-ico spot-cat-${spot.category}`}>{spot.icon}</span>
                  <span className="spot-card-dist">{spot.distance} · ~{spot.walkMin}m</span>
                </div>
                <b className="spot-card-name">{spot.name}</b>
                <div className="spot-card-meta">
                  <span className="spot-crowd-badge">👥 {spot.crowdLevel}</span>
                </div>
                <button
                  type="button"
                  className="spot-card-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRouteToSpot(spot);
                  }}
                  title="Route directly to this safe haven"
                >
                  <Icon name="route" size={14} />
                  <span>Route here</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="chip-scroll" aria-label="Saved places">
          {places.filter((p) => p.pos).map((p) => <button key={p.id} type="button" className="place-chip" onClick={() => choose(p.label, p.pos!)}><Icon name="pin" size={15} />{p.label}</button>)}
          <Link to="/places" className="place-chip add"><Icon name="plus" size={15} />Places</Link>
        </div>

        <div className="eta-row">
          <div><small>ESTIMATED ARRIVAL</small><b>{routing ? "Calculating…" : eta ? fmtClock(eta) : "Choose a destination"}</b></div>
          {route && !routing && <div className="right"><b>{route.etaMin} min</b><small>{route.distanceKm.toFixed(1)} km · {MODES.find((m) => m.id === mode)!.label}</small></div>}
        </div>
        {route?.estimated && <Notice tone="warn">Routing service unavailable. Showing an estimated straight line, so the time is approximate.</Notice>}
        <div className="field"><label>Share with <small>(they'd see your journey when it starts)</small></label>
          <div className="share-row">{contacts.map((c) => { const on = share.includes(c.id); return <button type="button" key={c.id} className={`share-pick ${on ? "on" : ""}`} aria-pressed={on} onClick={() => setShare(on ? share.filter((x) => x !== c.id) : [...share, c.id])}><Avatar name={c.name} size={42} /><span>{c.name.split(" ")[0]}</span>{on && <i><Icon name="check" size={11} /></i>}</button>; })}
            <Link to="/contacts" className="share-pick add"><span className="avatar add"><Icon name="plus" size={18} /></span><span>Add</span></Link></div></div>
        <Field label="Check-in interval" htmlFor="ci"><select id="ci" className="input" value={interval} onChange={(e) => setIntervalMin(+e.target.value)}>{[10, 15, 30, 60].map((m) => <option key={m} value={m}>Every {m} minutes</option>)}</select></Field>
        <Button full icon="route" disabled={!dest || !route || routing} onClick={begin}>Start Safe Journey</Button>
        <p className="tiny center"><DemoTag>Demo</DemoTag> Contacts are not messaged in this prototype.</p>
      </div>

      {/* Interactive Safe Spot Detail Sheet */}
      <SafeSpotModal
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        onNavigate={handleRouteToSpot}
      />
    </div>
  );
}

export function ActiveJourney() {
  const nav = useNavigate();
  const { journey, patchJourney, setJourney, contacts, toast } = useStore();
  const loc = useLocation();
  const [now, setNow] = useState(Date.now());
  const [end, setEnd] = useState(false);
  const [help, setHelp] = useState(false);
  const [sim, setSim] = useState(0);
  const simRef = useRef(0);
  useInterval(() => setNow(Date.now()), 1000);
  useInterval(() => { simRef.current = Math.min(1, simRef.current + 0.015); setSim(simRef.current); }, 2000);
  useInterval(() => {
    if (!journey || journey.status !== "on-track") return;
    const due = new Date(journey.lastCheckIn ?? journey.startedAt).getTime() + journey.interval * 60000;
    if (Date.now() > due) patchJourney({ status: "checkin-due" });
  }, 5000);

  const pos = useMemo<LatLng | undefined>(() => (journey ? (loc.status === "ok" && loc.pos ? loc.pos : pointAlong(journey.route.path, sim)) : undefined), [journey, loc.status, loc.pos, sim]);
  if (!journey?.active) return <div className="page"><TopBar title="Active journey" back="/" /><EmptyState icon="route" title="No journey in progress" text="Plan a route and share it with people you trust." action={<Button to="/journey" icon="route">Start a Safe Journey</Button>} /></div>;

  const arrive = new Date(new Date(journey.startedAt).getTime() + journey.route.etaMin * 60000);
  const remaining = Math.max(0, Math.round((arrive.getTime() - now) / 60000));
  const sharing = contacts.filter((c) => journey.shareWith.includes(c.id));
  const next = new Date(new Date(journey.lastCheckIn ?? journey.startedAt).getTime() + journey.interval * 60000);
  const st = journey.status;
  const checkIn = () => { patchJourney({ status: "on-track", lastCheckIn: new Date().toISOString() }); toast("Checked in. Recorded on this device"); };
  const finish = (msg: string) => { setJourney(null); toast(msg); nav("/"); };

  return (
    <div className="page flush">
      <TopBar title="Journey in progress" back="/" right={<Chip tone={st === "overdue" ? "red" : st === "checkin-due" ? "amber" : "sage"}>{st === "overdue" ? "Overdue" : st === "checkin-due" ? "Check-in due" : "On track"}</Chip>} />
      <div className="journey-map short">
        <MapView markers={[{ pos: journey.start, kind: "start" }, { pos: journey.dest, kind: "dest", label: journey.destLabel }, ...(pos ? [{ pos, kind: loc.status === "ok" ? ("me" as const) : ("demo" as const) }] : [])]} route={journey.route.path} routeEstimated={journey.route.estimated} height="100%"
          onLocate={loc.request} locStatus={loc.status} note={loc.status === "ok" ? "Live position (this device)" : "Simulated position (demo)"} />
      </div>
      <div className="panel">
        {st === "overdue" && <Notice tone="error" icon="alert"><b>Check-in overdue.</b> In the full product your contacts would be alerted now. <DemoTag>Demo: nothing was sent</DemoTag></Notice>}
        {st === "checkin-due" && <Notice tone="warn" icon="clock"><b>Time to check in.</b> Let your circle know you're okay.</Notice>}
        <div className="eta-card"><div><small>ARRIVING AT</small><b>{fmtClock(arrive)}</b><span>{journey.destLabel.split(",")[0]}</span></div><strong>{remaining} min</strong></div>
        <Button full icon="check" variant={st === "on-track" ? "sage" : "primary"} onClick={checkIn}>I'm safe: check in</Button>
        {st !== "on-track" && <Button full variant="danger" icon="alert" onClick={() => setHelp(true)}>I need help</Button>}
        <div className="info-row"><Icon name="clock" size={18} /><span>Next check-in around <b>{fmtClock(next)}</b> (every {journey.interval} min)</span></div>
        <h2 className="mt">Sharing with</h2>
        <div className="stack-sm">
          {sharing.length === 0 && <p className="muted">You're not sharing this journey with anyone.</p>}
          {sharing.map((c) => <div className="row-card plain" key={c.id}><Avatar name={c.name} size={40} /><div className="grow"><b>{c.name}</b><small>{c.relation}</small></div><Chip tone="grey" icon="info">Demo: not notified</Chip></div>)}
        </div>
        <div className="demo-controls"><small>DEMO CONTROLS</small><div><button type="button" onClick={() => patchJourney({ status: "checkin-due" })}>Simulate check-in due</button><button type="button" onClick={() => patchJourney({ status: "overdue" })}>Simulate overdue</button></div></div>
        <div className="two"><Button variant="secondary" icon="check" onClick={() => finish("Arrived safely. Journey ended")}>I've arrived</Button><Button variant="secondary" icon="x" onClick={() => setEnd(true)}>End Journey</Button></div>
      </div>
      <Confirm open={end} onClose={() => setEnd(false)} title="End this journey?" text="Sharing stops and your route is no longer followed." confirmLabel="End Journey" onConfirm={() => finish("Journey ended")} />
      <Sheet open={help} onClose={() => setHelp(false)} title="Need help?" footer={<><Button variant="secondary" onClick={() => setHelp(false)}>Not now</Button><Button variant="danger" to="/sos">Go to SOS</Button></>}><p className="muted">SOS creates an incident record and starts the alert flow (simulated in this prototype). If you're in immediate danger, call your local emergency number (112 in India).</p></Sheet>
    </div>
  );
}
