import React, { useMemo } from "react";
import { Validator, ArrayValidator, ObjectValidator } from "../../validators";
import {
  AddOutlined,
  CheckOutlined,
  CloseOutlined,
  RemoveOutlined,
} from "@mui/icons-material";
import { useGeneralState } from "../../helpers/useGeneralState";

type GenericObjectDiffProps = {
  validator: Validator;
  name: string;
};

export const GenericObjectDiff: React.FC<GenericObjectDiffProps> = ({
  name,
  validator,
}) => {
  if (validator instanceof ObjectValidator) {
    return <ObjectView name={name} validator={validator} />;
  } else if (validator instanceof ArrayValidator) {
    return <ArrayView name={name} validator={validator} />;
  } else {
    return <LiteralView name={name} validator={validator} />;
  }
};

type ObjectViewProps = {
  validator: ObjectValidator;
  name: string;
};

export const ObjectView: React.FC<ObjectViewProps> = React.memo(
  ({ name, validator }) => {
    const [state, setState] = useGeneralState({ showChildren: true });

    const { targetValue } = validator?.config || {};
    const { isValid } = validator || {};

    const childrenLength = useMemo(() => {
      try {
        return Object.keys(targetValue || {})?.length;
      } catch (e) {
        return null;
      }
    }, [targetValue]);

    return (
      <div className="w-full flex flex-col">
        <div className="flex items-center">
          {isValid ? (
            <CheckOutlined className="text-emerald-800 mr-1" />
          ) : (
            <CloseOutlined className="text-amber-800 mr-1" />
          )}
          {name}:{/* Other options */} {"{"}
          <ShowHideButton
            show={state.showChildren}
            onChange={(c) => setState({ showChildren: !!c })}
          />
        </div>

        {state?.showChildren && childrenLength ? (
          <div className="ml-5">
            {Object.keys(targetValue || {}).map((k) => {
              return <GenericObjectDiff name={k} validator={targetValue![k]} />;
            })}
          </div>
        ) : null}

        {childrenLength ? <p className="ml-2">{"}"}</p> : null}
      </div>
    );
  }
);

type ArrayViewProps = {
  validator: ArrayValidator;
  name: string;
};

export const ArrayView: React.FC<ArrayViewProps> = React.memo(
  ({ name, validator }) => {
    const [state, setState] = useGeneralState({ showChildren: true });

    const { targetValue } = validator?.config || {};
    const { isValid } = validator || {};

    const childrenLength = useMemo(() => {
      try {
        return targetValue?.length;
      } catch (e) {
        return null;
      }
    }, [targetValue]);

    return (
      <div className="w-full flex flex-col">
        <div className="flex items-center">
          {isValid ? (
            <CheckOutlined className="text-emerald-800 mr-1" />
          ) : (
            <CloseOutlined className="text-amber-800 mr-1" />
          )}
          {JSON.stringify(name)}:{/* Other options */}
          {childrenLength ? <p className="ml-2">[</p> : null}
          <ShowHideButton
            show={state.showChildren}
            onChange={(c) => setState({ showChildren: c })}
          />
          <p className="text-amber-800 ml-3">{validator?.error}</p>
        </div>

        {state?.showChildren && childrenLength ? (
          <div className="ml-5">
            {targetValue!.map((v, i) => {
              return <GenericObjectDiff name={`[${i}]`} validator={v} />;
            })}
          </div>
        ) : null}

        {childrenLength ? <p className="ml-2">]</p> : null}
      </div>
    );
  }
);

export const LiteralView: React.FC<GenericObjectDiffProps> = React.memo(
  ({ name, validator }) => {
    const { targetValue } = validator?.config || {};
    const { isValid, receivedValue } = validator || {};

    return (
      <div className="w-full flex flex-col">
        <div className={`flex items-center`}>
          {isValid ? (
            <CheckOutlined className="text-emerald-800 mr-1" />
          ) : (
            <CloseOutlined className="text-amber-800 mr-1" />
          )}
          <p className={`mr-2 ${!isValid ? "text-amber-800" : ""}`}>{name}:</p>

          <p
            className={`${
              isValid ? "text-emerald-800" : "bg-amber-200 text-amber-800"
            }`}
          >
            {JSON.stringify(receivedValue)}
          </p>
          {!isValid ? (
            <>
              <p className="ml-3">Expected:</p>
              <p className={`bg-emerald-200`}>{JSON.stringify(targetValue)}</p>
            </>
          ) : null}
        </div>
      </div>
    );
  }
);

type ShowHideButtonProps = {
  show: boolean;
  onChange: (c: boolean) => void;
};

const ShowHideButton: React.FC<ShowHideButtonProps> = React.memo(
  ({ show, onChange }) => {
    return (
      <button
        className="bg-transparent text-blue-600"
        onClick={() => onChange(show)}
      >
        {show ? <RemoveOutlined /> : <AddOutlined />}
      </button>
    );
  }
);
