/**
 * Enhanced localStorage utilities for survey answers with real-time persistence
 */

export type SurveyAnswers = {
  // Axis questions (dynamic keys)
  [questionText: string]: {
    axis: string
    offset: number
    question: string
  } | any // Allow other types for the fixed keys below
} & {
  // Demographics
  demographics?: {
    age_range?: string
    gender?: string
    gender_self_described?: string
    race?: string[]
    military_status?: string
    years_since_separation?: string
    branch?: string
    mos?: string
    combat?: string
  }
  // Benefits  
  va_benefits?: {
    has_applied?: string
    benefits_used?: string[]
    has_disability_rating?: string
    disability_rating?: string
    comfort_delay?: string
    decision_time?: string
    va_healthcare?: string
    va_experience?: string
  }
  // Contact
  contact?: {
    first_name?: string
    last_name?: string
    email?: string
    subscribe?: boolean
    story_opt_in?: boolean
  }
}

const SURVEY_STORAGE_KEY = 'vcp-survey-backup'

/**
 * Get survey answers from localStorage backup
 */
export function getSurveyBackup(): Partial<SurveyAnswers> {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(SURVEY_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.warn('Failed to parse survey backup from localStorage:', error)
    return {}
  }
}

/**
 * Save survey answers to localStorage backup
 */
export function saveSurveyBackup(answers: Partial<SurveyAnswers>): void {
  if (typeof window === 'undefined') return
  
  try {
    const existing = getSurveyBackup()
    const merged = { ...existing, ...answers }
    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(merged))
  } catch (error) {
    console.warn('Failed to save survey backup to localStorage:', error)
  }
}

/**
 * Clear survey backup from localStorage
 */
export function clearSurveyBackup(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(SURVEY_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear survey backup from localStorage:', error)
  }
}

/**
 * Restore survey answers from localStorage backup to answersStore
 */
export function restoreSurveyFromBackup(answersStore: any): void {
  const backup = getSurveyBackup()
  if (Object.keys(backup).length > 0) {
    console.log('Restoring survey from localStorage backup')
    answersStore.set({ ...answersStore.get(), ...backup })
  }
}
