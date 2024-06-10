import { ViewPage } from "../../components/UICrud/ViewPage";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  FunctionTestResult,
  TestResult,
  TestRunForTestSuite,
  matchExecutionWithTestConfig,
} from "../../components/NestedObjectView/matcher";
import {
  TestResultColumns,
  TestResultFunctionView,
} from "./components/NestedObjectTestResultView";
import { TestRunServices } from "./services";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Modal,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import {
  BugReportSharp,
  CheckSharp,
  CloseSharp,
  DoneSharp,
} from "@mui/icons-material";
import { HorizontalFlowDiagram } from "../../components/FlowChart/HorizontalFlowDiagram";
import { PyramidFlowDiagram } from "../../components/FlowChart/PyramidFlowDiagram";
import { DiagramEntity } from "../../components/FlowChart/types";

export const ViewTestRun = () => {
  const params = useParams();
  const objectID = params?.["*"] || "";
  return (
    <ViewPage
      title="Test Suite Run"
      dataLoader={async () => {
        return await TestRunServices.getTestRunById(objectID);
      }}
      Content={ExecutedFunctionToTestConfigConverter}
    ></ViewPage>
  );
};

const ExecutedFunctionToTestConfigConverter: React.FC<{
  object: TestRunForTestSuite;
}> = ({ object }) => {
  const [result, setResult] = useState<TestResult | undefined>(undefined);
  useEffect(() => {
    if (!object) return;

    const res = matchExecutionWithTestConfig(object);
    setResult(res);
  }, [object]);

  if (!result) {
    return null;
  }
  return <TestResultView result={result} />;
};

