/**
 * Offline example: normalize a caller lead into a consistent CRM-facing record.
 * Synthetic inputs only. No network calls or production credential handling.
 *
 * Node.js: node examples/normalize-lead.test.js
 * n8n Code node adapter example:
 *   const { normalizeLead } = ... // bundle/import as supported in your environment
 *   return $input.all().map(item => ({json: normalizeLead(item.json)}));
 *
 * This module uses CommonJS for zero-dependency local tests.
 */
"use strict";

function normalizeLead(event) {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new TypeError("Event must be an object");
  }
  if (event.event_type !== "lead_captured") {
    throw new Error("Unsupported event_type");
  }
  const lead = event.lead;
  if (!lead || typeof lead !== "object" || Array.isArray(lead)) {
    throw new Error("Missing lead object");
  }
  const str = (value) => typeof value === "string" ? value.trim() : "";
  const callId = str(event.call_id);
  const name = str(lead.name);
  const email = str(lead.email).toLowerCase();
  const phone = str(lead.phone);
  const service = str(lead.service);
  const requestedTime = str(lead.requested_time);
  const timezone = str(lead.timezone);
  if (!callId || !/^[a-zA-Z0-9_-]{1,100}$/.test(callId)) throw new Error("Invalid call_id");
  if (!name || name.length > 120) throw new Error("Invalid contact name");
  if (!email && !phone) throw new Error("At least one contact method is required");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
  if (phone && !/^\+?[0-9() .-]{7,25}$/.test(phone)) throw new Error("Invalid phone");
  if (requestedTime && !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(requestedTime)) {
    throw new Error("requested_time must include an offset or Z");
  }
  if (requestedTime && Number.isNaN(Date.parse(requestedTime))) throw new Error("Invalid requested_time");
  if (timezone) {
    try { new Intl.DateTimeFormat("en", {timeZone: timezone}); }
    catch { throw new Error("Unknown IANA timezone"); }
  }
  if (typeof lead.consent_to_contact !== "boolean") throw new Error("consent_to_contact must be boolean");
  return {
    call_id: callId,
    name,
    email: email || null,
    phone: phone || null,
    service: service || "not specified",
    requested_time: requestedTime || null,
    timezone: timezone || null,
    consent_to_contact: lead.consent_to_contact,
    lead_status: "new"
  };
}

module.exports = { normalizeLead };
