
import mongoose from "mongoose"


export const TestCaseSchema = new mongoose.Schema({
    name: String,
    description: String,
    inputToPass: mongoose.Schema.Types.Mixed,
    functionMeta: mongoose.Schema.Types.Mixed,
    config: mongoose.Schema.Types.Mixed
})


export const TestCaseModel = mongoose.model('TestCase', TestCaseSchema)