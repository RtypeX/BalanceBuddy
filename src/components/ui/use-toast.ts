import * as React from "react"

import { ToastActionElement } from "@/components/ui/toast"

export type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
} & {}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type Toasts = Toast[]

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return `toast-${count}`
}

export const toastsReducer = (state: Toasts, action: any): Toasts => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return [
        action.toast,
        ...state.filter((toast) => toast.id !== action.toast.id),
      ].slice(0, TOAST_LIMIT)

    case actionTypes.UPDATE_TOAST:
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      )

    case actionTypes.DISMISS_TOAST:
      return state.map((t) =>
        t.id === action.toastId || action.toastId === undefined
          ? { ...t, open: false }
          : t
      )

    case actionTypes.REMOVE_TOAST:
      return state.filter((t) => t.id !== action.toastId)
    default:
      return state
  }
}

const listeners: Array<(toasts: Toasts) => void> = []

let memoryState: Toasts = []

function dispatch(action: any) {
  memoryState = toastsReducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: any) =>
    dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...props, id } })
  const dismiss = () =>
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) {
          setTimeout(
            () =>
              dispatch({
                type: actionTypes.REMOVE_TOAST,
                toastId: id,
              }),
            TOAST_REMOVE_DELAY
          )
        }
      },
    },
  })

  return { id, dismiss, update }
}

function useToast() {
  const [toasts, setToasts] = React.useState<Toasts>(memoryState)

  React.useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [toasts])

  return {
    toasts,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}

export { useToast, toast }