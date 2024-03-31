import {RouterHandler} from "@tsndr/cloudflare-worker-router";

export interface Env {
	database: D1Database;
}

export interface Record {
	id: number;
	hostname: string;
	public_key: string;
}

export type Handler = RouterHandler<Env>;
