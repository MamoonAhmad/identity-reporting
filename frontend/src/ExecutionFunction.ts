import { LOG_TYPE, Log, Log1 as Log1Type } from "./Log";


export type FunctionMeta = {
  name: string;
  description: string;
  reference_id: string;
  execution_id: string;
  id: string;

  input_data: any;
  output_data: any;

  input_schema: any;
  output_schema: any;

  execution_start_time: Date;
  execution_end_time: Date;
  parent_id: string
  executed_successfully: boolean
};

export class ExecutedFunction {
  functionMeta!: FunctionMeta;
  createdObjects: any[] = [];
  deletedObjects: any[] = [];
  updatedObjects: any[] = [];

  childFunctions: ExecutedFunction[] = []

  exception: string | undefined = undefined
  logs: (Log | ExecutedFunction)[] = [];

  constructor(props?: {
    functionMeta?: FunctionMeta;
    createdObjects?: any[];
    deletedObjects?: any[];
    updatedObjects?: any[];
  }) {
    if (props?.functionMeta) this.functionMeta = props.functionMeta;
    this.createdObjects = props?.createdObjects || [];
    this.updatedObjects = props?.updatedObjects || [];
    this.deletedObjects = props?.deletedObjects || [];
  }

  addLog(log: Log) {
    switch (log.log_type) {
      case LOG_TYPE.ENTITY_EXECUTION_START: {
        // ENTITY_EXECUTION_START always logs entity object
        this.functionMeta = {
          ...(this.functionMeta || {}),
          ...(log?.object || []),
        };
        break;
      }
      case LOG_TYPE.ENTITY_EXECUTION_END: {
        this.functionMeta = {
          ...(this.functionMeta || {}),
          ...(log.object || {}),
        };
        this.calculateDifferenceInInputAndOutput();
        break;
      }
      case LOG_TYPE.ENTITY_EXECUTION_FAILURE: {
        // object.object is the trace back string
        // this trace back has \ns
        this.exception = log.message
        break;
      }
      case LOG_TYPE.CREATE_OBJECT: {
        log?.object && this.createdObjects?.push(log.object);
        break;
      }
      case LOG_TYPE.UPDATE_OBJECT: {
        log?.object && this.updatedObjects?.push(log.object);
        break;
      }
      case LOG_TYPE.DELETE_OBJECT: {
        log?.object && this.deletedObjects?.push(log.object);
        break;
      }

      default: {
        break
      }
    }

    this.logs.push(log);
  }

  calculateDifferenceInInputAndOutput() {
    // TODO calculate object diff
  }
}



export type ExecutedFunction1Type = {
  name:                  string;
  description:           string | null;
  executed_successfully: boolean;
  execution_id:          string;
  id:                    string;
  exception:             string | null;
  output_data:           any | null;
  input_data:            any | null;
  parent_id:             null | string;
  logs:                  Log1Type[];



  createdObjects: any[];
  updatedObjects: any[];
  deletedObjects: any[];
  childFunctions: ExecutedFunction1Type[]
}
