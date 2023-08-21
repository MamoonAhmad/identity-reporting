import React, { useContext, useEffect, useMemo } from "react";
import { ArrayValidator, ObjectValidator, Validator } from "../../validators";
import { useGeneralState } from "../../helpers/useGeneralState";
import { AddOutlined, RemoveOutlined } from "@mui/icons-material";
import { TestCreationContext } from "./TestCreateView";

type GenericObjectInputViewProps = {
  name: string;
  validator: Validator;
  value: any;
};

export const GenericObjectInputView: React.FC<GenericObjectInputViewProps> = ({
  name,
  validator,
  value,
}) => {
  if (validator instanceof ObjectValidator) {
    return <ObjectView name={name} validator={validator} value={value} />;
  } else if (validator instanceof ArrayValidator) {
    return <ArrayView name={name} validator={validator} value={value} />;
  } else {
    return <LiteralView name={name} validator={validator} value={value} />;
  }
};

type ObjectViewProps = Omit<GenericObjectInputViewProps, "validator"> & {
  validator: ObjectValidator;
};
const ObjectView: React.FC<ObjectViewProps> = React.memo(
  ({ name, value, validator }) => {
    const [state, setState] = useGeneralState({
      showChildren: true,
      strictEqual: true,
      ignore: false,
      valuePathExpression: null,
    });

    const initialMatcherTargetValue = useMemo(
      () => validator?.config?.targetValue,
      [validator]
    );

    const childrenLength = useMemo(() => {
      try {
        return Object.keys(validator?.config?.targetValue || {})?.length;
      } catch (e) {
        return null;
      }
    }, [validator]);

    useEffect(() => {
      if (state?.ignore) {
        validator?.setConfig({
          ignore: true,
          strictEqual: false,
          expressionValue: null,
          targetValue: null,
        });
      } else {
        validator?.setConfig({
          ignore: false,
          strictEqual: !!state?.strictEqual,
          expressionValue: state?.valuePathExpression || null,
          targetValue: initialMatcherTargetValue,
        });
      }
    }, [validator, value, state, initialMatcherTargetValue]);

    return (
      <div className="w-full flex flex-col ml-3 items-start">
        <div className="flex items-center">
          {name}:{/* Other options */}
          <CheckBoxWithLabel
            label={"Strict Equal"}
            checked={state?.strictEqual}
            onChange={(c) => setState({ strictEqual: c })}
          />
          {"{"}
          <ShowHideButton
            show={state.showChildren}
            onChange={(show) => setState({ showChildren: show })}
          />
          {!state.showChildren || !childrenLength ? "}" : null}
        </div>

        {state?.showChildren && childrenLength ? (
          <div className="ml-4">
            {Object.keys(validator?.config?.targetValue || {}).map((k) => {
              return (
                <GenericObjectInputView
                  name={k}
                  validator={validator?.config?.targetValue![k]}
                  value={value[k]}
                />
              );
            })}
          </div>
        ) : null}

        {state.showChildren && childrenLength ? (
          <p className="">{"}"}</p>
        ) : null}
      </div>
    );
  }
);

