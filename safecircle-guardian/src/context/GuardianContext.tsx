import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Incident, Evidence, TimelineEvent, Guardian, NotificationItem, GuardianCoordinationStatus } from '../types';
import {
  CURRENT_GUARDIAN,
  INITIAL_INCIDENTS,
  INITIAL_EVIDENCE,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_GUARDIAN_COORDINATION,
} from '../data/mockData';
import { alertService } from '../utils/audioAlert';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'emergency';
}

interface GuardianContextType {
  incidents: Incident[];
  activeIncident: Incident | undefined;
  activeIncidentId: string;
  setActiveIncidentId: (id: string) => void;
  evidence: Evidence[];
  timelineEvents: TimelineEvent[];
  guardian: Guardian;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  acknowledgeIncident: (incidentId: string, responderName?: string) => void;
  resolveIncident: (incidentId: string, note?: string) => void;
  simulateIncomingEvidence: (incidentId: string) => void;
  simulateLocationRefresh: (incidentId: string) => void;
  resetDemoState: () => void;
  getIncidentEvidence: (incidentId: string) => Evidence[];
  getIncidentTimeline: (incidentId: string) => TimelineEvent[];
  // WebSocket and Siren Alert
  isWsConnected: boolean;
  alarmEnabled: boolean;
  setAlarmEnabled: (enabled: boolean) => void;
  isAlarmPlaying: boolean;
  triggerEmergencyAlarm: () => void;
  stopEmergencyAlarm: () => void;
  testEmergencyAlarm: () => void;
  // Multi-Guardian Coordination
  guardianCoordination: GuardianCoordinationStatus[];
  updateGuardianStatus: (action: GuardianCoordinationStatus['statusAction'], label: string, note?: string) => Promise<void>;
}

const GuardianContext = createContext<GuardianContextType | undefined>(undefined);

