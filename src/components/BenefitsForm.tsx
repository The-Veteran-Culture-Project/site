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
  const [impactPayments, setImpactPayments] = useState(va_benefits?.va_healthcare || '');
  const [impactExplanation, setImpactExplanation] = useState(va_benefits?.va_experience || '');
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

  const validate = () => {
    const requiredFields = [
      { value: hasApplied, name: 'VA benefits application' },
      { value: benefitsUsed.length > 0, name: 'Benefits used' },
      { value: hasDisabilityRating, name: 'Disability rating status' },
      { value: hasDisabilityRating === 'No' || disabilityRating, name: 'Disability rating percentage' },
      { value: comfortDelay, name: 'Application comfort level' },
      { value: decisionTime, name: 'Decision timeline' },
      { value: impactPayments, name: 'Impact assessment' }
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

          {/* Q7: Payments impact */}
          <div>
            <label className="font-semibold block mb-2 text-white">
              Do you think VA disability payments would have made an impact on your early transition into civilian society? <span className="text-white ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
                <input type="radio" name="va_healthcare" value="Yes" checked={impactPayments === 'Yes'} onChange={handleRadio(setImpactPayments, 'va_healthcare')} className="accent-[#CBB87C] scale-110" />
                <span className="text-white">Yes</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
                <input type="radio" name="va_healthcare" value="No" checked={impactPayments === 'No'} onChange={handleRadio(setImpactPayments, 'va_healthcare')} className="accent-[#CBB87C] scale-110" />
                <span className="text-white">No</span>
              </label>
            </div>
          </div>

          {/* Q8: Optional explanation */}
          <div>
            <label className="font-semibold block mb-2 text-white">If yes or no, please describe. (Optional)</label>
            <textarea className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-[#CBB87C] focus:outline-none resize-none" rows={5} value={impactExplanation} onChange={handleTextArea(setImpactExplanation, 'va_experience')} />
          </div>

          {/* Error message */}
          {formError && <p className="text-red-500 mt-2">{formError}</p>}
        </form>
      );
    }
