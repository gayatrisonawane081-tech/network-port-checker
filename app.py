from flask import Flask, render_template, request, jsonify
import socket
import time

app = Flask(__name__)

# Common ports required for the project
COMMON_PORTS = {
    21: "FTP",
    22: "SSH",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    443: "HTTPS"
}


def check_port(target, port):
    """
    Check whether a TCP port is open or closed.
    """

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Prevent the program from waiting too long
    sock.settimeout(2)

    start_time = time.perf_counter()

    try:
        result = sock.connect_ex((target, port))

        end_time = time.perf_counter()

        response_time = round((end_time - start_time) * 1000, 2)

        if result == 0:
            status = "OPEN"
        else:
            status = "CLOSED"

        return {
            "port": port,
            "status": status,
            "response_time": response_time
        }

    except socket.gaierror:
        return {
            "port": port,
            "status": "INVALID HOST",
            "response_time": 0
        }

    except socket.timeout:
        return {
            "port": port,
            "status": "TIMEOUT",
            "response_time": 0
        }

    except socket.error:
        return {
            "port": port,
            "status": "ERROR",
            "response_time": 0
        }

    finally:
        sock.close()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/check-port", methods=["POST"])
def check_single_port():

    data = request.get_json()

    target = data.get("target", "").strip()
    port = data.get("port")

    # Validate target
    if not target:
        return jsonify({
            "success": False,
            "message": "Please enter an IP address or hostname."
        }), 400

    # Validate port
    try:
        port = int(port)
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Port must be a number."
        }), 400

    if port < 1 or port > 65535:
        return jsonify({
            "success": False,
            "message": "Port must be between 1 and 65535."
        }), 400

    result = check_port(target, port)

    service = COMMON_PORTS.get(port, "Unknown")

    result["service"] = service

    return jsonify({
        "success": True,
        "target": target,
        "result": result
    })


@app.route("/scan-common", methods=["POST"])
def scan_common_ports():

    data = request.get_json()

    target = data.get("target", "").strip()

    # Validate target
    if not target:
        return jsonify({
            "success": False,
            "message": "Please enter an IP address or hostname."
        }), 400

    results = []

    for port, service in COMMON_PORTS.items():

        result = check_port(target, port)

        result["service"] = service

        results.append(result)

    open_ports = sum(
        1 for result in results
        if result["status"] == "OPEN"
    )

    closed_ports = sum(
        1 for result in results
        if result["status"] == "CLOSED"
    )

    return jsonify({
        "success": True,
        "target": target,
        "results": results,
        "total": len(results),
        "open": open_ports,
        "closed": closed_ports
    })


if __name__ == "__main__":
    app.run(debug=True)