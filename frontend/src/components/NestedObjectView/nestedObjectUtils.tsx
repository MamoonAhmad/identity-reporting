import { ArrayValidator, ObjectValidator, Validator } from "../../validators";
import {
  AbcSharp,
  DataArraySharp,
  DataObjectSharp,
  FunctionsSharp,
  NumbersSharp,
} from "@mui/icons-material";
import { NestedObjectUIListItem } from "./NestedObjectView";
import { FunctionValidator } from "../../validators/function";

export const getChildrenForObject = (
  name: string,
  o: any,
  onChange: (o: any) => void
): NestedObjectUIListItem[] | null => {
  if (o instanceof ObjectValidator) {
    return Object.keys(o.config.targetValue || {}).map((k) => {
      return {
        object: o.config.targetValue![k],
        id: k,
        name: k,
        onChange: (oo: Validator) => {
          onChange(
            new ObjectValidator({
              ...o.config,
              targetValue: {
                ...(o.config.targetValue || {}),
                [k]: oo,
              },
            })
          );
        },
      };
    });
  } else if (o instanceof ArrayValidator) {
    return (o.config.targetValue || []).map((v, i) => {
      return {
        object: v,
        id: i.toString(),
        name: `${name}[${i}]`,
        onChange: (oo: Validator) => {
          o.config.targetValue![i] = oo;
          onChange(
            new ArrayValidator({
              ...o.config,
              targetValue: [...o.config.targetValue!],
            })
          );
        },
      };
    });
  } else if (o instanceof FunctionValidator) {
    const config = o.config.targetValue.validatorConfig;
    const arr = [
      {
        id: "input",
        name: "Input",
        object: config?.input,

        onChange: (v: Validator) => {
          onChange(
            new FunctionValidator({
              ...o.config,
              targetValue: {
                ...o.config.targetValue,
                validatorConfig: {
                  ...config,
                  input: v,
                },
              },
            })
          );
        },
      },
      {
        id: "output",
        name: "Output",
        object: config?.output,

        onChange: (v: Validator) => {
          onChange(
            new FunctionValidator({
              ...o.config,
              targetValue: {
                ...o.config.targetValue,
                validatorConfig: {
                  ...config,
                  output: v,
                },
              },
            })
          );
        },
      },
      {
        name: "Created Objects",
        id: "created_objects",
        object: config?.createdObjects,
        onChange: (v: ArrayValidator) => {
          onChange(
            new FunctionValidator({
              ...o.config,
              targetValue: {
                ...o.config.targetValue,
                validatorConfig: {
                  ...config,
                  createdObjects: v,
                },
              },
            })
          );
        },
      },
      {
        name: "Updated Objects",
        id: "updated_objects",
        object: config?.updatedObjects,
        onChange: (v: ArrayValidator) => {
          onChange(
            new FunctionValidator({
              ...o.config,
              targetValue: {
                ...o.config.targetValue,
                validatorConfig: {
                  ...config,
                  updatedObjects: v,
                },
              },
            })
          );
        },
      },
      {
        name: "Deleted Objects",
        id: "deleted_objects",
        object: config?.deletedObjects,
        onChange: (v: ArrayValidator) => {
          onChange(
            new FunctionValidator({
              ...o.config,
              targetValue: {
                ...o.config.targetValue,
                validatorConfig: {
                  ...config,
                  deletedObjects: v,
                },
              },
            })
          );
        },
      },
    ];

    config?.childFunctions.forEach((f, i) => {
      const config = f.config.targetValue;
      arr.push({
        name: config.executedFunctionMeta.name,
        id: `childFunction.${i}.${config.executedFunctionMeta.name}`,
        object: f as any,
        onChange: (v: any) => {
          o.config.targetValue.validatorConfig.childFunctions[i] = v;
          onChange(
            new FunctionValidator({
              ...o.config,
              targetValue: {
                ...o.config.targetValue,
                validatorConfig: {
                  ...(o?.config?.targetValue?.validatorConfig || {}),
                  childFunctions: [
                    ...(o?.config?.targetValue?.validatorConfig
                      ?.childFunctions || []),
                  ],
                },
              },
            })
          );
        },
      });
    });

    return arr;
  } else if (o instanceof Validator) {
    return null;
  }
  return null;
};

export const getIcon = (o: any): JSX.Element => {
  if (o instanceof ObjectValidator) {
    return <DataObjectSharp fontSize="small" />;
  } else if (o instanceof ArrayValidator) {
    return <DataArraySharp fontSize="small" />;
  } else if (o instanceof Validator) {
    if (Number.isFinite(o.config.targetValue)) {
      return <NumbersSharp fontSize="small" />;
    } else {
      return <AbcSharp fontSize="small" />;
    }
    return <>{null}</>;
  } else if (o?.executedFunction?.id) {
    return <FunctionsSharp fontSize="small" />;
  }
  return <>{null}</>;
};

export const hasChildren = (o: any) => {
  if (
    o instanceof ObjectValidator &&
    Object.keys(o.config.targetValue || {}).length
  ) {
    return true;
  } else if (o instanceof ArrayValidator && o.config.targetValue?.length) {
    return true;
  } else if (o instanceof Validator) {
    return false;
  } else if (o?.executedFunction?.id) {
    return true;
  }
  return false;
};
