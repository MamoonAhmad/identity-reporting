/**
 * Test config
 *
 *
 * ObjectConfig
 * {
 *  _type: 'ObjectConfig'
 *  _version: number
 *  operator: 'strictEqual' | 'contains' ....
 *  expectedValue: any value
 *  type: 'literal' | 'object' | 'array'
 *  typeSpecificConfig: {
 *      array?: {
 *          matchOrder: true by default.
 *      },
 *      object?: {
 *
 *      },
 *      number?: {
 *      }
 *  }
 *  ignore: boolean
 * }
 *
 * FunctionConfig
 * {
 *  _type: 'FunctionConfig'
 *  _version: number
 *  input: ObjectConfig
 *  output: ObjectConfig
 *  shouldThrowError?: boolean
 *  expectedErrorMessage?: string
 *  shouldHaveBeenCalled?: boolean
 *  ignoreChildren?: boolean
 *  children: FunctionConfig[]
 * }
 *
 *
 * TestResult
 * {
 *  _type: 'TestResult',
 *  _version: number
 *  config: FunctionConfig | ObjectConfig
 *  receivedValue: any value
 *  pass: boolean - whether the test was passed
 * }
 *
 *
 *
 */

import { TestCase } from "../../views/test_case/_TestConfig";
import { NestedObjectColumnItem } from "./NestedObjectView";

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
  children?: ExecutedFunction[];
};

export type ObjectTestConfig = {
  _type: "ObjectTestConfig";
  _version: number;
  operator: "equal" | "contains";
  expectedValue: any;
  ignore: boolean;
  type: "object" | "array" | "literal";
  typeSpecificConfig: {
    array?: {
      matchOrder: boolean;
    };
  };
};

export type OTC = {
  operator: string;
  value: any;
  dataType: "literal" | "object" | "array";
};
export type FTC = {
  input: OTC;
  output: OTC;
  children: FTC[];
};

export type FTR = {
  config: FTC;
  value: ExecutedFunction;
};

export type FunctionTestConfig = {
  _type: "FunctionTestConfig";
  _version: number;
  isRootFunction: boolean;
  functionMeta: ExecutedFunction;
  input: ObjectTestConfig;
  output: ObjectTestConfig;
  shouldThrowError?: boolean;
  expectedErrorMessage?: string;
  shouldHaveBeenCalled?: boolean;
  ignoreChildren?: boolean;
  children: FunctionTestConfig[];
};

export type ObjectTestResult = Omit<ObjectTestConfig, "_type"> & {
  _type: "ObjectTestResult";
  successful: boolean;
  failureReason?: string;
  value: any;
  ignored?: boolean;
};
export type FunctionTestResult = Omit<FunctionTestConfig, "_type"> & {
  _type: "FunctionTestResult";
  successful: boolean;
  failureReason?: string;
  value: ExecutedFunction;
  ignored?: boolean;
};

export const convertFunctionTestConfigToNestedObjectUIItems = (
  functionTestConfigs: FunctionTestConfig[],
  objectPath: string[]
) => {
  return getFunctionTestConfigItems(functionTestConfigs, objectPath);
};

export const hasChildren = (
  configObject: FunctionTestConfig | ObjectTestConfig
) => {
  if (configObject._type === "FunctionTestConfig") {
    return true;
  } else if (
    configObject._type === "ObjectTestConfig" &&
    (configObject.type === "object" || configObject.type === "array")
  ) {
    return true;
  }
  return false;
};

export const getChildrenForObject = (
  configObject: FunctionTestConfig | ObjectTestConfig,
  objectPath: string[]
): NestedObjectColumnItem[] => {
  if (configObject._type === "FunctionTestConfig") {
    return getChildrenFromFunctionConfig(configObject, objectPath);
  } else if (
    configObject._type === "ObjectTestConfig" &&
    (configObject.type === "object" || configObject.type === "array")
  ) {
    return getChildrenFromObjectConfig(configObject, objectPath);
  }
  return [];
};

