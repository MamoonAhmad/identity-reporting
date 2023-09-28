import React from "react";
import { ArrayValidator, ObjectValidator, Validator } from "../../validators";
import { AddOutlined, RemoveOutlined } from "@mui/icons-material";

import { LiteralConfig } from "./LiteralConfig";
import { ArrayConfig } from "./ArrayConfig";
import { ObjectConfig } from "./ObjectConfig";

export type GenericObjectInputViewProps = {
  name: string;
  validator: Validator;
  value: any;
  onChange: (v: Validator) => void;
};

export const GenericObjectInputView: React.FC<GenericObjectInputViewProps> = ({
  name,
  validator,
  value,
  onChange,
}) => {
  if (validator instanceof ObjectValidator) {
    return (
      <ObjectConfig
        onChange={onChange}
        name={name}
        validator={validator}
        value={value}
      />
    );
  } else if (validator instanceof ArrayValidator) {
    return (
      <ArrayConfig
        onChange={onChange}
        name={name}
        validator={validator}
        value={value}
      />
    );
  } else {
    return (
      <LiteralConfig
        onChange={onChange}
        name={name}
        validator={validator}
        value={value}
      />
    );
  }
};

export const ShowHideButton: React.FC<{
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

export const CheckBoxWithLabel: React.FC<{
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

// const INPUT_OPTION_KEYS = {
//   should_equal: "should_equal",
//   is_set: "is_set",
//   strict_equal: "strict_equal",
//   match_length: "match_length",
//   match_order: "match_order",
//   match_object_type: "match_object_type",
//   expression: "expression",
//   value_path: "value_path",
// };

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
