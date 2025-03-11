#!/usr/bin/env python3
"""
Simple HTTP Server for running the Dopamine game locally
"""

import http.server
import socketserver
import webbrowser
import os
import sys

# Set the port for the server
PORT = 8000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    # Override to set proper MIME types for JavaScript files
    def guess_type(self, path):
        mimetype = http.server.SimpleHTTPRequestHandler.guess_type(self, path)
        if mimetype is None and path.endswith('.js'):
            mimetype = 'application/javascript'
        return mimetype

def run_server():
    # Create the server
    Handler = MyHandler
    httpd = socketserver.TCPServer(("", PORT), Handler)
    
    # Print server information
    print(f"Starting server at http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server")
    
    # Open the browser automatically
    webbrowser.open(f"http://localhost:{PORT}")
    
    try:
        # Start the server
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
        httpd.server_close()
        sys.exit(0)

if __name__ == "__main__":
    # Make sure we're in the right directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Run the server
    run_server() 