'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface Step {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  optional?: boolean
}

export interface StepperProps {
  steps: Step[]
  currentStep: number
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'compact' | 'numbered'
  clickable?: boolean
  onStepClick?: (stepIndex: number) => void
  className?: string
}

export interface StepperContextValue {
  currentStep: number
  totalSteps: number
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

// ============================================================================
// Context
// ============================================================================

const StepperContext = React.createContext<StepperContextValue | null>(null)

export function useStepperContext() {
  const context = React.useContext(StepperContext)
  if (!context) {
    throw new Error('useStepperContext must be used within a StepperProvider')
  }
  return context
}

// ============================================================================
// Stepper Provider
// ============================================================================

interface StepperProviderProps {
  children: React.ReactNode
  totalSteps: number
  initialStep?: number
  onStepChange?: (step: number) => void
}

export function StepperProvider({
  children,
  totalSteps,
  initialStep = 0,
  onStepChange,
}: StepperProviderProps) {
  const [currentStep, setCurrentStep] = React.useState(initialStep)

  const goToStep = React.useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step)
        onStepChange?.(step)
      }
    },
    [totalSteps, onStepChange]
  )

  const nextStep = React.useCallback(() => {
    goToStep(currentStep + 1)
  }, [currentStep, goToStep])

  const prevStep = React.useCallback(() => {
    goToStep(currentStep - 1)
  }, [currentStep, goToStep])

  const value = React.useMemo(
    () => ({
      currentStep,
      totalSteps,
      goToStep,
      nextStep,
      prevStep,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === totalSteps - 1,
    }),
    [currentStep, totalSteps, goToStep, nextStep, prevStep]
  )

  return (
    <StepperContext.Provider value={value}>{children}</StepperContext.Provider>
  )
}

// ============================================================================
// Step Indicator
// ============================================================================

interface StepIndicatorProps {
  step: Step
  index: number
  currentStep: number
  variant: 'default' | 'compact' | 'numbered'
  isLast: boolean
  orientation: 'horizontal' | 'vertical'
  clickable: boolean
  onClick?: () => void
}

