DISPATCHLY - RoseRocket Coding Challenge
----

Key components of the Backend api
---
1. **[WebRPC](https://github.com/webrpc/webrpc)** http server.
2. **[NATS](https://github.com/nats-io/nats-server)** embedded messaging server.
3. **[NATS Go Client](https://github.com/nats-io/nats.go)** message broker that connects to NATS server.
4. **Server Sent Events** pushing updates to connected clients.
5. **Concurrent embedded memory store** data structure handling the drivers' schedule.

- The rpc requests from the client are handled by the Webrpc server.
- The stream requests from the client are handled by Nats server.
- Message distribution from the api to clients is multiplexed by Nats internally.
- Requests that deal with the state (create, update, delete and read tasks) are added to a queue.
- The memory store takes the requests one by one with a buffer to handle load.
- (Elixir/Erlang) Actor like pattern is used to make the memory structure thread safe without the use of locks and mutexes.

Limitations
---
1. Did not have time to implement the CSV report generator
2. Time pickers don't work as expected on safari (chrome, firefox, brave work well)
3. No backend time conflicts validation for time, depend only on the front end
4. If an error occurs on the backend it sends 500 instead of a customized error response