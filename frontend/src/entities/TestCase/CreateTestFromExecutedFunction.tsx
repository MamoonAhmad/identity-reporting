import { useNavigate, useParams } from "react-router-dom";
import {
  ExecutedFunction,
  getFunctionTestConfigForExecutedFunction,
} from "../../components/NestedObjectView/someutil";
import { ConfigureTestCase } from "./components/ConfigureTestCase";
import { useMemo } from "react";
import { ViewPage } from "../../components/UICrud/ViewPage";
import { FunctionExecutionServices } from "../FunctionExecution/services";

export const CreateTestFromExecutedFunction = () => {
  const params = useParams();
  const objectID = params?.["*"];
  if (!objectID) {
    return <>Executed function ID not found in params.</>;
  }
  return (
    <ViewPage
      title="Function Execution View"
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
    return getFunctionTestConfigForExecutedFunction(object);
  }, [object]);

  return (
    <>
      {converted && (
        <ConfigureTestCase
          onSave={(t) => navigate(`/test-case/view-test-case/${t.id}`)}
          testCase={{
            name: "",
            description: "",
            functionMeta: object,

            id: undefined as any,
            tests: [
              {
                name: object.name,
                config: converted,
                mocks: null as any,
                inputToPass: object.input,
                id: new Date().getTime().toString(),
              },
            ],
          }}
        />
      )}
    </>
  );
};
