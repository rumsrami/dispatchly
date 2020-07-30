# Go parameters
GOCMD				=go
GOBUILD				=$(GOCMD) build
GOINSTALL			=$(GOCMD) install
GOCLEAN				=$(GOCMD) clean
GOTEST				=$(GOCMD) test
TEST_FLAGS        	?=-v
BINARY_NAME			=dispatch
BIN					=$$PWD/bin
GOMODULES			?=on

# Finding root folder
TOP 				=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
BOTTOM 				=$(shell dirname $(TOP))
VCS_REF	 			?=$(shell git describe --tags --long --abbrev=8 --always HEAD)

GOFLAGS        		?=-mod=vendor -gcflags='-e' -ldflags "-X main.build=${VCS_REF}"

##
## Build
##
define build
	GOGC=off GO111MODULE=$(GOMODULES) GOBIN=$(BIN) CGO_ENABLED=0 \
	$(GOINSTALL) -v $(GOFLAGS) $(1)
endef

build:
	$(call build,./cmd/$(BINARY_NAME))

##
## Local Development
##
define run
	sh -c '$(MAKE) build && \
	export BASE_PATH=$(TOP) && \
	./bin/$(1)'
endef

define run-help
	sh -c 'BASE_PATH=$(TOP) $(MAKE) build && \
	./bin/$(1) -h'
endef

define test
	sh -c 'BASE_PATH=$(TOP) go test ./... -v -cover'
endef

define test-color
	sh -c 'BASE_PATH=$(TOP) gotest ./... -v -cover'
endef

clean: 
	$(GOCLEAN) -modcache -testcache
	rm -rf ./bin/$(BINARY_NAME)

run:
	$(call run,$(BINARY_NAME))

run-help:
	$(call run-help,$(BINARY_NAME))

test:
	$(call test)

test-color:
	$(call test-color)

##
## Proto Gen
##
proto: proto-clean
	go generate ./internal/proto/...

proto-clean:
	rm -f ./internal/proto/*.gen.go
	rm -f ./internal/proto/*.gen.js
	rm -f ./internal/proto/*.gen.ts

##
## Tools
##
tools:
	export GO111MODULE=off && \
	go get -u github.com/goware/modvendor
	go get -u golang.org/x/tools/cmd/goimports
	go get -u github.com/rakyll/gotest


##
## Dependency mgmt
##
dep:
	@export GO111MODULE=on && \
		go mod tidy && \
		rm -rf ./vendor && go mod vendor && \
		modvendor -copy="**/*.c **/*.h **/*.s **/*.proto"

dep-upgrade-all:
	@GO111MODULE=on go get -u ./...
	@$(MAKE) dep


##
## Docker deploy
##
deploy:
	heroku container:push web --recursive

release:
	heroku container:release web


##
## Compose
##
compose-up:
	docker-compose up --build

compose-down:
	docker-compose down

##
## Load test
load-create-task:
	hey -m POST -c 100 -n 1000 -H "Content-Type: application/json" -d '{"req": {"operation": "Pickup","driverName": "fierce-bob","week": 1,"day": 2,"startHour": "17:00","duration": 2}}' "http://0.0.0.0:9000/rpc/Dispatch/CreateTask"

load-read-schedule:
	hey -m POST -c 100 -n 1000 -H "Content-Type: application/json" -d '{"req": {"driverName": "fierce-bob","week": 1}}' "http://0.0.0.0:9000/rpc/Dispatch/ReadSchedule"

load-delete-task:
	hey -m POST -c 100 -n 1000 -H "Content-Type: application/json" -d '{"req": {"driverName": "fierce-bob","week": 1,"day": 2,"startHour": "12:00"}}' "http://0.0.0.0:9000/rpc/Dispatch/DeleteTask"

