import { ExecutedFunction } from "../FunctionExecution/types";

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

export type EvalAbleCode = string;

export type TestSuiteForFunction = {
  id: string;
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

export type FunctionMockConfig = {
  [callCount: number]: {
    output?: any;
    errorToThrow?: string;
  };
};
