import { cloneElement, useEffect, useId, useRef, useState } from 'react'

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="nx-page-header">
      <div>
        <div className="brand">{eyebrow || 'NEXUS WORKSPACE'}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="nx-header-actions">{children}</div>}
    </header>
  )
}
export function Button({
  children,
  tone = 'secondary',
  busy = false,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      type="button"
      className={`nx-button ${tone} ${className}`}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...props}
    >
      {busy && <span className="nx-spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}
export function Badge({ value }) {
  return (
    <span className={`nx-badge ${value}`}>
      <span aria-hidden="true" />
      {value}
    </span>
  )
}
export function Empty({ title, children, action }) {
  return (
    <div className="nx-empty">
      <span className="nx-empty-icon" aria-hidden="true">
        ◇
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  )
}
export function Loading({ label = 'Loading workspace' }) {
  return (
    <div className="nx-loading" role="status">
      <span className="nx-spinner" />
      {label}
      <div className="nx-skeleton" />
      <div className="nx-skeleton" />
      <div className="nx-skeleton short" />
    </div>
  )
}
export function ErrorState({ message, retry }) {
  return (
    <div className="nx-error" role="alert">
      <strong>Something needs attention</strong>
      <p>{message}</p>
      {retry && <Button onClick={retry}>Try again</Button>}
    </div>
  )
}
export function Modal({ title, children, onClose, busy = false }) {
  const dialog = useRef(null)
  const titleId = useId()
  useEffect(() => {
    const element = dialog.current
    const previous = document.activeElement
    if (!element.open) element.showModal()
    return () => {
      element.close()
      if (previous?.isConnected) previous.focus()
    }
  }, [])
  return (
    <dialog
      ref={dialog}
      className="nx-modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <div className="nx-modal-inner">
        <div className="nx-modal-heading">
          <h2 id={titleId}>{title}</h2>
          <Button aria-label="Close dialog" disabled={busy} onClick={onClose}>
            ×
          </Button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
export function Confirm({
  title,
  children,
  onConfirm,
  onClose,
  label = 'Delete',
  tone = 'danger',
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal title={title} onClose={onClose} busy={busy}>
      <p>{children}</p>
      {error && (
        <p role="alert" className="nx-inline-error">
          {error}
        </p>
      )}
      <div className="nx-actions">
        <Button disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button tone={tone} busy={busy} onClick={submit}>
          {label}
        </Button>
      </div>
    </Modal>
  )
}
export function Field({ label, children }) {
  const generatedId = useId()
  const id = children.props.id || generatedId
  return (
    <div className="nx-field">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  )
}
