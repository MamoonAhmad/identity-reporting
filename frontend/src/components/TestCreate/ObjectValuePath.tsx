import React, { useEffect, useMemo } from "react";
import { ArrayValidator, ObjectValidator, Validator } from "../../validators";
import { useGeneralState } from "../../helpers/useGeneralState";
import { AddOutlined, RemoveOutlined } from "@mui/icons-material";

type GenericObjectInputViewProps = {
  name: string;
  path: string;
  currentPath: string
  value: any;
  onSelect: (path: string) => void;
};

export const GenericObjectPathView: React.FC<GenericObjectInputViewProps> = ({
  name,
  path,
  value,
  onSelect: n,
  currentPath
}) => {

    
    const onSelect = (c: string) => console.log(c, 'this is path')
  if (typeof value === "object" && value) {
    return (
      <ObjectView currentPath={currentPath} name={name} path={path} value={value} onSelect={onSelect} />
    );
  } else if (Array.isArray(value)) {
    return (
      <ArrayView currentPath={currentPath} name={name} path={path} value={value} onSelect={onSelect} />
    );
  } else {
    return (
      <LiteralView currentPath={currentPath} name={name} path={path} value={value} onSelect={onSelect} />
    );
  }
};

const ObjectView: React.FC<GenericObjectInputViewProps> = React.memo(
  ({ name, value, path, onSelect, currentPath }) => {
    const [state, setState] = useGeneralState({
      showChildren: true,
    });

    const childrenLength = useMemo(() => {
      try {
        return Object.keys(value)?.length;
      } catch (e) {
        return null;
      }
    }, [value]);

    return (
      <div className="w-full flex flex-col ml-3 items-start">
        <div className="flex items-center">
          {name}:{/* Other options */}
          {"{"}
          <ShowHideButton
            show={state.showChildren}
            onChange={(show) => setState({ showChildren: show })}
          />
          {!state.showChildren || !childrenLength ? "}" : null}
        </div>

        {state?.showChildren && childrenLength ? (
          <div className="ml-4">
            {Object.keys(value).map((k) => {
              return (
                <GenericObjectPathView
                  name={`${k}`}
                  currentPath={`${currentPath}.${k}`}
                  path={path}
                  value={value[k]}
                  onSelect={onSelect}
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

const ArrayView: React.FC<GenericObjectInputViewProps> = React.memo(
  ({ name, value, currentPath, path, onSelect }) => {
    const [state, setState] = useGeneralState({
      showChildren: true,
    });

    const childrenLength = useMemo(() => {
      try {
        return value.length;
      } catch (e) {
        return null;
      }
    }, [value]);

    return (
      <div className="w-full flex flex-col items-start">
        <div className="flex items-center">
          {name}
          <p className="ml-2">[</p>
          <ShowHideButton
            show={state.showChildren}
            onChange={(showChildren) => setState({ showChildren })}
          />
          {!state.showChildren || !childrenLength ? (
            <p className="ml-2">{"]"}</p>
          ) : null}
        </div>

        {state?.showChildren && childrenLength ? (
          <div className="ml-5">
            {value?.map((v: any, i: number) => {
              return (
                <GenericObjectPathView
                  name={`[${i}]`}
                  currentPath={`${currentPath}.[${i}]`}
                  path={path}
                  value={v}
                  onSelect={onSelect}
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
  ({ name, value, path, onSelect, currentPath }) => {

    return (
      <div className="w-full flex flex-col my-2">
        <div className={`flex items-center`}>
          <div className="mr-1">
            <CheckBoxWithLabel
              label={`${name}:`}
              checked={path === currentPath}
              onChange={(c) => onSelect(c ? currentPath : '')}
            />
          </div>
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
