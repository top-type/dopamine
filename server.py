#!/usr/bin/env python3
"""
Simple HTTP Server for running the Dopamine game locally
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import mimetypes

# Set the port for the server
PORT = 8000

class MyHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP request handler with improved MIME type handling"""
    
    def __init__(self, *args, **kwargs):
        # Initialize the MIME types
        mimetypes.add_type('application/javascript', '.js')
        mimetypes.add_type('text/css', '.css')
        mimetypes.add_type('application/json', '.json')
        super().__init__(*args, **kwargs)
    
    def log_message(self, format, *args):
        """Customize logging format to be more readable"""
        sys.stderr.write("%s - %s\n" %
                         (self.address_string(),
                          format % args))
    
    def guess_type(self, path):
        """Improve MIME type guessing for web files"""
        # Try to use the improved mimetypes module first
        mimetype = mimetypes.guess_type(path)[0]
        if mimetype:
            return mimetype
        
        # Fall back to parent method if needed
        return super().guess_type(path)

def run_server():
    """Run the HTTP server"""
    # Create the server with improved handling of interruptions
    Handler = MyHandler
    
    try:
        # Create and start the server
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
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
                print("Server shutdown complete")
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"ERROR: Port {PORT} is already in use. Try stopping other servers or use a different port.")
        else:
            print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # Make sure we're in the right directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Run the server
    run_server() 