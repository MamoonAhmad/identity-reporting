export type ValidatorConfig = {
  ignore: boolean;
  strictEqual: boolean;
  targetValue?: any;
  checkIsSet: boolean;
  expressionValue: string | null;
  valuePath?: string;
  dataType: string;
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
    this.receivedValue = value
    try {
      this.validate();
      this.isValid = true
      this.error = ''
    } catch (e) {
      this.isValid = false;
      this.error = e?.toString();
    }
  }

 validate() {
  if(this.receivedValue !== this.config.targetValue) {
    throw new Error(`Received value does not match the expected value of ${JSON.stringify(this.config.targetValue)}`)
  }
 }

  json(): ValidatorConfigJSON {
    return { ...this.config };
  }

  static initializeFromJSON(jsonValue: ValidatorConfig) {
    return new Validator({ ...jsonValue });
  }

  
}



export const VALIDATOR_OBJECT_TYPES = {
  test_case_config: Symbol.for('test_case_config'),
  function_validator_config: Symbol.for('function_validator_config'),
  object_validator_config: Symbol.for('object_validator_config'),
  array_validator_config: Symbol.for('array_validator_config'),
  literal_validator_config: Symbol.for('literal_validator_config'),
}
