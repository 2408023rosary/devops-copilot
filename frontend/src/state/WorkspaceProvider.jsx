import { useCallback, useEffect, useRef, useState } from 'react'
import { api, getStorageWarning } from '../services/api'
import { WorkspaceContext } from './workspace-context'

const replace = (items, next) =>
  items.some((item) => item.id === next.id)
    ? items.map((item) => (item.id === next.id ? next : item))
    : [next, ...items]
export default function WorkspaceProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyCount, setBusyCount] = useState(0)
  const [toast, setToast] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const pending = useRef(0)
  const version = useRef(0)
  const notice = useCallback(
    (message, kind = 'success') => setToast({ message, kind, id: crypto.randomUUID() }),
    [],
  )
  const refresh = useCallback(
    async (signal) => {
      if (pending.current) return
      const generation = ++version.current
      setLoading(true)
      setError('')
      try {
        const next = await api.load(signal)
        if (
          !next ||
          !['services', 'incidents', 'conversations', 'memories'].every((key) =>
            Array.isArray(next[key]),
          ) ||
          !next.settings
        )
          throw new Error('The server returned an invalid workspace. Check the API contract.')
        if (generation === version.current) {
          setData(next)
          setUpdatedAt(new Date())
          if (getStorageWarning()) notice(getStorageWarning(), 'warning')
        }
      } catch (err) {
        if (err.name !== 'AbortError' && generation === version.current) setError(err.message)
      } finally {
        if (generation === version.current) setLoading(false)
      }
    },
    [notice],
  )
  useEffect(() => {
    const controller = new AbortController()
    let active = true
    api
      .load(controller.signal)
      .then((next) => {
        if (
          !next ||
          !['services', 'incidents', 'conversations', 'memories'].every((key) =>
            Array.isArray(next[key]),
          ) ||
          !next.settings
        )
          throw new Error('The server returned an invalid workspace. Check the API contract.')
        if (active) {
          setData(next)
          setUpdatedAt(new Date())
          if (getStorageWarning()) notice(getStorageWarning(), 'warning')
        }
      })
      .catch((err) => {
        if (active && err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
      controller.abort()
    }
  }, [notice])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast])
  const perform = useCallback(
    async (task, apply, success) => {
      pending.current += 1
      version.current += 1
      setBusyCount((count) => count + 1)
      setLoading(false)
      try {
        const result = await task()
        setData((previous) => apply(previous, result))
        if (success) notice(success)
        if (getStorageWarning()) notice(getStorageWarning(), 'warning')
        return result
      } catch (err) {
        if (err.name !== 'AbortError') notice(err.message, 'error')
        throw err
      } finally {
        pending.current -= 1
        setBusyCount((count) => count - 1)
      }
    },
    [notice],
  )
  const updateIncident = useCallback(
    (id, patch) =>
      perform(
        () => api.updateIncident(id, patch),
        (old, item) => ({ ...old, incidents: replace(old.incidents, item) }),
        'Incident updated',
      ),
    [perform],
  )
  const analyze = useCallback(
    (id, signal) =>
      perform(
        () => api.analyze(id, signal),
        (old, item) => ({ ...old, incidents: replace(old.incidents, item) }),
        'Analysis ready',
      ),
    [perform],
  )
  const createConversation = (options) =>
    perform(
      () => api.createConversation(options),
      (old, item) => ({ ...old, conversations: replace(old.conversations, item) }),
    )
  const sendMessage = (id, payload, signal) =>
    perform(
      () => api.sendMessage(id, payload, signal),
      (old, item) => ({ ...old, conversations: replace(old.conversations, item) }),
    )
  const renameConversation = (id, title) =>
    perform(
      () => api.renameConversation(id, title),
      (old, item) => ({ ...old, conversations: replace(old.conversations, item) }),
      'Conversation renamed',
    )
  const deleteConversation = (id) =>
    perform(
      () => api.deleteConversation(id),
      (old) => ({ ...old, conversations: old.conversations.filter((item) => item.id !== id) }),
      'Conversation deleted',
    )
  const clearConversations = () =>
    perform(
      api.clearConversations,
      (old) => ({ ...old, conversations: [] }),
      'Conversations cleared',
    )
  const updateSettings = (patch) =>
    perform(
      () => api.updateSettings(patch),
      (old, settings) => ({ ...old, settings }),
      'Preferences saved',
    )
  const saveMemory = (payload) =>
    perform(
      () => api.saveMemory(payload),
      (old, item) => ({ ...old, memories: replace(old.memories, item) }),
      'Investigation saved to Memory',
    )
  const deleteMemory = (id) =>
    perform(
      () => api.deleteMemory(id),
      (old) => ({ ...old, memories: old.memories.filter((item) => item.id !== id) }),
      'Memory deleted',
    )
  const clearMemories = () =>
    perform(api.clearMemories, (old) => ({ ...old, memories: [] }), 'Memories cleared')
  const resetDemo = () => perform(api.resetDemo, (_, next) => next, 'Demo workspace restored')
  const visibleToast = toast && (toast.kind !== 'success' || data?.settings.notifications !== false)
  return (
    <WorkspaceContext.Provider
      value={{
        data,
        loading,
        error,
        busy: busyCount > 0,
        updatedAt,
        refresh,
        notice,
        updateIncident,
        analyze,
        createConversation,
        sendMessage,
        renameConversation,
        deleteConversation,
        clearConversations,
        updateSettings,
        saveMemory,
        deleteMemory,
        clearMemories,
        resetDemo,
      }}
    >
      {children}
      {visibleToast && (
        <div
          key={toast.id}
          className={`nx-toast ${toast.kind}`}
          role={toast.kind === 'error' ? 'alert' : 'status'}
        >
          <span>{toast.message}</span>
          <button aria-label="Dismiss notification" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
    </WorkspaceContext.Provider>
  )
}
