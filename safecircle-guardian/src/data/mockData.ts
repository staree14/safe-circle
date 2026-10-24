import type {
  Incident,
  Evidence,
  TimelineEvent,
  Guardian,
  LegalReference,
  NotificationItem,
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

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    title: '🚨 High Priority: Physical SOS Alert',
    message: 'Sreeya triggered an emergency SOS from Koramangala, Bengaluru. Stealth streaming live.',
    timestamp: 'Just now',
    read: false,
    type: 'emergency',
    incidentId: 'DEMO-SC-2026-0142',
  },
  {
    id: 'notif-002',
    title: '📹 New Live Chunk Preserved',
    message: 'Chunk #03 (4.0s video) cryptographically hashed with SHA-256 seal.',
    timestamp: '2 min ago',
    read: false,
    type: 'update',
    incidentId: 'DEMO-SC-2026-0142',
  },
  {
    id: 'notif-003',
    title: '🛡️ Guardian Console Ready',
    message: 'Encrypted capability connection established with SafeCircle Command Center.',
    timestamp: '15 min ago',
    read: true,
    type: 'system',
  },
];

export const LEGAL_STATUTES: Record<string, LegalReference[]> = {
  'Non-Consensual Imagery Threat': [
    {
      section: 'IT Act Section 66E',
      title: 'Violation of Privacy',
      description: 'Punishment for intentionally capturing, publishing, or transmitting images of private areas of any person without consent (up to 3 years imprisonment).',
      applicableThreat: 'Non-Consensual Imagery Threat'
    },
    {
      section: 'IT Act Section 67 & 67A',
      title: 'Sexually Explicit Material Dissemination',
      description: 'Punishment for publishing or transmitting sexually explicit acts in electronic form (cognizable, non-bailable, up to 5 years).',
      applicableThreat: 'Non-Consensual Imagery Threat'
    },
    {
      section: 'BNS Section 77 / IPC 354C',
      title: 'Voyeurism & Non-Consensual Capture',
      description: 'Dissemination of photos/videos of a woman engaged in private acts without consent.',
      applicableThreat: 'Non-Consensual Imagery Threat'
    }
  ],
  'Extortion / Blackmail': [
    {
      section: 'BNS Section 308 / IPC 384',
      title: 'Extortion by Threat of Injury / Disrepute',
      description: 'Intentionally putting any person in fear of injury or reputational harm to induce delivery of money or digital assets.',
      applicableThreat: 'Extortion / Blackmail'
    },
    {
      section: 'IT Act Section 66',
      title: 'Computer Related Offences (Digital Extortion)',
      description: 'Dishonest extortion, harassment, and coercion carried out using electronic communication devices.',
      applicableThreat: 'Extortion / Blackmail'
    }
  ],
  'Cyberstalking': [
    {
      section: 'BNS Section 78 / IPC 354D',
      title: 'Stalking via Electronic Communications',
      description: 'Monitoring a woman’s use of internet, email, or digital channels, or contacting repeatedly despite clear disinterest.',
      applicableThreat: 'Cyberstalking'
    },
    {
      section: 'IT Act Section 66E',
      title: 'Invasion of Personal Digital Privacy',
      description: 'Unauthorised tracking, location monitoring, and electronic stalking.',
      applicableThreat: 'Cyberstalking'
    }
  ]
};

