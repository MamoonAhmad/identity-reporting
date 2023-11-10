import { getValidatorFromJSON } from "../helpers/function";
import { Validator, ValidatorConfig, ValidatorConfigJSON } from "./base";
export const DEFAULT_ARRAY_VALIDATOR_CONFIG = {
  matchOrder: true,
};

export type ArrayValidatorConfig = Omit<ValidatorConfig, "targetValue"> & {
  targetValue: Validator[] | null;
  matchOrder: boolean;
};
export type ArrayValidatorConfigJSON = Omit<
  ArrayValidatorConfig,
  "targetValue"
> & {
  targetValue: ValidatorConfigJSON[] | null;
};

export class ArrayValidator extends Validator {
  strictEqual = false;
  declare config: ArrayValidatorConfig;
  receivedValue: any[] | null = null;

  constructor(config: ArrayValidatorConfig) {
    super({ ...DEFAULT_ARRAY_VALIDATOR_CONFIG, ...(config || {}) });
  }

  // if(this.checkOrder) {
  //     this.targetValue.forEach((m, i) => {
  //         m.match(value[i])
  //         if(!m.isValid) {
  //             this.isValid = false
  //         }
  //     })
  // }

  json(): ArrayValidatorConfigJSON {
    const newTarget = this.config?.targetValue?.map((k) => k.json()) || null;
    return { ...this.config, targetValue: newTarget };
  }

  validate(): void {
    this.error = "";
    if (
      (!this.config.targetValue && this.receivedValue) ||
      (Array.isArray(this.config.targetValue) &&
        !Array.isArray(this.receivedValue)) ||
      (!Array.isArray(this.config.targetValue) &&
        Array.isArray(this.receivedValue))
    ) {
      throw new Error(`Received value does not match the expected value.`);
    }
    if (
      this.config.strictEqual &&
      this.config.targetValue?.length !== this.receivedValue?.length
    ) {
      throw new Error(
        `Received array has more values than the expected array.`
      );
    }

    if (this.config.matchOrder) {
      this.config.targetValue?.forEach((v, i) => {
        try {
          v.match(this.receivedValue?.[i]);
        } catch (e) {
          this.error = e?.toString() || "";
        }
      });
    } else {
      const indexMap: { [key: number]: true } = {};
      for (let a = 0; a < this.config.targetValue!.length; a++) {
        const validator = this.config.targetValue![a];
        for (let b = 0; b < this.receivedValue!.length; b++) {
          if (!indexMap[b]) {
            validator.match(this.receivedValue![b]);
            if (validator.isValid) {
              indexMap[b] = true;
              break;
            }
          }
        }
        if (!validator.isValid) {
          validator.error =
            "Did not match with any value in the received array.";
        }
      }
    }
  }

  static initializeFromJSON(jsonValue: ArrayValidatorConfigJSON) {
    if (!jsonValue?.targetValue) {
      return new ArrayValidator({ ...jsonValue, targetValue: null });
    }
    if (!Array.isArray(jsonValue?.targetValue)) {
      throw new Error(
        "Received an invalid value in targetValue instead of an array."
      );
    }
    const newTarget = jsonValue?.targetValue?.map((v) =>
      getValidatorFromJSON(v)
    );

    return new ArrayValidator({
      ...jsonValue,
      targetValue: newTarget,
    });
  }
}
