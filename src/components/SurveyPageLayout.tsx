'use client'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import SurveyProgressBar from '@/components/SurveyProgressBar.tsx'
import { answersStore } from '@/stores/answersStore.ts'

interface SurveyPageLayoutProps {
  title: string
  step: number
  totalSteps: number
  backHref?: string
  nextHref?: string
  nextDisabled?: boolean
  onNext?: () => void
  onBack?: () => void
  children: ReactNode
}

export default function SurveyPageLayout({
  title,
  step,
  totalSteps,
  backHref,
  nextHref,
  nextDisabled = false,
  onNext,
  onBack,
  children,
}: SurveyPageLayoutProps) {

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else if (nextHref) {
      sessionStorage.setItem('scrollToTop', 'true')
      window.location.href = nextHref
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backHref) {
      sessionStorage.setItem('scrollToTop', 'true')
      window.location.href = backHref
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-black text-white rounded-lg shadow-2xl p-8 mx-auto">
        {/* Progress indicator */}
        <div className="mb-6">
          <SurveyProgressBar currentStep={step} totalSteps={totalSteps} />
        </div>

        {/* Main content */}
        <div className="flex-1 pb-32">
          <div className="text-white">
            {children}
          </div>
        </div>

        {/* Fixed bottom navigation */}
        <div className="fixed inset-x-0 bottom-0 bg-black/95 backdrop-blur border-t border-gray-800 z-20">
          <div className="flex justify-center flex-wrap-reverse min-w-50 py-4 max-w-4xl mx-auto gap-4">
            {(backHref || onBack) && (
              <Button 
                onClick={handleBack} 
                className="bg-[#CBB87C] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#b8a75c] transition duration-200 flex-1 mx-4 min-w-36"
              >
                Previous
              </Button>
            )}
            
            {(nextHref || onNext) && (
              <Button
                disabled={nextDisabled}
                onClick={handleNext}
                className={`bg-[#CBB87C] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#b8a75c] transition duration-200 flex-1 mx-4 min-w-36 ${
                  nextDisabled ? 'bg-gray-400 text-white cursor-not-allowed hover:bg-gray-400' : ''
                }`}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
