import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedNumber — smoothly counts from 0 (or a previous value) to `value`.
 *
 * Props:
 *  - value:     number  — target value
 *  - duration:  number  — animation duration in ms (default 1200)
 *  - prefix:    string  — text before number (e.g. "₹", "$")
 *  - suffix:    string  — text after number (e.g. "%", "/day")
 *  - decimals:  number  — decimal places (default 0)
 *  - className: string  — CSS class for the wrapper span
 *  - easing:    fn      — custom easing function (t => result), default easeOutExpo
 */
export const AnimatedNumber = ({
  value = 0,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  easing
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  const defaultEasing = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  useEffect(() => {
    const easeFn = easing || defaultEasing;
    const from = fromRef.current;
    const to = value;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeFn(progress);
      const current = from + (to - from) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = displayValue.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
};
