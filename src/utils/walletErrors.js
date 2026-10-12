// First-top-up gating for wallet errors.
// Partners who never completed a wallet credit (hasToppedUp === false)
// should not see the raw "Insufficient wallet balance" text on report
// surfaces — they see a friendly add-funds prompt with a CTA instead.
// hasToppedUp === null (still loading) must fall through to the real
// message to avoid a flash, matching the showPrice pattern.

export const FIRST_TOPUP_MESSAGE =
  "Please add funds to pull reports — one top-up unlocks everything.";

export const isInsufficientBalanceError = (err) => {
  if (!err) return false;
  const data = err?.response?.data || {};
  if (err?.response?.status === 402) return true;
  if (data?.code === "INSUFFICIENT_BALANCE") return true;
  const msg = String(data?.message || data?.error?.message || err?.message || "");
  return /insufficient[^.]{0,60}balance|balance[^.]{0,60}insufficient/i.test(msg);
};

// Resolve what to show in a report form's error Alert. Returns the
// friendly first-top-up message only when the partner verifiably never
// topped up; otherwise returns the backend message (or fallback).
export const resolveReportError = (err, hasToppedUp, fallback) => {
  const backendMsg =
    err?.response?.data?.message ||
    err?.response?.data?.error?.message ||
    err?.message ||
    fallback;
  if (hasToppedUp === false && isInsufficientBalanceError(err)) {
    return FIRST_TOPUP_MESSAGE;
  }
  return backendMsg;
};

// True when the currently displayed error string is the first-top-up
// prompt (used to render the Add Funds CTA alongside the Alert).
export const isFirstTopupPrompt = (error, hasToppedUp) =>
  hasToppedUp === false && error === FIRST_TOPUP_MESSAGE;
