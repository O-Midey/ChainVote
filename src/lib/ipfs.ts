import axios from "axios";
import { PollMetadata } from "./types";

const GATEWAY = "https://gateway.pinata.cloud/ipfs";

export async function uploadMetadata(metadata: PollMetadata): Promise<string> {
  const res = await axios.post("/api/ipfs/upload", metadata);
  return res.data.cid as string;
}

export async function fetchMetadata(cid: string): Promise<PollMetadata> {
  const res = await axios.get(`${GATEWAY}/${cid}`, { timeout: 8000 });
  return res.data as PollMetadata;
}
