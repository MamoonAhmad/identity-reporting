import { VALIDATOR_OBJECT_TYPES } from ".";
import { ExecutedFunction1Type } from "../ExecutionFunction";
import { FunctionValidator, FunctionValidatorJSON } from "./function";

export type TestValidatorConfig = {
  id: string;
  name: string;
  description?: string;
  functions: FunctionValidator[];
};

export type TestValidatorConfigJSON = {
  type: symbol;
  id: string;
  name: string;
  description?: string;
  functions: FunctionValidatorJSON[];
};

export class TestValidator {
  private hasError = false;
  constructor(public config: TestValidatorConfig) {}

  validate(executedFunctions: ExecutedFunction1Type[]) {
    this.config.functions.forEach((f, i) => {
      this.runValidator(() => f.match(executedFunctions?.[i]));
    });

    if (this.hasError) {
      throw new Error(`One or more functions did not pass the test.`);
    }
  }

  private runValidator(runner: () => void) {
    try {
      runner();
    } catch (e) {
      this.hasError = true;
    }
  }

  json(): TestValidatorConfigJSON {
    return {
      ...this.config,
      type: VALIDATOR_OBJECT_TYPES.function_validator_config,
      functions: this.config.functions.map((f) => f.json()),
    };
  }

  static initializeFromJSON(jsonValue: TestValidatorConfigJSON) {
    const functions = jsonValue?.functions.map((f) =>
      FunctionValidator.initializeFromJSON(f)
    );
    return new TestValidator({
      ...jsonValue,
      functions,
    });
  }
}
