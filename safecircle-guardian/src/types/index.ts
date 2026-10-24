export type IncidentType = 'PHYSICAL_SOS' | 'DIGITAL_THREAT';
export type IncidentStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export type EvidenceType =
  | 'STEALTH_VIDEO_CHUNK'
  | 'STEALTH_AUDIO_CHUNK'
  | 'SCREENSHOT'
  | 'TEXT_LOG'
  | 'URL_CAPTURE';

export type HashStatus =
  | 'HASH_NOT_GENERATED'
  | 'HASH_GENERATED'
  | 'VERIFICATION_PASSED'
  | 'VERIFICATION_FAILED';

export type TimelineEventType =
  | 'SOS_TRIGGERED'
  | 'STEALTH_RECORDING_STARTED'
  | 'EVIDENCE_HASHED'
  | 'TELEGRAM_ALERT_SENT'
  | 'LOCATION_UPDATED'
  | 'AI_TRIAGE_COMPLETED'
  | 'GUARDIAN_ACKNOWLEDGED'
  | 'REPORT_SHARED'
  | 'INCIDENT_RESOLVED'
  | 'OFFLINE_RELAY_RECEIVED';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  label: string;
  landmark?: string;
  accuracyMeters?: number;
}

export interface Incident {
  id: string;
  type: IncidentType;
  victimDisplayName: string;
  victimPhone: string;
  victimEmail?: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  location: LocationCoordinates;
  batteryLevel: number;
  triggerMode: string;
  description: string;
  sourceUrl?: string;
  aiCategory?: string;
  aiSeverity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  aiSummary?: string;
  sharedWithContactName?: string;
  tokenExpiresAt?: string;
  evidenceIds: string[];
  timelineEventIds: string[];
  accessToken: string;
  isTokenExpired?: boolean;
}

export interface EvidenceAsset {
  url?: string;
  type: 'video' | 'audio' | 'image' | 'text';
  durationSeconds?: number;
  textSnippet?: string;
  audioWaveformData?: number[];
  mockResolution?: string;
}

export interface Evidence {
  id: string;
  incidentId: string;
  filename: string;
  type: EvidenceType;
  timestamp: string;
  sizeBytes: number;
  sha256Hash: string;
  hashStatus: HashStatus;
  chunkIndex: number;
  previewAsset: EvidenceAsset;
  capturedCoordinates?: { lat: number; lng: number };
  isSimulated: boolean;
  legalRelevance?: string;
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  category: 'alert' | 'system' | 'security' | 'location' | 'evidence' | 'resolution';
  metadata?: Record<string, any>;
  isDemoEvent: boolean;
}

export interface Guardian {
  id: string;
  displayName: string;
  role: string;
  phone: string;
  telegramChatId?: string;
  avatarInitials: string;
  isPrimarySos: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'emergency' | 'update' | 'system';
  incidentId?: string;
}

export interface LegalReference {
  section: string;
  title: string;
  description: string;
  applicableThreat: string;
}