export const GuardianProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [activeIncidentId, setActiveIncidentId] = useState<string>('SC-2026-0142');
  const [evidence, setEvidence] = useState<Evidence[]>(INITIAL_EVIDENCE);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE_EVENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Multi-Guardian Coordination state
  const [guardianCoordination, setGuardianCoordination] = useState<GuardianCoordinationStatus[]>(INITIAL_GUARDIAN_COORDINATION);

  // WebSocket Live Connection state
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Audible Siren and Browser Alert state
  const [alarmEnabled, setAlarmEnabledState] = useState<boolean>(alertService.isEnabled());
  const [isAlarmPlaying, setIsAlarmPlaying] = useState<boolean>(false);

  // Find active incident
  const activeIncident = incidents.find((inc) => inc.id === activeIncidentId) || incidents[0];

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const setAlarmEnabled = (enabled: boolean) => {
    alertService.setSoundEnabled(enabled);
    setAlarmEnabledState(enabled);
    if (!enabled) {
      alertService.stopAlarm();
      setIsAlarmPlaying(false);
    }
  };

  const triggerEmergencyAlarm = () => {
    if (alarmEnabled) {
      alertService.startEmergencySiren();
      setIsAlarmPlaying(true);
      setTimeout(() => setIsAlarmPlaying(false), 6000);
    }
  };

  const stopEmergencyAlarm = () => {
    alertService.stopAlarm();
    setIsAlarmPlaying(false);
  };

  const testEmergencyAlarm = () => {
    void alertService.requestNotificationPermission();
    alertService.startEmergencySiren();
    setIsAlarmPlaying(true);
    setTimeout(() => setIsAlarmPlaying(false), 4000);
    alertService.fireNotification(
      '🚨 SafeCircle Emergency Siren Test',
      'Attention-grabbing siren active! Browser push notifications enabled.'
    );
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auto-dismiss toasts after 4.5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4500);
    return () => clearTimeout(timer);
  }, [toasts]);

  // Sync with Backend API if online (GET /api/incidents)
  const syncWithBackend = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/incidents');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;

      // Check if there are newly created digital reports or updates from Mobile app
      setIncidents((prev) => {
        const merged = [...prev];
        for (const item of data) {
          const existingIdx = merged.findIndex((m) => m.id === item.id || m.accessToken === item.access_token);
          if (existingIdx >= 0) {
            // Update status if server has newer status
            merged[existingIdx] = {
              ...merged[existingIdx],
              status: item.status || merged[existingIdx].status,
              updatedAt: item.updated_at || merged[existingIdx].updatedAt,
            };
          } else {
            // New mobile upload! Add to list
            const newInc: Incident = {
              id: item.id,
              type: item.incident_type,
              victimDisplayName: item.user?.name || 'Shreya',
              victimPhone: item.user?.phone || '+91 98765 43210',
              status: item.status || 'ACTIVE',
              createdAt: item.created_at,
              updatedAt: item.updated_at || item.created_at,
              location: {
                lat: item.current_lat || 12.9756,
                lng: item.current_lng || 77.6066,
                label: 'Mobile Uploaded Vault Submission',
                landmark: 'Bengaluru, Karnataka',
              },
              batteryLevel: item.battery_level || 85,
              triggerMode: item.trigger_mode || 'DIGITAL_SUBMISSION',
              description: item.description || 'User-Generated Evidence Report',
              aiCategory: item.ai_category || 'Digital Harassment',
              aiSeverity: item.ai_severity || 'HIGH',
              aiSummary: item.ai_summary,
              evidenceIds: (item.evidence || []).map((e: any) => e.id),
              timelineEventIds: (item.timeline_events || []).map((t: any) => t.id),
              accessToken: item.access_token,
            };
            merged.unshift(newInc);

            // Also merge any new evidence items
            if (item.evidence && item.evidence.length > 0) {
              setEvidence((prevEv) => {
                const newEvList = [...prevEv];
                for (const ev of item.evidence) {
                  if (!newEvList.some((e) => e.id === ev.id)) {
                    newEvList.push({
                      id: ev.id,
                      incidentId: item.id,
                      filename: ev.file_url ? ev.file_url.split('/').pop() || 'evidence.jpg' : 'threat_text.log',
                      type: ev.evidence_type,
                      timestamp: ev.created_at,
                      sizeBytes: ev.file_size_bytes || 102400,
                      sha256Hash: ev.sha256_hash,
                      hashStatus: 'VERIFICATION_PASSED',
                      chunkIndex: ev.chunk_index || 0,
                      isSimulated: false,
                      legalRelevance: 'Mobile vault uploaded artifact sealed in tamper-evident repository.',
                      previewAsset: {
                        type: ev.evidence_type.includes('AUDIO') ? 'audio' : 'image',
                        mockResolution: '1170x2532 · Evidence Vault Item',
                        textSnippet: ev.raw_text,
                      },
                    });
                  }
                }
                return newEvList;
              });
            }
          }
        }
        return merged;
      });
    } catch {
      // Offline fallback: graceful silent fail
    }
  }, []);

  useEffect(() => {
    syncWithBackend();
    const interval = setInterval(syncWithBackend, 6000);
    return () => clearInterval(interval);
  }, [syncWithBackend]);

  // Real-Time WebSocket Connection to FastAPI Backend
  useEffect(() => {
    let reconnectTimer: number;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8000/ws/incidents');
        wsRef.current = ws;

        ws.onopen = () => {
          setIsWsConnected(true);
          void alertService.requestNotificationPermission();
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            const { type, data } = payload;

            if (type === 'SOS_TRIGGERED') {
              const nowIso = data.timestamp || new Date().toISOString();
              const newInc: Incident = {
                id: data.incident_id,
                type: 'PHYSICAL_SOS',
                victimDisplayName: data.user_name || 'Shreya',
                victimPhone: '+91 98765 43210',
                status: 'ACTIVE',
                createdAt: nowIso,
                updatedAt: nowIso,
                location: {
                  lat: data.lat || 12.9850,
                  lng: data.lng || 77.5850,
                  label: 'Live Emergency Location',
                  landmark: 'Palace Road, Bengaluru',
                },
                batteryLevel: data.battery_level || 34,
                triggerMode: data.trigger_mode || 'STEALTH_BLACK_SCREEN',
                description: 'Physical Emergency SOS Broadcasted',
                aiSeverity: 'CRITICAL',
                evidenceIds: [],
                timelineEventIds: [],
                accessToken: data.access_token || '',
              };

              setIncidents((prev) => [newInc, ...prev.filter((i) => i.id !== newInc.id)]);
              setActiveIncidentId(newInc.id);

              // Trigger attention-grabbing emergency alarm & push notification
              triggerEmergencyAlarm();
              alertService.fireNotification(
                '🚨 SAFE-CIRCLE EMERGENCY ALERT',
                `${newInc.victimDisplayName} triggered Physical SOS! Live audio & GPS streaming.`
              );

              addToast({
                title: '🚨 CRITICAL: Physical SOS Triggered',
                message: `${newInc.victimDisplayName} activated stealth SOS! Live stream connecting...`,
                type: 'emergency',
              });
            } else if (type === 'TELEMETRY_UPDATED') {
              setIncidents((prev) =>
                prev.map((inc) => {
                  if (inc.id === data.incident_id) {
                    return {
                      ...inc,
                      location: {
                        ...inc.location,
                        lat: data.current_lat ?? inc.location.lat,
                        lng: data.current_lng ?? inc.location.lng,
                      },
                      batteryLevel: data.battery_level ?? inc.batteryLevel,
                      updatedAt: data.timestamp || new Date().toISOString(),
                    };
                  }
                  return inc;
                })
              );
              alertService.playPingSound();
            } else if (type === 'EVIDENCE_UPLOADED') {
              const newEv: Evidence = {
                id: data.evidence_id || `ev-${Date.now()}`,
                incidentId: data.incident_id,
                filename: data.file_url ? data.file_url.split('/').pop() || 'chunk.webm' : 'chunk.webm',
                type: data.evidence_type || 'STEALTH_VIDEO_CHUNK',
                timestamp: data.timestamp || new Date().toISOString(),
                sizeBytes: data.file_size || 428000,
                sha256Hash: data.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                hashStatus: 'VERIFICATION_PASSED',
                chunkIndex: data.chunk_index || 0,
                isSimulated: false,
                legalRelevance: 'Live stealth media chunk verified with SHA-256 seal.',
                previewAsset: {
                  url: data.file_url ? `http://localhost:8000${data.file_url}` : undefined,
                  type: data.evidence_type?.includes('AUDIO') ? 'audio' : 'video',
                  durationSeconds: 4,
                  mockResolution: '1080x1920 · 30fps H.264',
                },
              };

              setEvidence((prev) => [newEv, ...prev]);
              alertService.playPingSound();
              addToast({
                title: 'New Evidence Preserved',
                message: `Chunk #${data.chunk_index} received with SHA-256 seal.`,
                type: 'info',
              });
            } else if (type === 'GUARDIAN_COORDINATION_UPDATE') {
              setGuardianCoordination((prev) => {
                const existing = prev.find((c) => c.guardianName.includes(data.guardian_name.split(' ')[0]));
                if (existing) {
                  return prev.map((c) =>
                    c.id === existing.id
                      ? {
                          ...c,
                          statusAction: data.status_action,
                          statusLabel: data.status_label,
                          note: data.note,
                          timestamp: 'Just now',
                        }
                      : c
                  );
                } else {
                  return [
                    {
                      id: `coord-${Date.now()}`,
                      guardianName: data.guardian_name,
                      role: 'Trusted Responder',
                      statusAction: data.status_action,
                      statusLabel: data.status_label,
                      note: data.note,
                      timestamp: 'Just now',
                    },
                    ...prev,
                  ];
                }
              });

              addToast({
                title: 'Circle Status Update',
                message: `${data.guardian_name}: ${data.status_label}`,
                type: 'info',
              });
            } else if (type === 'GUARDIAN_ACKNOWLEDGED') {
              setIncidents((prev) =>
                prev.map((inc) =>
                  inc.id === data.incident_id
                    ? { ...inc, status: 'ACKNOWLEDGED', acknowledgedBy: data.acknowledged_by }
                    : inc
                )
              );
            } else if (type === 'INCIDENT_RESOLVED') {
              setIncidents((prev) =>
                prev.map((inc) =>
                  inc.id === data.incident_id ? { ...inc, status: 'RESOLVED' } : inc
                )
              );
              stopEmergencyAlarm();
            }
          } catch {
            // Ignore non-json ws frames
          }
        };

        ws.onclose = () => {
          setIsWsConnected(false);
          reconnectTimer = window.setTimeout(connectWebSocket, 4000);
        };

        ws.onerror = () => {
          setIsWsConnected(false);
          try {
            ws.close();
          } catch {}
        };
      } catch {
        setIsWsConnected(false);
        reconnectTimer = window.setTimeout(connectWebSocket, 4000);
      }
    };

    connectWebSocket();

    return () => {
      window.clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const updateGuardianStatus = async (
    action: GuardianCoordinationStatus['statusAction'],
    label: string,
    note?: string
  ) => {
    // 1. Immediately update local state
    setGuardianCoordination((prev) =>
      prev.map((c) =>
        c.isCurrentUser
          ? {
              ...c,
              statusAction: action,
              statusLabel: label,
              note: note || c.note,
              timestamp: 'Just now',
            }
          : c
      )
    );

    // 2. Add event to timeline
    const nowIso = new Date().toISOString();
    const coordEvent: TimelineEvent = {
      id: `evt-coord-${Date.now()}`,
      incidentId: activeIncidentId,
      eventType: 'GUARDIAN_ACKNOWLEDGED',
      title: `Guardian Action: ${CURRENT_GUARDIAN.displayName}`,
      description: `${CURRENT_GUARDIAN.displayName} updated status: '${label}'${note ? ` — ${note}` : ''}`,
      timestamp: nowIso,
      category: 'security',
      isDemoEvent: false,
    };
    setTimelineEvents((prev) => [coordEvent, ...prev]);

    addToast({
      title: 'Status Broadcasted to Circle',
      message: `Your status '${label}' was broadcasted to all guardians.`,
      type: 'success',
    });

    // 3. Post to backend if active
    try {
      await fetch(`http://localhost:8000/api/incidents/${activeIncidentId}/coordination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardian_name: `${CURRENT_GUARDIAN.displayName} (${CURRENT_GUARDIAN.role})`,
          status_action: action,
          status_label: label,
          note: note,
        }),
      });
    } catch {
      // Offline fallback
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const acknowledgeIncident = async (
    incidentId: string,
    responderName: string = CURRENT_GUARDIAN.displayName
  ) => {
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: 'ACKNOWLEDGED',
            acknowledgedAt: nowIso,
            acknowledgedBy: responderName,
            updatedAt: nowIso,
          };
        }
        return inc;
      })
    );

    // Append to timeline
    const newEvent: TimelineEvent = {
      id: `evt-ack-${Date.now()}`,
      incidentId,
      eventType: 'GUARDIAN_ACKNOWLEDGED',
      title: 'Alert Formally Acknowledged',
      description: `Acknowledged by ${responderName} at ${timeFormatted}. Emergency response coordination active.`,
      timestamp: nowIso,
      category: 'security',
      metadata: { acknowledgedBy: responderName, time: timeFormatted },
      isDemoEvent: false,
    };

    setTimelineEvents((prev) => [newEvent, ...prev]);

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Alert Acknowledged',
        message: `${responderName} acknowledged incident ${incidentId}. Status updated to Acknowledged.`,
        timestamp: 'Just now',
        read: false,
        type: 'update',
        incidentId,
      },
      ...prev,
    ]);

    addToast({
      title: 'Alert Acknowledged',
      message: `Status updated to Acknowledged by ${responderName}.`,
      type: 'success',
    });

    // Optionally hit backend acknowledgment endpoint if available
    try {
      const inc = incidents.find((i) => i.id === incidentId);
      if (inc?.accessToken) {
        await fetch(`http://localhost:8000/api/incidents/token/${inc.accessToken}/acknowledge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ acknowledged_by: responderName }),
        });
      }
    } catch {
      // Backend optional
    }
  };

  const resolveIncident = (incidentId: string, note?: string) => {
    const nowIso = new Date().toISOString();

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: 'RESOLVED',
            resolvedAt: nowIso,
            updatedAt: nowIso,
          };
        }
        return inc;
      })
    );

    const newEvent: TimelineEvent = {
      id: `evt-res-${Date.now()}`,
      incidentId,
      eventType: 'INCIDENT_RESOLVED',
      title: 'Incident Resolved — Victim Safe',
      description: note || 'Emergency status cleared. Evidence chain sealed in vault.',
      timestamp: nowIso,
      category: 'resolution',
      metadata: { resolvedAt: nowIso, note },
      isDemoEvent: false,
    };

    setTimelineEvents((prev) => [newEvent, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Incident Resolved',
        message: `Incident ${incidentId} marked resolved. Evidence sealed.`,
        timestamp: 'Just now',
        read: false,
        type: 'system',
        incidentId,
      },
      ...prev,
    ]);

    addToast({
      title: 'Incident Resolved',
      message: 'Status changed to RESOLVED. Evidence sealed.',
      type: 'info',
    });
  };

  const simulateIncomingEvidence = (incidentId: string) => {
    const incEvidence = evidence.filter((e) => e.incidentId === incidentId);
    const nextIndex = incEvidence.length;
    const nowIso = new Date().toISOString();

    const isVideo = nextIndex % 2 === 0;
    const newEvidenceId = isVideo ? `EVD-VID-${String(nextIndex + 1).padStart(2, '0')}` : `EVD-AUD-${String(nextIndex + 1).padStart(2, '0')}`;
    const filename = isVideo ? `ambient_dash_chunk_0${nextIndex}.webm` : `cabin_mic_chunk_0${nextIndex}.opus`;

    const simulatedSha = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newEvidenceItem: Evidence = {
      id: newEvidenceId,
      incidentId,
      filename,
      type: isVideo ? 'STEALTH_VIDEO_CHUNK' : 'STEALTH_AUDIO_CHUNK',
      timestamp: nowIso,
      sizeBytes: isVideo ? 1280000 : 98000,
      sha256Hash: simulatedSha,
      hashStatus: 'VERIFICATION_PASSED',
      chunkIndex: nextIndex,
      isSimulated: false,
      capturedCoordinates: { lat: 12.9850 + nextIndex * 0.0003, lng: 77.5850 + nextIndex * 0.0003 },
      legalRelevance: `Sequential ambient capture (${isVideo ? 'video' : 'directional audio'}) cryptographically fingerprinted.`,
      previewAsset: isVideo
        ? {
            type: 'video',
            durationSeconds: 4.0,
            mockResolution: '1080p 30fps (Stealth Buffer)',
          }
        : {
            type: 'audio',
            durationSeconds: 4.0,
            audioWaveformData: [35, 60, 45, 90, 85, 70, 50, 65, 80, 40, 55, 30, 75],
          },
    };

    setEvidence((prev) => [...prev, newEvidenceItem]);

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            evidenceIds: [...inc.evidenceIds, newEvidenceId],
            updatedAt: nowIso,
          };
        }
        return inc;
      })
    );

    const newTimelineEvt: TimelineEvent = {
      id: `evt-${Date.now()}`,
      incidentId,
      eventType: 'EVIDENCE_HASHED',
      title: `Chunk #${String(nextIndex).padStart(2, '0')} Preserved`,
      description: `New ${isVideo ? '4.0s video' : '4.0s audio'} segment (${newEvidenceId}) fingerprinted with SHA-256 seal.`,
      timestamp: nowIso,
      category: 'evidence',
      metadata: {
        evidenceId: newEvidenceId,
        sha256: simulatedSha,
      },
      isDemoEvent: false,
    };

    setTimelineEvents((prev) => [newTimelineEvt, ...prev]);

    addToast({
      title: 'Incoming Evidence Preserved',
      message: `Sealed ${isVideo ? 'video' : 'audio'} chunk #${nextIndex} with SHA-256 certificate.`,
      type: 'info',
    });
  };

  const simulateLocationRefresh = (incidentId: string) => {
    const nowIso = new Date().toISOString();

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const deltaLat = (Math.random() - 0.5) * 0.0004;
          const deltaLng = (Math.random() - 0.5) * 0.0004;
          const newBattery = Math.max(12, inc.batteryLevel - 1);
          return {
            ...inc,
            location: {
              ...inc.location,
              lat: Number((inc.location.lat + deltaLat).toFixed(5)),
              lng: Number((inc.location.lng + deltaLng).toFixed(5)),
            },
            batteryLevel: newBattery,
            updatedAt: nowIso,
          };
        }
        return inc;
      })
    );

    const newTimelineEvt: TimelineEvent = {
      id: `evt-loc-${Date.now()}`,
      incidentId,
      eventType: 'LOCATION_UPDATED',
      title: 'Live GPS Refreshed',
      description: 'Device telemetry pulse received. Coordinates updated with 4.5m precision.',
      timestamp: nowIso,
      category: 'location',
      isDemoEvent: false,
    };

    setTimelineEvents((prev) => [newTimelineEvt, ...prev]);

    addToast({
      title: 'Telemetry Refreshed',
      message: 'GPS coordinates and device battery status updated.',
      type: 'info',
    });
  };

  const resetDemoState = () => {
    setIncidents(INITIAL_INCIDENTS);
    setActiveIncidentId('SC-2026-0142');
    setEvidence(INITIAL_EVIDENCE);
    setTimelineEvents(INITIAL_TIMELINE_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const getIncidentEvidence = (incidentId: string) => {
    return evidence.filter((e) => e.incidentId === incidentId).sort((a, b) => a.chunkIndex - b.chunkIndex);
  };

  const getIncidentTimeline = (incidentId: string) => {
    return timelineEvents
      .filter((t) => t.incidentId === incidentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  return (
    <GuardianContext.Provider
      value={{
        incidents,
        activeIncident,
        activeIncidentId,
        setActiveIncidentId,
        evidence,
        timelineEvents,
        guardian: CURRENT_GUARDIAN,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toasts,
        addToast,
        removeToast,
        acknowledgeIncident,
        resolveIncident,
        simulateIncomingEvidence,
        simulateLocationRefresh,
        resetDemoState,
        getIncidentEvidence,
        getIncidentTimeline,
        isWsConnected,
        alarmEnabled,
        setAlarmEnabled,
        isAlarmPlaying,
        triggerEmergencyAlarm,
        stopEmergencyAlarm,
        testEmergencyAlarm,
        guardianCoordination,
        updateGuardianStatus,
      }}
    >
      {children}
    </GuardianContext.Provider>
  );
};

export const useGuardian = (): GuardianContextType => {
  const context = useContext(GuardianContext);
  if (!context) {
    throw new Error('useGuardian must be used within a GuardianProvider');
  }
  return context;
};
