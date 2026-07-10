export const getCachedData = (key, username) => {
  if (!username) return null;
  const storageKey = `campus_${key}_${username}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data;
  } catch (e) {
    console.error('Failed to read from offline cache:', e);
    return null;
  }
};

export const setCachedData = (key, username, data) => {
  if (!username) return;
  const storageKey = `campus_${key}_${username}`;
  const timestampKey = `campus_${key}_${username}_time`;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ data }));
    localStorage.setItem(timestampKey, Date.now().toString());
  } catch (e) {
    console.error('Failed to write to offline cache:', e);
  }
};

export const isCacheValid = (key, username) => {
  if (!username) return false;
  const timestampKey = `campus_${key}_${username}_time`;
  try {
    const rawTime = localStorage.getItem(timestampKey);
    if (!rawTime) return false;
    const age = Date.now() - parseInt(rawTime, 10);
    return age < 120000; // 2 minutes cache validity
  } catch (e) {
    return false;
  }
};

export const invalidateCache = (key, username) => {
  if (!username) return;
  const timestampKey = `campus_${key}_${username}_time`;
  try {
    localStorage.removeItem(timestampKey);
  } catch (e) {}
};

export const clearCacheForUser = (username) => {
  if (!username) return;
  const keys = ['dashboard', 'timetable', 'attendanceSummary', 'tasks', 'profile'];
  keys.forEach((key) => {
    try {
      localStorage.removeItem(`campus_${key}_${username}`);
      localStorage.removeItem(`campus_${key}_${username}_time`);
    } catch (e) {}
  });
};
