package main

import (
	"log"
	"os"
)

// build is the git version of this program. It is set using build flags in the makefile.
var build = "develop"
var environment = "local"

func main() {

	if err := run(); err != nil {
		log.Print(err)
		os.Exit(1)
	}

}
