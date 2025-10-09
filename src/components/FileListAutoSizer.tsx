import React, { memo, useLayoutEffect, useRef, useState } from 'react';

interface FileListAutoSizerProps {
  children: (size: { width: number; height: number }) => React.ReactNode;
}

// Custom AutoSizer to avoid resize feedback loops that can occur with nested
// scrollbars. Measures clientWidth/clientHeight and only updates when values
// actually change. Resize callbacks are batched via requestAnimationFrame to
// prevent nested state updates during React commit.
export const FileListAutoSizer = memo(function FileListAutoSizer({ children }: FileListAutoSizerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number | null = null;

    const update = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      setSize(prev => (prev.width !== width || prev.height !== height) ? { width, height } : prev);
    };

    // Initial measure
    update();

    const ro = new ResizeObserver(() => {
      if (raf != null) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    });

    ro.observe(el);

    return () => {
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ width: '100%', height: '100%', overflow: 'hidden', minHeight: 0, minWidth: 0 }}
    >
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  );
});