type ArrayViewProps = Omit<GenericObjectInputViewProps, "validator"> & {
  validator: ArrayValidator;
};
const ArrayView: React.FC<ArrayViewProps> = React.memo(
  ({ name, value, validator }) => {
    const [state, setState] = useGeneralState({
      showChildren: true,
      checkLength: true,
      matchOrder: true,
      checkIsSet: true,
      valuePathExpression: null,
      ignore: false,
    });

    const initialMatcherTargetValue = useMemo(
      () => validator?.config?.targetValue,
      [validator]
    );

    const childrenLength = useMemo(() => {
      try {
        return validator?.config?.targetValue?.length;
      } catch (e) {
        return null;
      }
    }, [validator]);

    useEffect(() => {
      if (state?.ignore) {
        validator?.setConfig({
          ignore: true,
          checkIsSet: false,
          expressionValue: null,
          checkLength: false,
          matchOrder: false,
          targetValue: null,
        });
      } else {
        validator?.setConfig({
          ignore: false,
          checkIsSet: !!state?.checkIsSet,
          expressionValue: state?.valuePathExpression,
          checkLength: !!state?.checkLength,
          matchOrder: !!state?.matchOrder,
          targetValue: initialMatcherTargetValue,
        });
      }
    }, [validator, value, state, initialMatcherTargetValue]);

    return (
      <div className="w-full flex flex-col items-start">
        <div className="flex items-center">
          <CheckBoxWithLabel
            label={name}
            checked={!state?.ignore}
            onChange={(c) => setState({ ignore: !c })}
          />
          <p className="ml-2">[</p>
          <ShowHideButton
            show={state.showChildren}
            onChange={(showChildren) => setState({ showChildren })}
          />

          <CheckBoxWithLabel
            label={"Strict Equal"}
            checked={state?.checkLength}
            onChange={(c) => setState({ checkLength: c })}
          />
          <CheckBoxWithLabel
            label={"Match Order"}
            checked={state?.matchOrder}
            onChange={(c) => setState({ matchOrder: c })}
          />
          {!state.showChildren || !childrenLength ? (
            <p className="ml-2">{"]"}</p>
          ) : null}
        </div>

        {state?.showChildren && childrenLength ? (
          <div className="ml-5">
            {validator?.config?.targetValue?.map((v, i) => {
              return (
                <GenericObjectInputView
                  name={`[${i}]`}
                  validator={v}
                  value={value[i]}
                />
              );
            })}
          </div>
        ) : null}

        {state.showChildren && childrenLength ? (
          <p className="ml-2">{"]"}</p>
        ) : null}
      </div>
    );
  }
);

type LiteralViewState = {
  showChildren: boolean;
  ignore: boolean;
  shouldBeEqualToTargetValue: boolean;
  checkIsSet: boolean;
  expression: boolean;
  expressionString?: string;
  valuePath?: boolean;
  valuePathString?: string;
};
const LiteralView: React.FC<GenericObjectInputViewProps> = React.memo(
  ({ name, value, validator }) => {
    const { showObjectPathSelector } = useContext(TestCreationContext);

    const [state, setState] = useGeneralState<LiteralViewState>({
      showChildren: true,
      ignore: validator?.config?.ignore,
      shouldBeEqualToTargetValue: true,
      checkIsSet: validator?.config?.checkIsSet,
      expression: false,
    });

    useEffect(() => {
      validator.config.ignore = !!state?.ignore;
      if (validator?.config?.ignore) {
        validator?.setConfig({
          ignore: true,
          checkIsSet: false,
          expressionValue: null,
          targetValue: null,
        });
      } else {
        validator?.setConfig({
          ignore: false,
          checkIsSet: !!state?.checkIsSet,
          expressionValue: state?.expression ? state?.expressionString : null,
          targetValue: value,
        });
      }
    }, [state, value, validator]);

    return (
      <div className="w-full flex flex-col my-2">
        <div className={`flex items-center`}>
          <div className="mr-1">
            <CheckBoxWithLabel
              label={`${name}:`}
              checked={!state?.ignore}
              onChange={(c) => setState({ ignore: !c })}
            />
          </div>
          <select
            defaultValue={"shouldBeEqualToTargetValue"}
            className="p-0.5 border border-gray-400 rounded mx-2"
            onChange={(e) => {
              switch (e.target.value) {
                case INPUT_OPTION_KEYS.is_set: {
                  setState({
                    checkIsSet: true,
                    shouldBeEqualToTargetValue: false,
                    expressionString: undefined,
                    expression: false,
                  });
                  break;
                }
                case INPUT_OPTION_KEYS.should_equal: {
                  setState({
                    checkIsSet: false,
                    shouldBeEqualToTargetValue: true,
                    expressionString: undefined,
                    expression: false,
                  });
                  break;
                }
                case INPUT_OPTION_KEYS.expression:
                  setState({
                    checkIsSet: false,
                    shouldBeEqualToTargetValue: false,
                    expressionString: "",
                    expression: true,
                  });
                  break;
                case INPUT_OPTION_KEYS.value_path:
                  showObjectPathSelector((c) => {
                    setState({ valuePathString: c });
                  });
                  setState({
                    checkIsSet: false,
                    shouldBeEqualToTargetValue: false,
                    expressionString: "",
                    expression: false,
                    valuePath: true,
                    valuePathString: "",
                  });
                  break;
                default: {
                  console.error("Got invalid option.");
                }
              }
            }}
          >
            <option
              onClick={() => {
                setState({
                  checkIsSet: false,
                  shouldBeEqualToTargetValue: true,
                  expression: false,
                });
              }}
              value={INPUT_OPTION_KEYS.should_equal}
            >
              {JSON.stringify(value)?.length > 10
                ? JSON.stringify(value)?.substring(0, 10)
                : JSON.stringify(value)}
            </option>
            <option
              onClick={() => {
                setState({
                  checkIsSet: true,
                  shouldBeEqualToTargetValue: false,
                  expression: false,
                });
              }}
              value={INPUT_OPTION_KEYS.is_set}
            >
              Should Be Set
            </option>
            <option
              onClick={() => {
                setState({
                  checkIsSet: false,
                  shouldBeEqualToTargetValue: false,
                  expression: true,
                });
              }}
              value={INPUT_OPTION_KEYS.expression}
            >
              Expression
            </option>
            <option
              onClick={() => {
                setState({
                  checkIsSet: false,
                  shouldBeEqualToTargetValue: false,
                  expression: false,
                  valuePath: true,
                });
              }}
              value={INPUT_OPTION_KEYS.value_path}
            >
              Select Value
            </option>
          </select>
          {state?.expression ? (
            <div className="">
              <input
                value={state?.expressionString}
                className="p-0.5 px-2 rounded border border-gray-400 hover:border-blue-400"
                onChange={(e) => setState({ expressionString: e.target.value })}
              />
            </div>
          ) : null}
          {/* <CheckBoxWithLabel label={`Should Equal ${JSON.stringify(value)}`} checked={state?.shouldBeEqualToTargetValue} onChange={c => setState({shouldBeEqualToTargetValue: c})} />
        <CheckBoxWithLabel label={`Should Be Set`} checked={state?.checkIsSet} onChange={c => setState({checkIsSet: c, shouldBeEqualToTargetValue: false})} disabled={state?.ignore} /> */}
        </div>
        {JSON.stringify(value)?.length > 10 && JSON.stringify(value)}
      </div>
    );
  }
);

const ShowHideButton: React.FC<{
  show: boolean;
  onChange: (b: boolean) => void;
}> = React.memo(({ show, onChange }) => {
  return (
    <button
      className="bg-transparent text-blue-600"
      onClick={() => onChange(!show)}
    >
      {show ? <RemoveOutlined /> : <AddOutlined />}
    </button>
  );
});

const CheckBoxWithLabel: React.FC<{
  label: string;
  checked: boolean;
  onChange: (b: boolean) => void;
}> = ({ label, checked, onChange }) => {
  return (
    <label className=" flex items-center mx-1" style={{ maxWidth: 500 }}>
      <input
        type="checkbox"
        className="mr-2"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
};

const INPUT_OPTION_KEYS = {
  should_equal: "should_equal",
  is_set: "is_set",
  strict_equal: "strict_equal",
  match_length: "match_length",
  match_order: "match_order",
  match_object_type: "match_object_type",
  expression: "expression",
  value_path: "value_path",
};

// Fix Validators
// Fix the entity execution
// create small field decorators ?
// all the values in dict inout and output ?
// how to save the objects copies efficiently input output changes
// field options
// IO Driver
// control configs for how much loggin. input output
// unit tests backend
// unit tests frontend
// default parameters
// Object reference
// created updated and deleted objects match
/**
 * Test Creation Tool {
 *
 *  name a test case
 *  copy test json
 *  create test case from logs
 *  provide default input
 *  a way to save the test case
 *   options for value validator like ( is set )
 *  literal: has a non null value, should equal '', custom value (type mismatch ?)
 *  array: Exact Keys, Ignore
 *  // when custom value is inserted, parse it and show it in edit mode
 *  //
 *
 *  exeception validator
 *  log validator ?
 *  created objects validator
 *  updated and deleted validator
 *
 *  unit tests
 *
 * }
 *
 * Test Runner Tool {
 *
 *  a way to run the test case
 *  a way to run multiple test cases
 *  when a test case fails, find a way to update the test case
 *
 *
 *   uni tests
 *
 * }
 */
