export const getCachedData = (key, username) => {
  if (!username) return null;
  const storageKey = `campus_${key}_${username}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data;
  } catch (e) {
    return null;
  }
};

export const setCachedData = (key, username, data) => {
  if (!username) return;
  const storageKey = `campus_${key}_${username}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ data }));
  } catch (e) {}
};

export const clearCacheForUser = (username) => {
  if (!username) return;
  const keys = ['dashboard', 'timetable', 'attendanceSummary', 'tasks', 'profile'];
  keys.forEach((key) => {
    try {
      localStorage.removeItem(`campus_${key}_${username}`);
    } catch (e) {}
  });
};
