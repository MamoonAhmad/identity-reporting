import {
  Box,
  Checkbox,
  Input,
  Modal,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextareaAutosize,
} from "@mui/material";
import { useGeneralState } from "../../helpers/useGeneralState";
import { TestConfig } from "../TestRun/TestRunView";
import { TestCreateView } from "./TestCreateView";

import logs from "../../tests/data/logs.json";
import { createEntitiesFromDBRecords } from "../../helpers/function";
import { ExecutedFunction } from "../../ExecutionFunction";
import { Log } from "../../Log";
import { useCallback, useEffect, useMemo } from "react";

// TestConfig

type TestCaseInfo = {
  testCaseConfig: Partial<TestConfig>;
  executedFunctions: ExecutedFunction[];
};

type StepObject = {
  label: string;
  validate: (s: TestCaseInfo) => boolean;
  Component: React.FC<{
    info: TestCaseInfo;
    onChange: (i: Partial<TestCaseInfo>) => void;
  }>;
};

const getSteps = (): StepObject[] => {
  return [
    {
      label: "Test Case Information",
      validate: (s) =>
        !!s.testCaseConfig?.name && !!s.testCaseConfig.description,
      Component: TestInformationStep,
    },
    {
      label: "Select Execution Functions",
      validate: (i) => !!i.executedFunctions?.length,
      Component: ExecutedFunctionSelectionStep,
    },
    // {
    //   label: "Test Case Data Configuration",
    //   validate: () => true,
    //   Component: InputConfigStep,
    // },
  ];
};

const style = {
  position: "absolute" as any,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  minWidth: 400,
  bgcolor: "background.paper",
};

type CreateTestModalProps = {
  onCreate: (c: Partial<TestConfig>) => void
}
export const CreateTestModal: React.FC<CreateTestModalProps> = ({onCreate}) => {
  const [testCaseConfig, setTestCaseConfig] = useGeneralState<TestConfig>({});

  const [state, setState] = useGeneralState<{
    executedFunctions: ExecutedFunction[];
    activeStep: number;
    open: boolean;
  }>({ activeStep: 0 });

  const testCaseInfo: TestCaseInfo = useMemo(
    () => ({ executedFunctions: state?.executedFunctions, testCaseConfig }),
    [state, testCaseConfig]
  );

  const steps = getSteps();
  const isCurrentStepValid = steps[state?.activeStep]?.validate?.(testCaseInfo);

  const onChangeCallback = useCallback((i: Partial<TestCaseInfo>) => {
    if (i.executedFunctions) {
      setState({ executedFunctions: [...i.executedFunctions] });
    } else if (i.testCaseConfig) {
      setTestCaseConfig({ ...i?.testCaseConfig });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ActiveStepComponent =
    steps[state?.activeStep]?.Component || (() => null);

  return (
    <Modal
      className="border-1"
      open={true}
      onClose={() => null}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div
        style={{ ...style, maxHeight: "80vh", outline: "none" }}
        className="rounded bg-white"
      >
        <div className="w-full p-3">
          <h1 className="text-lg font-semibold text-black mt-2 mb-8">
            Create New Test Case
          </h1>

          <ActiveStepComponent
            info={testCaseInfo}
            onChange={onChangeCallback}
          />

          <div className="p-3 flex justify-end">
            <button
              disabled={!isCurrentStepValid}
              className={`${
                !isCurrentStepValid
                  ? "bg-gray-200 text-gray-800"
                  : "bg-blue-500 text-white"
              }  p-1 test-sm px-3 rounded`}
              onClick={() => {
                if(state?.activeStep < steps?.length - 1) {
                  setState({ activeStep: state?.activeStep + 1 })
                } else {
                  onCreate({
                    ...testCaseConfig,
                  })
                }
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const TestCreateStep = () => null;

type CommonTestStepProps = {
  info: TestCaseInfo;
  onChange: (i: Partial<TestCaseInfo>) => void;
};

const TestInformationStep: React.FC<CommonTestStepProps> = ({
  onChange,
  info,
}) => {
  return (
    <div className="w-full flex items-start flex-col">
      <div className="flex flex-col items-start my-3 w-full">
        <label className="text-xs font-semibold text-black">
          Test Case Name
        </label>
        <Input
          onChange={(e) =>
            onChange({ testCaseConfig: { name: e.target.value } })
          }
          value={info.testCaseConfig?.name || ""}
          className="bg-gray-50 px-2 my-2 w-full"
        />
      </div>

      <div className="flex flex-col items-start my-3 w-full">
        <label className="text-xs font-semibold text-black">
          Test Case Description
        </label>
        <TextareaAutosize
          onChange={(e) =>
            onChange({ testCaseConfig: { description: e.target.value } })
          }
          value={info.testCaseConfig?.description || ""}
          className="bg-gray-50 p-2 my-2 w-full h-16"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

const ExecutedFunctionSelectionStep: React.FC<CommonTestStepProps> = ({
  onChange,
}) => {
  const executedFunctions = useMemo(
    () => createEntitiesFromDBRecords({ logs: logs as unknown as Log[] }),
    []
  );

  const [state, setState] = useGeneralState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const ids = Object.keys(state)?.filter((k) => !!state[k]);

    onChange({
      executedFunctions:
        ids?.map(
          (i) => executedFunctions.find((e) => e.functionMeta?.id === i)!
        ) || [],
    });
  }, [state]);
  return (
    <div className="w-full flex items-center justify-center">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Function Name</TableCell>
            <TableCell>Executed At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {executedFunctions?.map((executedFunction) => {
            return (
              <TableRow>
                <TableCell>
                  <Checkbox
                    value={!!state[executedFunction?.functionMeta?.id]}
                    onChange={(_e, checked) =>
                      setState({
                        [executedFunction?.functionMeta?.id]: checked,
                      })
                    }
                  />
                </TableCell>
                <TableCell>{executedFunction?.functionMeta?.name}</TableCell>
                <TableCell>
                  {executedFunction?.functionMeta?.execution_end_time?.toString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

// const InputConfigStep: React.FC<CommonTestStepProps> = ({ info }) => {
//   return (
//     <div className="w-full">
//       <TestCreateView executionFunctions={info.executedFunctions} />
//     </div>
//   );
// };
