import { useEffect } from 'react';

export function useDebounce(
  fn: () => void,
  waitTime: number,
  deps?: any
) {
  useEffect(() => {
    // eslint-disable-next-line prefer-spread
    const t = setTimeout(() => fn.apply(undefined, deps), waitTime);

    return () => {
      clearTimeout(t);
    };
  }, deps);
}
