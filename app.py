"""
app.py
Aplikasi Web Simulasi Analisis Numerik:
- Metode 1: Metode Tabel
- Metode 2: Metode Bisection (Bagi Dua)
- Metode 3: Metode Newton-Raphson

Dapat dijalankan menggunakan Flask ATAU secara mandiri menggunakan modul standar Python (http.server)
tanpa perlu instalasi paket tambahan jika diinginkan.
"""

import os
import sys
import json
from typing import Dict, Any

from numerical_methods import (
    metode_tabel,
    metode_bisection,
    metode_newton_raphson
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")


def process_simulation(data: Dict[str, Any]) -> Dict[str, Any]:
    """Router fungsi untuk memproses simulasi berdasarkan metode yang dipilih."""
    method = data.get("metode")
    func_str = data.get("fungsi", "").strip()

    if not func_str:
        return {"status": "error", "message": "Fungsi f(x) tidak boleh kosong."}

    try:
        if method == "tabel":
            a = float(data.get("a", 0))
            b = float(data.get("b", 1))
            n = int(data.get("n", 10))
            return metode_tabel(func_str, a, b, n)

        elif method == "bisection":
            a = float(data.get("a", 0))
            b = float(data.get("b", 1))
            tol = float(data.get("tol", 1e-5))
            max_iter = int(data.get("max_iter", 50))
            return metode_bisection(func_str, a, b, tol, max_iter)

        elif method == "newton":
            dfunc_str = data.get("dfungsi", "").strip() or None
            x0 = float(data.get("x0", 0))
            tol = float(data.get("tol", 1e-6))
            max_iter = int(data.get("max_iter", 50))
            return metode_newton_raphson(func_str, dfunc_str, x0, tol, max_iter)

        else:
            return {"status": "error", "message": f"Metode '{method}' tidak dikenali."}

    except ValueError as ve:
        return {"status": "error", "message": str(ve)}
    except Exception as e:
        return {"status": "error", "message": f"Terjadi kesalahan: {str(e)}"}


# ==========================================
# Cek ketersediaan Flask
# ==========================================
try:
    from flask import Flask, request, jsonify, render_template, send_from_directory
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False


if HAS_FLASK:
    app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=STATIC_DIR)

    @app.route("/")
    def index():
        root_index = os.path.join(BASE_DIR, "index.html")
        if os.path.exists(root_index):
            with open(root_index, "r", encoding="utf-8") as f:
                return f.read()
        return render_template("index.html")

    @app.route("/api/simulasi", methods=["POST"])
    def api_simulasi():
        data = request.get_json(silent=True) or {}
        result = process_simulation(data)
        if result.get("status") == "error":
            return jsonify(result), 400
        return jsonify(result)

    def run_server(port=5000):
        print(f"[*] Berjalan dengan Flask di http://localhost:{port}")
        app.run(host="0.0.0.0", port=port, debug=True)

else:
    # Fallback murni menggunakan pustaka bawaan Python (http.server)
    import urllib.parse
    from http.server import HTTPServer, SimpleHTTPRequestHandler

    class StandaloneHandler(SimpleHTTPRequestHandler):
        def translate_path(self, path):
            # Arahkan path statis
            parsed = urllib.parse.urlparse(path).path
            if parsed.startswith("/static/"):
                relative = parsed[len("/static/"):]
                return os.path.join(STATIC_DIR, relative.replace('/', os.sep))
            return super().translate_path(path)

        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path).path
            if parsed == "/" or parsed == "/index.html":
                root_index = os.path.join(BASE_DIR, "index.html")
                index_path = root_index if os.path.exists(root_index) else os.path.join(TEMPLATES_DIR, "index.html")
                if os.path.exists(index_path):
                    with open(index_path, "rb") as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Content-Length", str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                    return
                else:
                    self.send_error(404, "File index.html tidak ditemukan")
                    return
            elif parsed.startswith("/static/"):
                return super().do_GET()
            else:
                self.send_error(404, "Halaman tidak ditemukan")

        def do_POST(self):
            parsed = urllib.parse.urlparse(self.path).path
            if parsed == "/api/simulasi":
                content_len = int(self.headers.get("Content-Length", 0))
                post_body = self.rfile.read(content_len).decode("utf-8")
                try:
                    req_data = json.loads(post_body)
                except Exception:
                    req_data = {}

                result = process_simulation(req_data)
                resp_json = json.dumps(result).encode("utf-8")

                status_code = 400 if result.get("status") == "error" else 200
                self.send_response(status_code)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(resp_json)))
                self.end_headers()
                self.wfile.write(resp_json)
                return

            self.send_error(404, "Endpoint tidak ditemukan")

    def run_server(port=5000):
        print(f"[*] Menjalankan Standalone Python Server (http.server)")
        print(f"[*] Buka di browser: http://localhost:{port}")
        server = HTTPServer(("0.0.0.0", port), StandaloneHandler)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")
            server.server_close()


if __name__ == "__main__":
    port = 5000
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run_server(port)

