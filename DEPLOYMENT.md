# Stylyf Deployment

Stylyf is deployed directly from the repository checkout. The server does not use a copied release directory, helper scripts, or a separate deployment user.

## Production shape

- Repo path: `/root/stylyf`
- App runtime: SolidStart production build at `.output/server/index.mjs`
- Local bind: `127.0.0.1:3001`
- Public entry: `Caddy` on `:80` and `:443`
- Domains: `stylyf.com`, `www.stylyf.com`

## Build and restart

From the repo root:

```bash
npm install
npm run build
systemctl restart stylyf
systemctl reload caddy
```

## systemd unit

File: `/etc/systemd/system/stylyf.service`

```ini
[Unit]
Description=Stylyf SolidStart App
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/stylyf
Environment=NODE_ENV=production
Environment=HOST=127.0.0.1
Environment=PORT=3001
ExecStart=/usr/bin/node /root/stylyf/.output/server/index.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

After creating or editing the unit:

```bash
systemctl daemon-reload
systemctl enable --now stylyf
```

## Caddy site block

File: `/etc/caddy/Caddyfile`

```caddy
searchupp.com, www.searchupp.com {
	encode zstd gzip
	reverse_proxy 127.0.0.1:3000
}

stylyf.com, www.stylyf.com {
	encode zstd gzip
	reverse_proxy 127.0.0.1:3001 {
		header_up -Accept-Encoding
		transport http {
			compression off
		}
	}
}
```

Validate and reload:

```bash
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

## Deployment learnings

- Keep the proxy contract simple. Let `Caddy` handle edge compression and let the SolidStart/Nitro app serve normal upstream responses.
- Strip `Accept-Encoding` on the upstream proxy request for Stylyf. Caddy passes request headers through by default, and Nitro uses `Accept-Encoding` when deciding whether to serve precompressed public assets. If that contract gets out of sync with the build output, asset requests can fail.
- Do not add Stylyf-specific helper scripts or copied release directories. The repo checkout is the deployment source of truth, so the update flow stays:

```bash
git pull
npm install
npm run build
systemctl restart stylyf
systemctl reload caddy
```

## DNS

Required records:

```text
A      @      62.72.56.232
CNAME  www    stylyf.com
```

## Verification

```bash
systemctl status stylyf --no-pager
systemctl status caddy --no-pager
curl -I http://127.0.0.1:3001
curl -I https://stylyf.com
curl -I https://www.stylyf.com
```
