import { createDemoWorkspace, defaultSettings } from '../data/demo'

// Change only the adapter when your backend contract differs.
// Never put API secrets in VITE_* variables.
export const isDemo = import.meta.env.VITE_API_MODE !== 'http'
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const storageKey = 'nexus-workspace-v2'

let session = null
let storageWarning = ''

export const getStorageWarning = () => storageWarning

const clone = (value) => structuredClone(value)
const id = (prefix) => `${prefix}-${crypto.randomUUID()}`
const now = () => new Date().toISOString()

function database() {
  if (session) return session

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey))

    if (
      stored &&
      ['services', 'incidents', 'conversations', 'memories'].every((key) =>
        Array.isArray(stored[key]),
      )
    ) {
      session = {
        ...stored,
        settings: { ...defaultSettings, ...stored.settings },
      }
    }
  } catch {
    storageWarning =
      'Browser storage is unavailable or invalid. Changes are kept for this session.'
  }

  session ||= createDemoWorkspace()
  return session
}

function persist(next) {
  session = next

  // Private conversations remain available in memory for this tab
  // but never enter persistent storage.
  const durable = {
    ...next,
    conversations: next.conversations.filter((chat) => chat.persisted),
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(durable))
  } catch {
    storageWarning =
      'Browser storage is full or unavailable. Changes are kept for this session.'
  }
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('Request cancelled', 'AbortError'))
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, ms)

    if (signal?.aborted) {
      abort()
    } else {
      signal?.addEventListener('abort', abort, { once: true })
    }
  })
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const controller = new AbortController()
  let timedOut = false

  const onAbort = () => controller.abort()

  if (signal?.aborted) {
    controller.abort()
  } else {
    signal?.addEventListener('abort', onAbort, { once: true })
  }

  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, 30000)

  try {
    /*
     * Support both:
     *
     *   request('/some/path')
     *
     * and:
     *
     *   request('http://127.0.0.1:8000/api/copilot/analyze')
     *
     * This lets the Copilot call FastAPI directly while the rest
     * of Member 3's API adapter remains unchanged.
     */
    const url = /^https?:\/\//i.test(path)
      ? path
      : `${baseUrl}${path}`

    const response = await fetch(url, {
      method,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    if (!response.ok) {
      let message = `Request failed (${response.status}). Please try again.`

      try {
        const errorBody = await response.json()

        if (errorBody?.detail) {
          message =
            typeof errorBody.detail === 'string'
              ? errorBody.detail
              : message
        }
      } catch {
        // Keep the default error message if the response is not JSON.
      }

      throw new Error(message)
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    if (timedOut) {
      throw new Error('The request timed out. Please try again.', {
        cause: error,
      })
    }

    if (error.name === 'AbortError') {
      throw error
    }

    /*
     * Browser fetch errors often appear only as "Failed to fetch".
     * Give the user a useful message while keeping the original error
     * available as the cause.
     */
    if (
      error instanceof TypeError &&
      error.message.toLowerCase().includes('fetch')
    ) {
      throw new Error(
        'Could not connect to the DevOps Copilot backend. Make sure FastAPI is running on port 8000.',
        { cause: error },
      )
    }

    throw new Error(
      error.message || 'Could not connect to the server.',
      { cause: error },
    )
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

async function demo(action, signal, ms = 300) {
  await delay(ms, signal)

  const next = clone(database())
  const result = action(next)

  persist(next)

  return clone(result)
}

function find(list, recordId) {
  const record = list.find((item) => item.id === recordId)

  if (!record) {
    throw new Error(
      'This record no longer exists. Refresh the workspace.',
    )
  }

  return record
}

function answerFor(question, incident, memory) {
  if (!incident) {
    return 'Choose an incident to attach service evidence. Start by describing the affected service, observed error, and when it began. This is a simulated response.'
  }

  const q = question.toLowerCase()

  if (/before|similar|memory|previous/.test(q)) {
    return memory
      ? `Reference: ${memory.title}. Previous cause: ${memory.rootCause}. Previous resolution: ${memory.resolution} This historical match does not confirm the current cause.`
      : 'No reference investigation is attached. Open Memory to review stored investigations and attach one to a new conversation.'
  }

  if (/log|evidence|signal/.test(q)) {
    return `Evidence for ${incident.id}:\n${incident.logs
      .map((line) => `• ${line}`)
      .join(
        '\n',
      )}\nThese are sample records; verify them against your live logs.`
  }

  if (/first|next|fix|check|action|resolve/.test(q)) {
    return `Suggested checks for ${incident.service}:\n${incident.recommendations
      .map((line, i) => `${i + 1}. ${line}`)
      .join('\n')}\nNo infrastructure changes have been executed.`
  }

  return `${incident.service}: ${incident.description}\nWorking hypothesis: ${incident.rootCause}.\nFirst step: ${incident.recommendations[0]}\nThis is a simulated analysis; verify the cause before taking action.`
}

export const api = {
  load: (signal) =>
    isDemo
      ? demo((db) => db, signal)
      : request('/workspace', { signal }),

  updateIncident: (recordId, patch) =>
    isDemo
      ? demo((db) => {
          const record = find(db.incidents, recordId)

          if (patch.status && patch.status !== record.status) {
            record.status = patch.status
            record.timeline.push({
              text: `Status changed to ${patch.status}`,
              at: now(),
            })
          }

          if (patch.note?.trim()) {
            record.notes.push({
              id: id('note'),
              text: patch.note.trim(),
              at: now(),
            })

            record.timeline.push({
              text: 'Investigation note added',
              at: now(),
            })
          }

          return record
        })
      : request(
          `/incidents/${encodeURIComponent(recordId)}`,
          {
            method: 'PATCH',
            body: patch,
          },
        ),

  analyze: (recordId, signal) =>
    isDemo
      ? demo(
          (db) => {
            const record = find(db.incidents, recordId)

            record.analysis = {
              summary: record.rootCause,
              recommendations: record.recommendations,
              generatedAt: now(),
            }

            record.timeline.push({
              text: 'Demo analysis completed',
              at: now(),
            })

            return record
          },
          signal,
          1000,
        )
      : request(
          `/incidents/${encodeURIComponent(recordId)}/analysis`,
          {
            method: 'POST',
            signal,
          },
        ),

  createConversation: ({ incidentId = null, memoryId = null } = {}) =>
    isDemo
      ? demo((db) => {
          if (incidentId) {
            find(db.incidents, incidentId)
          }

          if (memoryId) {
            find(db.memories, memoryId)
          }

          const chat = {
            id: id('chat'),
            title: 'New investigation',
            incidentId,
            memoryId,
            persisted: db.settings.rememberChats,
            createdAt: now(),
            updatedAt: now(),
            messages: [],
          }

          db.conversations.unshift(chat)

          return chat
        })
      : request('/conversations', {
          method: 'POST',
          body: {
            incidentId,
            memoryId,
          },
        }),

  /*
   * Real DevOps Copilot integration.
   *
   * The frontend keeps Member 3's existing local conversation
   * architecture, while the actual AI diagnosis comes from:
   *
   * React → FastAPI → DevOps simulator → AI/OpenRouter
   */
  sendMessage: async (recordId, { text, requestId }, signal) => {
    const db = database()
    const chat = find(db.conversations, recordId)

    if (
      chat.messages.some(
        (message) => message.requestId === requestId,
      )
    ) {
      return clone(chat)
    }

    const incident = db.incidents.find(
      (item) => item.id === chat.incidentId,
    )

    if (!incident) {
      throw new Error(
        'Choose an incident before sending a Copilot message.',
      )
    }

    /*
     * Map frontend incidents to the simulator scenarios.
     *
     * Simulator scenarios:
     *   crashloop
     *   imagepull
     *   highcpu
     */
    let scenario = null

    if (incident.error === 'CrashLoopBackOff') {
      scenario = 'crashloop'
    } else if (
      incident.service === 'notification-service' &&
      incident.error === 'ImagePullBackOff'
    ) {
      scenario = 'imagepull'
    } else if (
      incident.service === 'order-service' &&
      incident.error === 'HighLatency'
    ) {
      scenario = 'highcpu'
    }

    /*
     * Send the question to the real FastAPI backend.
     */
    const response = await request(
      'http://127.0.0.1:8000/api/copilot/analyze',
      {
        method: 'POST',
        body: {
          message: text,
          service: incident.service,
          scenario,
        },
        signal,
      },
    )

    /*
     * Convert the structured backend response into a readable
     * chat message for the existing Copilot UI.
     */
    const assistantText = [
      response.summary,
      '',
      `Root cause: ${response.root_cause}`,
      '',
      `Severity: ${response.severity}`,
      `Confidence: ${Math.round(response.confidence * 100)}%`,
      '',
      'Evidence:',
      ...(Array.isArray(response.evidence)
        ? response.evidence.map((item) => `• ${item}`)
        : ['• No evidence returned.']),
      '',
      'Recommendations:',
      ...(Array.isArray(response.recommendations)
        ? response.recommendations.map(
            (item, index) => `${index + 1}. ${item}`,
          )
        : ['1. No recommendations returned.']),
      ...(response.missing_information?.length
        ? [
            '',
            'Missing information:',
            ...response.missing_information.map(
              (item) => `• ${item}`,
            ),
          ]
        : []),
    ].join('\n')

    /*
     * Store both sides of the conversation locally so that:
     *
     * - History still works
     * - Export still works
     * - Refresh persistence still works
     * - Member 3's existing UI remains unchanged
     */
    chat.messages.push(
      {
        id: id('msg'),
        role: 'user',
        text,
        requestId,
        at: now(),
      },
      {
        id: id('msg'),
        role: 'assistant',
        text: assistantText,
        at: now(),
      },
    )

    if (chat.title === 'New investigation') {
      chat.title = text.slice(0, 70)
    }

    chat.updatedAt = now()

    persist(db)

    return clone(chat)
  },

  renameConversation: (recordId, title) =>
    isDemo
      ? demo((db) => {
          const chat = find(db.conversations, recordId)
          chat.title = title
          return chat
        })
      : request(
          `/conversations/${encodeURIComponent(recordId)}`,
          {
            method: 'PATCH',
            body: { title },
          },
        ),

  deleteConversation: (recordId) =>
    isDemo
      ? demo((db) => {
          db.conversations = db.conversations.filter(
            (item) => item.id !== recordId,
          )

          return null
        })
      : request(
          `/conversations/${encodeURIComponent(recordId)}`,
          {
            method: 'DELETE',
          },
        ),

  clearConversations: () =>
    isDemo
      ? demo((db) => {
          db.conversations = []
          return null
        })
      : request('/conversations', {
          method: 'DELETE',
        }),

  updateSettings: (patch) =>
    isDemo
      ? demo((db) => {
          db.settings = {
            ...db.settings,
            ...patch,
          }

          return db.settings
        })
      : request('/settings', {
          method: 'PATCH',
          body: patch,
        }),

  saveMemory: (payload) =>
    isDemo
      ? demo((db) => {
          const duplicate = db.memories.find(
            (item) => item.incidentId === payload.incidentId,
          )

          if (duplicate) {
            throw new Error(
              'An investigation for this incident is already saved in Memory.',
            )
          }

          const memory = {
            ...payload,
            id: id('memory'),
            createdAt: now(),
            similarity: null,
          }

          db.memories.unshift(memory)

          return memory
        })
      : request('/memories', {
          method: 'POST',
          body: payload,
        }),

  deleteMemory: (recordId) =>
    isDemo
      ? demo((db) => {
          db.memories = db.memories.filter(
            (item) => item.id !== recordId,
          )

          return null
        })
      : request(
          `/memories/${encodeURIComponent(recordId)}`,
          {
            method: 'DELETE',
          },
        ),

  clearMemories: () =>
    isDemo
      ? demo((db) => {
          db.memories = []
          return null
        })
      : request('/memories', {
          method: 'DELETE',
        }),

  resetDemo: () => {
    if (!isDemo) {
      return Promise.reject(
        new Error('Reset is only available in demo mode.'),
      )
    }

    return demo((db) => {
      Object.assign(db, createDemoWorkspace())
      return db
    })
  },
}