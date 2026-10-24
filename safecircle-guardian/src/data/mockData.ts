import type {
  Incident,
  Evidence,
  TimelineEvent,
  Guardian,
  LegalReference,
  NotificationItem,
  GuardianCoordinationStatus,
} from '../types';

export const CURRENT_GUARDIAN: Guardian = {
  id: 'guard-001',
  displayName: 'Aditi Sharma',
  role: 'Sister / Primary Trusted Contact',
  phone: '+91 98765 43211',
  telegramChatId: '123456789',
  avatarInitials: 'AS',
  isPrimarySos: true,
};

export const INITIAL_GUARDIAN_COORDINATION: GuardianCoordinationStatus[] = [
  {
    id: 'coord-1',
    guardianName: 'Aditi Sharma',
    role: 'Sister (Primary Contact)',
    statusAction: 'NAVIGATING_TO_VICTIM',
    statusLabel: 'Navigating to Location (ETA 6 mins)',
    note: 'In cab heading north from Palace Road junction.',
    timestamp: '2 mins ago',
    isCurrentUser: true,
  },
  {
    id: 'coord-2',
    guardianName: 'Pooja Sharma',
    role: 'Circle Member',
    statusAction: 'CALLED_112',
    statusLabel: 'Called 112 Police Control Room',
    note: 'Spoke with Dispatcher Rao; PCR Van #14 alerted for MG Road sector.',
    timestamp: '4 mins ago',
    isCurrentUser: false,
  },
  {
    id: 'coord-3',
    guardianName: 'Rohan Mehta',
    role: 'Circle Member',
    statusAction: 'MONITORING_STREAM',
    statusLabel: 'Monitoring Live Stealth Audio & GPS',
    note: 'Recording chunk transcripts and watching battery drift.',
    timestamp: '5 mins ago',
    isCurrentUser: false,
  },
  {
    id: 'coord-4',
    guardianName: 'Kavita S',
    role: 'Circle Member',
    statusAction: 'MONITORING_STREAM',
    statusLabel: 'Notified via Telegram Alert',
    note: 'Alert received on standby.',
    timestamp: '6 mins ago',
    isCurrentUser: false,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    title: '🚨 Physical SOS Alert: Shreya',
    message: 'Triggered via Calculator Camouflage (112=) from MG Road, Bengaluru. Audio evidence streaming live.',
    timestamp: '5:09 PM',
    read: false,
    type: 'emergency',
    incidentId: 'SC-2026-0142',
  },
  {
    id: 'notif-002',
    title: '🛡️ Evidence Preserved & Sealed',
    message: 'ambient_cab_audio_01.webm (0:14) cryptographically hashed with SHA-256 digital certificate.',
    timestamp: '5:10 PM',
    read: false,
    type: 'update',
    incidentId: 'SC-2026-0142',
  },
  {
    id: 'notif-003',
    title: '📁 Mobile Vault Dossier Received',
    message: 'Shreya shared Digital Harassment Dossier (SC-2026-0138) with 3 verified exhibits.',
    timestamp: '21 Oct, 10:05 AM',
    read: true,
    type: 'system',
    incidentId: 'SC-2026-0138',
  },
];

export const LEGAL_STATUTES: Record<string, LegalReference[]> = {
  'Cyberstalking, Impersonation & Imminent Physical Threat': [
    {
      section: 'BNS Section 78 / IPC 354D',
      title: 'Stalking via Electronic Communications',
      description: 'Persistent electronic monitoring, contacting repeatedly despite refusal, or threatening surveillance.',
      applicableThreat: 'Cyberstalking',
    },
    {
      section: 'IT Act Section 66D',
      title: 'Cheating by Personation using Computer Resource',
      description: 'Creation and distribution of fraudulent social media accounts using stolen identity, likeness, or photos.',
      applicableThreat: 'Impersonation',
    },
    {
      section: 'BNS Section 351 / IPC 506',
      title: 'Criminal Intimidation',
      description: 'Threatening person with injury to her reputation, safety, or person with intent to cause alarm ("I\'m coming for you tomorrow").',
      applicableThreat: 'Imminent Physical Threat',
    },
    {
      section: 'IT Act Section 66E',
      title: 'Violation of Bodily & Personal Privacy',
      description: 'Intentional capture, publication, or transmission of images without consent.',
      applicableThreat: 'Privacy Violation',
    },
  ],
  'Cyberstalking': [
    {
      section: 'BNS Section 78 / IPC 354D',
      title: 'Stalking via Electronic Communications',
      description: 'Monitoring internet, messaging, or social platforms without consent.',
      applicableThreat: 'Cyberstalking',
    },
    {
      section: 'IT Act Section 66E',
      title: 'Invasion of Personal Digital Privacy',
      description: 'Unauthorised tracking, location monitoring, and electronic stalking.',
      applicableThreat: 'Cyberstalking',
    },
  ],
};

