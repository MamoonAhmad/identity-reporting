import { getValidatorFromJSON } from "../helpers/function";
import { Validator, ValidatorConfig, ValidatorConfigJSON } from "./base";

type ObjectValue = { [key: string]: any } | null;

export type ObjectValidatorConfig = Omit<ValidatorConfig, "targetValue"> & {
  targetValue: { [key: string]: Validator } | null;
};

export type ObjectValidatorConfigJSON = Omit<
  ValidatorConfigJSON,
  "targetValue"
> & {
  targetValue: { [key: string]: ValidatorConfigJSON } | null;
};

export class ObjectValidator extends Validator {
  declare config: ObjectValidatorConfig;

  receivedValue: ObjectValue | null = null;

  strictEqual = false;

  validateEquality() {
    const targetValue = this.config.targetValue;
    if (!targetValue) {
      return;
    }
    let hasError = false;
    Object.keys(targetValue).forEach((k) => {
      targetValue[k].match(this.receivedValue?.[k]);
      if (!targetValue[k]?.isValid) {
        this.isValid = false;
        hasError = true;
      }
    });
    if (hasError) {
      throw new Error("Failed ");
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateStrictEquality() {}

  json(): ObjectValidatorConfigJSON {
    if (!this.config.targetValue) {
      return { ...this.config, targetValue: null };
    }
    const newTarget: ObjectValidatorConfigJSON["targetValue"] = {};
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    Object?.keys(this.config.targetValue).forEach(
      (k) => (newTarget[k] = this.config.targetValue![k].json())
    );
    return { ...this.config, targetValue: newTarget };
  }

  static initializeFromJSON(jsonValue: ObjectValidatorConfigJSON) {
    if (!jsonValue?.targetValue) {
      return new ObjectValidator({ ...jsonValue });
    }
    const jsonObject: ObjectValidatorConfig["targetValue"] = {};
    Object.keys(jsonValue.targetValue || {}).forEach((k) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      jsonObject[k] = getValidatorFromJSON(jsonValue.targetValue![k]);
    });
    return new ObjectValidator({ ...jsonValue, targetValue: jsonObject });
  }
}
