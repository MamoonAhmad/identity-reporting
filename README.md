## Identity Trace Reporting

Identity Trace Reporting helps you create, run and manage unit tests for your `python` code very easily. This software comes with a tracing agent for python called `identity-trace-python-agent` and reporting web app called `identity-server` which presents the different components of your python app with a GUI. 

The tracing agent is responsible for collecting data inside your python app. Tracing agent will keep track of executed functions, run unit tests and run functions on demand.
Identity Server will present a GUI to visualize the executed functions, design and execute unit tests, run functions on demand while giving you the ability to observe different components of your app and see and the interaction between them. Identity Server will let you create unit tests for your app in the matter of minutes.

Follow these easy steps to set up your `python` project for unit testing.

### Installation
#### Install Tracing Agent
```
pip install identity-trace-python-agent
```

In the root of your python project, create a file called `identity_config.json`. This file will be used to configure how tracer runs.

`identity_config.json`
```
{

	"modules": { // Tracer will decorate all the functions inside the modules listed in the modules
		"your_python_module": true // This will decorate all the functions  and classes inside the module
		"another_module": [... String list of function and class name to decorate]
	},
	"command": "/Users/mamoon/.local/share/virtualenvs/your-env-name/bin/python", // path to your virtualenv python. You can set it "python3" or "python" if you wanna use the global python without virtual env.
	"server_port": 8002, // Port on which Identity server will start. You can then visit http://localhost:8002 To access the identity server web app.
	"max_executed_functions": 100 // Number of executed function records to keep. 0 means unlimited. Limiting it will be good for storage space.
}
```

#### Install Identity Server
 Install Identity Server globally. You can use the identity server with multiple `python` apps. 
 ```
 npm install -g identity-server
 ```
 
 ### Run Identity Server
 From the root of your `python` app, run the command to start the Identity Server:
 ```
 identity-server
 ```

### Run Function Inside Your Python App
Inside the Identity Server home page, at the top right corner, Click `Run Function` and in the prompt, enter the python code for the function you want to run.
```
from my_python_module import my_function
my_function("some named or positional arguments to pass.")
```
When submitted, Identity Server will tell the tracer to run this code in the context of you python app. Once the function runs, tracer will capture the function execution and this function execution will be recorded. Once the function is executed, you will be redirected to a page where you will see the visual representation of the executed function. You will be able to see all the (decorated) functions that got called when `my_function` got executed.

![image](https://github.com/user-attachments/assets/c77e7302-1983-4b85-9fae-712840156b23)

In the above picture, you can see how each function and its children show up. In the above execution, `create_ticket_and_item` called `create_ticket` and `add_item_to_ticket`.

Lets say `my_function` called `another_function` from any other module or the same module, and you wanna see the function call to `another_function`. You would have to decorate `another_function` too. You can do that via `identity_config.json` file.

Once the function is executed, you will be able to see this function in executed functions list page by choosing the option from the menu bar.

### Create Test Suite From Executed Function

From the function execution view page, in the page actions, Click `Create New Test Suite`. This will take you to test suite creation page. Enter the name for your test suite and click `Save`.
Once the new test suite is created, you can add test cases to your test suite. Test you function with different inputs.
After setting up your test suite, you can run test by select `Run Test` from the top right corner, or Selecting `Run All Tests` from test suites list page.
