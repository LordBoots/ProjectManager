/**
 * Snapshot id rotated on every persisted save so local/remote compares detect any data change without manual semver bumps.
 */
export function newDataUid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const hex = () =>
    Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, '0');
  return `${hex()}-${hex()}-${hex()}-${hex()}-${hex()}${hex()}`;
}
