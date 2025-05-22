import axios from "axios";

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const getScanResults = (
  userId: string,
  tool: string,
  timestamp: string
) =>
  axios.get(
    `http://localhost:8000/scan/testreports/user-${userId}/${tool}/${timestamp}`
  );
