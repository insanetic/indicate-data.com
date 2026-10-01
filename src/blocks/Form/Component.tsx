'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import { ArrowRight, Check, CircleAlert, LoaderCircle } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { getDictionary } from '@/i18n/dictionaries'
import { cn } from '@/utilities/ui'
import { useLocale } from '@/providers/Locale'
import { buildSubmissionBody, HONEYPOT_FIELD } from './submission'
import { track } from '@subneo/payload-consent/react'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
}

export const FormBlock: React.FC<
  {
    id?: string
    /** Shown beside the form, e.g. the heading block that precedes it on the page. */
    aside?: React.ReactNode
  } & FormBlockType
> = (props) => {
  const {
    aside,
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
    // Complain only after a field was left, then clear the message as soon as it is fixed.
    mode: 'onTouched',
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = formMethods

  // Prefill from the link: /contact?message=… fills the field named "message" (only known fields).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    for (const field of formFromProps.fields || []) {
      if (!('name' in field) || !field.name) continue
      const value = params.get(field.name)
      // The template types the form by field index; names are what `register` actually uses.
      if (value) setValue(field.name as never, value as never)
    }
  }, [formFromProps.fields, setValue])

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<boolean>(false)
  const router = useRouter()
  const locale = useLocale()
  const labels = getDictionary(locale).form
  const confirmationRef = useRef<HTMLDivElement>(null)

  // Move focus to the confirmation so screen readers announce it and the page does not jump.
  useEffect(() => {
    if (hasSubmitted) confirmationRef.current?.focus()
  }, [hasSubmitted])

  const onSubmit = useCallback(
    async (data: FormFieldBlock[]) => {
      setError(false)
      setIsLoading(true)

      try {
        const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
          body: JSON.stringify(
            buildSubmissionBody(formID, data as unknown as Record<string, unknown>, locale),
          ),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })

        if (req.status >= 400) {
          const res = await req.json().catch(() => undefined)
          console.warn('Form submission failed', req.status, res?.errors?.[0]?.message)
          setError(true)
          return
        }

        setHasSubmitted(true)

        track({
          name: 'generate_lead',
          params: { form_id: String(formID), form_name: formFromProps.title || String(formID) },
        })

        if (confirmationType === 'redirect' && redirect) {
          const { url } = redirect

          const redirectUrl = url

          if (redirectUrl) router.push(redirectUrl)
        }
      } catch (err) {
        console.warn(err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    },
    [router, formID, redirect, confirmationType, formFromProps.title, locale],
  )

  const hasIntro = Boolean(aside || (enableIntro && introContent))

  // With an intro: heading and contact options beside the form. Without one: the form alone, centred.
  return (
    <div className="container">
      <div
        className={cn(
          hasIntro ? 'grid items-start gap-12 lg:grid-cols-12 lg:gap-16' : 'mx-auto max-w-[46rem]',
          // The section around an aside already spaces it; the legacy wrapper around an intro does not.
          !aside && hasIntro && 'pt-6 md:pt-12',
        )}
      >
        {aside && <div className="lg:sticky lg:top-28 lg:col-span-5 lg:pt-4">{aside}</div>}
        {!aside && hasIntro && (
          <RichText
            className={cn(
              'lg:sticky lg:top-28 lg:col-span-5 lg:pt-4',
              '[&_h1]:type-display [&_h1]:max-w-[14ch] [&_h1]:text-ink [&_h2]:type-h2 [&_h2]:text-ink',
              '[&>p]:mt-5 [&>p]:max-w-[40ch] [&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-ink-2',
              '[&_ul]:mt-10 [&_ul]:border-t [&_ul]:border-line',
              '[&_li]:flex [&_li]:flex-col [&_li]:gap-1 [&_li]:border-b [&_li]:border-line [&_li]:py-4',
              '[&_li_strong]:text-sm [&_li_strong]:font-normal [&_li_strong]:text-ink-3',
              '[&_a]:w-fit [&_a]:font-medium [&_a]:text-ink [&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:decoration-[var(--focus)]',
            )}
            data={introContent!}
            enableGutter={false}
            enableProse={false}
          />
        )}
        <div
          className={cn(
            'rounded-card border border-line bg-surface-2 p-5 sm:p-8 lg:p-10',
            hasIntro && 'lg:col-span-7',
          )}
          data-form-card
        >
          <FormProvider {...formMethods}>
            {hasSubmitted && confirmationType === 'message' && (
              <div
                aria-live="polite"
                className="flex flex-col items-start gap-4 outline-none sm:flex-row sm:gap-5"
                ref={confirmationRef}
                tabIndex={-1}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-success-soft text-success-deep">
                  <Check aria-hidden className="size-5" strokeWidth={2.5} />
                </span>
                <div className="pt-1.5">
                  <p className="text-lg font-semibold text-ink">{labels.sent}</p>
                  {confirmationMessage && (
                    <RichText
                      className="mt-2 text-ink-2 [&_p]:m-0"
                      data={confirmationMessage}
                      enableGutter={false}
                      enableProse={false}
                    />
                  )}
                </div>
              </div>
            )}
            {!hasSubmitted && (
              <form id={formID} noValidate onSubmit={handleSubmit(onSubmit)}>
                {/* Trap for bots: off-screen, skipped by keyboard and screen readers. */}
                <div
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}
                >
                  <label htmlFor={`${formID}-${HONEYPOT_FIELD}`}>Leave this field empty</label>
                  <input
                    id={`${formID}-${HONEYPOT_FIELD}`}
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore
                    {...register(HONEYPOT_FIELD as never)}
                  />
                </div>
                <fieldset className="m-0 min-w-0 border-0 p-0" disabled={isLoading}>
                  <div className="flex flex-wrap gap-x-4 gap-y-6">
                    {formFromProps &&
                      formFromProps.fields &&
                      formFromProps.fields?.map((field, index) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                        if (Field) {
                          return (
                            <Field
                              form={formFromProps}
                              key={index}
                              {...field}
                              {...formMethods}
                              control={control}
                              errors={errors}
                              register={register}
                            />
                          )
                        }
                        return null
                      })}
                  </div>

                  {error && (
                    <p
                      className="mt-6 flex items-start gap-2.5 rounded-[0.625rem] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-ink"
                      role="alert"
                    >
                      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
                      {labels.failed}
                    </p>
                  )}

                  <div className="mt-8">
                    <Button
                      aria-busy={isLoading || undefined}
                      className="w-full sm:w-auto"
                      form={formID}
                      size="lg"
                      type="submit"
                      variant="default"
                    >
                      {isLoading ? (
                        <>
                          <LoaderCircle aria-hidden className="animate-spin" />
                          {labels.sending}
                        </>
                      ) : (
                        <>
                          {submitButtonLabel}
                          <ArrowRight aria-hidden />
                        </>
                      )}
                    </Button>
                  </div>
                </fieldset>
              </form>
            )}
          </FormProvider>
        </div>
      </div>
    </div>
  )
}
