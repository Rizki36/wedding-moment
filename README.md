# Wedding Moment

A TanStack Start app with Tailwind CSS v4 and Headless UI.

```bash
pnpm install
pnpm dev
```

Edit `src/routes/index.tsx` to get started. Add route files under
`src/routes`; TanStack Router updates `src/routeTree.gen.ts` for you.

Build the production app with:

```bash
pnpm build
```

## Deploy to Cloudflare Workers

This project uses the Cloudflare Vite plugin (configured in `vite.config.ts`) and `wrangler.jsonc`:

1. Install Wrangler: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Deploy: `npx wrangler deploy`

For production env vars, run `wrangler secret put MY_VAR` for each secret listed in `.env.example`. Public (non-secret) vars go in `wrangler.jsonc` under `vars`.

KV, D1, R2, and Durable Object bindings are configured in `wrangler.jsonc` — see https://developers.cloudflare.com/workers/wrangler/configuration/.

### R2 bucket CORS

Uploads (frames, guest photo/audio submissions) use presigned URLs that the
browser `PUT`s to R2 directly, so the R2 bucket itself needs a CORS policy —
otherwise uploads fail with a CORS error. After creating the bucket, apply
the policy in `cors.json`:

```bash
wrangler r2 bucket cors set <R2_BUCKET_NAME> --file ./cors.json
wrangler r2 bucket cors list <R2_BUCKET_NAME>  # verify
```

Update `cors.json`'s `AllowedOrigins` if you attach a custom domain instead
of the default `*.workers.dev` subdomain.