const getChildrenFromFunctionConfig = (
  config: FunctionTestConfig,
  objectPath: string[]
): NestedObjectColumnItem[] => {
  return [
    ...(config.isRootFunction
      ? []
      : [
          {
            id: "input",
            name: "input",
            object: config.input,
            objectPath: [...objectPath, "input"],
            selected: false,
          },
        ]),
    {
      id: "output",
      name: "output",
      object: config.output,
      objectPath: [...objectPath, "output"],
      selected: false,
    },

    // divider
    ...getFunctionTestConfigItems(config.children, objectPath),
  ];
};

const getFunctionTestConfigItems = (
  functions: FunctionTestConfig[],
  objectPath: string[]
) => {
  return functions.map((f) => ({
    id: f.functionMeta._id,
    name: f.functionMeta.name,
    object: f,
    objectPath: [...objectPath, f.functionMeta._id],
    selected: false,
  }));
};

const getChildrenFromObjectConfig = (
  config: ObjectTestConfig,
  objectPath: string[]
): NestedObjectColumnItem[] => {
  if (config.type === "object") {
    return [
      ...Object.keys(config.expectedValue).map((k) => ({
        id: k,
        name: k,
        object: config.expectedValue[k],
        objectPath: [...objectPath, k],
        selected: false,
      })),
    ];
  } else if (config.type === "array") {
    return [
      ...(config.expectedValue as ObjectTestConfig[]).map((childConfig, i) => ({
        id: i?.toString(),
        name: i?.toString(),
        object: childConfig,
        objectPath: [...objectPath, i?.toString()],
        selected: false,
      })),
    ];
  }

  return [];
};

const getItemForObject = (
  object: any,
  name: string
): NestedObjectColumnItem => {
  return {
    id: name,
    name,
    object,
    objectPath: [name],
    selected: false,
  };
};

export const getColumns = (
  object: FunctionTestConfig,
  objectPath: string[]
) => {
  const columns: NestedObjectColumnItem[][] = [
    [
      {
        id: object.functionMeta.name,
        name: object.functionMeta.name,
        object: object,
        objectPath: [objectPath[0]],
        selected: true,
      },
    ],
  ];

  for (let a = 1; a <= objectPath.length; a++) {
    const previousSelectedPathID = objectPath[a - 1];
    const previousSelected = columns[a - 1].find(
      (o) => o.id === previousSelectedPathID
    )!;
    previousSelected.selected = true;

    const currentChildren = getChildrenForObject(
      previousSelected.object,
      previousSelected.objectPath
    );

    if (currentChildren.length) {
      columns.push(currentChildren);
    } else {
      break;
    }
  }
  return columns;
};

export const getFunctionTestConfigForExecutedFunction = (
  f: ExecutedFunction,
  isRootFunction = true
): FunctionTestConfig => {
  return {
    _type: "FunctionTestConfig",
    _version: 1,
    functionMeta: f,
    isRootFunction,
    input: createObjectTestConfigForObject(f.input),
    output: createObjectTestConfigForObject(f.output),
    shouldThrowError: !!f.error,
    expectedErrorMessage: f.error,
    ignoreChildren: false,
    children: [
      ...(f.children?.map((ff) =>
        getFunctionTestConfigForExecutedFunction(ff, false)
      ) || []),
    ],
  };
};

export const createObjectTestConfigForObject = (o: any): ObjectTestConfig => {
  if (Array.isArray(o)) {
    return {
      _type: "ObjectTestConfig",
      _version: 1,
      ignore: false,
      operator: "equal",
      type: "array",
      expectedValue: o.map((oo) => createObjectTestConfigForObject(oo)),
      typeSpecificConfig: {},
    };
  } else if (typeof o === "object" && o) {
    return {
      _type: "ObjectTestConfig",
      _version: 1,
      ignore: false,
      operator: "equal",
      type: "object",
      expectedValue: Object.keys(o).reduce((p, k) => {
        return {
          ...p,
          [k]: createObjectTestConfigForObject(o[k]),
        };
      }, {}),
      typeSpecificConfig: {},
    };
  } else {
    return {
      _type: "ObjectTestConfig",
      _version: 1,
      ignore: false,
      operator: "equal",
      type: "literal",
      expectedValue: o,
      typeSpecificConfig: {},
    };
  }
};

type TC = {
  functionMeta: ExecutedFunction;
  inputToPass: any[];

  outputConfig: ObjectTestConfig;
  children: FunctionTestConfig[];
};
