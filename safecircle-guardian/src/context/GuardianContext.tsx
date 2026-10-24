import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Incident, Evidence, TimelineEvent, Guardian, NotificationItem } from '../types';
import {
  CURRENT_GUARDIAN,
  INITIAL_INCIDENTS,
  INITIAL_EVIDENCE,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

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
}

const GuardianContext = createContext<GuardianContextType | undefined>(undefined);

export const GuardianProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [activeIncidentId, setActiveIncidentId] = useState<string>('DEMO-SC-2026-0142');
  const [evidence, setEvidence] = useState<Evidence[]>(INITIAL_EVIDENCE);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE_EVENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Find active incident
  const activeIncident = incidents.find((inc) => inc.id === activeIncidentId) || incidents[0];

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4500);
    return () => clearTimeout(timer);
  }, [toasts]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const acknowledgeIncident = (incidentId: string, responderName: string = CURRENT_GUARDIAN.displayName) => {
    const nowIso = new Date().toISOString();

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
      id: `evt-${Date.now()}`,
      incidentId,
      eventType: 'GUARDIAN_ACKNOWLEDGED',
      title: 'SOS Formally Acknowledged',
      description: `Emergency alert acknowledged by ${responderName}. Responder is actively coordinating assistance.`,
      timestamp: nowIso,
      category: 'security',
      metadata: { acknowledgedBy: responderName },
      isDemoEvent: true,
    };

    setTimelineEvents((prev) => [newEvent, ...prev]);

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: '✅ SOS Alert Acknowledged (Demo)',
        message: `${responderName} acknowledged incident ${incidentId}.`,
        timestamp: 'Just now',
        read: false,
        type: 'update',
        incidentId,
      },
      ...prev,
    ]);

    addToast({
      title: 'Alert Acknowledged (Demo)',
      message: `Simulated acknowledgment by ${responderName} recorded. Status set to ACKNOWLEDGED.`,
      type: 'success',
    });
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

    // Append to timeline
    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      incidentId,
      eventType: 'INCIDENT_RESOLVED',
      title: 'Incident Resolved — Victim Safe',
      description: note || 'Emergency status cleared. Forensic custody log permanently finalized and archived in vault.',
      timestamp: nowIso,
      category: 'resolution',
      metadata: { resolvedAt: nowIso, note },
      isDemoEvent: true,
    };

    setTimelineEvents((prev) => [newEvent, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: '🟢 Incident Resolved (Demo)',
        message: `Incident ${incidentId} was marked resolved. Evidence chain sealed.`,
        timestamp: 'Just now',
        read: false,
        type: 'system',
        incidentId,
      },
      ...prev,
    ]);

    addToast({
      title: 'Incident Resolved (Demo)',
      message: 'Simulated resolution recorded. Incident state changed to RESOLVED.',
      type: 'info',
    });
  };

  const simulateIncomingEvidence = (incidentId: string) => {
    const incEvidence = evidence.filter((e) => e.incidentId === incidentId);
    const nextIndex = incEvidence.length;
    const nowIso = new Date().toISOString();

    const isVideo = nextIndex % 2 === 0;
    const newEvidenceId = isVideo ? `DEMO-VID-${String(nextIndex + 1).padStart(3, '0')}` : `DEMO-AUD-${String(nextIndex + 1).padStart(3, '0')}`;
    const filename = isVideo ? `stealth_chunk_0${nextIndex}_cam_stream.webm` : `stealth_audio_chunk_0${nextIndex}.opus`;

    // Simulated pseudo-random SHA-256 string
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
      isSimulated: true,
      capturedCoordinates: { lat: 12.9356 + nextIndex * 0.0002, lng: 77.6253 + nextIndex * 0.0002 },
      legalRelevance: `Sequential 4-second ambient capture (${isVideo ? 'video' : 'directional audio'}) cryptographically fingerprinted.`,
      previewAsset: isVideo
        ? {
            type: 'video',
            durationSeconds: 4.0,
            mockResolution: '1080p 30fps (Stealth Mode)',
          }
        : {
            type: 'audio',
            durationSeconds: 4.0,
            audioWaveformData: [35, 60, 45, 90, 85, 70, 50, 65, 80, 40, 55, 30, 75],
          },
    };

    setEvidence((prev) => [...prev, newEvidenceItem]);

    // Update incident evidence count
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

    // Append to timeline
    const newTimelineEvt: TimelineEvent = {
      id: `evt-${Date.now()}`,
      incidentId,
      eventType: 'EVIDENCE_HASHED',
      title: `Chunk #${String(nextIndex).padStart(2, '0')} Cryptographically Preserved`,
      description: `New ${isVideo ? '4.0s stealth video' : '4.0s directional audio'} segment (${newEvidenceId}) fingerprinted with SHA-256: ${simulatedSha.slice(0, 16)}...`,
      timestamp: nowIso,
      category: 'evidence',
      metadata: {
        evidenceId: newEvidenceId,
        sha256: simulatedSha,
        chunkIndex: nextIndex,
      },
      isDemoEvent: true,
    };

    setTimelineEvents((prev) => [newTimelineEvt, ...prev]);

    addToast({
      title: 'Incoming Evidence Preserved (Demo)',
      message: `Added simulated ${isVideo ? 'video' : 'audio'} chunk #${nextIndex} (${newEvidenceId}) with SHA-256 seal.`,
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
      id: `evt-${Date.now()}`,
      incidentId,
      eventType: 'LOCATION_UPDATED',
      title: 'Simulated GPS Ping Received',
      description: 'Device telemetry pulse received. Coordinates updated with 4.2m precision circle.',
      timestamp: nowIso,
      category: 'location',
      isDemoEvent: true,
    };

    setTimelineEvents((prev) => [newTimelineEvt, ...prev]);

    addToast({
      title: 'Telemetry Refreshed (Demo)',
      message: 'Simulated GPS coordinate drift and battery telemetry updated.',
      type: 'info',
    });
  };

  const resetDemoState = () => {
    setIncidents(INITIAL_INCIDENTS);
    setActiveIncidentId('DEMO-SC-2026-0142');
    setEvidence(INITIAL_EVIDENCE);
    setTimelineEvents(INITIAL_TIMELINE_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    addToast({
      title: 'Demo State Reset',
      message: 'All incidents, evidence items, and simulated timelines restored to factory demo state.',
      type: 'info',
    });
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
