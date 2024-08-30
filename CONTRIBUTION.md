## Contribution Guidelines

### Contribution
- Create a fork of repository if you wish to work on a feature or an issue.
- Only work on issues or feature requests which has a `ready` label.
- Browse the issue tracker before creating a new issue or feature request. We records all the issues and feature requests in the issue tracker.
- In your issue, explain in detail whats wrong or what needs to be added, in such a way that other people can read it. Once an issue or feature request is approved, it should get a `ready` label.
- It is recommended to create an issue and get an approval to work on it. We value your time and it would be frustrating for you to create a PR only to get it rejected.

### Development

#### Python Tracing Agent 

You can create a symlink of `./identity-trace-python-agent/identity_trace` inside your `site-packages` folder of you virtual env, if you wish to contribute to the development of tracing agent. 

#### Identity Server
Identity Server has the pattern of entities on both frontend and backend. Each entity has its own folder which contains `README.md` file explaining what that entity does.

**Backend Directory Structure**
```
	backend/
		entities/
			<entity_name> // Entity name like TestSuite or ExecutedFunction
				endpoints.js // Defines SocketIO or REST API endpoints
				controller.js // Defines handler functions for the endpoints
				loader.js // Responsible for loading the data from storage. Controller will utilize loaders to load the data. Controller can use loaders from other entities.
				README.md // Explains each endpoint and controller in detail.
				
```

**Frontend Directory Structure**
```
	frontend/
		src/
			entities/
				<entity_name> // Entity name like TestSuite or ExecutedFunction
					routes.tsx // Responsible for defining react router routes
					services.ts // Defines functions to retrieve data from APIs
					<Page_Name>.tsx // For each page on the entity, there will be a file.
					
```

Entry point for Identity server is `cli.js` in the root of backend.