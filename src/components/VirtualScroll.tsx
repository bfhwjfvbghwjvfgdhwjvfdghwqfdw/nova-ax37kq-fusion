import React, { useRef, useLayoutEffect } from 'react';

interface VirtualScrollProps {
  itemCount: number;
  itemHeight: number;
  renderItem: (index: number) => React.ReactNode;
  className?: string;
  overscanCount?: number;
}

export function VirtualScroll({ itemCount, itemHeight, renderItem, className = '', overscanCount = 5 }: VirtualScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const onScroll = () => {
      if (!innerRef.current) return;

      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscanCount);
      const endIndex = Math.min(itemCount - 1, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscanCount);

      const items = [];
      for (let i = startIndex; i <= endIndex; i++) {
        items.push(
          <div
            key={i}
            style={{
              position: 'absolute',
              top: i * itemHeight,
              height: itemHeight,
              left: 0,
              right: 0,
            }}
          >
            {renderItem(i)}
          </div>
        );
      }

      innerRef.current.style.height = `${itemCount * itemHeight}px`;
      innerRef.current.innerHTML = '';
      items.forEach(item => {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.top = `${parseInt(item.props.style.top)}px`;
        div.style.height = `${itemHeight}px`;
        div.style.left = '0';
        div.style.right = '0';
        div.appendChild(renderItem(parseInt(item.key as string)) as any);
        innerRef.current?.appendChild(div);
      });
    };

    container.addEventListener('scroll', onScroll);
    onScroll(); // Initial render

    return () => {
      container.removeEventListener('scroll', onScroll);
    };
  }, [itemCount, itemHeight, renderItem, overscanCount]);

  return (
    <div ref={containerRef} className={`overflow-auto ${className}`}>
      <div ref={innerRef} className="relative" />
    </div>
  );
}