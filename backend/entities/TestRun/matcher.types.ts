export type EvalAbleCode = string;

export type FunctionTestConfig = {
  _type: "FunctionTestConfig";
  _version: number;
  isRootFunction: boolean;
  functionMeta: ExecutedFunction;
  isMocked?: boolean;
  mockedOutput?: any;
  mockedErrorMessage?: string;
  functionCallCount: number;
  shouldThrowError?: boolean;
  assertions: FunctionTestConfigAssertion[];
  children: FunctionTestConfig[];
};

export type FunctionMockConfig = {
  [callCount: number]: {
    output?: any;
    errorToThrow?: string;
  };
};

export type FunctionTestConfigAssertion = {
  ioConfig?: {
    target: "input" | "output";
    operator: "contains" | "equals";
    object: any;
  };

  expectedErrorMessage?: {
    operator: "contains" | "equals";
    message: string;
  };

  shouldThrowError: boolean;
  customValidator?: {
    code: EvalAbleCode;
  };
  name: string;
};

export type ExecutedFunction = {
  _id: string;
  name: string;
  parentID: string;
  input: any;
  output: any;
  startTime: number;
  endTime: number;
  error?: string;
  executedSuccessfully: boolean;
  traceID: string;
  environmentName: string;
  moduleName: string;
  fileName: string;
  executionContext: Record<string, any>;
  executionID: string;
  children?: ExecutedFunction[];
};

export type TestSuiteForFunction = {
  _id: string;
  name: string;
  description: string;
  functionMeta: ExecutedFunction;
  tests: TestCaseForFunction[];
};

export type TestCaseForFunction = {
  id: string;
  inputToPass: any;
  name: string;
  mocks: {
    [functionName: string]: FunctionMockConfig;
  };
  config: FunctionTestConfig;
};
export type TestRunForTestSuite = Omit<TestSuiteForFunction, "tests"> & {
  testSuiteID: string;
  tests: (TestCaseForFunction & {
    executedFunction: ExecutedFunction;
  })[];
};

export type TestResultForCase = {
  result: FunctionTestResult;
  successful: boolean;
  expectation: string;
};
export type TestResult = {
  testCaseName: string;
  testCaseDescription: string;
  error: string;
  functionMeta: ExecutedFunction;
  successful: boolean;
  result: TestResultForCase[];
};

export type BaseTestResult = {
  ignored: boolean;
  failureReasons: string[] | null;
  successful: boolean;
};

export type FunctionTestResult = BaseTestResult & {
  _type: "FunctionTestResult";
  name: string;
  executionID: string;
  executedSuccessfully: boolean;
  thrownError?: string;
  executionContext: Record<string, any>;
  children: FunctionTestResult[];
  assertions: AssertionResult[];
};

export type AssertionResult = {
  ioConfig?: {
    target: "input" | "output";
    operator: "contains" | "equals";
    object: any;
    receivedObject: any;
  };

  expectedErrorMessage?: {
    operator: "contains" | "equals";
    message: string;
    receivedError?: string;
  };

  customValidator?: {
    failureReason: string;
  };
  name: string;
  success: boolean;
  failureReasons: string[];
};
