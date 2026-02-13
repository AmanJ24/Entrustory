export const versions = new Map();

export function saveVersion(record) {
  versions.set(record.version_id, record);
  return record;
}

export function getVersion(versionId) {
  return versions.get(versionId);
}
