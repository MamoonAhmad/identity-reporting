import { useCallback, useEffect, useState } from "react";

const objectCallbacksSet: any[] = [];
const allObjectCallbackSet: any[] = [];

export const registerAnyObjectChangeCallback = (
  key: string,
  callback: (o: any) => void,
  shouldCallCallback?: (o: any) => boolean
) => {
  const exists = allObjectCallbackSet.find((entry) => entry[0] === key);
  if (exists) return;

  allObjectCallbackSet.push([key, shouldCallCallback, callback]);
};

export const deleteAnyObjectChangeCallback = (key: string) => {
  const index = allObjectCallbackSet.find((entry) => entry[0] === key);
  if (index > -1) {
    allObjectCallbackSet.splice(index, 1);
  }
};

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
  allObjectCallbackSet.forEach((entry) => {
    if (entry[1]) {
      const shouldCallCallback = entry[1](object);
      if (!shouldCallCallback) {
        return;
      }
    }
    entry[2](object);
  });
};

export const useObjectChange = (
  object: any,
  getSnapShot?: (obj: any) => any[]
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCounter] = useState(0);

  const reRender = () => setCounter((counter) => counter + 1);

  useEffect(() => {
    // create a snapshot
    let snapshot = getSnapShot?.(object) || null;

    const callback = () => {
      // If we have snapshot, check if the snapshot matches in the object
      if (getSnapShot) {
        const newSnapShot = getSnapShot(object);

        // match with old snapshot
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
    // won't list to getSnapshot changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
