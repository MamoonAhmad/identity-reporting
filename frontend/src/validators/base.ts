export type ValidatorConfig = {
  ignore: boolean;
  strictEqual: boolean;
  targetValue?: any;
  checkIsSet: boolean;
  expressionValue: string | null;
  valuePath?: string;
};

export const DEFAULT_VALIDATOR_CONFIG: ValidatorConfig = {
  ignore: false,
  targetValue: null,
  // strictEqual: true,
  // checkIsSet: false,
  // expressionValue: null,
  // valuePath: undefined
} as any;

export type ValidatorConfigJSON = ValidatorConfig;

export class Validator {
  config!: ValidatorConfig;

  isValid = false;
  receivedValue: any = null;
  error?: string;

  constructor(config: Partial<ValidatorConfig>) {
    this.config = {
      ...DEFAULT_VALIDATOR_CONFIG,
      ...(config || {}),
    };
  }

  match(value: any) {
    try {
      this.validate(value);
    } catch (e) {
      this.isValid = false;
      this.error = e?.toString();
    }
  }

  validate(value: any) {
    this.receivedValue = value;
    if (this.config.ignore) {
      this.isValid = true;
      return;
    } else if (this.config.checkIsSet) {
      this.validateIsSet();
    } else if (this.config.expressionValue) {
      // check whether it matches that value at path
      this.validateValuePathExpressionEquality();
    } else {
      this.validateNull();
      this.validateEquality();
      this.validateStrictEquality();
    }
    this.isValid = true;
  }

  validateIsSet() {
    if (
      this.config.checkIsSet &&
      !this.receivedValue &&
      this.receivedValue !== 0
    ) {
      throw new Error("This field is expected to have a value set.");
    }
  }

  validateValuePathExpressionEquality() {
    // check whether it matches that value at path
  }
  validateStrictEquality() {
    if (
      this.config.strictEqual &&
      this.receivedValue !== this.config.targetValue
    ) {
      throw new Error(
        `Value did not match. Received: ${JSON.stringify(
          this.receivedValue
        )} Expected: ${JSON.stringify(this.config.targetValue)}`
      );
    }
  }
  validateEquality() {
    if (this.receivedValue !== this.config.targetValue) {
      throw new Error(
        `Received: ${JSON.stringify(
          this.receivedValue
        )}  Expected: ${JSON.stringify(this.config.targetValue)}`
      );
    }
  }

  validateNull() {
    if (this.receivedValue && !this.config.targetValue) {
      throw new Error(
        `Received: ${JSON.stringify(
          this.receivedValue
        )}  Expected: ${JSON.stringify(this.config.targetValue)}`
      );
    }
  }

  json(): ValidatorConfigJSON {
    return { ...this.config };
  }

  static initializeFromJSON(jsonValue: ValidatorConfig) {
    return new Validator({ ...jsonValue });
  }

  setConfig(obj: Partial<(typeof this)["config"]>) {
    this.config = { ...this.config, ...obj };
  }
}
