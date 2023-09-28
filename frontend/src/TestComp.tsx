


import { createMatchersFromValue } from './helpers/function'
import {
    ObjectValidator, ArrayValidator, Validator
} from './validators'

const input = {first_name: "Mamoon"}
const testObj = {
    first_name: "Mamoon",
    last_name: "Ahmed",
    orders: [
        {
            order_id: 1,
            description: "Nike Shoes"
        },
        {
            order_id: 2,
            description: "Addidas Shoes"
        }
    ]
}

const testObj2 = {
    first_name: "Mamoon",
    last_name: "Ahmed",
    orders: [
        {
            order_id: 1,
            description: "Nike Shoes"
        },
        {
            order_id: 2,
            description: "Addidas Shoes"
        },
        {
            order_id: 3,
            description: "Addidasdadasdasdas"

        }
    ]
}


const validator = createMatchersFromValue(testObj)

export const TestComponent: React.FC = () => {
    return <div className='flex flex-col'>

        <button className='p-5 border-1 rounded mb-10' onClick={() => {
            try {
                validator2.validate(testObj2)
                alert('Success')
            } catch(e) {
                alert(e?.toString())
            }
            
        }}>
            Test
        </button>

        {JSON.stringify(validator.json())}
    </div>
}


const testObjConfig = {"ignore":false,"targetValue":{"first_name":{"ignore":false,"targetValue":"Mamoon","strictEqual":true,"checkIsSet":false,"expressionValue":null},"last_name":{"ignore":false,"targetValue":"Ahmed","strictEqual":true,"checkIsSet":false,"expressionValue":null},"orders":{"ignore":false,"targetValue":[{"ignore":false,"targetValue":{"order_id":{"ignore":false,"targetValue":1,"strictEqual":true,"checkIsSet":false,"expressionValue":null},"description":{"ignore":false,"targetValue":"Nike Shoes","strictEqual":true,"checkIsSet":false,"expressionValue":null}},"strictEqual":true,"checkIsSet":false,"expressionValue":null},{"ignore":false,"targetValue":{"order_id":{"ignore":false,"targetValue":2,"strictEqual":true,"checkIsSet":false,"expressionValue":null},"description":{"ignore":false,"targetValue":"Addidas Shoes","strictEqual":true,"checkIsSet":false,"expressionValue":null}},"strictEqual":true,"checkIsSet":false,"expressionValue":null}],"strictEqual":true,"checkIsSet":false,"expressionValue":null}},"strictEqual":true,"checkIsSet":false,"expressionValue":null}
const validator2 = ObjectValidator.initializeFromJSON(testObjConfig)