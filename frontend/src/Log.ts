export enum LOG_TYPE {
    // ##### General Log Types
    ERROR = "ERROR",
    WARNING = "WARNING",
    INFO = "INFO",
  
    // ##### Object Mutations
    CREATE_OBJECT = "CREATE_OBJECT",
    UPDATE_OBJECT = "UPDATE_OBJECT",
    DELETE_OBJECT = "DELETE_OBJECT",
  
    // ##### EXECUTION
    ENTITY_EXECUTION_START = "ENTITY_EXECUTION_START",
    ENTITY_EXECUTION_END = "ENTITY_EXECUTION_END",
    ENTITY_EXECUTION_FAILURE = "ENTITY_EXECUTION_FAILURE",
  }
  
  export type Log = {
    message: string;
    error?: string;
    object?: any;
    log_type: LOG_TYPE;
    function_id: string;
    function_name: string;
    parent_function_id: string;
    execution_id: string;
    id: string;
  };