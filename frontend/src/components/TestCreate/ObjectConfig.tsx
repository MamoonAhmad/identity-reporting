import React, { useMemo } from "react";
import { ObjectValidator, Validator } from "../../validators";
import {
  CheckBoxWithLabel,
  GenericObjectInputView,
  GenericObjectInputViewProps,
  ShowHideButton,
} from "./ObjectInput";
import { useGeneralState } from "../../helpers/useGeneralState";

type ObjectViewProps = Omit<GenericObjectInputViewProps, "validator"> & {
  validator: ObjectValidator;
  onChange: (v: Validator) => void;
};
export const ObjectConfig: React.FC<ObjectViewProps> = React.memo(
  ({ name, value, validator, onChange }) => {
    const [state, setState] = useGeneralState({
      showChildren: true,
    });

    const onChangeCallbacks = useMemo(() => {
      const callbackObj: { [key: string]: (v: Validator) => void } = {};
      Object.keys(validator?.config?.targetValue || {}).forEach((k) => {
        callbackObj[k] = (v: Validator) =>
          onChange(
            new ObjectValidator({
              ...validator?.config,
              targetValue: {
                ...validator?.config?.targetValue,
                [k]: v,
              },
            })
          );
      });
      return callbackObj;
    }, [validator, onChange]);

    const childrenLength = useMemo(() => {
      try {
        return Object.keys(validator?.config?.targetValue || {})?.length;
      } catch (e) {
        return null;
      }
    }, [validator]);

    const config = validator.config;

    const updateValidatorConfig = (v: any) => {
      onChange(new ObjectValidator({ ...validator.config, ...v }));
    };

    const showChildren =
      state?.showChildren && !!childrenLength && !validator.config?.ignore;

    return (
      <div className="w-full flex flex-col ml-3 items-start">
        <div className="flex items-center">
          <CheckBoxWithLabel
            label={name}
            checked={!config?.ignore}
            onChange={(c) => updateValidatorConfig({ ignore: !c })}
          />
          {"{"}
          {!validator.config?.ignore && (
            <ShowHideButton
              show={showChildren}
              onChange={(show) => setState({ showChildren: show })}
            />
          )}
          {!showChildren ? "...}" : null}
        </div>

        {showChildren ? (
          <div className="ml-4">
            {Object.keys(validator?.config?.targetValue || {}).map((k) => {
              return (
                <GenericObjectInputView
                  name={k}
                  validator={validator?.config?.targetValue![k]}
                  value={value[k]}
                  onChange={onChangeCallbacks[k]}
                />
              );
            })}
          </div>
        ) : null}

        {showChildren ? <p className="">{"}"}</p> : null}
      </div>
    );
  }
);
