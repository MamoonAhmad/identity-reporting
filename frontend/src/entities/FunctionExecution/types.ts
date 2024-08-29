

export type ExecutedFunction = {
    id: string;
    name: string;
    description: string;
    parentID: string;
    input: any;
    output: any;
    startTime: number;
    endTime: number;
    error?: string;
    executedSuccessfully: boolean;
    traceID: string;
    environmentName: string;
    moduleName: string;
    fileName: string;
    executionContext: Record<string, any>;
    executionID: string;
    children?: ExecutedFunction[];
  };