import { ExecutedFunction } from "../../FunctionExecution/types";
import { FunctionTestConfig, FunctionTestConfigAssertion } from "../types";

type FunctionTestConfigContext = {
    functionCallCountMap: {
      [key: string]: number;
    };
  };
  

export const getFunctionTestConfigForExecutedFunction = (
  f: ExecutedFunction,
  isRootFunction = true,
  context: FunctionTestConfigContext = { functionCallCountMap: {} }
): FunctionTestConfig => {
  const functionKey = `${f.moduleName}-${f.name}`;
  if (!context.functionCallCountMap[functionKey]) {
    context.functionCallCountMap[functionKey] = 0;
  }
  context.functionCallCountMap[functionKey]++;
  const assertions: FunctionTestConfigAssertion[] = [];

  if (f.error) {
    assertions.push({
      name: "Assert Error Message",
      expectedErrorMessage: {
        operator: "equals",
        message: f.error,
      },
      shouldThrowError: true,
    });
  } else {
    if (!isRootFunction) {
      assertions.push({
        name: "Assert Input",
        ioConfig: {
          target: "input",
          operator: "equals",
          object: f.input,
        },
        shouldThrowError: false,
      });
    }
    assertions.push({
      name: "Assert Output",
      ioConfig: {
        target: "output",
        operator: "equals",
        object: f.output,
      },
      shouldThrowError: false,
    });
  }

  return {
    _type: "FunctionTestConfig",
    _version: 1,
    functionMeta: f,
    isRootFunction,

    assertions,
    shouldThrowError: !!f.error,
    functionCallCount: context.functionCallCountMap[functionKey],
    children: [
      ...(f.children?.map((ff) =>
        getFunctionTestConfigForExecutedFunction(ff, false, context)
      ) || []),
    ],
  };
};