function StepIndicator({
  step,
  index,
  currentStep,
  variant,
  isLast,
  orientation,
  clickable,
  onClick,
}: StepIndicatorProps) {
  const isCompleted = index < currentStep
  const isCurrent = index === currentStep
  const isUpcoming = index > currentStep

  const indicatorContent = () => {
    if (isCompleted) {
      return <Check className="h-4 w-4" />
    }
    if (variant === 'numbered' || variant === 'default') {
      return <span>{index + 1}</span>
    }
    if (step.icon) {
      return step.icon
    }
    return <span>{index + 1}</span>
  }

  const indicatorClasses = cn(
    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200',
    isCompleted && 'bg-primary text-primary-foreground',
    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
    isUpcoming && 'bg-background-surface border-2 border-border text-foreground-muted',
    clickable && !isUpcoming && 'cursor-pointer hover:opacity-80'
  )

  const labelClasses = cn(
    'transition-colors',
    isCompleted && 'text-foreground',
    isCurrent && 'text-foreground font-medium',
    isUpcoming && 'text-foreground-muted'
  )

  const descriptionClasses = cn(
    'text-xs transition-colors',
    isCompleted && 'text-foreground-muted',
    isCurrent && 'text-foreground-muted',
    isUpcoming && 'text-foreground-muted/70'
  )

  if (variant === 'compact') {
    return (
      <div className="flex items-center">
        <div
          className={indicatorClasses}
          onClick={clickable && !isUpcoming ? onClick : undefined}
          role={clickable && !isUpcoming ? 'button' : undefined}
          tabIndex={clickable && !isUpcoming ? 0 : undefined}
        >
          {indicatorContent()}
        </div>
        {!isLast && (
          <div
            className={cn(
              'h-0.5 w-12 transition-colors',
              isCompleted ? 'bg-primary' : 'bg-border'
            )}
          />
        )}
      </div>
    )
  }

  if (orientation === 'vertical') {
    return (
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div
            className={indicatorClasses}
            onClick={clickable && !isUpcoming ? onClick : undefined}
            role={clickable && !isUpcoming ? 'button' : undefined}
            tabIndex={clickable && !isUpcoming ? 0 : undefined}
          >
            {indicatorContent()}
          </div>
          {!isLast && (
            <div
              className={cn(
                'w-0.5 flex-1 min-h-8 transition-colors',
                isCompleted ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </div>
        <div className="pb-8">
          <div className={labelClasses}>{step.title}</div>
          {step.description && (
            <div className={descriptionClasses}>{step.description}</div>
          )}
          {step.optional && (
            <div className="text-xs text-foreground-muted/70">(Optional)</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="flex w-full items-center">
        {index > 0 && (
          <div
            className={cn(
              'h-0.5 flex-1 transition-colors',
              index <= currentStep ? 'bg-primary' : 'bg-border'
            )}
          />
        )}
        <div
          className={indicatorClasses}
          onClick={clickable && !isUpcoming ? onClick : undefined}
          role={clickable && !isUpcoming ? 'button' : undefined}
          tabIndex={clickable && !isUpcoming ? 0 : undefined}
        >
          {indicatorContent()}
        </div>
        {!isLast && (
          <div
            className={cn(
              'h-0.5 flex-1 transition-colors',
              isCompleted ? 'bg-primary' : 'bg-border'
            )}
          />
        )}
      </div>
      <div className="text-center">
        <div className={labelClasses}>{step.title}</div>
        {step.description && (
          <div className={descriptionClasses}>{step.description}</div>
        )}
        {step.optional && (
          <div className="text-xs text-foreground-muted/70">(Optional)</div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Main Stepper Component
// ============================================================================

export function Stepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  variant = 'default',
  clickable = false,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <div
      className={cn(
        orientation === 'horizontal'
          ? 'flex items-start justify-between'
          : 'flex flex-col',
        className
      )}
      role="navigation"
      aria-label="Progress steps"
    >
      {steps.map((step, index) => (
        <StepIndicator
          key={step.id}
          step={step}
          index={index}
          currentStep={currentStep}
          variant={variant}
          isLast={index === steps.length - 1}
          orientation={orientation}
          clickable={clickable}
          onClick={() => onStepClick?.(index)}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Step Content Wrapper
// ============================================================================

interface StepContentProps {
  children: React.ReactNode
  stepIndex: number
  className?: string
}

export function StepContent({ children, stepIndex, className }: StepContentProps) {
  const { currentStep } = useStepperContext()

  if (stepIndex !== currentStep) {
    return null
  }

  return <div className={className}>{children}</div>
}

// ============================================================================
// Step Actions
// ============================================================================

interface StepActionsProps {
  children?: React.ReactNode
  className?: string
  showPrevious?: boolean
  showNext?: boolean
  previousLabel?: string
  nextLabel?: string
  finishLabel?: string
  onNext?: () => boolean | void | Promise<boolean | void>
  onPrevious?: () => void
  onFinish?: () => void
  nextDisabled?: boolean
  previousDisabled?: boolean
  loading?: boolean
}

export function StepActions({
  children,
  className,
  showPrevious = true,
  showNext = true,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  finishLabel = 'Finish',
  onNext,
  onPrevious,
  onFinish,
  nextDisabled = false,
  previousDisabled = false,
  loading = false,
}: StepActionsProps) {
  const { isFirstStep, isLastStep, nextStep, prevStep } = useStepperContext()

  const handleNext = async () => {
    if (onNext) {
      const result = await onNext()
      if (result === false) return
    }
    if (isLastStep) {
      onFinish?.()
    } else {
      nextStep()
    }
  }

  const handlePrevious = () => {
    onPrevious?.()
    prevStep()
  }

  return (
    <div className={cn('flex items-center justify-between pt-6', className)}>
      <div>
        {showPrevious && !isFirstStep && (
          <button
            type="button"
            onClick={handlePrevious}
            disabled={previousDisabled || loading}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground-muted hover:bg-background-surface hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {previousLabel}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {showNext && (
          <button
            type="button"
            onClick={handleNext}
            disabled={nextDisabled || loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isLastStep ? finishLabel : nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}
