import { ViewPage } from "../../components/UICrud/ViewPage";
import { useParams } from "react-router-dom";
import { ExecutedFunction } from "../../components/NestedObjectView/someutil";
import { useEffect, useState } from "react";
import { matchExecutionWithTestConfig } from "../../components/NestedObjectView/matcher";
import { TestResultColumns } from "./components/NestedObjectTestResultView";
import { TestCase } from "../TestCase/components/ConfigureTestCase";
import { TestRunServices } from "./services";

type TestRun = {
  _id: string;
  testCase: TestCase;
  executedFunction: ExecutedFunction;
};

export const ViewTestRun = () => {
  const params = useParams();
  const objectID = params?.["*"] || "";
  return (
    <ViewPage
      title="Function Execution View"
      dataLoader={async () => {
        return await TestRunServices.getTestRunById(objectID);
      }}
      Content={ExecutedFunctionToTestConfigConverter}
    ></ViewPage>
  );
};

const ExecutedFunctionToTestConfigConverter: React.FC<{
  object: TestRun;
}> = ({ object }) => {
  const [result, setResult] = useState<any>(undefined);

  useEffect(() => {
    if (!object) return;

    const res = matchExecutionWithTestConfig(
      object.executedFunction,
      object.testCase
    );
    setResult(res);
    console.log(res, "This is test result");
  }, [object]);

  return <>{result && <TestResultColumns object={result} />}</>;
};
