import { useNavigate, useParams } from "react-router-dom";
import {
  ExecutedFunction,
  getFunctionTestConfigForExecutedFunction,
} from "../../components/NestedObjectView/someutil";
import { useMemo } from "react";
import { ViewPage } from "../../components/UICrud/ViewPage";
import { FunctionExecutionServices } from "../FunctionExecution/services";
import { CreateUpdateTestSuite } from "./components/CreateUpdateTestSuite";
import { TestSuiteForFunction } from "./components/ConfigureTestCase";
import axios from "axios";
import { TestCaseRoutes } from "./routes";

export const CreateTestFromExecutedFunction = () => {
  const params = useParams();
  const objectID = params?.["*"];
  if (!objectID) {
    return <>Executed function ID not found in params.</>;
  }
  return (
    <ViewPage
      objectID={objectID}
      title="New Test Suite"
      dataLoader={async () =>
        await FunctionExecutionServices.getFunctionExecutionById(objectID)
      }
      Content={ExecutedFunctionToTestConfigConverter}
    ></ViewPage>
  );
};

const ExecutedFunctionToTestConfigConverter: React.FC<{
  object: ExecutedFunction;
}> = ({ object }) => {
  const navigate = useNavigate();
  const converted = useMemo(() => {
    const config = getFunctionTestConfigForExecutedFunction(object);
    const testSuiteConfig: TestSuiteForFunction = {
      name: object.name,
      description: "",
      functionMeta: object,

      id: undefined as any,
      tests: [
        {
          name: "Test Case 1",
          config: config,
          mocks: null as any,
          inputToPass: object.input,
          id: new Date().getTime().toString(),
        },
      ],
    };
    return testSuiteConfig;
  }, [object]);
  const onSaveTestSuite = (testSuite: TestSuiteForFunction) => {
    axios
      .post("http://localhost:8002/test_case/save-test-case", {
        ...testSuite,
      })
      .then((res) => {
        const testSuite = res.data;
        if (testSuite.id) {
          window.location.href = TestCaseRoutes.ViewTestCase.replace(
            "*",
            testSuite.id
          );
        }
      });
  };

  return (
    <>
      {converted && (
        <>
          <CreateUpdateTestSuite
            onSave={onSaveTestSuite}
            testSuite={converted}
          />
        </>
      )}
    </>
  );
};
