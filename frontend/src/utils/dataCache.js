const cache = {
  dashboard: null,
  timetable: null,
  attendanceSummary: null,
  tasks: null,
  profile: null
};

export const getCachedData = (key) => {
  return cache[key];
};

export const setCachedData = (key, data) => {
  cache[key] = data;
};

export const clearCache = () => {
  Object.keys(cache).forEach((k) => {
    cache[k] = null;
  });
};
