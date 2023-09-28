import React, { useCallback } from "react";
import { Validator } from "../../validators";
import { CheckBoxWithLabel, GenericObjectInputViewProps } from "./ObjectInput";

// type LiteralViewState = {
//   showChildren: boolean;
//   ignore: boolean;
//   shouldBeEqualToTargetValue: boolean;
//   checkIsSet: boolean;
//   expression: boolean;
//   expressionString?: string;
//   valuePath?: boolean;
//   valuePathString?: string;
// };

export const LiteralConfig: React.FC<GenericObjectInputViewProps> = React.memo(
  ({ name, value, validator, onChange }) => {
    const updateConfig = useCallback(
      (v: any) => {
        onChange(new Validator({ ...validator?.config, ...v }));
      },
      [validator, onChange]
    );
    const config = validator?.config;

    return (
      <div className="w-full flex flex-col my-2">
        <div className={`flex items-center`}>
          <div className="mr-1">
            <CheckBoxWithLabel
              label={`${name}:`}
              checked={!config?.ignore}
              onChange={(c) => updateConfig({ ignore: !c })}
            />
          </div>
          {JSON.stringify(value)}
        </div>
      </div>
    );
  }
);
