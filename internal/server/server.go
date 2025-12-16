package server

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

// Server exposes HTTP handlers for ETHUB functionality implemented in Go.
type Server struct {
	mux      *http.ServeMux
	openapi  []byte
	warnings []string
}

// New configures a Server with default routes.
func New() *Server {
	s := &Server{mux: http.NewServeMux()}
	s.loadOpenAPI()
	s.routes()
	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.mux.ServeHTTP(w, r)
}

func (s *Server) routes() {
	s.mux.HandleFunc("/healthz", s.handleHealth)
	s.mux.HandleFunc("/api/openapi", s.handleOpenAPI)
	s.mux.HandleFunc("/api/info", s.handleInfo)
	s.mux.HandleFunc("/", s.handleRoot)
}

func (s *Server) loadOpenAPI() {
	_, filename, _, ok := runtime.Caller(0)
	if !ok {
		s.warnings = append(s.warnings, "unable to resolve source directory")
		return
	}

	repoRoot := filepath.Clean(filepath.Join(filepath.Dir(filename), "../.."))
	specPath := filepath.Join(repoRoot, "openapi.json")

	data, err := os.ReadFile(specPath)
	if err != nil {
		log.Printf("warning: unable to load openapi.json: %v", err)
		s.warnings = append(s.warnings, "openapi specification not loaded")
		return
	}

	s.openapi = data
}

func (s *Server) handleRoot(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = w.Write([]byte("ETHUB Go service is running. See /api/info for details."))
}

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok", "time": time.Now().UTC().Format(time.RFC3339)})
}

func (s *Server) handleOpenAPI(w http.ResponseWriter, _ *http.Request) {
	if len(s.openapi) == 0 {
		http.Error(w, "missing OpenAPI spec", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(s.openapi)
}

func (s *Server) handleInfo(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	info := map[string]interface{}{
		"name":        "ETHUB Go Server",
		"description": "Lightweight Go entrypoint for serving ETHUB APIs",
		"health":      "/healthz",
		"openapi":     "/api/openapi",
	}

	if len(s.warnings) > 0 {
		info["warnings"] = s.warnings
	}

	_ = json.NewEncoder(w).Encode(info)
}
