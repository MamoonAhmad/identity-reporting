import { ExecutedFunction } from "../FunctionExecution/types";
import { TestCaseForFunction, TestSuiteForFunction } from "../TestCase/types";

export type TestResultForCase = {
  result?: FunctionTestResult;
  successful: boolean;
  expectation: string;
  error?: string;
};

export type TestResult = {
  testCaseName: string;
  testSuiteID: string;
  testCaseDescription: string;
  functionMeta: ExecutedFunction;
  successful: boolean;
  result: TestResultForCase[];
  error?: string;
};

export type BaseTestResult = {
  ignored: boolean;
  failureReasons: string[] | null;
  successful: boolean;
};

export type FunctionTestResult = BaseTestResult & {
  _type: "FunctionTestResult";
  name: string;
  id: string;
  executedSuccessfully: boolean;
  thrownError?: string;
  executionContext: Record<string, any>;
  children: FunctionTestResult[];
  assertions: AssertionResult[];
  functionMeta: ExecutedFunction;
  isMocked: boolean;
  mockedOutput: any;
};

export type AssertionResult = {
  ioConfig?: {
    target: "input" | "output";
    operator: "contains" | "equals";
    object: any;
    receivedObject: any;
    thrownError?: string;
  };

  expectedErrorMessage?: {
    operator: "contains" | "equals";
    message: string;
    receivedError?: string;
    functionOutput?: any;
  };

  customValidator?: {
    failureReason: string;
  };
  name: string;
  success: boolean;
  failureReasons: string[];
};

export type TestRunForTestSuite = Omit<TestSuiteForFunction, "tests"> & {
  testSuiteID: string;
  tests: (TestCaseForFunction & {
    executedFunction: ExecutedFunction;
  })[];
};

export type GenericObjectTestResult =
  | ObjectTestResult
  | ArrayTestResult
  | LiteralTestResult;
export type ObjectTestResult = BaseTestResult & {
  _type: "ObjectTestResult";
  type: "object";
  expectedValue: { [key: string]: GenericObjectTestResult };
  operator: "equal" | "contains";
};
export type ArrayTestResult = BaseTestResult & {
  _type: "ObjectTestResult";
  type: "array";
  expectedValue: GenericObjectTestResult[];
  operator: "equal" | "contains";
};
export type LiteralTestResult = BaseTestResult & {
  _type: "ObjectTestResult";
  type: "literal";
  expectedValue: any;
  receivedValue: any;
  operator: "equal" | "contains";
};
