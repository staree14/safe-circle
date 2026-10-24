import { Button, Card, Icon, Sheet } from "./ui";

export interface Helpline {
  number: string;
  name: string;
  dept: string;
  desc: string;
  badge: string;
  badgeTone: "red" | "sage" | "amber" | "berry";
}

export const GOVT_HELPLINES: Helpline[] = [
  {
    number: "112",
    name: "National Emergency (ERSS)",
    dept: "Ministry of Home Affairs",
    desc: "All-in-one 24×7 emergency helpline for immediate Police, Fire, and Ambulance response across India.",
    badge: "Immediate Police",
    badgeTone: "red",
  },
  {
    number: "1091",
    name: "Women in Distress Helpline",
    dept: "State Police",
    desc: "Dedicated police patrol vehicle dispatch for women facing immediate threat or harassment.",
    badge: "24×7 Patrol Dispatch",
    badgeTone: "red",
  },
  {
    number: "181",
    name: "Women Helpline (WCD)",
    dept: "Ministry of Women & Child Development",
    desc: "Toll-free 24-hour service providing rescue, shelter, medical aid, legal counsel, and psychological support.",
    badge: "Counseling & Legal",
    badgeTone: "sage",
  },
  {
    number: "1930",
    name: "National Cyber Crime Helpline",
    dept: "Indian Cybercrime Coordination Centre (I4C)",
    desc: "Immediate reporting for digital harassment, morphing, extortion, online stalking, and financial fraud.",
    badge: "Digital Harassment",
    badgeTone: "berry",
  },
  {
    number: "1090",
    name: "Women Power Line",
    dept: "Anti-Stalking Special Cell",
    desc: "Anonymous intervention helpline specializing in telephone harassment, stalking, and cyber-bullying.",
    badge: "Anti-Stalking",
    badgeTone: "amber",
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HelplinesModal({ open, onClose }: Props) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Government Helplines"
      footer={
        <Button variant="secondary" full onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="helpline-intro">
        <p className="tiny muted">
          These are verified national government emergency services. Tapping any
          number opens your phone's native phone dialer directly.
        </p>
      </div>

      <div className="stack-sm">
        {GOVT_HELPLINES.map((h) => (
          <Card key={h.number} className="helpline-card">
            <div className="helpline-head">
              <div>
                <span className={`chip chip-${h.badgeTone}`}>{h.badge}</span>
                <h3>{h.name}</h3>
                <small>{h.dept}</small>
              </div>
              <a
                href={`tel:${h.number}`}
                className="call-btn"
                aria-label={`Call ${h.name} at ${h.number}`}
              >
                <Icon name="phone" size={18} />
                <span>Call {h.number}</span>
              </a>
            </div>
            <p className="tiny muted">{h.desc}</p>
          </Card>
        ))}
      </div>
    </Sheet>
  );
}
