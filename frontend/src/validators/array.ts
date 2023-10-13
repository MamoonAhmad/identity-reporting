import { getValidatorFromJSON } from "../helpers/function";
import { Validator, ValidatorConfig, ValidatorConfigJSON } from "./base"

export type ArrayValidatorConfig = Omit<ValidatorConfig, 'targetValue'> & {
    targetValue: Validator[] | null
    checkLength: boolean;
    matchOrder: boolean;
}
export type ArrayValidatorConfigJSON = Omit<ArrayValidatorConfig, 'targetValue'> & {
    targetValue: ValidatorConfigJSON[] | null
    checkLength: boolean;
    matchOrder: boolean;
}

export class ArrayValidator extends Validator{
    strictEqual = false
    declare config: ArrayValidatorConfig
    receivedValue: any[] | null = null
    
    
        // if(this.checkOrder) {
        //     this.targetValue.forEach((m, i) => {
        //         m.match(value[i])
        //         if(!m.isValid) {
        //             this.isValid = false
        //         }
        //     })
        // }
        

    json(): ArrayValidatorConfigJSON {
        const newTarget = this.config?.targetValue?.map(k => k.json()) || null
        return {...this.config, targetValue: newTarget}
    }

    validateEquality() {
        if((this.config.targetValue && !this.receivedValue) || !Array.isArray(this.receivedValue)) {
            throw new Error(`Expected an array but got ${JSON.stringify(this.receivedValue)}.`)
        }

        let hasError = false
        this.config.targetValue?.forEach((m, i) => {
            m.match(this.receivedValue?.[i])
            if(!m.isValid) hasError = true
        })
        if (hasError) {
            throw new Error(`One or more elements in the array did not meet expectations.`)
        }
    }

    validateStrictEquality() {
        if(this.config.targetValue && this.config.targetValue?.length !== this.receivedValue?.length) {
            throw new Error(`Length of the array does not match. Expected array size is ${this.config.targetValue.length}} but received an array of length ${this.receivedValue?.length}.`)
        }
    }

    static initializeFromJSON (jsonValue: ArrayValidatorConfigJSON) {
        if(!jsonValue?.targetValue) {
            return new ArrayValidator(jsonValue)
        }
        if(!Array.isArray(jsonValue?.targetValue)) {
            throw new Error('Received an invalid value in targetValue instead of an array.')
        }
        const newTarget = jsonValue?.targetValue?.map(v => getValidatorFromJSON(v))

        return new ArrayValidator({
            ...jsonValue,
            targetValue: newTarget
        })
    }
}