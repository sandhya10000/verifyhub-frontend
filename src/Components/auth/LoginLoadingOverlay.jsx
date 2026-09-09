import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Logo from "../shared/Logo";

/**
 * LoginLoadingOverlay
 *
 * Full-viewport loading overlay rendered into document.body via a portal.
 * Covers both the left BrandPanel and right login card.
 *
 * Props:
 *   visible  - boolean. When true the overlay is shown; when false it fades out then unmounts.
 */
const LoginLoadingOverlay = ({ visible }) => {
  const [mounted, setMounted] = useState(visible);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setFading(false);
    } else if (mounted) {
      setFading(true);
      const timer = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!mounted) return null;

  return ReactDOM.createPortal(
    <>
      <style>{`
        @keyframes vh-spinner-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes vh-logo-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(0.96); }
        }
        .vh-login-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          background: rgba(10, 22, 40, 0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          opacity: 1;
          transition: opacity 0.38s ease;
        }
        .vh-login-overlay.fading {
          opacity: 0;
        }
        .vh-overlay-logo {
          animation: vh-logo-pulse 1.8s ease-in-out infinite;
          filter: drop-shadow(0 0 18px rgba(59,130,246,0.55));
        }
        .vh-overlay-spinner-track {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3.5px solid rgba(255,255,255,0.15);
          border-top-color: #3B82F6;
          border-right-color: #7EA6FF;
          animation: vh-spinner-spin 0.8s linear infinite;
          box-shadow: 0 0 20px rgba(59,130,246,0.35);
        }
        .vh-overlay-label {
          font-family: "Plus Jakarta Sans", "Inter", sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.55);
        }
      `}</style>

      <div
        className={`vh-login-overlay${fading ? " fading" : ""}`}
        role="status"
        aria-live="polite"
        aria-label="Signing in, please wait"
      >
        <Logo height={54} className="vh-overlay-logo" alt="VerifyHub" />
        <div className="vh-overlay-spinner-track" aria-hidden="true" />
        <span className="vh-overlay-label">Signing in…</span>
      </div>
    </>,
    document.body
  );
};

export default LoginLoadingOverlay;
