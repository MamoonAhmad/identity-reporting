import { TestCaseModel } from "./model.js"



export const saveTestCase = async (testCase) => {

    if (testCase._id) {
        await TestCaseModel.findByIdAndUpdate(testCase._id, { ...testCase })
        return await getTestCaseById(testCase._id)
    }
    const t = new TestCaseModel(testCase)
    const res = await t.save()
    return res;

}


export const getTestCaseById = async (testCaseId) => {
    return await TestCaseModel.findById(testCaseId)
}


export const getAllTestCases = async () => {
    return await TestCaseModel.find()
}