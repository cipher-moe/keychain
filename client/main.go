package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type Record struct {
	Id        int    `json:"id"`
	Hostname  string `json:"hostname"`
	Username  string `json:"username"`
	PublicKey string `json:"public_key"`
}

func main() {
	username := os.Args[1]
	hostname, err := os.Hostname()

	if err != nil {
		log.Fatalf("%s", err)
	}

	url := fmt.Sprintf("https://keychain.cipher.moe/keys/%s/%s", hostname, username)
	r, err := http.Get(url)

	if err != nil {
		log.Fatalf("%s", err)
	}

	defer r.Body.Close()

	var record []Record
	if err = json.NewDecoder(r.Body).Decode(&record); err != nil {
		log.Fatalf("%s", err)
	}

	for _, row := range record {
		fmt.Printf("%s\n", row.PublicKey)
	}
}
