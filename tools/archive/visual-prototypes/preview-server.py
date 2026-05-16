import http.server, socketserver, os
from pathlib import Path

PORT = 8800
os.chdir(Path(__file__).parent)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    print(f"Previews at http://localhost:{PORT}/wiki-v1.html  (v1-v3: original concepts)")
    print(f"             http://localhost:{PORT}/wiki-v2.html")
    print(f"             http://localhost:{PORT}/wiki-v3.html")
    print(f"             http://localhost:{PORT}/wiki-v4.html  (v4-v5: redesigns)")
    print(f"             http://localhost:{PORT}/wiki-v5.html")
    print(f"             (v6 is the live version at public/wiki/index.html)")
    httpd.serve_forever()
