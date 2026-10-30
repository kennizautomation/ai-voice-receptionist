"use strict";
const assert = require("node:assert/strict");
const { normalizeLead } = require("./normalize-lead");

const goodEvent = {
  event_type: "lead_captured",
  call_id: "demo-call-001",
  lead: {
    name: " Alex Example ",
    email: "Alex@Example.com",
    phone: "+15555550101",
    service: "HVAC assessment",
    requested_time: "2030-06-12T10:00:00-05:00",
    timezone: "America/Chicago",
    consent_to_contact: true
  }
};

const output = normalizeLead(goodEvent);
assert.equal(output.name, "Alex Example");
assert.equal(output.email, "alex@example.com");
assert.equal(output.lead_status, "new");
assert.equal(output.requested_time, "2030-06-12T10:00:00-05:00");

assert.throws(() => normalizeLead({...goodEvent, lead: {...goodEvent.lead, email: "not-an-email"}}), /Invalid email/);
assert.throws(() => normalizeLead({...goodEvent, lead: {...goodEvent.lead, phone: "", email: ""}}), /contact method/);
assert.throws(() => normalizeLead({...goodEvent, lead: {...goodEvent.lead, timezone: "Mars/Olympus"}}), /timezone/);
assert.throws(() => normalizeLead({...goodEvent, lead: {...goodEvent.lead, consent_to_contact: "true"}}), /consent_to_contact/);
assert.throws(() => normalizeLead({...goodEvent, event_type: "unknown"}), /Unsupported/);
assert.throws(() => normalizeLead({...goodEvent, call_id: "../../secrets"}), /call_id/);
assert.throws(() => normalizeLead({...goodEvent, lead: {...goodEvent.lead, requested_time: "tomorrow"}}), /requested_time/);

console.log("8 lead normalization checks passed.");
