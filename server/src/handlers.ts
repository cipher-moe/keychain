import {Env, Handler, Record} from "./types";
import {RouterHandler} from "@tsndr/cloudflare-worker-router";

export const ensureUser : RouterHandler<Env> = ({ req }) => {
	if (!req.params.host?.trim()) {
		return new Response('Missing hostname!', { status: 400 });
	}

	if (!req.params.user?.trim()) {
		return new Response('Missing username!', { status: 400 });
	}
}

export const ensureId : RouterHandler<Env> = async ({ req, env }) => {
	let id = +req.params.id?.trim();
	if (!id) {
		return new Response('Missing key ID!', { status: 400 });
	}

	// noinspection SqlResolve,SqlNoDataSourceInspection
	let r = env.database.prepare('select * from keys WHERE id = ? AND deleted = 0');
	let result = await r.bind(id).first<Record>();
	if (result == null) {
		return new Response('Key ID not found!', { status: 400 });
	}
}

export const get : Handler = async ({ req, env }) => {
	const host = (req.params.host as string).trim();
	const user = (req.params.user as string).trim();

	// noinspection SqlResolve,SqlNoDataSourceInspection
	let queries = env.database.prepare(
		`SELECT * FROM keys WHERE deleted = 0 AND username = ? AND hostname LIKE ? COLLATE NOCASE AND TRIM(hostname) = ? COLLATE NOCASE`
	);
	let result = await queries.bind(user, `%${host}%`, host).all<Record>();
	let v = result.results;
	return new Response(JSON.stringify(v, null, 4));
}

export const post : Handler = async ({ req, env }) => {
	const host = (req.params.host as string).trim();
	const user = (req.params.user as string).trim();
	const key = await req.text();
	if (!key?.trim()) {
		return new Response('Missing public key!', { status: 400 });
	}

	// noinspection SqlResolve,SqlNoDataSourceInspection
	let queries = env.database.prepare('INSERT INTO keys (hostname, public_key, username) VALUES (?, ?, ?)');
	let result = await queries.bind(host, key.trim(), user).run();
	return new Response(`${result.success ? 1 : result.error}`, { status: result.success ? 200 : 400 });
}

export const del : Handler = async ({ req, env }) => {
	let id = +req.params.id?.trim();

	// noinspection SqlResolve,SqlNoDataSourceInspection
	let queries = env.database.prepare('UPDATE keys SET deleted = 1 WHERE id = ?');
	let result = await queries.bind(id).run();
	return new Response(`${result.success ? 1 : result.error}`, { status: result.success ? 200 : 400 });
}
