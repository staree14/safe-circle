import { useState } from "react";

interface Props {
  onUnlock: () => void;
  pin?: string;
}

export function CalculatorDecoy({ onUnlock, pin = "112" }: Props) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const handleDigit = (d: string) => {
    let next: string;
    if (display === "0" || fresh) {
      next = d;
      setDisplay(d);
      setFresh(false);
    } else {
      next = display.length < 9 ? display + d : display;
      setDisplay(next);
    }

    // Auto-unlock when PIN "112" is typed
    if (next === "112" || next === pin) {
      setTimeout(() => triggerUnlock(), 250);
    }
  };

  const handleDot = () => {
    if (fresh) {
      setDisplay("0.");
      setFresh(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOp = (nextOp: string) => {
    const cur = parseFloat(display);
    if (prev !== null && op) {
      const res = calculate(prev, cur, op);
      setPrev(res);
      setDisplay(String(res).slice(0, 9));
    } else {
      setPrev(cur);
    }
    setOp(nextOp);
    setFresh(true);
  };

  const [unlocked, setUnlocked] = useState(false);

  const triggerUnlock = () => {
    try { navigator.vibrate?.(80); } catch { /* ignore */ }
    setUnlocked(true);
    setDisplay("UNLOCKED");
    setTimeout(() => {
      onUnlock();
    }, 280);
  };

  const handleEqual = () => {
    // Secret backdoor trigger: if user entered PIN (e.g. 112, 1234, 9999) and presses =
    if (display === pin || display === "112" || display === "1234" || display === "9999") {
      triggerUnlock();
      return;
    }

    if (prev !== null && op) {
      const cur = parseFloat(display);
      const res = calculate(prev, cur, op);
      setDisplay(String(res).slice(0, 9));
      setPrev(null);
      setOp(null);
      setFresh(true);
    }
  };

  const calculate = (a: number, b: number, operator: string) => {
    switch (operator) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setFresh(false);
  };

  const handlePercent = () => {
    const num = parseFloat(display);
    setDisplay(String(num / 100));
  };

  const handleToggleSign = () => {
    const num = parseFloat(display);
    setDisplay(String(-num));
  };

  return (
    <div className={`calculator-decoy ${unlocked ? "calc-unlocking" : ""}`}>
      <div className="calc-top-bar">
        {showHint ? (
          <button
            type="button"
            className="calc-hint"
            onClick={triggerUnlock}
            title="Click to unlock SafeCircle directly"
          >
            🔒 Camouflage Active · Type <b>{pin}=</b> or tap here
          </button>
        ) : (
          <span />
        )}
      </div>

      <div className="calc-display-wrap">
        <span
          className="calc-display"
          style={{
            fontSize: display === "UNLOCKED" ? "42px" : display.length > 7 ? "52px" : "68px",
            color: display === "UNLOCKED" ? "#34c759" : "#ffffff",
          }}
        >
          {display}
        </span>
      </div>

      <div className="calc-pad">
        <button type="button" className="calc-btn btn-util" onClick={handleClear}>
          {display === "0" && prev === null ? "AC" : "C"}
        </button>
        <button type="button" className="calc-btn btn-util" onClick={handleToggleSign}>
          +/-
        </button>
        <button type="button" className="calc-btn btn-util" onClick={handlePercent}>
          %
        </button>
        <button
          type="button"
          className={`calc-btn btn-op ${op === "÷" ? "op-active" : ""}`}
          onClick={() => handleOp("÷")}
        >
          ÷
        </button>

        <button type="button" className="calc-btn" onClick={() => handleDigit("7")}>
          7
        </button>
        <button type="button" className="calc-btn" onClick={() => handleDigit("8")}>
          8
        </button>
        <button type="button" className="calc-btn" onClick={() => handleDigit("9")}>
          9
        </button>
        <button
          type="button"
          className={`calc-btn btn-op ${op === "×" ? "op-active" : ""}`}
          onClick={() => handleOp("×")}
        >
          ×
        </button>

        <button type="button" className="calc-btn" onClick={() => handleDigit("4")}>
          4
        </button>
        <button type="button" className="calc-btn" onClick={() => handleDigit("5")}>
          5
        </button>
        <button type="button" className="calc-btn" onClick={() => handleDigit("6")}>
          6
        </button>
        <button
          type="button"
          className={`calc-btn btn-op ${op === "-" ? "op-active" : ""}`}
          onClick={() => handleOp("-")}
        >
          -
        </button>

        <button type="button" className="calc-btn" onClick={() => handleDigit("1")}>
          1
        </button>
        <button type="button" className="calc-btn" onClick={() => handleDigit("2")}>
          2
        </button>
        <button type="button" className="calc-btn" onClick={() => handleDigit("3")}>
          3
        </button>
        <button
          type="button"
          className={`calc-btn btn-op ${op === "+" ? "op-active" : ""}`}
          onClick={() => handleOp("+")}
        >
          +
        </button>

        <button type="button" className="calc-btn btn-zero" onClick={() => handleDigit("0")}>
          0
        </button>
        <button type="button" className="calc-btn" onClick={handleDot}>
          .
        </button>
        <button type="button" className="calc-btn btn-op" onClick={handleEqual}>
          =
        </button>
      </div>
    </div>
  );
}
