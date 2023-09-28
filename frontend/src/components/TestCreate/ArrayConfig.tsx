import React, { useMemo } from "react";
import { ArrayValidator, Validator } from "../../validators";
import {
  CheckBoxWithLabel,
  GenericObjectInputView,
  GenericObjectInputViewProps,
  ShowHideButton,
} from "./ObjectInput";
import { useGeneralState } from "../../helpers/useGeneralState";

type ArrayViewProps = Omit<GenericObjectInputViewProps, "validator"> & {
  validator: ArrayValidator;
};
export const ArrayConfig: React.FC<ArrayViewProps> = React.memo(
  ({ name, value, validator, onChange }) => {
    const [state, setState] = useGeneralState({
      showChildren: true,
    });

    const childrenLength = useMemo(() => {
      try {
        return validator?.config?.targetValue?.length;
      } catch (e) {
        return null;
      }
    }, [validator]);

    const onChangeCallbacks = useMemo(() => {
      const callbacks: any = [];
      validator?.config.targetValue?.forEach((_v, i) => {
        callbacks.push((v: Validator) => {
          const arr = validator.config.targetValue!;
          arr[i] = v;
          onChange(
            new ArrayValidator({
              ...validator?.config,
              targetValue: arr,
            })
          );
        });
      });
      return callbacks;
    }, [validator, onChange]);
    const config = validator.config;

    const updateValidatorConfig = (v: any) => {
      onChange(new ArrayValidator({ ...validator.config, ...v }));
    };

    return (
      <div className="w-full flex flex-col items-start">
        <div className="flex items-center">
          <CheckBoxWithLabel
            label={name}
            checked={!config?.ignore}
            onChange={(c) => updateValidatorConfig({ ignore: !c })}
          />
          <p className="ml-2">[</p>
          <ShowHideButton
            show={state.showChildren}
            onChange={(showChildren) => setState({ showChildren })}
          />

          <CheckBoxWithLabel
            label={"Strict Equal"}
            checked={config?.checkLength}
            onChange={(c) => updateValidatorConfig({ checkLength: c })}
          />
          <CheckBoxWithLabel
            label={"Match Order"}
            checked={config?.matchOrder}
            onChange={(c) => updateValidatorConfig({ matchOrder: c })}
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
                  value={value?.[i]}
                  onChange={onChangeCallbacks[i]}
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