export const INITIAL_EVIDENCE: Evidence[] = [
  {
    id: 'DEMO-VID-001',
    incidentId: 'DEMO-SC-2026-0142',
    filename: 'stealth_chunk_00_cam_front.webm',
    type: 'STEALTH_VIDEO_CHUNK',
    timestamp: '2026-10-24T10:12:04Z',
    sizeBytes: 1245184,
    sha256Hash: '4a6b98e1f02c918237b6c7e2d3f4a5b6c7d8e9f01a2b3c4d5e6f7a8b9c0d1e2f',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 0,
    capturedCoordinates: { lat: 12.9352, lng: 77.6245 },
    isSimulated: true,
    legalRelevance: 'Initial front-camera ambient video segment captured immediately upon SOS activation.',
    previewAsset: {
      type: 'video',
      durationSeconds: 4.0,
      mockResolution: '1080p 30fps (Stealth Mode)'
    }
  },
  {
    id: 'DEMO-AUD-001',
    incidentId: 'DEMO-SC-2026-0142',
    filename: 'ambient_mic_chunk_01.opus',
    type: 'STEALTH_AUDIO_CHUNK',
    timestamp: '2026-10-24T10:12:08Z',
    sizeBytes: 94208,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 1,
    capturedCoordinates: { lat: 12.9353, lng: 77.6247 },
    isSimulated: true,
    legalRelevance: 'Dual-mic directional audio capture recording footstep pace and surrounding ambient speech.',
    previewAsset: {
      type: 'audio',
      durationSeconds: 4.0,
      audioWaveformData: [25, 40, 65, 30, 80, 95, 60, 45, 75, 88, 52, 33, 70, 85, 40]
    }
  },
  {
    id: 'DEMO-IMG-001',
    incidentId: 'DEMO-SC-2026-0142',
    filename: 'device_lockscreen_snapshot.png',
    type: 'SCREENSHOT',
    timestamp: '2026-10-24T10:12:12Z',
    sizeBytes: 524288,
    sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 2,
    capturedCoordinates: { lat: 12.9354, lng: 77.6249 },
    isSimulated: true,
    legalRelevance: 'Screen buffer capture preserving active threat notifications on lockscreen.',
    previewAsset: {
      type: 'image',
      mockResolution: '1170x2532 PNG'
    }
  },
  {
    id: 'DEMO-VID-002',
    incidentId: 'DEMO-SC-2026-0142',
    filename: 'stealth_chunk_03_cam_rear.webm',
    type: 'STEALTH_VIDEO_CHUNK',
    timestamp: '2026-10-24T10:12:16Z',
    sizeBytes: 1310720,
    sha256Hash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 3,
    capturedCoordinates: { lat: 12.9355, lng: 77.6251 },
    isSimulated: true,
    legalRelevance: 'Rear ultra-wide camera ambient capture recording street lighting and passing vehicles.',
    previewAsset: {
      type: 'video',
      durationSeconds: 4.0,
      mockResolution: '1080p 30fps (Stealth Mode)'
    }
  },
  {
    id: 'DEMO-DH-IMG-01',
    incidentId: 'DEMO-SC-2026-0131',
    filename: 'instagram_threat_dm_thread.png',
    type: 'SCREENSHOT',
    timestamp: '2026-10-21T14:22:10Z',
    sizeBytes: 684120,
    sha256Hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 0,
    isSimulated: true,
    legalRelevance: 'Direct message extortion thread demanding ₹25,000 under threat of photo leak.',
    previewAsset: {
      type: 'image',
      mockResolution: '1080x2400 PNG'
    }
  },
  {
    id: 'DEMO-DH-TXT-01',
    incidentId: 'DEMO-SC-2026-0131',
    filename: 'threat_message_transcript.log',
    type: 'TEXT_LOG',
    timestamp: '2026-10-21T14:23:45Z',
    sizeBytes: 1420,
    sha256Hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    hashStatus: 'VERIFICATION_PASSED',
    chunkIndex: 1,
    isSimulated: true,
    legalRelevance: 'Cryptographically sealed UTF-8 text dump of coercive demands.',
    previewAsset: {
      type: 'text',
      textSnippet: '[2026-10-21 19:45:10 IST] anonymous_8821: "I have your contact list and pictures from the festival. Pay ₹25,000 by tonight via UPI or all contacts will receive them."'
    }
  }
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-001',
    incidentId: 'DEMO-SC-2026-0142',
    eventType: 'SOS_TRIGGERED',
    title: 'Physical Emergency SOS Activated',
    description: 'Victim triggered emergency SOS via rapid hardware button sequence in STEALTH_BLACK_SCREEN mode.',
    timestamp: '2026-10-24T10:12:00Z',
    category: 'alert',
    metadata: {
      triggerMode: 'STEALTH_BLACK_SCREEN',
      initialLat: 12.9352,
      initialLng: 77.6245,
      batteryLevel: 78
    },
    isDemoEvent: true
  },
  {
    id: 'evt-002',
    incidentId: 'DEMO-SC-2026-0142',
    eventType: 'STEALTH_RECORDING_STARTED',
    title: 'Stealth Evidence Pipeline Initialized',
    description: 'Background 4-second video/audio recorder engaged with zero screen luminescence.',
    timestamp: '2026-10-24T10:12:02Z',
    category: 'evidence',
    metadata: {
      chunkIntervalSec: 4,
      encoder: 'VP8/Opus'
    },
    isDemoEvent: true
  },
  {
    id: 'evt-003',
    incidentId: 'DEMO-SC-2026-0142',
    eventType: 'EVIDENCE_HASHED',
    title: 'Chunk #00 Cryptographically Preserved',
    description: '4-second video segment hashed with SHA-256 (4a6b98e1f02c...) and recorded to tamper-evident vault.',
    timestamp: '2026-10-24T10:12:05Z',
    category: 'evidence',
    metadata: {
      evidenceId: 'DEMO-VID-001',
      fileSize: '1.24 MB',
      sha256: '4a6b98e1f02c918237b6c7e2d3f4a5b6c7d8e9f01a2b3c4d5e6f7a8b9c0d1e2f'
    },
    isDemoEvent: true
  },
  {
    id: 'evt-004',
    incidentId: 'DEMO-SC-2026-0142',
    eventType: 'TELEGRAM_ALERT_SENT',
    title: 'Emergency Dispatch Broadcasted',
    description: 'High-priority emergency alert transmitted to Aditi Sharma (Sister) with live Guardian streaming link and Google Maps coordinates.',
    timestamp: '2026-10-24T10:12:06Z',
    category: 'security',
    metadata: {
      primaryRecipient: 'Aditi Sharma',
      channel: 'Telegram Bot API',
      mapsPin: 'https://maps.google.com/?q=12.9352,77.6245'
    },
    isDemoEvent: true
  },
  {
    id: 'evt-005',
    incidentId: 'DEMO-SC-2026-0142',
    eventType: 'LOCATION_UPDATED',
    title: 'Live GPS Telemetry Refreshed',
    description: 'Coordinates updated: 12.9354° N, 77.6249° E. Victim moving northeast along 80 Feet Road. Battery: 76%.',
    timestamp: '2026-10-24T10:12:14Z',
    category: 'location',
    metadata: {
      lat: 12.9354,
      lng: 77.6249,
      battery: 76,
      accuracy: '4.2m'
    },
    isDemoEvent: true
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'DEMO-SC-2026-0142',
    type: 'PHYSICAL_SOS',
    victimDisplayName: 'Sreeya',
    victimPhone: '+91 98765 43210',
    victimEmail: 'sreeya@safecircle.internal',
    status: 'ACTIVE',
    createdAt: '2026-10-24T10:12:00Z',
    updatedAt: '2026-10-24T10:16:30Z',
    location: {
      lat: 12.9352,
      lng: 77.6245,
      label: 'Koramangala 4th Block, 80 Feet Road',
      landmark: 'Near Sony World Junction, Bengaluru (Simulated Demo Pin)',
      accuracyMeters: 4.2
    },
    batteryLevel: 76,
    triggerMode: 'STEALTH_BLACK_SCREEN',
    description: 'Emergency Physical SOS activated while travelling. Stealth front/rear camera and directional microphone capturing 4-second continuous evidence chunks.',
    evidenceIds: ['DEMO-VID-001', 'DEMO-AUD-001', 'DEMO-IMG-001', 'DEMO-VID-002'],
    timelineEventIds: ['evt-001', 'evt-002', 'evt-003', 'evt-004', 'evt-005'],
    accessToken: 'demo_tok_7f9c21b34e5a90d8123456789abcdef0'
  },
  {
    id: 'DEMO-SC-2026-0138',
    type: 'PHYSICAL_SOS',
    victimDisplayName: 'Sreeya',
    victimPhone: '+91 98765 43210',
    status: 'RESOLVED',
    createdAt: '2026-10-22T19:40:00Z',
    updatedAt: '2026-10-22T20:18:00Z',
    acknowledgedAt: '2026-10-22T19:44:12Z',
    acknowledgedBy: 'Campus Security Desk (Officer R. Nair)',
    resolvedAt: '2026-10-22T20:18:00Z',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      label: 'MG Road Metro Station North Gate',
      landmark: 'Near Exit 2, Bengaluru',
      accuracyMeters: 6.0
    },
    batteryLevel: 91,
    triggerMode: 'TRIPLE_TAP_SOS',
    description: 'Transit safety alert resolved. Campus security team verified victim safely reached student residence hall.',
    evidenceIds: [],
    timelineEventIds: [],
    accessToken: 'demo_tok_138_resolved_b82a7f'
  },
  {
    id: 'DEMO-SC-2026-0131',
    type: 'DIGITAL_THREAT',
    victimDisplayName: 'Sreeya',
    victimPhone: '+91 98765 43210',
    status: 'ACKNOWLEDGED',
    createdAt: '2026-10-21T14:20:00Z',
    updatedAt: '2026-10-21T16:30:00Z',
    acknowledgedAt: '2026-10-21T16:30:00Z',
    acknowledgedBy: 'Dr. Rajiv Chand (Father)',
    location: {
      lat: 12.9724,
      lng: 77.5806,
      label: 'Digital Threat Vault Submission',
      landmark: 'Digital Evidence Record'
    },
    batteryLevel: 85,
    triggerMode: 'DIGITAL_SUBMISSION',
    description: 'Instagram burner account (@anonymous_8821) demanding financial extortion with threats to leak private festival photographs.',
    sourceUrl: 'https://instagram.com/direct/t/882194',
    aiCategory: 'Extortion / Blackmail',
    aiSeverity: 'HIGH',
    aiSummary: 'High-confidence extortion pattern violating Section 308 of BNS and Section 66 of IT Act. Extracted suspect handle: @anonymous_8821.',
    sharedWithContactName: 'Aditi Sharma',
    tokenExpiresAt: '2026-10-25T14:20:00Z',
    evidenceIds: ['DEMO-DH-IMG-01', 'DEMO-DH-TXT-01'],
    timelineEventIds: [],
    accessToken: 'demo_tok_d82a17f4b391e029c48b17a02c98d712'
  },
  {
    id: 'DEMO-SC-2026-0125',
    type: 'DIGITAL_THREAT',
    victimDisplayName: 'Sreeya',
    victimPhone: '+91 98765 43210',
    status: 'RESOLVED',
    createdAt: '2026-10-14T11:00:00Z',
    updatedAt: '2026-10-16T15:00:00Z',
    acknowledgedAt: '2026-10-14T11:45:00Z',
    acknowledgedBy: 'Campus Cyber Cell (Aditi & Security)',
    resolvedAt: '2026-10-16T15:00:00Z',
    location: {
      lat: 12.9724,
      lng: 77.5806,
      label: 'Digital Cyberstalking Vault Record',
      landmark: 'Archived Dossier'
    },
    batteryLevel: 98,
    triggerMode: 'DIGITAL_SUBMISSION',
    description: 'Unsolicited location tracking messages across Telegram and LinkedIn. Formal cease-and-desist logged.',
    aiCategory: 'Cyberstalking',
    aiSeverity: 'MEDIUM',
    aiSummary: 'Persistent digital stalking behavior triaged under BNS Section 78 and IT Act Section 66E.',
    evidenceIds: [],
    timelineEventIds: [],
    accessToken: 'demo_tok_125_resolved_c990'
  }
];
