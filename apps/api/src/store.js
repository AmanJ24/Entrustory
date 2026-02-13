import crypto from 'node:crypto';

const versions = new Map();
const timelineEvents = [];
const verificationLogs = [];

function createEvent({ work_item_id, version_id = null, event_type, event_metadata = {} }) {
  return {
    id: crypto.randomUUID(),
    work_item_id,
    version_id,
    event_type,
    event_metadata,
    created_at: new Date().toISOString()
  };
}

export function saveVersion(record) {
  versions.set(record.version_id, record);
  timelineEvents.push(
    createEvent({
      work_item_id: record.work_item_id,
      version_id: record.version_id,
      event_type: 'VersionCreated',
      event_metadata: {
        version_number: record.version_number,
        merkle_root: record.merkle_root,
        file_count: record.files.length
      }
    })
  );
  return record;
}

export function getVersion(versionId) {
  return versions.get(versionId);
}

export function getTimeline(workItemId) {
  return timelineEvents.filter((e) => e.work_item_id === workItemId);
}

export function appendVerificationLog(log) {
  const entry = {
    id: crypto.randomUUID(),
    ...log,
    created_at: new Date().toISOString()
  };
  verificationLogs.push(entry);
  return entry;
}

export function getVerificationLogsByVersion(versionId) {
  return verificationLogs.filter((l) => l.version_id === versionId);
}
