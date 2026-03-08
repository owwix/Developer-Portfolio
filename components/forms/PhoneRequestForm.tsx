'use client'

import { FormEvent, useMemo, useState } from 'react'

type FormState = {
  name: string
  phoneNumber: string
  email: string
  company: string
  bestTime: string
  topic: string
}

const initialState: FormState = {
  name: '',
  phoneNumber: '',
  email: '',
  company: '',
  bestTime: '',
  topic: '',
}

export default function PhoneRequestForm() {
  const [values, setValues] = useState<FormState>(initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const canSubmit = useMemo(
    () => values.name.trim().length > 1 && values.phoneNumber.trim().length > 6 && values.topic.trim().length > 8,
    [values],
  )

  const updateField = (key: keyof FormState, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit || isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/phone-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          phoneNumber: values.phoneNumber.trim(),
          email: values.email.trim() || undefined,
          company: values.company.trim() || undefined,
          bestTime: values.bestTime.trim() || undefined,
          topic: values.topic.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Could not submit request. Please try again.')
      }

      setIsSuccess(true)
      setValues(initialState)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="phone-form card reveal" onSubmit={onSubmit}>
      <h2>Reach Me by Phone</h2>
      <p className="page-intro">Submit your number and context. I’ll review this in Payload and accept or decline the request.</p>

      <div className="form-grid">
        <label className="form-field" htmlFor="name">
          <span>Name</span>
          <input
            autoComplete="name"
            id="name"
            onChange={(event) => updateField('name', event.target.value)}
            required
            type="text"
            value={values.name}
          />
        </label>

        <label className="form-field" htmlFor="phoneNumber">
          <span>Phone Number</span>
          <input
            autoComplete="tel"
            id="phoneNumber"
            onChange={(event) => updateField('phoneNumber', event.target.value)}
            placeholder="(555) 123-4567"
            required
            type="tel"
            value={values.phoneNumber}
          />
        </label>

        <label className="form-field" htmlFor="email">
          <span>Email (optional)</span>
          <input
            autoComplete="email"
            id="email"
            onChange={(event) => updateField('email', event.target.value)}
            type="email"
            value={values.email}
          />
        </label>

        <label className="form-field" htmlFor="company">
          <span>Company / Team (optional)</span>
          <input id="company" onChange={(event) => updateField('company', event.target.value)} type="text" value={values.company} />
        </label>

        <label className="form-field" htmlFor="bestTime">
          <span>Best Time To Call (optional)</span>
          <input
            id="bestTime"
            onChange={(event) => updateField('bestTime', event.target.value)}
            placeholder="Weekdays after 3 PM PST"
            type="text"
            value={values.bestTime}
          />
        </label>

        <label className="form-field form-field-full" htmlFor="topic">
          <span>What do you want to discuss?</span>
          <textarea
            id="topic"
            onChange={(event) => updateField('topic', event.target.value)}
            placeholder="Briefly describe your project, role, or reason for reaching out."
            required
            rows={5}
            value={values.topic}
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="submit-btn" disabled={!canSubmit || isSubmitting} type="submit">
          {isSubmitting ? 'Submitting...' : 'Send Phone Request'}
        </button>
        {isSuccess ? <p className="form-message form-success">Request sent. I’ll review and update status in Payload.</p> : null}
        {errorMessage ? <p className="form-message form-error">{errorMessage}</p> : null}
      </div>
    </form>
  )
}
