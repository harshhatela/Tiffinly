import { useEffect, useRef, useState } from 'react';

export default function AnimatedNumber({ value, prefix = '', suffix = '', duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef(null);
  const startValue = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    startValue.current = display;
    startTime.current  = null;

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startValue.current + (value - startValue.current) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <span>{prefix}{display.toLocaleString('en-IN')}{suffix}</span>;
}
