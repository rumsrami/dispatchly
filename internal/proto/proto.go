// Package proto ...
//go:generate webrpc-gen -schema=dispatch.ridl -target=go -pkg=proto -server -client -out=./dispatch.gen.go
//go:generate webrpc-gen -schema=dispatch.ridl -target=ts -pkg=proto -client -out=./dispatch.gen.ts
package proto
