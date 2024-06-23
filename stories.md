


Server

- wants to run the code written by user

    
    #### Proposal 1
    - creates a run file in temp directory and writes the code to be executed in the file
    - tracing agent reads the run file and reads the code to be executed
    - runs the code in client environment
    - collector creates a new ClientExecutedFunction record
    - collector gets intercepted and ClientExecutedFunction id is added to the run file
    - server can re-read the run file, read the executed function ids and process the functions

- wants to execute a function ClientExecutedFunction
    
    #### Proposal 1
    - create a run file
    - agent reads the executed function module name and function name
    - agent imports the module
    - agent calls the function by name
    - collector creates a new ClientExecutedFunction record
    - collector gets intercepted and ClientExecutedFunction id is added to the run file
    - server can re-read the run file, read the executed function ids and process the functions

- Wants to run a test suite

    #### Proposal 1
    - create a run file, writes the test suite to run file
    - agent reads every test in test suite
    - for each test, it imports the module
    - agent imports the module
    - agent calls the function by name
    - collector creates a new ClientExecutedFunction record
    - collector gets intercepted and ClientExecutedFunction id is added to the run file
    - server can re-read the run file, read the executed function ids and process the functions

- wants to run a test in a test suite
    ### Proposal 1
    - create a run file, writes the test case to run file along with test case id and input to pass and function to run
    - agent reads test case
    - agent imports the module
    - agent calls the function by name
    - collector creates a new ClientExecutedFunction record
    - collector gets intercepted and ClientExecutedFunction id is added to the run file
    - server can re-read the run file, read the executed function ids and process the functions

- wants to run multiple test suits

    ### Proposal 1
    - create a run file, test suits to run in the run file.
    - agent reads test cases in every test suite along with
    - agent imports the module
    - agent calls the function by name
    - collector creates a new ClientExecutedFunction record
    - collector gets intercepted and ClientExecutedFunction id is added to the run file
    - server can re-read the run file, read the executed function ids and process the functions


Looking at all the requirements, it can be assumed that the agent will need either a code or function information, input to pass to that function and respond to the function execution accordingly.

But data wise there are different types of operations which require some processing. For instance, if the server wants run a test suite, then all the inputs for the function and information about the function is in test suite itself. In this case, should the agent read all the test cases ? and extract the function information along with input to pass ? OR the server can write all the information about function and input to pass, in a run file. The idea would be to make processing on the agent side a little simple.

Server will prepare a run file that agent will read. run file will be in a way that agent understands. Meaning agent should not have to worry about the data architecture of test suits and test cases. Agent should just read the run file and execute functions. 

Agent will have only two jobs
- When a function is executed and it didn't run using run file , it should just send the trace to identity server
- When a function is executed and did run by run file, it should write the executed function trace to the run file accordingly.

Run File Config
```
{

    signal_endpoint?: string // Runner can send the signal for function the it is executed successfully.
    functions_to_run : [
        {
            execution_id: string
            input_to_pass: JSONObject
            function_meta?: {
                module_name: string // Agent will import this module. Decorator in the module should register the function.
                function_name: string // This name will be used to get function from registry.
                file_name: string // file name of the function
            }
            code?: string // agent will run this code which should initiate a function with the input.
            // one of function_meta or code option is required. If both are present, function_meta will be utilized.

            action: string // Action name, "test_run" for instance. For this action, a callback will be run before executing the client function.

            context?: {

            } // this is action specific context. A test runner sets mock details to in the context to return mock outputs for mocked functions.

            executed_function: Executed Function Trace. This will be written by agent.
        } // there can be more than one function to run
    ]
}
```
Executed Function Trace
```
type ExecutedFunction {
    name: string
    id: string
    parent_id?: string // present if not a root function
    input: any // input passed to the function
    output: any // output emitted by function
    thrown_error: string // error thrown by function
    executed_successfully: boolean // true if the function did not throw any error
    children: ExecutedFunction[] // all the functions called by this function

    execution_context: {
        copy_input: boolean
        deep_copy_input: boolean
        copy_input_error?: string
        copy_output: boolean
        deep_copy_output: boolean
        copy_output_error?: string

        // This object will have more keys depending on the type of decorator used. A test run decorator will set additional details like whether the function was mocked or not.
        
    } // Will be set automatically by the decorator function
}

```

Test Suite

```
type TestSuite {
    id: string
    name: string
    description?: string
    test_cases: TestCase[]
}

type TestCase {
    id: string
    name: string
    function_to_execute: {
        function_meta?: {
            module_name: string
            function_name: string
        }
        code?: string // code that will be executed
    }
    input_to_pass: any[]
    assertions: TestCaseAssertion[]
}

type TestCaseAssertion {
    assertion_target?: "input" | "output" // Whether this assertion check is for input or output of the function.
    object?: any // input or output config
    operator?: "equals" | "contains"
    code?: string // user defined code for testing the function output or input. Expects a function which will receive ${ExecutedFunction} in the param. Code should be in javascript language.

    // Either Code or all the others except code is required. 
}

```


### Test Result

```
type TestSuiteResult {
    id: string
    name: string
    description?: string
    test_case_results: TestCaseResult[]

    successful: boolean
}

type TestCaseResult {
    test_case_config: 
    id: string
    name: string
    function_to_execute: {
        function_meta?: {
            module_name: string
            function_name: string
        }
        code?: string // code that will be executed
    }
    input_to_pass: any[]
    executed_function: ExecutedFunction
    assertions: TestCaseAssertionResult[]

    failure_message: string
    successful: boolean
}


type TestCaseAssertionResult {
    assertion_target?: "input" | "output" // Whether this assertion check is for input or output of the function.
    object?: any // input or output config
    operator?: "equals" | "contains"
    code?: string // user defined code for testing the function output or input. Expects a function which will receive ${ExecutedFunction} in the param. Code should be in javascript language.

    failure_message: string
    successful: boolean
}
```