export const TestResultView: React.FC<{
  result: TestResult;
}> = ({ result }) => {
  const theme = useTheme();

  const [diagramType, setDiagramType] = useState("vertical");

  const [showTests, setShowTests] = useState<"all" | "passed" | "failed">(
    "all"
  );

  const [selectedFunctionEntity, setSelectedFunctionEntity] = useState<
    FunctionTestResult | undefined
  >(undefined);
  const onModalClose = () => setSelectedFunctionEntity(undefined);

  const { total, passed, failed } = useMemo(() => {
    if (!result?.result?.length) {
      return { total: 0, passed: 0, failed: 0 };
    }
    return result?.result?.reduce(
      (acc, r) => {
        acc.total += 1;
        acc.passed += r.successful ? 1 : 0;
        acc.failed += !r.successful ? 1 : 0;
        return acc;
      },
      { total: 0, passed: 0, failed: 0 }
    );
  }, [result]);

  useEffect(() => {
    if (failed) {
      setShowTests("failed");
    }
  }, [failed]);

  const resultsToShow = useMemo(() => {
    if (!result || !result.result?.length) {
      return [];
    }
    switch (showTests) {
      case "all":
        return result.result;
      case "failed":
        return result.result.filter((r) => !r.successful) || [];
      case "passed":
        return result.result.filter((r) => !!r.successful) || [];
    }
  }, [result, showTests]);

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={showTests}
            onChange={(_, v) => {
              if (!v) {
                return;
              }
              setShowTests(v);
            }}
            sx={{ display: "flex", my: 2 }}
            exclusive
          >
            <ToggleButton value={"all"} color="info" disabled={total < 1}>
              All{" "}
              <Chip
                label={total}
                size="small"
                variant="filled"
                color="info"
                sx={{ ml: 1 }}
              />
            </ToggleButton>
            <ToggleButton value={"failed"} color="error" disabled={failed < 1}>
              Failed{" "}
              <Chip
                label={failed}
                size="small"
                variant="filled"
                color="error"
                sx={{ ml: 1 }}
              />
            </ToggleButton>
            <ToggleButton
              value={"passed"}
              color="success"
              disabled={passed < 1}
            >
              Passed{" "}
              <Chip
                label={passed}
                size="small"
                variant="filled"
                color="success"
                sx={{ ml: 1 }}
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      {resultsToShow?.map((r) => {
        return (
          <Accordion key={r.result.id}>
            <AccordionSummary>
              <Typography>
                {r.successful && (
                  <DoneSharp color="success" fontSize="small" sx={{ mr: 1 }} />
                )}
                {!r.successful && (
                  <BugReportSharp
                    color="error"
                    fontSize="small"
                    sx={{ mr: 1 }}
                  />
                )}
                {r.expectation}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid
                display={"flex"}
                flexDirection={"column"}
                alignItems={"flex-start"}
              >
                <Grid item xs={12}>
                  <Grid display={"flex"}>
                    <ToggleButtonGroup
                      size="small"
                      color="primary"
                      value={diagramType}
                      onChange={(_, v) => {
                        setDiagramType(v);
                      }}
                      exclusive
                    >
                      <ToggleButton value={"horizontal"}>
                        Horizontal
                      </ToggleButton>
                      <ToggleButton value={"vertical"}>Vertical</ToggleButton>
                      <ToggleButton value={"columns"}>Columns</ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                </Grid>

                {diagramType === "horizontal" && (
                  <HorizontalFlowDiagram
                    DiagramNodeComponent={({ entity }) => {
                      return (
                        <Button
                          sx={{
                            p: 1,
                            borderRadius: 4,
                            border: "1px solid black",
                            display: "flex",
                            alignItems: "center",
                            textTransform: "none",
                            color: "black",
                            background: entity.metaData?.successful
                              ? "transparent"
                              : theme.palette.error.light,
                          }}
                          onClick={() =>
                            setSelectedFunctionEntity(entity.metaData?.result)
                          }
                        >
                          {entity.metaData?.successful ? (
                            <CheckSharp color="success" />
                          ) : (
                            <CloseSharp
                              sx={{ color: theme.palette.error.contrastText }}
                            />
                          )}
                          <Typography
                            sx={{
                              color: !entity.metaData?.successful
                                ? theme.palette.error.contrastText
                                : undefined,
                            }}
                          >
                            {entity.label}
                          </Typography>
                        </Button>
                      );
                    }}
                    entities={[
                      getDiagramEntityFromExecutedFunction(
                        r.result,
                        () => undefined
                      ),
                    ]}
                  />
                )}
                {diagramType === "vertical" && (
                  <PyramidFlowDiagram
                    DiagramNodeComponent={({ entity }) => {
                      return (
                        <Button
                          sx={{
                            p: 1,
                            borderRadius: 4,
                            border: "1px solid black",
                            display: "flex",
                            alignItems: "center",
                            textTransform: "none",
                            color: "black",
                            background: entity.metaData?.successful
                              ? "transparent"
                              : theme.palette.error.light,
                          }}
                          onClick={() =>
                            setSelectedFunctionEntity(entity.metaData?.result)
                          }
                        >
                          {entity.metaData?.successful ? (
                            <CheckSharp color="success" />
                          ) : (
                            <CloseSharp
                              sx={{ color: theme.palette.error.contrastText }}
                            />
                          )}
                          <Typography
                            sx={{
                              color: !entity.metaData?.successful
                                ? theme.palette.error.contrastText
                                : undefined,
                            }}
                          >
                            {entity.label}
                          </Typography>
                        </Button>
                      );
                    }}
                    entities={[
                      getDiagramEntityFromExecutedFunction(
                        r.result,
                        () => undefined
                      ),
                    ]}
                  />
                )}
                {diagramType === "columns" && (
                  <TestResultColumns object={r.result} />
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
      {selectedFunctionEntity && (
        <Modal open onClose={onModalClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "lightgrey",
              borderRadius: 1,
              boxShadow: 24,
              p: 4,

              width: "80vw",
              maxHeight: "80vh",
              overflow: "scroll",
            }}
          >
            <IconButton
              sx={{
                position: "absolute",
                right: 10,
                top: 10,
              }}
              onClick={() => onModalClose()}
            >
              <CloseSharp />
            </IconButton>
            <TestResultFunctionView resultObject={selectedFunctionEntity} />
          </Box>
        </Modal>
      )}
    </>
  );
};

const getDiagramEntityFromExecutedFunction = (
  func: FunctionTestResult,
  onClick?: DiagramEntity["onClick"]
): DiagramEntity => {
  const entity: DiagramEntity = {
    id: func.id,
    label: func.name,
    type: "node",
    metaData: {
      result: func,
      successful: func.successful,
    },

    onClick,
    children: [],
  };

  entity.children =
    func.children?.map((f) =>
      getDiagramEntityFromExecutedFunction(f, onClick)
    ) || [];

  return entity;
};
