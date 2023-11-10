import {
  ArrayValidator,
  ArrayValidatorConfigJSON,
  Validator,
  ValidatorConfig,
  ValidatorConfigJSON,
} from ".";
import {
  ExecutedFunction1Type,
  ExecutedFunction1TypeTestConfig,
} from "../ExecutionFunction";
import {
  createMatchersFromValue,
  getValidatorFromJSON,
} from "../helpers/function";

export type FunctionValidatorValue = {
  executedFunctionMeta: ExecutedFunction1TypeTestConfig;
  validatorConfig: {
    input: Validator;
    output: Validator;
    createdObjects: ArrayValidator;
    deletedObjects: ArrayValidator;
    updatedObjects: ArrayValidator;
    childFunctions: FunctionValidator[];
  };
};
export type FunctionValidatorValueJSON = {
  executedFunctionMeta: ExecutedFunction1TypeTestConfig;
  validatorConfig: {
    input: ValidatorConfigJSON;
    output: ValidatorConfigJSON;
    createdObjects: ArrayValidatorConfigJSON;
    deletedObjects: ArrayValidatorConfigJSON;
    updatedObjects: ArrayValidatorConfigJSON;
    executedChildFunctions: FunctionValidatorJSON[];
  };
};

export type FunctionValidatorConfig = Omit<ValidatorConfig, "targetValue"> & {
  targetValue: FunctionValidatorValue;
  isCalled: boolean;
};

export type FunctionValidatorJSON = Omit<ValidatorConfigJSON, "targetValue"> & {
  targetValue: FunctionValidatorValueJSON;
  isCalled: boolean;
};

export class FunctionValidator extends Validator {
  declare config: FunctionValidatorConfig;
  declare receivedValue: ExecutedFunction1Type;

  constructor(config: FunctionValidatorConfig) {
    super(config);
  }

  json(): FunctionValidatorJSON {
    const config = this.config.targetValue.validatorConfig;
    return {
      ...this.config,
      targetValue: {
        ...this.config.targetValue,
        validatorConfig: {
          input: config.input.json(),
          output: config.output.json(),
          createdObjects: config.createdObjects.json(),
          updatedObjects: config.updatedObjects.json(),
          deletedObjects: config.deletedObjects.json(),
          executedChildFunctions: config.childFunctions.map((f) => f.json()),
        },
      },
    };
  }

  static initializeFromJSON(s: FunctionValidatorJSON) {
    const cc: FunctionValidatorConfig = {
      ...s,
      targetValue: {
        executedFunctionMeta: s.targetValue.executedFunctionMeta,
        validatorConfig: {} as any,
      } as any,
    };
    const config = cc.targetValue!.validatorConfig!;
    config.input = getValidatorFromJSON(s.targetValue.validatorConfig?.input);
    config.output = getValidatorFromJSON(s.targetValue.validatorConfig?.output);

    config.createdObjects = getValidatorFromJSON(
      s.targetValue.validatorConfig?.createdObjects
    ) as ArrayValidator;
    config.updatedObjects = getValidatorFromJSON(
      s.targetValue.validatorConfig?.updatedObjects
    ) as ArrayValidator;
    config.deletedObjects = getValidatorFromJSON(
      s.targetValue.validatorConfig?.deletedObjects
    ) as ArrayValidator;

    config.childFunctions =
      s.targetValue.validatorConfig.executedChildFunctions.map((f) =>
        FunctionValidator.initializeFromJSON(f)
      );
    return new FunctionValidator({ ...cc });
  }

  static initializeFromExecutedFunction(
    executedFunction: ExecutedFunction1Type
  ) {
    const config: FunctionValidatorConfig = {
      ignore: false,
      strictEqual: true,
      checkIsSet: false,
      expressionValue: null,
      dataType: "function",
      isCalled: true,
      targetValue: {
        executedFunctionMeta: {
          ...executedFunction,
        },
        validatorConfig: {
          input: createMatchersFromValue(executedFunction.input_data),
          output: createMatchersFromValue(executedFunction.output_data),
          createdObjects: createMatchersFromValue(
            executedFunction.createdObjects
          ) as ArrayValidator,
          updatedObjects: createMatchersFromValue(
            executedFunction.updatedObjects
          ) as ArrayValidator,
          deletedObjects: createMatchersFromValue(
            executedFunction.deletedObjects
          ) as ArrayValidator,

          childFunctions:
            executedFunction.childFunctions?.map((f) => {
              return FunctionValidator.initializeFromExecutedFunction(f);
            }) || [],
        },
      },
    };

    return new FunctionValidator(config);
  }

  validate() {
    this.error = "";
    const config = this.config.targetValue.validatorConfig;

    if(this.config.ignore) {
      return
    }
    this.runValidator(config.input, this.receivedValue?.input_data)
    this.runValidator(config.output, this.receivedValue?.output_data)
    this.runValidator(config.createdObjects, this.receivedValue?.createdObjects)
    this.runValidator(config.updatedObjects, this.receivedValue?.updatedObjects)
    this.runValidator(config.deletedObjects, this.receivedValue?.deletedObjects)

    config.childFunctions?.forEach((f, i) => {
      this.runValidator(f, this.receivedValue?.childFunctions?.[i])
    })

    if (this.error) {
      throw new Error(this.error);
    } else {
      this.isValid = true
    }
  }

  private runValidator(validator: Validator, recievedValue: any) {
    validator.match(recievedValue)
    if(!validator.isValid) {
      this.isValid = false
      this.error = 'Failed to validate function.'
    }
  }
}
