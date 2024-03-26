



import mongoose from "mongoose"


export const TestRunSchema = new mongoose.Schema({
    testCaseId: String,
    executedFunctionId: String
})


export const TestRunModel = mongoose.model('TestRun', TestRunSchema)