import { useState, useCallback } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export const useHistory = <T>(initialState: T) => {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;

    setState(currentState => ({
      past: currentState.past.slice(0, -1),
      present: currentState.past[currentState.past.length - 1],
      future: [currentState.present, ...currentState.future],
    }));
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setState(currentState => ({
      past: [...currentState.past, currentState.present],
      present: currentState.future[0],
      future: currentState.future.slice(1),
    }));
  }, [canRedo]);

  const set = useCallback((newState: T) => {
    setState(currentState => ({
      past: [...currentState.past, currentState.present],
      present: newState,
      future: [],
    }));
  }, []);
  
  const replace = useCallback((newState: T) => {
    setState(currentState => ({
      ...currentState,
      present: newState,
    }));
  }, []);

  return {
    state: state.present,
    set,
    replace,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
