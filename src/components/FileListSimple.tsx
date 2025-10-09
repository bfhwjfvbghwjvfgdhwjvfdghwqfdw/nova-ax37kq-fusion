import React, { useState, useRef, memo, useLayoutEffect } from 'react';
import type { DirEntry, ViewOptions } from '@/types/api';
import { formatDate } from '@/utils/date';
import { formatSize } from '@/utils/size';
import { removeExtension } from '@/utils/path';

type FileListSimpleProps = {
  entries: DirEntry[];
  loading: boolean;
  selected: Set<string>;
  cutItems?: Set<string>;
  icons: Record<string, string | null>;
  viewOptions: ViewOptions;
  settings: any;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (path: string) => void;
  onEntryClick: (entry: DirEntry, event: React.MouseEvent) => void;
  onEntryDoubleClick: (entry: DirEntry) => void;
  onEntryAuxClick?: (entry: DirEntry, event: React.MouseEvent) => void;
  onContextMenu: (event: React.MouseEvent, entry: DirEntry) => void;
  onBackgroundContextMenu?: (event: React.MouseEvent) => void;
  onVisibleRangeChange?: (start: number, end: number) => void;
};

const FileItem = memo(({ entry, selected, cutItems, viewOptions, settings, onToggleSelect, onEntryClick, onEntryDoubleClick, onEntryAuxClick, onContextMenu, icons }: any) => {
  const getIconKey = (path: string): string => {
    const sizeHint = viewOptions.iconSize === 'extra-large' || viewOptions.iconSize === 'large' ? 'large' :
                     viewOptions.iconSize === 'medium' ? 'normal' : 'small';
    return path + ':' + sizeHint;
  };

  const renderIcon = (entry: DirEntry): JSX.Element => {
    const iconKey = getIconKey(entry.path);
    const iconData = icons[iconKey];
    if (iconData) {
      return <img src={iconData} alt="icon" className="w-full h-full rounded-sm" />;
    }
    return <span className={`${
      viewOptions.iconSize === 'small' ? 'text-2xl' :
      viewOptions.iconSize === 'medium' ? 'text-3xl' :
      viewOptions.iconSize === 'large' ? 'text-4xl' :
      'text-5xl'
    }`}>{entry.isDir ? '📁' : '📄'}</span>;
  };

  return (
    <div
      data-path={entry.path}
      onClick={evt => onEntryClick(entry, evt)}
      onDoubleClick={() => onEntryDoubleClick(entry)}
      onAuxClick={evt => onEntryAuxClick?.(entry, evt)}
      onContextMenu={evt => onContextMenu(evt, entry)}
      className={`file-list-item p-2 flex items-center gap-2 ${selected.has(entry.path) ? 'bg-white/10' : ''} ${cutItems?.has(entry.path) ? 'opacity-50' : ''} hover:bg-white/5`}
    >
      <div className={`flex-shrink-0 ${
        viewOptions.iconSize === 'small' ? 'w-4 h-4' :
        viewOptions.iconSize === 'medium' ? 'w-6 h-6' :
        viewOptions.iconSize === 'large' ? 'w-8 h-8' :
        'w-10 h-10'
      }`}>
        {renderIcon(entry)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate">
          {settings.showFileExtensions ? entry.name : (entry.isDir ? entry.name : removeExtension(entry.name))}
        </div>
      </div>
      {!entry.isDir && (
        <div className="text-xs text-white/60 flex-shrink-0">
          {formatSize(entry.size, settings.fileSizeFormat === 'binary')}
        </div>
      )}
      {viewOptions.showItemCheckboxes && (
        <input 
          type="checkbox" 
          checked={selected.has(entry.path)} 
          onChange={() => onToggleSelect(entry.path)}
          onClick={e => e.stopPropagation()}
          className="ml-2"
        />
      )}
    </div>
  );
});

export const FileListSimple = memo(function FileListSimple(props: FileListSimpleProps) {
  const {
    entries,
    loading,
    selected,
    cutItems,
    icons,
    viewOptions,
    settings,
    allSelected,
    onToggleSelectAll,
    onToggleSelect,
    onEntryClick,
    onEntryDoubleClick,
    onContextMenu,
    onBackgroundContextMenu,
    onVisibleRangeChange,
    onEntryAuxClick,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const rowHeight = 36;

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    let rafId: number | null = null;

    const updateVisibleItems = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 5);
      const endIndex = Math.min(entries.length - 1, Math.ceil((scrollTop + height) / rowHeight) + 5);
      
      const newItems = Array.from({ length: endIndex - startIndex + 1 }, (_, i) => i + startIndex);
      
      // Only update if items actually changed
      setVisibleItems(prev => {
        if (prev.length !== newItems.length) return newItems;
        if (prev.length > 0 && (prev[0] !== newItems[0] || prev[prev.length - 1] !== newItems[newItems.length - 1])) {
          return newItems;
        }
        return prev;
      });
      
      onVisibleRangeChange?.(startIndex, endIndex);
    };

    const scheduleUpdate = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateVisibleItems);
    };

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(containerRef.current);
    containerRef.current.addEventListener('scroll', scheduleUpdate);
    
    // Initial update scheduled via rAF to avoid nested updates
    scheduleUpdate();

    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      containerRef.current?.removeEventListener('scroll', scheduleUpdate);
    };
  }, [entries.length, onVisibleRangeChange]);

  if (loading) {
    return <div className="text-center py-8 text-white/30">Loading...</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center py-8 text-white/30">No files in this folder</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {viewOptions.showItemCheckboxes && (
        <div className="p-2 border-b border-white/10">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleSelectAll}
            className="mr-2"
          />
          <span className="text-sm">Select All</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto file-list-container"
        style={{ 
          height: `calc(100% - ${viewOptions.showItemCheckboxes ? '40px' : '0px'})`,
          position: 'relative'
        }}
        onContextMenu={(e) => {
          // Check if click was on empty space (not on a file item)
          const target = e.target as HTMLElement;
          if (target.classList.contains('file-list-container') || !target.closest('.file-list-item')) {
            e.preventDefault();
            onBackgroundContextMenu?.(e);
          }
        }}
      >
        <div style={{ height: entries.length * rowHeight + 'px', position: 'relative' }}>
          {visibleItems.map(index => {
            const entry = entries[index];
            if (!entry) return null;
            
            return (
              <div
                key={entry.path}
                style={{
                  position: 'absolute',
                  top: index * rowHeight + 'px',
                  left: 0,
                  right: 0,
                  height: rowHeight + 'px'
                }}
              >
                <FileItem
                  entry={entry}
                  selected={selected}
                  cutItems={cutItems}
                  viewOptions={viewOptions}
                  settings={settings}
                  onToggleSelect={onToggleSelect}
                  onEntryClick={onEntryClick}
                  onEntryDoubleClick={onEntryDoubleClick}
                  onEntryAuxClick={onEntryAuxClick}
                  onContextMenu={onContextMenu}
                  icons={icons}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});