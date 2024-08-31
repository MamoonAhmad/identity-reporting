
const BACKEND_ENTITY_NAME = "test_run";
const socketEvent = (endpoint: string) => {
    return `${BACKEND_ENTITY_NAME}/${endpoint}`
}


export const BACKEND_SOCKET_EVENTS = {
    RUN_TEST_WITH_FILTER: socketEvent("run_test"),
    TEST_SUITE_RESULT: socketEvent("test_run_result"),
    TEST_SUITE_RESULT_ERROR: socketEvent("test_run_result:error"),
    TEST_RUN_COMPLETE: socketEvent("test_run_complete"),
}