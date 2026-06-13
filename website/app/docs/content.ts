export interface DocPage {
  slug: string
  title: string
  description: string
  content: string
}

export const docs: DocPage[] = [
  {
    slug: "quick-start",
    title: "Quick Start",
    description:
      "Get ffmpeg-over-ip running in minutes — install the server on your GPU machine, configure the client on your media server, and verify the connection.",
    content: `
Download the latest release for your platform from the [releases page](https://github.com/steelbrain/ffmpeg-over-ip/releases/latest).

## Server Setup (GPU machine)

1. Extract the release. Keep \`ffmpeg-over-ip-server\`, \`ffmpeg\`, and \`ffprobe\` in the same directory — the server finds them automatically.

2. Create a config file \`ffmpeg-over-ip.server.jsonc\` in the same directory:

\`\`\`jsonc
{
  "address": "0.0.0.0:5050",
  "authSecret": "pick-a-strong-secret"
}
\`\`\`

3. Make sure port 5050 is open (firewall, cloud security group, etc.), then start the server:

\`\`\`bash
./ffmpeg-over-ip-server
\`\`\`

## Client Setup (media server)

1. Extract \`ffmpeg-over-ip-client\` somewhere convenient.

2. Create a config file \`ffmpeg-over-ip.client.jsonc\` next to the binary or in your home directory:

\`\`\`jsonc
{
  "address": "192.168.1.100:5050",  // your server's IP
  "authSecret": "pick-a-strong-secret"
}
\`\`\`

3. Set up ffprobe so your media server can probe files too — symlink or copy the client binary:

\`\`\`bash
ln -s ffmpeg-over-ip-client ffprobe
# or: cp ffmpeg-over-ip-client ffprobe
\`\`\`

4. Point your media server at both binaries. For Jellyfin, set the FFmpeg path in Dashboard > Playback to \`ffmpeg-over-ip-client\`.

## Windows

On Windows, use the \`.exe\` binaries from the release. Config files work the same way — place \`ffmpeg-over-ip.client.jsonc\` next to the binary or in your user directory (\`C:\\Users\\<you>\\\`). For ffprobe, copy and rename the client binary:

\`\`\`cmd
copy ffmpeg-over-ip-client.exe ffprobe.exe
\`\`\`

## Verify

Test the connection by running a command through the client:

\`\`\`bash
./ffmpeg-over-ip-client -version
\`\`\`

You should see the server's ffmpeg version and build info. If you get a connection error, double-check the address, port, and auth secret.

## Alternative: Environment Variables

Instead of config files, you can pass configuration via environment variables. This is useful for Docker and scripted deployments:

\`\`\`bash
export FFMPEG_OVER_IP_SERVER_ADDRESS=0.0.0.0:5050
export FFMPEG_OVER_IP_SERVER_AUTH_SECRET=pick-a-strong-secret
./ffmpeg-over-ip-server
\`\`\`

See [Configuration](/docs/configuration#environment-variables) for all supported variables.
`,
  },
  {
    slug: "configuration",
    title: "Configuration",
    description:
      "Reference for ffmpeg-over-ip config — addresses, auth, environment variables, search paths, codec rewrites, local fallback, logging, and Unix sockets.",
    content: `
Config files use [JSONC](https://code.visualstudio.com/docs/languages/json#_json-with-comments) format (JSON with \`//\` comments, \`/* */\` block comments, and trailing commas).

## Config Resolution Order

Configuration is resolved in this order (first match wins):

1. **Explicit path** — \`--config <path>\` (server only)
2. **Config file env var** — \`FFMPEG_OVER_IP_SERVER_CONFIG\` / \`FFMPEG_OVER_IP_CLIENT_CONFIG\` pointing to a file
3. **Individual env vars** — if both \`_ADDRESS\` and \`_AUTH_SECRET\` are set (see [Environment Variables](#environment-variables) below)
4. **File search** — standard paths (see below)

## Environment Variables

If both \`ADDRESS\` and \`AUTH_SECRET\` env vars are set (and no \`_CONFIG\` env var is set), configuration is read entirely from environment variables — no config file is needed.

### Client

| Variable | Required | Description |
|---|---|---|
| \`FFMPEG_OVER_IP_CLIENT_ADDRESS\` | Yes | Server address (\`host:port\` or \`unix:/path\`) |
| \`FFMPEG_OVER_IP_CLIENT_AUTH_SECRET\` | Yes | HMAC auth secret (must match server) |
| \`FFMPEG_OVER_IP_CLIENT_LOG\` | No | Log destination: \`stdout\`, \`stderr\`, or file path |
| \`FFMPEG_OVER_IP_CLIENT_FALLBACK_TO_LOCAL\` | No | Run local ffmpeg if the server is unreachable (\`true\`, \`1\`, \`yes\`, \`y\` — case-insensitive) |
| \`FFMPEG_OVER_IP_CLIENT_DEBUG\` | No | Log original/rewritten args when fallback runs (\`true\`, \`1\`, \`yes\`, \`y\` — case-insensitive) |

### Server

| Variable | Required | Description |
|---|---|---|
| \`FFMPEG_OVER_IP_SERVER_ADDRESS\` | Yes | Listen address (\`host:port\` or \`unix:/path\`) |
| \`FFMPEG_OVER_IP_SERVER_AUTH_SECRET\` | Yes | HMAC auth secret (must match client) |
| \`FFMPEG_OVER_IP_SERVER_LOG\` | No | Log destination: \`stdout\`, \`stderr\`, or file path |
| \`FFMPEG_OVER_IP_SERVER_DEBUG\` | No | Log original/rewritten args (\`true\`, \`1\`, \`yes\`, \`y\` — case-insensitive) |

Rewrites (server \`rewrites\` and client \`fallbackRewrites\`) are not supported via environment variables — use a config file if you need them.

### Example (Docker / scripted deployment)

\`\`\`bash
docker run \\
  -e FFMPEG_OVER_IP_CLIENT_ADDRESS=192.168.1.100:5050 \\
  -e FFMPEG_OVER_IP_CLIENT_AUTH_SECRET=my-secret \\
  -v ./ffmpeg-over-ip-client:/usr/bin/ffmpeg \\
  your-image
\`\`\`

## Config File Search Paths

If no explicit path or env var config is used, the first file found wins:

1. Next to the binary: \`<exe-dir>/ffmpeg-over-ip.{server,client}.jsonc\`
2. Next to the binary (hidden): \`<exe-dir>/.ffmpeg-over-ip.{server,client}.jsonc\`
3. \`./ffmpeg-over-ip.{server,client}.jsonc\`
4. \`./.ffmpeg-over-ip.{server,client}.jsonc\`
5. \`~/.ffmpeg-over-ip.{server,client}.jsonc\`
6. \`~/.config/ffmpeg-over-ip.{server,client}.jsonc\`
7. \`/etc/ffmpeg-over-ip.{server,client}.jsonc\`
8. \`/usr/local/etc/ffmpeg-over-ip.{server,client}.jsonc\`

The server also accepts \`--config <path>\`.

On Windows, \`~\` is your user directory (e.g., \`C:\\Users\\<you>\`). Paths 7 and 8 don't apply — use the binary directory, current directory, or an environment variable instead.

To see which paths are searched on your system, run:

\`\`\`bash
ffmpeg-over-ip-server --debug-print-search-paths
ffmpeg-over-ip-client --debug-print-search-paths
\`\`\`

## Server Config

\`\`\`jsonc
{
  "address": "0.0.0.0:5050",
  "authSecret": "your-secret-here",
  // Optional: see "Log" section below (default: no logging)
  "log": "stdout",
  // Optional: log original and rewritten args for each command (default: false)
  "debug": true,
  // Optional: see "Rewrites" section below
  "rewrites": [
    ["h264_nvenc", "h264_qsv"],
  ],
}
\`\`\`

The server looks for \`ffmpeg\` and \`ffprobe\` in the same directory as its own binary. Ship all three together.

## Client Config

\`\`\`jsonc
{
  "address": "192.168.1.100:5050",
  "authSecret": "your-secret-here",
  // Optional: see "Log" section below
  "log": "/tmp/ffmpeg-over-ip.log",
  // Optional: see "Fallback to local ffmpeg" section below (default: false)
  "fallbackToLocal": false,
  // Optional: rewrites applied only when running the local fallback
  "fallbackRewrites": [
    ["h264_nvenc", "h264_qsv"],
  ],
  // Optional: log original and rewritten args when fallback runs (default: false)
  "debug": false,
}
\`\`\`

## ffprobe

The client detects ffprobe mode from its binary name. Create a symlink (or copy) whose name contains "ffprobe":

\`\`\`bash
# Linux / macOS
ln -s ffmpeg-over-ip-client ffprobe

# Windows
mklink ffprobe.exe ffmpeg-over-ip-client.exe
\`\`\`

Any name containing "ffprobe" works — \`ffprobe\`, \`my-ffprobe\`, \`ffprobe-remote\`, etc.

## Fallback to local ffmpeg

When \`fallbackToLocal\` is enabled, the client runs the host's own \`ffmpeg\` (or \`ffprobe\`) directly if it can't connect to the server. This keeps transcoding working when the GPU machine is offline — useful for media servers like Jellyfin where any transcoder is better than none.

\`\`\`jsonc
{
  "fallbackToLocal": true,
  // Optional: rewrites applied to argv before exec'ing the local ffmpeg.
  // Same format and semantics as server "rewrites" — useful for swapping
  // codecs that the local hardware can't handle (e.g., NVENC -> QSV).
  "fallbackRewrites": [
    ["h264_nvenc", "h264_qsv"],
  ],
}
\`\`\`

Behavior:

- Only triggered when the initial TCP connection to the server fails. Once a session is established, mid-stream errors are still fatal — we don't restart a partial transcode locally.
- \`ffmpeg\` vs \`ffprobe\` is selected by the client's argv[0] basename, exactly like the non-fallback path. A binary named \`ffprobe\` (or any name containing \`ffprobe\`) looks for \`ffprobe\` on PATH; everything else looks for \`ffmpeg\`.
- The local binary is located by searching \`$PATH\`. On Windows the bare name is tried first (so MSYS / Git-Bash shims named simply \`ffmpeg\` resolve), then each \`%PATHEXT%\` extension. The client always skips its own executable, so it's safe to install the client as \`ffmpeg\` on \`$PATH\` without recursing.
- \`FFMPEG_OVER_IP_*\` env vars are stripped from the local ffmpeg's environment so the auth secret doesn't leak into \`/proc/<pid>/environ\`.
- Empty and \`.\` entries in \`$PATH\` are skipped (cwd-on-PATH is a known foot-gun).
- If no local binary is found, the client exits with code 1 and the diagnostic is written to the configured \`log\` sink. Logging is disabled by default — enable \`"log": "stderr"\` (or a file path) if you want to see fallback events.

Security notes:

- Enabling \`fallbackToLocal\` means anyone who can write a file named \`ffmpeg\` to a directory earlier in \`$PATH\` than the real binary can hijack transcodes. Only enable on hosts where you trust \`$PATH\`.
- On Windows, \`%PATHEXT%\` is searched in its declared order (default \`.COM;.EXE;...\`), so a malicious \`ffmpeg.com\` would be picked up before \`ffmpeg.exe\`. Same caveat: trust your \`$PATH\`.
- A non-root user with write access to any directory in root's \`$PATH\` can hijack transcodes that root invokes. Audit \`$PATH\` directory permissions when running the client as root.
- All fallback diagnostics go to the configured \`log\` sink, not to ffmpeg's stdout/stderr (the client is an invisible proxy). To debug fallback in production where stderr is consumed by Jellyfin or another media server, set \`log\` to a file path.

## Rewrites

Rewrites let the server substitute argv elements in ffmpeg arguments before running the command. This is useful when the client requests a codec the server doesn't have — for example, the client asks for \`h264_nvenc\` but the server has Intel QSV instead of NVIDIA.

\`\`\`jsonc
{
  "rewrites": [
    ["h264_nvenc", "h264_qsv"],
    ["hevc_nvenc", "hevc_qsv"],
  ],
}
\`\`\`

Each pair \`["find", "replace"]\` matches whole argv elements — not substrings within them. The example above rewrites any argv element exactly equal to \`h264_nvenc\` to \`h264_qsv\`. An element like \`h264_nvenc_extra\` would not match.

\`find\` and \`replace\` are each split on whitespace, so a single rewrite can match a consecutive run of argv elements and substitute a run of different length:

\`\`\`jsonc
{
  "rewrites": [
    // Swap a two-element run (-hwaccel qsv) for a different two-element run.
    ["-hwaccel qsv", "-hwaccel cuda"],

    // Expand a two-element run into a four-element run.
    ["-hwaccel qsv", "-hwaccel cuda -hwaccel_output_format cuda"],

    // Remove a one-element argv entry entirely (empty replacement).
    ["-nostdin", ""],

    // Remove a two-element run.
    ["-preset veryfast", ""],
  ],
}
\`\`\`

Rewrites are applied in declared order, so a later rewrite can match tokens produced by an earlier one. The same rewrite is applied to every matching run in argv, not just the first.

Enable \`"debug": true\` on the server to log original and rewritten arguments for each command.

## Log

The \`log\` field controls where log output goes. Supported values:

| Value | Behavior |
|---|---|
| \`"stdout"\` | Log to standard output |
| \`"stderr"\` | Log to standard error |
| \`false\` or omitted | Disable logging (default) |
| \`"/path/to/file.log"\` | Log to a file (created if missing, appended if exists) |

Note: \`false\` must be the JSON boolean (no quotes). The string \`"false"\` would be treated as a file path.

File paths support \`$TMPDIR\`, \`$HOME\`, \`$USER\`, and \`$PWD\` interpolation (both \`$VAR\` and \`\${VAR}\` syntax):

\`\`\`jsonc
// expands to e.g. /tmp/ffmpeg-over-ip.log
"log": "$TMPDIR/ffmpeg-over-ip.log"

// use braces to disambiguate from e.g. $HOMEDIR
"log": "\${HOME}/logs/ffmpeg-over-ip.log"
\`\`\`

If the parent directory doesn't exist or the file can't be opened, a warning is printed to stderr and logging falls back to stderr.

## Address

The \`address\` field supports TCP and Unix domain sockets:

| Format | Example | Description |
|---|---|---|
| \`host:port\` | \`"0.0.0.0:5050"\` | TCP (default) |
| \`hostname:port\` | \`"server.local:5050"\` | TCP with hostname |
| \`unix:/path\` | \`"unix:/tmp/ffmpeg.sock"\` | Unix domain socket |

Unix domain sockets work on Linux, macOS, and Windows 10+. The server automatically cleans up the socket file on shutdown.

## Performance Tuning

The patched \`ffmpeg\` on the server tunnels its file reads back to the client. To cut round trips, the fio layer reads ahead, prefetches the next block while the current one is consumed, and caches recently-read ranges. Two optional environment variables tune this. They are read by \`ffmpeg\` at startup, so set them in the **server's** environment — the server passes its environment through to the \`ffmpeg\` it launches. The defaults suit most workloads; you rarely need to change them.

| Variable | Default | Description |
|---|---|---|
| \`FFOIP_READAHEAD_BYTES\` | \`2097152\` (2 MiB) | Maximum read-ahead window per open file. The window starts small and grows toward this value on sustained sequential reads. Values above 16 MiB are clamped. Set to \`0\` to disable read-ahead and prefetch entirely (one network read per ffmpeg read). |
| \`FFOIP_RANGE_CACHE_BYTES\` | \`268435456\` (256 MiB) | Maximum bytes of previously-read ranges cached per open file, so backward seeks and re-reads are served without a round trip. Only applies to read-only files of 256 MiB or smaller. Set to \`0\` to disable the range cache. |

Notes:

- Both values are byte counts. An unparseable value is ignored with a warning and the default is used.
- When \`FFOIP_READAHEAD_BYTES\` is left unset, a smaller automatic cap (1.25 MiB) is applied to files under 1 GiB; setting the variable explicitly overrides that heuristic for all files.
- These knobs trade a little server memory for fewer round trips. Larger values help high-latency links and sequential reads; they don't help seek-heavy access, where read-ahead resets on every seek.

\`\`\`bash
# Set in the server's environment (shell, systemd unit, etc.)
FFOIP_READAHEAD_BYTES=4194304 FFOIP_RANGE_CACHE_BYTES=536870912 \\
  ffmpeg-over-ip-server --config /etc/ffmpeg-over-ip.server.jsonc

# Docker: pass through with -e
docker run \\
  -e FFOIP_READAHEAD_BYTES=4194304 \\
  -e FFMPEG_OVER_IP_SERVER_ADDRESS=0.0.0.0:5050 \\
  -e FFMPEG_OVER_IP_SERVER_AUTH_SECRET=my-secret \\
  your-server-image
\`\`\`
`,
  },
  {
    slug: "docker",
    title: "Docker Integration",
    description:
      "Run ffmpeg-over-ip in Docker — mount the client as /usr/bin/ffmpeg, configure via environment variables, and use Unix sockets for same-machine setups.",
    content: `
You can use ffmpeg-over-ip in Docker environments by mounting the binary and passing configuration via environment variables. This allows containers to use ffmpeg remotely without needing GPU passthrough or other special setup.

## Client in Docker

Mount the client binary as \`/usr/bin/ffmpeg\` and pass config via environment variables:

\`\`\`bash
docker run \\
  -e FFMPEG_OVER_IP_CLIENT_ADDRESS=192.168.1.100:5050 \\
  -e FFMPEG_OVER_IP_CLIENT_AUTH_SECRET=your-secret \\
  -v ./ffmpeg-over-ip-client:/usr/bin/ffmpeg \\
  your-image
\`\`\`

For ffprobe support, add a second mount:

\`\`\`bash
docker run \\
  -e FFMPEG_OVER_IP_CLIENT_ADDRESS=192.168.1.100:5050 \\
  -e FFMPEG_OVER_IP_CLIENT_AUTH_SECRET=your-secret \\
  -v ./ffmpeg-over-ip-client:/usr/bin/ffmpeg \\
  -v ./ffmpeg-over-ip-client:/usr/bin/ffprobe \\
  your-image
\`\`\`

You can also use a config file volume instead of env vars — see [Configuration](/docs/configuration) for details.

## Server in Docker

\`\`\`bash
docker run \\
  -e FFMPEG_OVER_IP_SERVER_ADDRESS=0.0.0.0:5050 \\
  -e FFMPEG_OVER_IP_SERVER_AUTH_SECRET=your-secret \\
  -v ./ffmpeg-over-ip-server:/usr/bin/ffmpeg-over-ip-server \\
  -v ./ffmpeg:/usr/bin/ffmpeg \\
  -v ./ffprobe:/usr/bin/ffprobe \\
  --runtime=nvidia \\
  your-image
\`\`\`

All three binaries (\`ffmpeg-over-ip-server\`, \`ffmpeg\`, \`ffprobe\`) must be in the same directory inside the container.

## Unix Sockets (same-machine setups)

If the server and client run on the same machine (e.g., server on the host, client in a container), use a Unix socket instead of TCP to avoid network overhead and \`host.docker.internal\` configuration:

Start the server with a socket address (config file or env var):

\`\`\`bash
export FFMPEG_OVER_IP_SERVER_ADDRESS=unix:/tmp/ffmpeg-over-ip.sock
export FFMPEG_OVER_IP_SERVER_AUTH_SECRET=your-secret
./ffmpeg-over-ip-server
\`\`\`

Then mount the socket into the container:

\`\`\`bash
docker run \\
  -e FFMPEG_OVER_IP_CLIENT_ADDRESS=unix:/tmp/ffmpeg-over-ip.sock \\
  -e FFMPEG_OVER_IP_CLIENT_AUTH_SECRET=your-secret \\
  -v /tmp/ffmpeg-over-ip.sock:/tmp/ffmpeg-over-ip.sock \\
  -v ./ffmpeg-over-ip-client:/usr/bin/ffmpeg \\
  your-image
\`\`\`

## Debugging

Enable debug logging on the server via env vars:

\`\`\`bash
docker run \\
  -e FFMPEG_OVER_IP_SERVER_ADDRESS=0.0.0.0:5050 \\
  -e FFMPEG_OVER_IP_SERVER_AUTH_SECRET=your-secret \\
  -e FFMPEG_OVER_IP_SERVER_LOG=stdout \\
  -e FFMPEG_OVER_IP_SERVER_DEBUG=true \\
  -v ./ffmpeg-over-ip-server:/usr/bin/ffmpeg-over-ip-server \\
  -v ./ffmpeg:/usr/bin/ffmpeg \\
  -v ./ffprobe:/usr/bin/ffprobe \\
  --runtime=nvidia \\
  your-image
\`\`\`

For the client, log to a file you can tail from inside the container:

\`\`\`bash
docker run \\
  -e FFMPEG_OVER_IP_CLIENT_ADDRESS=192.168.1.100:5050 \\
  -e FFMPEG_OVER_IP_CLIENT_AUTH_SECRET=your-secret \\
  -e FFMPEG_OVER_IP_CLIENT_LOG=/tmp/ffmpeg-over-ip.client.log \\
  -v ./ffmpeg-over-ip-client:/usr/bin/ffmpeg \\
  your-image
\`\`\`

Then tail it:

\`\`\`bash
docker exec -it <container> tail -f /tmp/ffmpeg-over-ip.client.log
\`\`\`

Note: rewrites require a config file — they can't be set via env vars. If you need rewrites alongside env var config, use \`FFMPEG_OVER_IP_SERVER_CONFIG\` to point to a config file instead.
`,
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description:
      "Fixes for common ffmpeg-over-ip issues — connection refused, auth failures, missing codecs, ffprobe detection, and macOS Gatekeeper quarantine.",
    content: `
**Connection refused** — Check that the server is running, the address and port match your config, and the port is reachable (firewall, cloud security group, Docker network). Also verify the server is listening on the right host — \`127.0.0.1:5050\` only accepts local connections. Use \`0.0.0.0:5050\` to listen on all interfaces.

> **Tip:** To test whether the port is reachable, run \`telnet <server-ip> <port>\` from the client machine. If telnet can't connect, a firewall or security group is blocking the port — fix that before troubleshooting ffmpeg-over-ip itself.

**Authentication failed** — The \`authSecret\` must match exactly between client and server configs.

**Codec not found / encoder not available** — The server's ffmpeg may not support the requested codec. Use \`rewrites\` in the server config to map unsupported codecs to available ones (e.g., \`["h264_nvenc", "h264_qsv"]\`). See [Configuration — Rewrites](/docs/configuration#rewrites).

**ffprobe not working** — The client detects ffprobe mode from its binary name. The binary or symlink must contain "ffprobe" in the name. See [Configuration — ffprobe](/docs/configuration#ffprobe).

**Server can't find ffmpeg** — \`ffmpeg\` and \`ffprobe\` must be in the same directory as \`ffmpeg-over-ip-server\`.

**macOS Gatekeeper error** — Downloaded binaries may be quarantined by macOS. You may see \`"ffmpeg-over-ip" Not Opened — Apple could not verify "ffmpeg-over-ip" is free of malware that may harm your Mac or compromise your privacy\`, or \`Killed: 9\` when running from the terminal. Remove the quarantine attribute:

\`\`\`bash
# Server package
xattr -dr com.apple.quarantine ffmpeg ffprobe ffmpeg-over-ip-server

# Client package
xattr -dr com.apple.quarantine ffmpeg-over-ip-client
\`\`\`

**Need more detail?** — Enable logging on both sides. Set \`"log": "stdout"\` and \`"debug": true\` on the server to see the commands being executed. Set \`"log": "/tmp/ffmpeg-over-ip.log"\` on the client to capture client-side activity. **If you're using \`fallbackToLocal\`**, also set \`"debug": true\` on the client to log original and rewritten args when local fallback runs.
`,
  },
  {
    slug: "upgrading",
    title: "Upgrading from v4 to v5",
    description:
      "Migrate ffmpeg-over-ip from v4 to v5 — drop the shared filesystem, remove ffmpegPath, update Unix socket addresses, and replace --config on the client.",
    content: `
## Architecture Change

v4 required a **shared filesystem** (Docker mount, NFS, or SMB) between client and server to transfer video data. The client and server coordinated commands over a lightweight protocol, but actual file I/O happened through the shared filesystem.

v5 **eliminates the shared filesystem entirely**. The server runs a patched ffmpeg that tunnels all file I/O (reads, writes, seeks, stat, etc.) back to the client over the TCP connection. Files are never stored on the server, and no shared storage is needed.

This means:
- No more NFS/SMB mount setup or maintenance
- No more path mapping between client and server filesystems
- Works across networks where shared storage isn't practical

## Breaking Config Changes

### \`ffmpegPath\` removed

v4 required you to specify the path to ffmpeg on the server:

\`\`\`jsonc
// v4 (remove this)
"ffmpegPath": "/usr/bin/ffmpeg"
\`\`\`

v5 ships patched \`ffmpeg\` and \`ffprobe\` binaries in the release. The server finds them automatically in the same directory as its own binary. Place all three files together and remove \`ffmpegPath\` from your config.

### Unix socket address format changed

v4 used bare paths for Unix sockets:

\`\`\`jsonc
// v4
"address": "/tmp/ffmpeg-over-ip.sock"
\`\`\`

v5 uses the \`unix:\` prefix (following the gRPC/Docker convention):

\`\`\`jsonc
// v5
"address": "unix:/tmp/ffmpeg-over-ip.sock"
\`\`\`

TCP addresses (\`host:port\`) are unchanged.

### \`--config\` removed from client

v4 supported \`--config\` on both client and server. v5 only supports it on the server, since the client forwards all arguments to ffmpeg. Use environment variables or config file search paths instead:

\`\`\`bash
FFMPEG_OVER_IP_CLIENT_CONFIG="/path/to/config.jsonc" ffmpeg-over-ip-client ...
\`\`\`

Alternatively, pass configuration directly via individual environment variables — no config file required:

\`\`\`bash
FFMPEG_OVER_IP_CLIENT_ADDRESS=192.168.1.100:5050 \\
FFMPEG_OVER_IP_CLIENT_AUTH_SECRET=your-secret \\
ffmpeg-over-ip-client ...
\`\`\`

See [Configuration — Environment Variables](/docs/configuration#environment-variables) for the full list.

## New Features in v5

### No shared filesystem required

The biggest change. See the [home page](/) for the architecture overview.

### Pre-built ffmpeg binaries

Releases include patched \`ffmpeg\` and \`ffprobe\` with hardware acceleration support (NVENC, QSV, VAAPI, AMF, VideoToolbox, and more) built on [jellyfin-ffmpeg](https://github.com/jellyfin/jellyfin-ffmpeg). No need to install ffmpeg separately on the server.

### Block comments

Config files now support \`/* */\` block comments in addition to \`//\` line comments.

## Migration Checklist

1. Download the v5 release (includes \`ffmpeg-over-ip-server\`, \`ffmpeg\`, and \`ffprobe\`)
2. Place all three server binaries in the same directory
3. Remove \`ffmpegPath\` from your server config
4. If using Unix sockets, add the \`unix:\` prefix to your address
5. Remove path rewrites from your server config (no longer needed without shared filesystems)
6. Remove any shared filesystem mounts that were only needed for ffmpeg-over-ip
7. If using \`--config\` on the client, switch to the \`FFMPEG_OVER_IP_CLIENT_CONFIG\` env var
`,
  },
]

export function getDoc(slug: string): DocPage | undefined {
  return docs.find((d) => d.slug === slug)
}
