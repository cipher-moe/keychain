# keychain
I felt the need to reinvent the wheel, so I drafted up a few lines of code to manage SSH public keys more easily.

### Description
The public keys are served via a Cloudflare Worker.

Data is modified using the Cloudflare web UI (endpoint implementation to modify it via the worker is available, but commented out because I didn't want to figure out authentication).
Therefore, it is important to keep your Cloudflare account secure.

A Go client is installed on servers, and then calls to the Worker (I hardcoded my own endpoint, change it to yours) to provide `authorized_keys` for authentication.

### Requirements
- Go 1.22 or later
- Node.js 20 or later
- [Yarn Classic](https://classic.yarnpkg.com/lang/en/) (just `npm install --global yarn` if you don't have it)

### Build
##### Server
  - Ensure you have `yarn` and Node.js 20 or later.
  - Go to the `server` directory.
  - Run `yarn --immutable`.
  - Create a [Cloudflare D1](https://developers.cloudflare.com/d1/) database with `yarn wrangler d1 create your_database`. Edit `wrangler.toml` accordingly (don't change the `binding` name, it is referenced in code).
  - Import database models with `yarn wrangler d1 execute your_database --remote --file=./src/db.sql`.
  - Deploy it with `yarn deploy`. Keep the worker URL handy, we'll need it later.

##### Client
  - Ensure you have Go 1.22 installed.
  - Edit `main.go`, replace my endpoint with yours (the one I just told you to keep).
  - Run `CGO_ENABLED=0 go build` in the `client` directory.
  - Copy the resulting `keychain` binary to your server.
  - Move it to somewhere appropriate, like `/usr/local/bin` and set proper permissions (0755, owned by `root`)
  - Configure your SSH server to use it as the key provider like this :
    ```
    AuthorizedKeysCommand /usr/local/bin/keychain
    AuthorizedKeysCommandUser nobody
    ```
  - Restart your SSH server so those changes take effect.
`
