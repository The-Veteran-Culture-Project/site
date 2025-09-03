import { useState } from 'react';
import { answersStore } from '@/stores/answersStore.ts';
import type { BenefitsAnswers } from '@/stores/answersStore';

export default function BenefitsForm() {
  const initialStore = answersStore.get();
  const va_benefits = (initialStore['va_benefits'] ?? {}) as BenefitsAnswers;

  const [hasApplied, setHasApplied] = useState(va_benefits?.has_applied || '');
  const [benefitsUsed, setBenefitsUsed] = useState(va_benefits?.benefits_used || []);
  const [hasDisabilityRating, setHasDisabilityRating] = useState(va_benefits?.has_disability_rating || '');
  const [disabilityRating, setDisabilityRating] = useState(va_benefits?.disability_rating || '');
  const [comfortDelay, setComfortDelay] = useState(va_benefits?.comfort_delay || '');
  const [decisionTime, setDecisionTime] = useState(va_benefits?.decision_time || '');
  const [supportChoice, setSupportChoice] = useState(va_benefits?.support_choice || '');
  const [firstYearHelp, setFirstYearHelp] = useState(va_benefits?.first_year_help || []);
  const [cashBenefitsUse, setCashBenefitsUse] = useState(va_benefits?.cash_benefits_use || '');
  const [formError, setFormError] = useState('');

  const updateStore = (newVals: Partial<BenefitsAnswers>) => {
    answersStore.set({
      ...answersStore.get(),
      va_benefits: {
        ...(answersStore.get().va_benefits ?? {}),
        ...newVals,
      },
    });
  };

  const benefitsOptions = ['GI Bill', 'VA Home Loan', 'Vocational Rehab (VR&E)', 'VA Pension', 'VA Healthcare', 'Other', 'None'];
  const disabilityOptions = ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];
  const comfortOptions = [
    'I applied right away',
    'Within the first year after separation',
    '1–3 years after separation',
    'More than 3 years after separation',
    'I\'ve never felt comfortable applying',
    'Not applicable',
  ];
  const decisionOptions = [
    'Less than 3 months',
    '3–6 months',
    '6–12 months',
    'Over a year',
    'Still waiting',
    'Not applicable',
  ];

  const supportChoiceOptions = [
    '$1,000/month for two years, no strings attached',
    'Job placement services',
    'Free school or training (e.g. GI Bill-style)',
    'VA disability rating and healthcare',
    'Other'
  ];

  const firstYearHelpOptions = [
    'Affordable housing',
    'Mental health support',
    'Money with no strings attached',
    'Clearer VA process',
    'Childcare or family support',
    'Job training',
    'Community or mentorship',
    'None of the above'
  ];

  const cashBenefitsOptions = [
    'It should be totally unconditional — trust veterans to choose',
    'It should be used for education, housing, or caregiving',
    'It should be based on need or disability status',
    "I don't think veterans should get cash benefits like that"
  ];

  const handleRadio = (setter: (val: string) => void, key: keyof BenefitsAnswers) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    updateStore({ [key]: e.target.value });
  };

  const handleSelect = (setter: (val: string) => void, key: keyof BenefitsAnswers) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    updateStore({ [key]: e.target.value });
  };

  const handleTextArea = (setter: (val: string) => void, key: keyof BenefitsAnswers) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setter(e.target.value);
    updateStore({ [key]: e.target.value });
  };

  const handleCheckbox = (option: string) => {
    let updated: string[] = [];
    if (option === 'None') {
      updated = benefitsUsed.includes('None') ? [] : ['None'];
    } else {
      if (benefitsUsed.includes(option)) {
        updated = benefitsUsed.filter((b) => b !== option);
      } else {
        updated = [...benefitsUsed.filter((b) => b !== 'None'), option];
      }
    }
    setBenefitsUsed(updated);
    updateStore({ benefits_used: updated });
  };

  const handleFirstYearHelp = (option: string) => {
    let updated: string[] = [];
    if (option === 'None of the above') {
      updated = firstYearHelp.includes('None of the above') ? [] : ['None of the above'];
    } else {
      if (firstYearHelp.includes(option)) {
        updated = firstYearHelp.filter((h) => h !== option);
      } else {
        updated = [...firstYearHelp.filter((h) => h !== 'None of the above'), option];
      }
    }
    setFirstYearHelp(updated);
    updateStore({ first_year_help: updated });
  };

  const validate = () => {
    const requiredFields = [
      { value: hasApplied, name: 'VA benefits application' },
      { value: benefitsUsed.length > 0, name: 'Benefits used' },
      { value: hasDisabilityRating, name: 'Disability rating status' },
      { value: hasDisabilityRating === 'No' || disabilityRating, name: 'Disability rating percentage' },
      { value: comfortDelay, name: 'Application comfort level' },
      { value: decisionTime, name: 'Decision timeline' },
      { value: supportChoice, name: 'Support choice preference' },
      { value: firstYearHelp.length > 0, name: 'First year help selection' },
      { value: cashBenefitsUse, name: 'Cash benefits usage opinion' }
    ];

    const missingFields = requiredFields
      .filter(field => !field.value)
      .map(field => field.name);

    if (missingFields.length > 0) {
      setFormError(`Please answer all required questions: ${missingFields.join(', ')}`);
      return false;
    }

    setFormError('');
    return true;
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      {/* Q1: Have you applied */}
                {/* Q1: Have you applied */}
      <div>
        <label className="font-semibold block mb-2 text-white">
          Have you applied for VA benefits? <span className="text-white ml-1">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
            <input type="radio" name="has_applied" value="Yes" checked={hasApplied === 'Yes'} onChange={handleRadio(setHasApplied, 'has_applied')} className="accent-[#CBB87C] scale-110" />
            <span className="text-white">Yes</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
            <input type="radio" name="has_applied" value="No" checked={hasApplied === 'No'} onChange={handleRadio(setHasApplied, 'has_applied')} className="accent-[#CBB87C] scale-110" />
            <span className="text-white">No</span>
          </label>
        </div>
      </div>          {/* Q2: Benefits used */}
          <div>
            <label className="font-semibold block mb-2 text-white">
              Which VA benefits have you used? <span className="text-white ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefitsOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    className="accent-[#CBB87C] scale-110"
                    checked={benefitsUsed.includes(opt)}
                    onChange={() => handleCheckbox(opt)}
                  />
                  <span className="text-white">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Q3: Has disability rating */}
          <div>
            <label className="font-semibold block mb-2 text-white">
              Do you have a service-connected disability rating from the VA? <span className="text-white ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
                <input type="radio" name="has_disability_rating" value="Yes" checked={hasDisabilityRating === 'Yes'} onChange={handleRadio(setHasDisabilityRating, 'has_disability_rating')} className="accent-[#CBB87C] scale-110" />
                <span className="text-white">Yes</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
                <input type="radio" name="has_disability_rating" value="No" checked={hasDisabilityRating === 'No'} onChange={handleRadio(setHasDisabilityRating, 'has_disability_rating')} className="accent-[#CBB87C] scale-110" />
                <span className="text-white">No</span>
              </label>
            </div>
          </div>

          {/* Q4: Disability rating dropdown */}
          <div>
            <label className="font-semibold block mb-2 text-white">
              What is your current VA disability rating? <span className="text-white ml-1">*</span>
            </label>
            <select className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-[#CBB87C] focus:outline-none" value={disabilityRating} onChange={handleSelect(setDisabilityRating, 'disability_rating')}>
              <option value="">Select rating</option>
              {disabilityOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Q5: Comfort delay */}
          <div>
            <label className="font-semibold block mb-2 text-white">
              How long did it take to feel comfortable applying for VA disability benefits? <span className="text-white ml-1">*</span>
            </label>
            <select className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-[#CBB87C] focus:outline-none" value={comfortDelay} onChange={handleSelect(setComfortDelay, 'comfort_delay')}>
              <option value="">Select one</option>
              {comfortOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Q6: Decision time */}
          <div>
            <label className="font-semibold block mb-2 text-white">
              How long did it take to receive a decision on your VA disability benefits? <span className="text-white ml-1">*</span>
            </label>
            <select className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-[#CBB87C] focus:outline-none" value={decisionTime} onChange={handleSelect(setDecisionTime, 'decision_time')}>
              <option value="">Select one</option>
              {decisionOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Q7: Support choice preference */}
          <div>
            <label className="font-semibold block mb-2 text-white">
              If you had to choose between one of these types of support after leaving the military, which would you have preferred? <span className="text-white ml-1">*</span>
            </label>
            <div className="space-y-3">
              {supportChoiceOptions.map((option) => (
                <label key={option} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
                  <input 
                    type="radio" 
                    name="support_choice" 
                    value={option} 
                    checked={supportChoice === option} 
                    onChange={handleRadio(setSupportChoice, 'support_choice')} 
                    className="accent-[#CBB87C] scale-110 mt-1" 
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
              {supportChoice === 'Other' && (
                <input
                  type="text"
                  placeholder="Please specify..."
                  className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-[#CBB87C] focus:outline-none"
                  onChange={(e) => {
                    const otherValue = `Other: ${e.target.value}`;
                    setSupportChoice(otherValue);
                    updateStore({ support_choice: otherValue });
                  }}
                />
              )}
            </div>
          </div>

          {/* Q8: First year help (multi-select) */}
          <div>
            <label className="font-semibold block mb-2 text-white">
              What would have helped you the most in your first year after transitioning out? (Pick 1–2) <span className="text-white ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {firstYearHelpOptions.map((option) => (
                <label key={option} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    className="accent-[#CBB87C] scale-110"
                    checked={firstYearHelp.includes(option)}
                    onChange={() => handleFirstYearHelp(option)}
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Q9: Cash benefits usage opinion */}
          <div>
            <label className="font-semibold block mb-2 text-white">
              If veterans received $1,000/month for two years after service, how should it be used? (Pick the statement you most agree with) <span className="text-white ml-1">*</span>
            </label>
            <div className="space-y-3">
              {cashBenefitsOptions.map((option) => (
                <label key={option} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
                  <input 
                    type="radio" 
                    name="cash_benefits_use" 
                    value={option} 
                    checked={cashBenefitsUse === option} 
                    onChange={handleRadio(setCashBenefitsUse, 'cash_benefits_use')} 
                    className="accent-[#CBB87C] scale-110 mt-1" 
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error message */}
          {formError && <p className="text-red-500 mt-2">{formError}</p>}
        </form>
      );
    }
