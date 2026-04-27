/**
 * Lightweight user-agent parser — no external dependencies.
 * Returns browser, OS, and deviceType strings.
 */
export function parseUserAgent(ua = "") {
  let browser = "Unknown";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";

  let os = "Unknown";
  if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Macintosh/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let deviceType = "Desktop";
  if (/Mobi|Android/.test(ua) && !/Tablet|iPad/.test(ua)) deviceType = "Mobile";
  else if (/Tablet|iPad/.test(ua)) deviceType = "Tablet";

  return { browser, os, deviceType };
}
