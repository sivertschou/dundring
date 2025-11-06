import React from 'react';

export const useLiveRef = <T>(value: T) => {
  const ref = React.useRef(value);

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
