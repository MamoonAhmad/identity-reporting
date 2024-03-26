import assert from "assert";
import { TestCase } from "../../views/test_case/_TestConfig";
import {
  ExecutedFunction,
  FunctionTestConfig,
  ObjectTestConfig,
} from "./someutil";

export type TestResult = {
  testCaseName: string;
  testCaseDescription: string;
  functionMeta: ExecutedFunction;
  result: FunctionTestResult;
};

export type FunctionTestResult = BaseTestResult & {
  _type: "FunctionTestResult";
  input: GenericObjectTestResult;
  name: string;
  output: GenericObjectTestResult;
  executedSuccessfully: boolean;
  thrownError?: string;

  children: FunctionTestResult[];
};

export type BaseTestResult = {
  ignored: boolean;
  failureReasons: string[] | null;
  successful: boolean;
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

export const matchExecutionWithTestConfig = (
  executedFunction: ExecutedFunction,
  testCase: TestCase
): TestResult => {
  const res = matchFunctionWithConfig(executedFunction, testCase.config);

  return {
    testCaseName: testCase.name,
    testCaseDescription: testCase.description,
    functionMeta: testCase.functionMeta,
    result: res,
  };
};

const matchFunctionWithConfig = (
  executedFunction: ExecutedFunction,
  config: FunctionTestConfig
): FunctionTestResult => {
  let successful = true;
  const failureReasons = [];
  let inputResult: GenericObjectTestResult | null = null;

  if (!config.isRootFunction) {
    inputResult = matchObjectWithConfig(executedFunction?.input, config.input);
    if (!isResultSuccessful(inputResult)) {
      successful = false;
      failureReasons.push("Input");
    }
  }

  const outputResult = matchObjectWithConfig(
    executedFunction?.output,
    config.output
  );

  if (!isResultSuccessful(outputResult)) {
    successful = false;
    failureReasons.push("Output");
  }

  const childrenResults = config.children.map((f, i) => {
    if (executedFunction.children?.[i]) {
      const childResult = matchFunctionWithConfig(
        executedFunction.children?.[i],
        f
      );
      if (!isResultSuccessful(childResult)) {
        successful = false;
        failureReasons.push(`Child function ${f.functionMeta.name}.`);
      }
      return childResult;
    }
    return undefined as any;
  });

  return {
    _type: "FunctionTestResult",
    input: inputResult as any,
    output: outputResult,
    failureReasons: failureReasons,
    successful,
    ignored: false,
    name: config.functionMeta.name,
    children: childrenResults,
    executedSuccessfully: executedFunction.executedSuccessfully,
    thrownError: executedFunction.error,
  };
};

const matchObjectWithConfig = (
  obj: any,
  config: ObjectTestConfig
): GenericObjectTestResult => {
  if (config.ignore) {
    return {
      ignored: true,
    } as any;
  }
  if (config.type === "object") {
    return matchObject(obj, config);
  } else if (config.type === "array") {
    return matchArray(obj, config);
  } else if (config.type === "literal") {
    return matchLiteral(obj, config);
  }
  throw new Error("Invalid config received.");
};

const matchObject = (obj: any, config: ObjectTestConfig): ObjectTestResult => {
  const result: ObjectTestResult = {
    _type: "ObjectTestResult",
    ignored: false,
    type: "object",
    expectedValue: {},
    successful: true,
    failureReasons: [],
    operator: config.operator,
  };
  Object.keys(config.expectedValue || {}).forEach((k) => {
    const res = matchObjectWithConfig(obj[k], config.expectedValue[k]);
    if (!isResultSuccessful(res)) {
      result.successful = false;
      result.failureReasons!.push(k);
    }
    result.expectedValue[k] = res;
  });
  return result;
};

const matchArray = (obj: any, config: ObjectTestConfig): ArrayTestResult => {
  const result: ArrayTestResult = {
    _type: "ObjectTestResult",
    ignored: false,
    type: "array",
    expectedValue: [],
    successful: true,
    failureReasons: [],
    operator: config.operator,
  };
  config.expectedValue.forEach((v: any, i: any) => {
    const res = matchObjectWithConfig(obj[i], v);
    if (!isResultSuccessful(res)) {
      result.successful = false;
      result.failureReasons?.push(i);
    }
    result.expectedValue.push(res);
  });
  return result;
};

const matchLiteral = (
  obj: any,
  config: ObjectTestConfig
): LiteralTestResult => {
  const result: LiteralTestResult = {
    _type: "ObjectTestResult",
    ignored: false,
    type: "literal",
    expectedValue: config.expectedValue,
    receivedValue: obj,
    failureReasons: [],
    successful: true,
    operator: config.operator,
  };
  if (config.operator === "equal") {
    result.successful = obj === config.expectedValue;
    if (result.successful) {
      result.failureReasons?.push(
        "Received value is not equal to expected value."
      );
    }
  } else if (config.operator === "contains") {
    result.successful = String(obj).includes(config.expectedValue);
    if (result.successful) {
      result.failureReasons?.push(
        "Received value does not contain expected value."
      );
    }
  }

  return result;
};

const isResultSuccessful = (obj: BaseTestResult) => {
  return obj.ignored || obj.successful;
};
