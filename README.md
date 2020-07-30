DISPATCHLY - RoseRocket Coding Challenge
=================

-	Website: https://rr-dispatcher.netlify.app

Dispatchly is a tool for dispatchers to manage tasks for different drivers. A Task is a distinct job per driver that has a start date, end date and an operation. Dispatchly provides a unique and convenient way for you to efficiently manage your resources.

Running the app
---
Clone the repo and navigate to the root folder
```
git clone git@github.com:rumsrami/dispatchly.git`
cd dispatchly
```

#### Using docker-compose (production build)

1. Install docker-cli and docker-compose
2. From the root folder run the client and the server
``` make compose ```
3. Access the app using the browser
``` http://localhost:8080 ```
> This builds the client and runs it on Nginx 
> The server will run and listen to requests
> maps port 8080:80 (client) 9000:9000 (server)

#### Local environment without docker (dev environment)
#### Server
1. Install Go v1.14+
2. From the root folder run the following in sequence
```
1. make tools
2. make run
```
> Server will run on port 9000
#### Client
- In a separate terminal window
1. Navigate to root folder `cd dispatchly`
2. Then the client folder `cd react-client`
3. Run `yarn`
4. Run `yarn start`
> Client will run on port 3000

Using the app
----
- Create new tasks by updating the driver's name, task type, week, day and time
- Task will show up in the dispatcher timetable
- You can delete tasks right from the table by clicking on the delete icon
- You can update the task using the pen icon
- Updating the task will overwrite existing tasks with time conflicts
- You cannot create a new task unless you delete any time conflicting tasks
