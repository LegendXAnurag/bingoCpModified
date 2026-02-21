
interface CachedResponse {
  timestamp: number;
  data: any;
}

const CACHE_DURATION_MS = Number(process.env.CODEFORCES_CACHE_DURATION_MS) || 10 * 1000; // Default 10 seconds
const MIN_REQUEST_DELAY_MS = 250; // Delay between new outgoing requests

const submissionCache = new Map<string, CachedResponse>();
const pendingRequests = new Map<string, Promise<any>>();
let lastRequestTime = 0;

/**
 * Delays execution to ensure a minimum gap between requests.
 */
async function throttle() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_DELAY_MS) {
    const delay = MIN_REQUEST_DELAY_MS - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastRequestTime = Date.now();
}

/**
 * Fetches user submissions with caching, request coalescing, and throttling.
 * @param handle Codeforces user handle
 */
export async function fetchUserSubmissions(handle: string) {
  const now = Date.now();

  // 1. Check Cache
  const cached = submissionCache.get(handle);
  if (cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return cached.data;
  }

  // 2. Check Pending Requests (Request Coalescing)
  if (pendingRequests.has(handle)) {
    return pendingRequests.get(handle);
  }

  // 3. Create New Request
  const promise = (async () => {
    try {
      await throttle(); // Ensure we don't spam the API
      console.log(`[Codeforces] Fetching submissions for ${handle}...`);
      const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=50`);

      if (!res.ok) {
        const text = await res.text();
        console.warn(`[Codeforces] API error for ${handle}: ${res.status}`, text.substring(0, 100));
        throw new Error(`API error ${res.status}`);
      }

      let data;
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text();
        console.error(`[Codeforces] Non-JSON response for ${handle}:`, text.substring(0, 100));
        throw new Error("Invalid API response format");
      }

      const result = data.status === "OK" ? data.result : [];
      console.log(`[Codeforces] Fetched ${result.length} submissions for ${handle}`);

      // Update Cache
      submissionCache.set(handle, { timestamp: Date.now(), data: result });
      return result;
    } catch (error) {
      console.error(`[Codeforces] Error fetching ${handle}:`, error);
      return []; // Return empty on error to prevent crashing consumers
    } finally {
      pendingRequests.delete(handle);
    }
  })();

  pendingRequests.set(handle, promise);
  return promise;
}

// Keep the original function signature for backward compatibility, but use the new logic
export async function fetchRecentSubmissions(handles: string[]) {
  const results = await Promise.all(handles.map(fetchUserSubmissions));
  return results.flat();
}
