import { Point, Element } from '../types/canvas';

export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const getElementBounds = (element: Element) => {
  return {
    x1: element.x,
    y1: element.y,
    x2: element.x + element.width,
    y2: element.y + element.height,
  };
};

export const isPointInElement = (point: Point, element: Element): boolean => {
  const bounds = getElementBounds(element);
  return (
    point.x >= bounds.x1 &&
    point.x <= bounds.x2 &&
    point.y >= bounds.y1 &&
    point.y <= bounds.y2
  );
};

export const normalizeRect = (startX: number, startY: number, endX: number, endY: number) => {
  return {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
