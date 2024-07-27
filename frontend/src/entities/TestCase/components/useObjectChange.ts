import { useCallback, useEffect, useState } from "react";

const objectCallbacksSet: any[] = [];

export const registerObjectChangeCallback = (
  object: any,
  callback: () => void,
  shouldUpdate?: (object: any) => boolean
) => {
  const existingCallbackSet = objectCallbacksSet.find((o) => o[0] === object);
  if (existingCallbackSet) {
    existingCallbackSet[1].push([callback, shouldUpdate]);
  } else {
    objectCallbacksSet.push([object, [[callback, shouldUpdate]]]);
  }
};

export const deleteObjectChangeCallback = (
  object: any,
  callback: () => void
) => {
  const existingCallbackSet = objectCallbacksSet.find((o) => o[0] === object);
  if (existingCallbackSet) {
    const index = existingCallbackSet[1].findIndex(
      (c: any) => callback === c[0]
    );
    if (index > -1) {
      existingCallbackSet[1].splice(index, 1);
    }
  }
};

export const notifyObjectChange = (object: any) => {
  const existingCallbackSet = objectCallbacksSet.find((o) => o[0] === object);
  if (existingCallbackSet) {
    existingCallbackSet[1].forEach((c: any[]) => {
      if (c[1]) {
        if (c[1](existingCallbackSet[0])) {
          c[0]();
        }
      } else {
        c[0]();
      }
    });
  }
};

export const useObjectChange = (
  object: any,
  getSnapShot?: (obj: any) => any[]
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCounter] = useState(0);

  const reRender = () => setCounter((counter) => counter + 1);

  useEffect(() => {
    let snapshot = getSnapShot?.(object) || null;

    const callback = () => {
      if (getSnapShot) {
        const newSnapShot = getSnapShot(object);
        const shouldUpdate = snapshot?.some((s, i) => s !== newSnapShot[i]);
        if (shouldUpdate) {
          snapshot = newSnapShot;
          reRender();
        }
      } else {
        reRender();
      }
    };

    registerObjectChangeCallback(object, callback);
    reRender();

    return () => {
      deleteObjectChangeCallback(object, callback);
    };
  }, [object]);

  const updateObject = useCallback(
    (updatedKeyValuePair: any) => {
      Object.keys(updatedKeyValuePair).forEach((k) => {
        object[k] = updatedKeyValuePair[k];
      });
      notifyObjectChange(object);
    },
    [object]
  );

  return updateObject;
};
