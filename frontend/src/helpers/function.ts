import { ExecutedFunction, ExecutedFunction1Type } from "../ExecutionFunction";
import { LOG_TYPE, Log } from "../Log";
import {
  TestConfig,
  TestConfigForFunction,
  TestConfigForFunctionJSON,
} from "../components/TestRun/TestRunView";
import {
  ArrayValidator,
  ArrayValidatorConfigJSON,
  ObjectValidator,
  ObjectValidatorConfigJSON,
  Validator,
  ValidatorConfigJSON,
} from "../validators";

export const createExecutedFunctions = (functions: ExecutedFunction1Type[]) => {
  const processedFunctions: ExecutedFunction1Type[] = [];
  const functionWithoutParents = functions?.filter((f) => !f.parent_id);
  functionWithoutParents.forEach((func) => {
    const f = { ...func };
    processedFunctions.push(f);
    const childFunctions = functions.filter((ff) => ff.parent_id === f.id);
    f.childFunctions = childFunctions;
    f.createdObjects = [];
    f.deletedObjects = [];
    f.updatedObjects = [];
  });

  return processedFunctions;
};

export const createEntitiesFromDBRecords = ({ logs }: { logs: Log[] }) => {
  const executionSequenceArray: ExecutedFunction[] = [];
  const executionStack: ExecutedFunction[] = [];
  const getLatestEntity = () => executionStack[executionStack?.length - 1];

  logs?.forEach((l) => {
    const { execution_id, log_type } = l || {};

    if (!execution_id) {
      console.warn(
        `WARNING: Received a log which has no execution ID. ${JSON.stringify(
          l
        )}`
      );
    } else {
      if (!executionStack?.length) {
        executionStack?.push(new ExecutedFunction());
      }

      const latestEntityInStack = getLatestEntity();

      if (
        log_type === LOG_TYPE.ENTITY_EXECUTION_START &&
        !!latestEntityInStack?.functionMeta
      ) {
        const newEntity = new ExecutedFunction();
        getLatestEntity()?.logs?.push(newEntity);
        executionStack?.push(newEntity);
      }

      getLatestEntity()?.addLog(l);
      if (
        log_type === LOG_TYPE.ENTITY_EXECUTION_END ||
        log_type === LOG_TYPE.ENTITY_EXECUTION_FAILURE
      ) {
        const l: ExecutedFunction = executionStack.pop() as ExecutedFunction;
        if (!executionStack?.length) {
          executionSequenceArray.push(l);
        } else {
          getLatestEntity()?.childFunctions.push(l);
        }
      }
    }
  });

  return executionSequenceArray;
};

export const createMatchersFromValue = (value: any): Validator => {
  if (Array.isArray(value)) {
    return new ArrayValidator({
      targetValue: value?.map((v) => createMatchersFromValue(v)),
    });
  }

  if (typeof value == "object" && value) {
    const obj: { [key: string]: Validator } = {};
    Object.keys(value).forEach((k) => {
      obj[k] = createMatchersFromValue(value[k]);
    });
    return new ObjectValidator({ targetValue: obj });
  }

  return new Validator({ targetValue: value });
};

export const getValidatorFromJSON = (JSON: ValidatorConfigJSON): Validator => {
  if (Array.isArray(JSON?.targetValue))
    return ArrayValidator.initializeFromJSON(JSON as ArrayValidatorConfigJSON);

  if (typeof JSON?.targetValue == "object" && JSON?.targetValue)
    return ObjectValidator.initializeFromJSON(
      JSON as ObjectValidatorConfigJSON
    );

  return Validator.initializeFromJSON(JSON);
};

export const createValidatorForFunction = (
  executedFunction: ExecutedFunction1Type
) => {
  const config: TestConfigForFunction = {} as any;
  config.executedFunction = executedFunction;
  config.ignore = false;
  config.testCaseValidationConfig = {
    inputData: createMatchersFromValue(executedFunction.input_data),
    outputData: createMatchersFromValue(executedFunction.output_data),
    createdObjects: createMatchersFromValue(
      executedFunction.createdObjects
    ) as any,
    updatedObjects: createMatchersFromValue(
      executedFunction.updatedObjects
    ) as any,
    deletedObjects: createMatchersFromValue(
      executedFunction.deletedObjects
    ) as any,
    childFunctionExecutions:
      executedFunction.childFunctions?.map((f) =>
        createValidatorForFunction(f)
      ) || [],
  };
  return config;
};

export const createTestConfigFromExecutedFunctions = (
  executedFunctions: ExecutedFunction1Type[]
) => {
  const testCaseConfig: TestConfig = {
    name: "",
    description: "",
    id: null as any,
    testCases: executedFunctions.map((f) => createValidatorForFunction(f)),
  };

  return testCaseConfig;
};

export const convertFunctionConfigToJSON = (
  c: TestConfigForFunction
): TestConfigForFunctionJSON => {
  return {
    ...c,
    testCaseValidationConfig: {
      childFunctionExecutions:
        c.testCaseValidationConfig?.childFunctionExecutions?.map((cf) =>
          convertFunctionConfigToJSON(cf)
        ) || [],
      inputData: c.testCaseValidationConfig!.inputData.json(),
      outputData: c.testCaseValidationConfig!.outputData.json(),
      createdObjects: c.testCaseValidationConfig!.createdObjects.json(),
      updatedObjects: c.testCaseValidationConfig!.updatedObjects.json(),
      deletedObjects: c.testCaseValidationConfig!.deletedObjects.json(),
    },
  };
};

export const convertJSONConfigToTestCaseConfig = (
  c: TestConfigForFunctionJSON
): TestConfigForFunction => {
  const cc: TestConfigForFunction = {
    ...c,
  } as any;

  const config = c.testCaseValidationConfig;

  cc.testCaseValidationConfig = {
    createdObjects: getValidatorFromJSON(
      config.createdObjects
    ) as ArrayValidator,
    updatedObjects: getValidatorFromJSON(
      config.updatedObjects
    ) as ArrayValidator,
    deletedObjects: getValidatorFromJSON(
      config.deletedObjects
    ) as ArrayValidator,

    inputData: getValidatorFromJSON(config.inputData),
    outputData: getValidatorFromJSON(config.outputData),

    childFunctionExecutions:
      config.childFunctionExecutions?.map((c) =>
        convertJSONConfigToTestCaseConfig(c)
      ) || [],
  };

  return cc;
};