export const INITIAL_EVIDENCE: Evidence[] = [
  // Evidence for SC-2026-0142 (Physical SOS)
  {
    id: 'EVD-AUD-0142-01',
    incidentId: 'SC-2026-0142',
    filename: 'ambient_cab_audio_01.webm',
    type: 'STEALTH_AUDIO_CHUNK',
    timestamp: '2026-10-24T11:39:14Z',
    sizeBytes: 224180,
    sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 0,
    capturedCoordinates: { lat: 12.9850, lng: 77.5850 },
    isSimulated: false,
    legalRelevance: 'Directional microphone cabin recording capturing background navigation audio, vehicle acceleration, and ambient speech.',
    previewAsset: {
      type: 'audio',
      durationSeconds: 14.0,
      audioWaveformData: [28, 45, 72, 85, 92, 60, 48, 88, 76, 95, 64, 40, 52, 78, 62, 45, 82, 90, 70, 35],
    },
  },
  {
    id: 'EVD-VID-0142-02',
    incidentId: 'SC-2026-0142',
    filename: 'stealth_front_dash_02.webm',
    type: 'STEALTH_VIDEO_CHUNK',
    timestamp: '2026-10-24T11:39:20Z',
    sizeBytes: 1245184,
    sha256Hash: '4a6b98e1f02c918237b6c7e2d3f4a5b6c7d8e9f01a2b3c4d5e6f7a8b9c0d1e2f',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 1,
    capturedCoordinates: { lat: 12.9862, lng: 77.5838 },
    isSimulated: false,
    legalRelevance: 'Stealth front sensor ambient capture recording street illumination and road landmarks along Palace Road.',
    previewAsset: {
      type: 'video',
      durationSeconds: 4.0,
      mockResolution: '1080p 30fps (Stealth Buffer)',
    },
  },

  // Evidence for SC-2026-0138 (Digital Threat Report from Mobile Vault)
  {
    id: 'EVD-DH-0138-01',
    incidentId: 'SC-2026-0138',
    filename: 'chat_unknown_user_88.jpg',
    type: 'SCREENSHOT',
    timestamp: '2026-10-20T16:11:00Z', // 20 Oct, 9:41 PM IST
    sizeBytes: 421888,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 0,
    isSimulated: false,
    legalRelevance: 'Direct message threat thread from Unknown_User_88 with explicit physical confrontation warning: "I know where you study. Stop ignoring me. You\'re making a big mistake. I\'m coming for you tomorrow. Reply now or I\'ll just show up."',
    previewAsset: {
      type: 'image',
      mockResolution: '1170x2532 · JPEG · 412 KB',
      textSnippet: 'Unknown_User_88: "I know where you study." • "Stop ignoring me." • "You\'re making a big mistake." • "I\'m coming for you tomorrow." • "Reply now or I\'ll just show up."',
    },
  },
  {
    id: 'EVD-DH-0138-02',
    incidentId: 'SC-2026-0138',
    filename: 'fake_account_profile.jpg',
    type: 'SCREENSHOT',
    timestamp: '2026-10-20T16:39:00Z', // 20 Oct, 10:09 PM IST
    sizeBytes: 333824,
    sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 1,
    isSimulated: false,
    legalRelevance: 'Impersonation profile screenshot showing handle @shreya_official_xx using stolen photographs and defamatory biography.',
    previewAsset: {
      type: 'image',
      mockResolution: '1170x2532 · JPEG · 326 KB',
      textSnippet: 'Instagram Profile: @shreya_official_xx • Stolen profile photo • 14 followers • Bio targeting victim contacts.',
    },
  },
  {
    id: 'EVD-DH-0138-03',
    incidentId: 'SC-2026-0138',
    filename: 'impersonation_message.jpg',
    type: 'SCREENSHOT',
    timestamp: '2026-10-21T04:33:00Z', // 21 Oct, 10:03 AM IST
    sizeBytes: 351232,
    sha256Hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 2,
    isSimulated: false,
    legalRelevance: 'Phishing and OTP extortion message dispatched to mutual student contacts while masquerading as victim.',
    previewAsset: {
      type: 'image',
      mockResolution: '1080x2400 · JPEG · 343 KB',
      textSnippet: 'WhatsApp: "Hey, my phone got locked, can you send the verification code sent to your phone right now? It\'s urgent."',
    },
  },
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  // Events for SC-2026-0142 (Physical SOS)
  {
    id: 'evt-0142-01',
    incidentId: 'SC-2026-0142',
    eventType: 'SOS_TRIGGERED',
    title: 'Physical Emergency SOS Activated',
    description: 'Triggered via Calculator Camouflage (PIN: 112=). Battery at 76%. Live route tracking initiated.',
    timestamp: '2026-10-24T11:39:00Z', // 5:09 PM IST
    category: 'alert',
    metadata: {
      triggerMode: 'Calculator Camouflage 112=',
      battery: 76,
      timeIst: '5:09 PM IST',
      initialLat: 12.9756,
      initialLng: 77.6066,
    },
    isDemoEvent: false,
  },
  {
    id: 'evt-0142-02',
    incidentId: 'SC-2026-0142',
    eventType: 'TELEGRAM_ALERT_SENT',
    title: 'Telegram Dispatch Sent',
    description: 'High-priority emergency broadcast sent to Aditi Sharma (+91 98765 43211) and Circle (PS, RM, KS) with live stream capability link.',
    timestamp: '2026-10-24T11:39:05Z', // 5:09 PM IST
    category: 'security',
    metadata: {
      primaryRecipient: 'Aditi Sharma (Sister)',
      circleRecipients: 'PS, RM, KS',
      channel: 'Telegram Bot API',
    },
    isDemoEvent: false,
  },
  {
    id: 'evt-0142-03',
    incidentId: 'SC-2026-0142',
    eventType: 'EVIDENCE_HASHED',
    title: 'Audio Evidence Sealed',
    description: 'ambient_cab_audio_01.webm (0:14) sealed in tamper-evident vault with SHA-256 fingerprint (8f434346648f...).',
    timestamp: '2026-10-24T11:40:00Z', // 5:10 PM IST
    category: 'evidence',
    metadata: {
      filename: 'ambient_cab_audio_01.webm',
      duration: '0:14',
      sha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    },
    isDemoEvent: false,
  },
  {
    id: 'evt-0142-04',
    incidentId: 'SC-2026-0142',
    eventType: 'LOCATION_UPDATED',
    title: 'Live GPS Telemetry Refreshed',
    description: 'Coordinates updated along Palace Road towards Malleswaram (12.9850° N, 77.5850° E). Safe Spots nearby: Apollo 24/7 Pharmacy & Seshadripuram Police Outpost.',
    timestamp: '2026-10-24T11:41:20Z', // 5:11 PM IST
    category: 'location',
    metadata: {
      lat: 12.9850,
      lng: 77.5850,
      route: 'MG Road -> Malleswaram',
    },
    isDemoEvent: false,
  },

  // Events for SC-2026-0138 (Digital Threat Report from Mobile Vault)
  {
    id: 'evt-0138-01',
    incidentId: 'SC-2026-0138',
    eventType: 'EVIDENCE_HASHED',
    title: 'Mobile Vault Exhibits Preserved',
    description: 'Victim preserved 3 screenshot exhibits (chat_unknown_user_88.jpg, fake_account_profile.jpg, impersonation_message.jpg) with immutable SHA-256 hashes.',
    timestamp: '2026-10-21T04:33:00Z', // 21 Oct, 10:03 AM IST
    category: 'evidence',
    metadata: { exhibits: 3, sealedVault: true },
    isDemoEvent: false,
  },
  {
    id: 'evt-0138-02',
    incidentId: 'SC-2026-0138',
    eventType: 'AI_TRIAGE_COMPLETED',
    title: 'AI Threat Classification: CRITICAL',
    description: 'Categorized under Cyberstalking, Impersonation & Imminent Physical Threat. Urgent escalation trigger detected: "I\'m coming for you tomorrow". Applicable statutes: BNS Section 78 & IT Act Section 66D/66E.',
    timestamp: '2026-10-21T04:34:00Z',
    category: 'security',
    metadata: {
      category: 'Cyberstalking, Impersonation & Imminent Physical Threat',
      severity: 'CRITICAL',
      triggerQuote: "I'm coming for you tomorrow",
    },
    isDemoEvent: false,
  },
  {
    id: 'evt-0138-03',
    incidentId: 'SC-2026-0138',
    eventType: 'REPORT_SHARED',
    title: 'Dossier Shared with Guardian',
    description: 'Forensic evidence packet securely transmitted to Aditi Sharma with Section 65B court certificate.',
    timestamp: '2026-10-21T04:35:00Z',
    category: 'system',
    metadata: { sharedWith: 'Aditi Sharma', capabilityToken: 'sc_vault_tok_0138_digital' },
    isDemoEvent: false,
  },
  {
    id: 'evt-0138-04',
    incidentId: 'SC-2026-0138',
    eventType: 'GUARDIAN_ACKNOWLEDGED',
    title: 'Guardian Acknowledged Report',
    description: 'Dossier reviewed and formally acknowledged by Aditi Sharma (Sister / Primary Contact).',
    timestamp: '2026-10-21T04:42:00Z',
    category: 'security',
    metadata: { acknowledgedBy: 'Aditi Sharma' },
    isDemoEvent: false,
  },
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'SC-2026-0142',
    type: 'PHYSICAL_SOS',
    victimDisplayName: 'Shreya',
    victimPhone: '+91 98765 43210',
    victimEmail: 'shreya@safecircle.internal',
    status: 'ACTIVE',
    createdAt: '2026-10-24T11:39:00Z', // 5:09 PM IST
    updatedAt: '2026-10-24T11:41:20Z',
    location: {
      lat: 12.9850,
      lng: 77.5850,
      label: 'Palace Road, Near Seshadripuram',
      landmark: 'MG Road to Malleswaram Route, Bengaluru',
      accuracyMeters: 4.5,
    },
    batteryLevel: 76,
    triggerMode: 'Calculator Camouflage 112=',
    description: 'Physical Emergency SOS triggered via Calculator Camouflage (PIN 112=) while in transit along MG Road to Malleswaram route.',
    evidenceIds: ['EVD-AUD-0142-01', 'EVD-VID-0142-02'],
    timelineEventIds: ['evt-0142-01', 'evt-0142-02', 'evt-0142-03', 'evt-0142-04'],
    accessToken: 'sc_live_tok_0142_physical',
  },
  {
    id: 'SC-2026-0138',
    type: 'DIGITAL_THREAT',
    victimDisplayName: 'Shreya',
    victimPhone: '+91 98765 43210',
    victimEmail: 'shreya@safecircle.internal',
    status: 'ACKNOWLEDGED',
    createdAt: '2026-10-20T16:11:00Z',
    updatedAt: '2026-10-21T04:42:00Z',
    acknowledgedAt: '2026-10-21T04:42:00Z',
    acknowledgedBy: 'Aditi Sharma (Sister / Primary Contact)',
    location: {
      lat: 12.9756,
      lng: 77.6066,
      label: 'Mobile Evidence Vault Submission',
      landmark: 'Bengaluru, Karnataka',
      accuracyMeters: 5.0,
    },
    batteryLevel: 88,
    triggerMode: 'DIGITAL_SUBMISSION',
    description: 'User-Generated Digital Harassment & Stalking Report preserved from Mobile App Vault with 3 verified exhibits.',
    aiCategory: 'Cyberstalking, Impersonation & Imminent Physical Threat',
    aiSeverity: 'CRITICAL',
    aiSummary: 'Suspect Unknown_User_88 issued coercive demands with imminent physical confrontation threat ("I\'m coming for you tomorrow"). Stolen photos used in impersonation profile @shreya_official_xx.',
    sharedWithContactName: 'Aditi Sharma',
    evidenceIds: ['EVD-DH-0138-01', 'EVD-DH-0138-02', 'EVD-DH-0138-03'],
    timelineEventIds: ['evt-0138-01', 'evt-0138-02', 'evt-0138-03', 'evt-0138-04'],
    accessToken: 'sc_vault_tok_0138_digital',
  },
];
