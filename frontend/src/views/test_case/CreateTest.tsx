import { ViewPage } from "../../components/UICrud/ViewPage";
import {
  ExecutedFunction,
  getFunctionTestConfigForExecutedFunction,
} from "../../components/NestedObjectView/someutil";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ConfigureTestCase } from "./_TestConfig";
import { matchExecutionWithTestConfig } from "../../components/NestedObjectView/matcher";
import { TestResultColumns } from "./_NestedObjectTestResultView";

export const CreateTestCase = () => {
  const params = useParams();
  const objectID = params?.["*"];
  return (
    <ViewPage
      title="Function Execution View"
      dataLoader={async () => {
        const res = await axios.get(
          `http://localhost:8002/executed_function/get-executed-function/${objectID}`
        );
        return res.data;
      }}
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

  const [result, setResult] = useState<any>(undefined);

  useEffect(() => {
    if (!converted) return;
    const res = matchExecutionWithTestConfig(object, {
      _id: "",
      name: "",
      config: converted,
      description: "",
      functionMeta: object,
      inputToPass: object.input,
    });
    setResult(res);
    console.log(res, "This is test result");
  }, [converted]);

  return (
    <>
      {converted && (
        <ConfigureTestCase
          onSave={(t) => navigate(`/configure-test-case/${t._id}`)}
          testCase={{
            name: "",
            description: "",
            functionMeta: object,
            inputToPass: object.input,
            _id: undefined as any,
            config: converted,
          }}
        />
      )}
      {result && <TestResultColumns object={result} />}
    </>
  );
};
