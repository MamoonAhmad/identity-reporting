
import mongoose from "mongoose"


export const FunctionExecutionSchema = new mongoose.Schema({
    functionID: String,
    parentID: {
        type: String,
        allowNull: true
    },
    name: String,
    description: {
        type: String,
        allowNull: true
    },
    executedSuccessfully: Boolean,
    fileName: String,
    packageName: String,
    moduleName: String,

    config: new mongoose.Schema({
        trace_input: Boolean,
        trace_output: Boolean
    }),

    input: {
        type: [mongoose.Schema.Types.Mixed],
        allowNull: true
    },
    output: {
        type: mongoose.Schema.Types.Mixed,
        allowNull: true
    },


    startTime: Number,
    endTime: Number,

    error: {
        type: String,
        allowNull: true,
    },

    environmentName: String,
    traceID: mongoose.Schema.Types.UUID
})


export const FunctionExecutionModel = mongoose.model('FunctionExecution', FunctionExecutionSchema)