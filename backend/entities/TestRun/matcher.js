/**
 * @function matchExecutionWithTestConfig Matches executed function with test config.
 * @param {import("./matcher.types.ts").TestRunForTestSuite} testRun 
 * @return {import("./matcher.types.ts").TestResult}
*/
export const matchExecutionWithTestConfig = (
    testRun
) => {
    const results = testRun.tests.map((t) => {
        return matchFunctionWithConfig(t.executedFunction, t.config);
    });

    return {
        testCaseName: testRun.name,
        testCaseDescription: testRun.description,
        functionMeta: testRun.functionMeta,
        testSuiteID: testRun.testSuiteID,
        successful: results.every((r) => r.successful),
        result: results.map((r, i) => ({
            expectation: testRun.tests[i].name,
            result: r,
            successful: r.successful,
        })),
    };
};

const matchFunctionWithConfig = (
    executedFunction,
    config
) => {
    let successful = true;

    if (!executedFunction) {
        return {
            _type: "FunctionTestResult",
            assertions: [],
            children: [],
            executedSuccessfully: false,
            executionContext: {},
            executionID: config.functionMeta.executionID,
            failureReasons: ["Did not get called."],
            name: config.functionMeta.name,
            ignored: false,
            successful: false,
            thrownError: "",
        };
    }

    const assertionResults = config.assertions.map(
        (assertion) => {
            const failureReasons = [];

            const assertionResult = {};
            if (assertion.expectedErrorMessage) {
                const thrownError = executedFunction.error;
                const conf = assertion.expectedErrorMessage;
                if (conf.operator === "equals" && thrownError !== conf.message) {
                    failureReasons.push(`Error message does not match.`);
                } else if (
                    conf.operator === "contains" &&
                    !thrownError?.includes(conf.message)
                ) {
                    failureReasons.push(
                        `Error message does not contain "${conf.message}"`
                    );
                }

                assertionResult.expectedErrorMessage = {
                    message: assertion.expectedErrorMessage.message,
                    operator: assertion.expectedErrorMessage.operator,
                    receivedError: executedFunction.error,
                };
            } else if (assertion.ioConfig) {
                const matchObject = (
                    label,
                    operator,
                    sourceObject,
                    targetObject
                ) => {
                    if (
                        operator === "equals" &&
                        !objectIsEqual(sourceObject, targetObject)
                    ) {
                        failureReasons.push(`${label} does not match the expectation.`);
                    } else if (
                        operator === "contains" &&
                        !objectContains(sourceObject, targetObject)
                    ) {
                        failureReasons.push(`${label} does not match the expectation.`);
                    }
                };

                if (assertion.ioConfig.target === "input") {
                    matchObject(
                        "Input",
                        assertion.ioConfig.operator,
                        assertion.ioConfig.object,
                        executedFunction.input
                    );
                } else {
                    matchObject(
                        "Output",
                        assertion.ioConfig.operator,
                        assertion.ioConfig.object,
                        executedFunction.output
                    );
                }
                assertionResult.ioConfig = {
                    target: assertion.ioConfig.target,

                    object: assertion.ioConfig.object,
                    operator: assertion.ioConfig.operator,
                    receivedObject:
                        assertion.ioConfig.target === "output"
                            ? executedFunction.output
                            : executedFunction.input,
                };
            }
            assertionResult.name = assertion.name;
            assertionResult.success = failureReasons.length === 0;
            assertionResult.failureReasons = failureReasons;
            if (!assertionResult.success) {
                successful = false;
            }
            return assertionResult;
        }
    );

    const failureReasons = [];
    const childrenResults = config.children.map((f, i) => {
        const childResult = matchFunctionWithConfig(
            executedFunction.children?.[i],
            f
        );
        if (!isResultSuccessful(childResult)) {
            successful = false;
            failureReasons.push(`Child function ${f.functionMeta.name}.`);
        }
        return childResult;
    });

    return {
        _type: "FunctionTestResult",
        failureReasons: failureReasons,
        successful,
        ignored: false,
        name: config.functionMeta.name,
        children: childrenResults,
        executedSuccessfully: executedFunction.executedSuccessfully,
        thrownError: executedFunction.error,
        executionContext: executedFunction.executionContext,
        executionID: executedFunction.executionID,
        assertions: assertionResults,
    };
};

const isResultSuccessful = (obj) => {
    return obj.ignored || obj.successful;
};

const objectIsEqual = (src, target) => {
    if (Array.isArray(src)) {
        if (!Array.isArray(target)) {
            return false;
        }
        return src.every((item, i) => objectIsEqual(item, target[i]));
    } else if (src && typeof src === "object") {
        return Object.keys(src).every((k) => {
            return objectIsEqual(src[k], target?.[k]);
        });
    } else {
        return src === target;
    }
};

const objectContains = (src, target) => {
    if (Array.isArray(src)) {
        if (!Array.isArray(target)) {
            return false;
        }
        return src.every((item, i) => objectIsEqual(item, target[i]));
    } else if (src && typeof src === "object") {
        return Object.keys(src).every((k) => {
            return objectIsEqual(src[k], target?.[k]);
        });
    } else {
        return src === target;
    }
};