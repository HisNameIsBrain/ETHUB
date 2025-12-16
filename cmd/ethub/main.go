package main

import (
	"log"
	"net/http"
	"os"

	"ethub/internal/server"
)

func main() {
	addr := ":8080"
	if port := os.Getenv("PORT"); port != "" {
		addr = ":" + port
	}

	handler := server.New()

	log.Printf("Starting ETHUB Go server on %s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
