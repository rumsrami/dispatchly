package logger

import "log"

// AppLogger is an app logger
type AppLogger struct {
	Info *log.Logger
	Err  *log.Logger
}

// NewAppLogger ...
func NewAppLogger(info, er *log.Logger) *AppLogger {
	return &AppLogger{
		Info: info,
		Err:  er,
	}
}
