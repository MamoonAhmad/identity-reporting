import { ViewPage } from "../../components/UICrud/ViewPage";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FunctionTestResult,
  TestResult,
  TestResultForCase,
  TestRunForTestSuite,
  matchExecutionWithTestConfig,
} from "../../components/NestedObjectView/matcher";
import {
  TestResultColumns,
  TestResultFunctionView,
} from "./components/NestedObjectTestResultView";
import { TestRunServices } from "./services";
import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Grid,
  IconButton,
  Modal,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
  styled,
  AccordionSummaryProps,
  AccordionProps,
} from "@mui/material";
import {
  ArrowForwardIosSharp,
  BugReportSharp,
  CheckCircle,
  CheckCircleSharp,
  CheckSharp,
  CloseSharp,
  DoneSharp,
  ErrorSharp,
} from "@mui/icons-material";
import { HorizontalFlowDiagram } from "../../components/FlowChart/HorizontalFlowDiagram";
import { PyramidFlowDiagram } from "../../components/FlowChart/PyramidFlowDiagram";
import { DiagramEntity } from "../../components/FlowChart/types";

const Accordion = styled(
  (
    props: AccordionProps & {
      colorVariant?: "success" | "error";
    }
  ) => {
    const theme = useTheme();
    return (
      <MuiAccordion
        disableGutters
        elevation={0}
        square
        {...props}
        sx={{
          borderColor:
            props.colorVariant === "success"
              ? theme.palette.success.main
              : props.colorVariant === "error"
              ? theme.palette.error.main
              : "",
        }}
      />
    );
  }
)(({ theme }) => ({
  borderWidth: "2px",
  borderStyle: "solid",
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

const AccordionSummary = styled(
  (
    props: AccordionSummaryProps & {
      colorVariant?: "success" | "error";
    }
  ) => {
    const theme = useTheme();
    return (
      <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharp sx={{ fontSize: "0.9rem" }} />}
        {...props}
        sx={{
          borderColor:
            props.colorVariant === "success"
              ? theme.palette.success.main
              : props.colorVariant === "error"
              ? theme.palette.error.main
              : "",
        }}
      />
    );
  }
)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,

  minHeight: "auto",
  height: "auto",
  padding: theme.spacing(0.5),
  "&.Mui-expanded": {
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
  },

  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
    marginTop: 0,
    marginBottom: 0,
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export const ViewTestRun = () => {
  const params = useParams();
  const objectID = params?.["*"] || "";
  return (
    <ViewPage
      objectID={objectID}
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
  if (result.error) {
    return (
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="caption" fontWeight={"bold"} color={"error"}>
            Failed to run the test case. Following error occurred while running
            the test case.
          </Typography>
          <Box sx={{ p: 2, m: 2 }}>
            <TextField
              fullWidth
              sx={{}}
              multiline
              color="error"
              value={result.error}
            />
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          {result.result?.map((r) => {
            return <TestCaseResult testCaseResult={r} />;
          })}
        </Grid>
      </Grid>
    </>
  );
};

export const TestCaseResult: React.FC<{
  testCaseResult: TestResultForCase;
  expanded?: boolean;
}> = ({ testCaseResult, expanded }) => {
  const [diagramType, setDiagramType] = useState("vertical");
  const [selectedFunctionEntity, setSelectedFunctionEntity] = useState<
    FunctionTestResult | undefined
  >(undefined);

  const theme = useTheme();

  const onModalClose = useCallback(() => {
    setSelectedFunctionEntity(undefined);
  }, []);

  return (
    <>
      <Accordion
        defaultExpanded={expanded}
        colorVariant={testCaseResult.successful ? "success" : "error"}
      >
        <AccordionSummary
          colorVariant={testCaseResult.successful ? "success" : "error"}
        >
          <Typography>
            {testCaseResult.successful && (
              <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
            )}
            {!testCaseResult.successful && (
              <ErrorSharp color="error" fontSize="small" sx={{ mr: 1 }} />
            )}
            {testCaseResult.expectation}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {testCaseResult?.error ? (
            <Grid container>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  sx={{}}
                  multiline
                  color="error"
                  value={testCaseResult.error}
                />
              </Grid>
            </Grid>
          ) : null}
          {!testCaseResult?.error ? (
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
                    <ToggleButton value={"horizontal"}>Horizontal</ToggleButton>
                    <ToggleButton value={"vertical"}>Vertical</ToggleButton>
                    <ToggleButton value={"columns"}>Columns</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>

              <Grid sx={{ overflow: "scroll" }} item xs={12}>
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
                            <CheckCircle color="success" />
                          ) : (
                            <ErrorSharp
                              sx={{ color: theme.palette.error.contrastText }}
                            />
                          )}
                          <Typography
                            sx={{
                              color: !entity.metaData?.successful
                                ? theme.palette.error.contrastText
                                : undefined,
                              ml: 1,
                            }}
                          >
                            {entity.label}
                          </Typography>
                        </Button>
                      );
                    }}
                    entities={[
                      getDiagramEntityFromExecutedFunction(
                        testCaseResult.result!,
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
                            <CheckCircleSharp color="success" />
                          ) : (
                            <ErrorSharp
                              sx={{ color: theme.palette.error.contrastText }}
                            />
                          )}
                          <Typography
                            sx={{
                              color: !entity.metaData?.successful
                                ? theme.palette.error.contrastText
                                : undefined,
                              ml: 1,
                            }}
                          >
                            {entity.label}
                          </Typography>
                        </Button>
                      );
                    }}
                    entities={[
                      getDiagramEntityFromExecutedFunction(
                        testCaseResult.result!,
                        () => undefined
                      ),
                    ]}
                  />
                )}
                {diagramType === "columns" && (
                  <TestResultColumns object={testCaseResult.result!} />
                )}
              </Grid>
            </Grid>
          ) : null}
        </AccordionDetails>
      </Accordion>

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
    label:
      func.name +
      (func.executionContext.test_run?.is_mocked ? " (Mocked)" : ""),
    type: "node",
    metaData: {
      result: func,
      successful: func.successful,
    },

    onClick,
    children: [],
  };

  if (!func.executionContext.test_run?.is_mocked) {
    entity.children =
      func.children?.map((f) =>
        getDiagramEntityFromExecutedFunction(f, onClick)
      ) || [];
  }

  return entity;
};
