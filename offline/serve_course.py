from __future__ import annotations

import argparse
import mimetypes
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the OWM Course Mode offline package.")
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--directory", default="www")
    args = parser.parse_args()

    # Windows registry may map .js to text/plain; module scripts require a JavaScript MIME type.
    mimetypes.add_type("text/javascript", ".js", strict=True)
    mimetypes.add_type("text/javascript", ".mjs", strict=True)
    mimetypes.add_type("application/json", ".json", strict=True)
    mimetypes.add_type("application/wasm", ".wasm", strict=True)
    mimetypes.add_type("image/svg+xml", ".svg", strict=True)

    root = Path(args.directory).resolve()
    if not root.is_dir():
        raise SystemExit(f"Offline web directory not found: {root}")

    handler = lambda *handler_args, **handler_kwargs: SimpleHTTPRequestHandler(
        *handler_args,
        directory=str(root),
        **handler_kwargs,
    )
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    print(f"OWM Course Mode: http://127.0.0.1:{args.port}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
