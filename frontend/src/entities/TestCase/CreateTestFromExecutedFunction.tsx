import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FunctionExecutionServices } from "../FunctionExecution/services";
import { CreateUpdateTestSuite } from "./components/CreateUpdateTestSuite";
import { TestCaseRoutes } from "./routes";
import { ExecutedFunction } from "../FunctionExecution/types";
import { getFunctionTestConfigForExecutedFunction } from "./utils/getFunctionTestConfigForExecutedFunction";
import { Grid } from "@mui/material";
import { PageTitle } from "../../components/PageTitle";
import { BackDropLoading } from "../../components/BackDropLoading";
import { TestSuiteForFunction } from "./types";
import { TestCaseServices } from "./services";

export const CreateTestFromExecutedFunction: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const objectID = params?.["*"];

  const [object, setObject] = useState<ExecutedFunction | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!objectID) {
      return;
    }
    setLoading(true);
    FunctionExecutionServices.getFunctionExecutionById(objectID).then((res) => {
      setObject(res);
      setLoading(false);
    });
  }, [objectID]);

  const converted = useMemo(() => {
    if (!object) return;
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
    TestCaseServices.onSaveTestSuite(testSuite).then((testSuite) => {
      if (testSuite.id) {
        navigate(`${TestCaseRoutes.ViewTestCase}/${testSuite.id}`);
      }
    });
  };

  return (
    <Grid container>
      <PageTitle title="Test Suite" />
      {loading && <BackDropLoading />}
      {!loading && converted && (
        <>
          <CreateUpdateTestSuite
            onSave={onSaveTestSuite}
            testSuite={converted}
          />
        </>
      )}
    </Grid>
  );
};
