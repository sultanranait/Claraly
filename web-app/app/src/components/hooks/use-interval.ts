import { useEffect, useRef } from "react";

type Callback = () => void;

// From: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useInterval(callback: Callback, delay: number | null) {
  //eslint-disable-next-line @typescript-eslint/no-empty-function
  const savedCallback = useRef<Callback>(() => {});

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
