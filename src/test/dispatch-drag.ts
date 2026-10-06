import { TAB_DRAG_MIME } from '../core/domain/tab-drag.dto';

export interface DragInit {
  fileId: string;
  x: number;
  y: number;
  types?: string[];
}

/**
 * jsdom has no `DragEvent`/`DataTransfer`, so pointer coordinates cannot travel
 * through the event constructor. Building the event by hand keeps the tests
 * honest about what the browser would deliver.
 */
export function dispatchDrag(type: 'dragover' | 'drop', target: HTMLElement, init: DragInit): Event {
  const types = init.types ?? (type === 'dragover' ? [TAB_DRAG_MIME] : [TAB_DRAG_MIME, 'text/plain']);
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, {
    clientX: init.x,
    clientY: init.y,
    dataTransfer: {
      types,
      dropEffect: 'move',
      setData: () => {},
      getData: (mime: string) => (mime === TAB_DRAG_MIME ? init.fileId : init.fileId),
    },
  });
  target.dispatchEvent(event);
  return event;
}