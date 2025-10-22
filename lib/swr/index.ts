import { mutate } from "swr"



/**
 * === Refresh cached data for a specific SWR API endpoint ===
 *
 * This function forces SWR to revalidate and refetch data
 * from the provided API endpoint. Useful after data mutations
 * (e.g., POST, PUT, DELETE) to keep UI in sync.
 *
 * @param {string} apiEndpoint - The endpoint whose cached data should be refreshed.
 * 
 * @example
 * refreshData('/api/transactions');
 */
export const refreshData = (apiEndpoint: string) => {
    mutate(apiEndpoint)
}



/**
 * === SWR-compatible data fetcher ===
 *
 * Fetches data from the given URL and parses it as JSON.
 * Designed to be used with the SWR hook as the `fetcher` argument.
 *
 * @param {string} url - The URL to fetch data from.
 * 
 * @example
 * const { data } = useSWR('/api/data', swrFetcher);
 */
export const swrFetcher = (url: string) => fetch(url).then((res) => res.json());