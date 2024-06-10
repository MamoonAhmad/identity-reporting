import {
  ExecutedFunction,
  FunctionTestConfig,
  ObjectTestConfig,
} from "./someutil";
import {
  TestCaseForFunction,
  TestSuiteForFunction,
} from "../../entities/TestCase/components/ConfigureTestCase";

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
  testSuiteID: string;
  testCaseDescription: string;
  functionMeta: ExecutedFunction;
  successful: boolean;
  result: TestResultForCase[];
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
  testRun: TestRunForTestSuite
): TestResult => {
  const results = testRun.tests.map((t) => {
    return matchFunctionWithConfig(t.executedFunction, t.config);
  });

  return {
    testCaseName: testRun.name,
    testCaseDescription: testRun.description,
    testSuiteID: "",
    functionMeta: testRun.functionMeta,
    successful: results.every((r) => r.successful),
    result: results.map((r, i) => ({
      expectation: testRun.tests[i].name,
      result: r,
      successful: r.successful,
    })),
  };
};

const matchFunctionWithConfig = (
  executedFunction: ExecutedFunction | undefined,
  config: FunctionTestConfig
): FunctionTestResult => {
  let successful = true;

  if (!executedFunction) {
    return {
      _type: "FunctionTestResult",
      assertions: [],
      children: [],
      executedSuccessfully: false,
      executionContext: {},
      id: config.functionMeta.executionID,
      failureReasons: ["Did not get called."],
      name: config.functionMeta.name,
      ignored: false,
      successful: false,
      thrownError: "",
    };
  }

  const assertionResults: AssertionResult[] = config.assertions.map(
    (assertion) => {
      const failureReasons: string[] = [];

      const assertionResult: AssertionResult = {} as any;
      if (assertion.expectedErrorMessage) {
        const thrownError = executedFunction.error;
        const conf = assertion.expectedErrorMessage;
        if (conf.operator === "equals" && thrownError !== conf.message) {
          failureReasons.push(`Error message does not match.`);
        } else if (
          conf.operator === "contains" &&
          !thrownError?.includes(conf.message)
        ) {
          failureReasons.push(
            `Error message does not contain "${conf.message}"`
          );
        }

        assertionResult.expectedErrorMessage = {
          message: assertion.expectedErrorMessage.message,
          operator: assertion.expectedErrorMessage.operator,
          receivedError: executedFunction.error,
        };
      } else if (assertion.ioConfig) {
        const matchObject = (
          label: string,
          operator: string,
          sourceObject: any,
          targetObject: any
        ) => {
          if (
            operator === "equals" &&
            !objectIsEqual(sourceObject, targetObject)
          ) {
            failureReasons.push(`${label} does not match the expectation.`);
          } else if (
            operator === "contains" &&
            !objectContains(sourceObject, targetObject)
          ) {
            failureReasons.push(`${label} does not match the expectation.`);
          }
        };

        if (assertion.ioConfig.target === "input") {
          matchObject(
            "Input",
            assertion.ioConfig.operator,
            assertion.ioConfig.object,
            executedFunction.input
          );
        } else {
          matchObject(
            "Output",
            assertion.ioConfig!.operator,
            assertion.ioConfig!.object,
            executedFunction.output
          );
        }
        assertionResult.ioConfig = {
          target: assertion.ioConfig.target,

          object: assertion.ioConfig!.object,
          operator: assertion.ioConfig!.operator,
          receivedObject:
            assertion.ioConfig.target === "output"
              ? executedFunction.output
              : executedFunction.input,
        };
      }
      assertionResult.name = assertion.name;
      assertionResult.success = failureReasons.length === 0;
      assertionResult.failureReasons = failureReasons;
      if (!assertionResult.success) {
        successful = false;
      }
      return assertionResult;
    }
  );

  const failureReasons: string[] = [];
  const childrenResults = config.children.map((f, i) => {
    const childResult = matchFunctionWithConfig(
      executedFunction.children?.[i],
      f
    );
    if (!isResultSuccessful(childResult)) {
      successful = false;
      failureReasons.push(`Child function ${f.functionMeta.name}.`);
    }
    return childResult;
  });

  return {
    _type: "FunctionTestResult",
    failureReasons: failureReasons,
    successful,
    ignored: false,
    name: config.functionMeta.name,
    children: childrenResults,
    executedSuccessfully: executedFunction.executedSuccessfully,
    thrownError: executedFunction.error,
    executionContext: executedFunction.executionContext,
    id: executedFunction.executionID,
    assertions: assertionResults,
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
    const res = matchObjectWithConfig(obj?.[k], config.expectedValue[k]);
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

const objectIsEqual = (src: any, target: any): boolean => {
  if (Array.isArray(src)) {
    if (!Array.isArray(target)) {
      return false;
    }
    return src.every((item, i) => objectIsEqual(item, target[i]));
  } else if (src && typeof src === "object") {
    return Object.keys(src).every((k) => {
      return objectIsEqual(src[k], target?.[k]);
    });
  } else {
    return src === target;
  }
};

const objectContains = (src: any, target: any): boolean => {
  if (Array.isArray(src)) {
    if (!Array.isArray(target)) {
      return false;
    }
    return src.every((item, i) => objectIsEqual(item, target[i]));
  } else if (src && typeof src === "object") {
    return Object.keys(src).every((k) => {
      return objectIsEqual(src[k], target?.[k]);
    });
  } else {
    return src === target;
  }
};
