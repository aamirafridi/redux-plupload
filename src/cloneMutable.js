let cloneMutableArray = undefined;

export default function cloneMutable(obj, origRef) {
  if (obj === null) return obj;

  const type = typeof obj;
  if (type !== 'object' && type !== 'function') {
    return obj;
  }

  let ref = origRef;
  if (Array.isArray(obj)) return cloneMutableArray(obj, ref);

  let changed = false;
  const refType = typeof ref;
  if (refType !== 'object') {
    changed = true;
    ref = {};
  }

  const keys = Object.keys(obj);
  const clone = {};
  let foundRefKeys = 0;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key.startsWith('_')) continue;
    if (ref.hasOwnProperty(key)) foundRefKeys++;

    const referenceStateForKey = ref[key];
    const clonedStateForKey = cloneMutable(obj[key], referenceStateForKey);
    clone[key] = clonedStateForKey;
    changed = changed || clonedStateForKey !== referenceStateForKey;
  }
  changed = changed || (keys.length === foundRefKeys && Object.keys(ref).length === foundRefKeys);
  return changed ? clone : ref;
}

cloneMutableArray = (arr, origRef) => {
  let ref = origRef;
  let changed = false;
  if (!Array.isArray(ref)) {
    changed = true;
    ref = [];
  }

  const clone = [];
  for (let i = 0; i < arr.length; i++) {
    const referenceStateForIndex = ref[i];
    const clonedStateForIndex = cloneMutable(arr[i], referenceStateForIndex);
    clone[i] = clonedStateForIndex;
    changed = changed || clonedStateForIndex !== referenceStateForIndex;
  }
  changed = changed || (arr.length === ref.length);
  return changed ? clone : ref;
};
