import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { answersStore } from '@/stores/answersStore.ts';
import type { ContactAnswers } from '@/stores/answersStore';

export default function ContactOptInForm() {
  const store = useStore(answersStore);
  const contact = (store.contact ?? {}) as ContactAnswers;

  const [firstName, setFirstName] = useState(contact.first_name || '');
  const [lastName, setLastName] = useState(contact.last_name || '');
  const [email, setEmail] = useState(contact.email || '');
  const [subscribe, setSubscribe] = useState(contact.subscribe || false);
  const [storyOptIn, setStoryOptIn] = useState(contact.story_opt_in || false);
  const [emailError, setEmailError] = useState('');

  // Auto-save contact data on change
  useEffect(() => {
    answersStore.set({
      ...answersStore.get(),
      contact: {
        first_name: firstName,
        last_name: lastName,
        email,
        subscribe,
        story_opt_in: storyOptIn,
      },
    });
  }, [firstName, lastName, email, subscribe, storyOptIn]);

  const validateEmail = (email: string) => {
    // Email validation with common TLDs
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[com|edu|org|net|gov|mil|biz|info|io|co|uk|us|ca]+)$/i;
    return emailRegex.test(email);
  };

  const validate = () => {
    if (!firstName || !lastName || !email) {
      setEmailError('All required fields must be filled out.');
      return false;
    }
    if (!validateEmail(email)) {
      if (!email.includes('@')) {
        setEmailError('Email must include @');
      } else if (!email.includes('.')) {
        setEmailError('Email must include a domain (e.g., .com)');
      } else {
        setEmailError('Please enter a valid email ending (e.g., .com, .edu, .org)');
      }
      return false;
    }
    setEmailError('');
    return true;
  };

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block font-semibold mb-2 text-white">
            First Name <span className="text-white ml-1">*</span>
          </label>
          <input 
            type="text"
            required 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-white">
            Last Name <span className="text-white ml-1">*</span>
          </label>
          <input 
            type="text"
            required 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors"
          />
        </div>
        <div>
                    <label className="block font-semibold mb-2 text-white">
            Email <span className="text-white ml-1">*</span>
          </label>
          <input 
            type="email" 
            required
            value={email} 
            onChange={(e) => {
              const newValue = e.target.value;
              setEmail(newValue);
              if (newValue) {
                if (!newValue.includes('@')) {
                  setEmailError('Email must include @');
                } else if (!newValue.includes('.')) {
                  setEmailError('Email must include a domain (e.g., .com)');
                } else if (!validateEmail(newValue)) {
                  setEmailError('Please enter a valid email ending (e.g., .com, .edu, .org)');
                } else {
                  setEmailError('');
                }
              } else {
                setEmailError('');
              }
            }} 
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors"
          />
          <span className="text-sm text-gray-400 block mt-1">{
            !email ? 'Please enter a valid email address (e.g., name@example.com)' :
            !email.includes('@') ? 'Add @ to continue' :
            !email.includes('.') ? 'Add domain to continue (e.g., .com)' :
            !validateEmail(email) ? 'Add valid domain ending (e.g., .com, .edu, .org)' :
            'Email format is valid ✓'
          }</span>
        </div>

        <label className="flex items-start gap-2 text-white">
          <input 
            type="checkbox" 
            checked={subscribe} 
            onChange={(e) => setSubscribe(e.target.checked)} 
            className="mt-1 accent-[#CBB87C]"
          />
          <span>
            Would you like to receive updates about the final project and future Veteran Culture research?
            <span className="text-sm text-gray-400 block mt-1">You will receive updates about the film, survey findings, and how to stay involved</span>
          </span>
        </label>

        <label className="flex items-start gap-2 text-white">
          <input 
            type="checkbox" 
            checked={storyOptIn} 
            onChange={(e) => setStoryOptIn(e.target.checked)} 
            className="mt-1 accent-[#CBB87C]" 
          />
          <span>
            I'd like to share my story for research or potential inclusion in the documentary.
            <span className="text-sm text-gray-400 block mt-1">We may contact you for a follow-up interview if interested. This is optional</span>
          </span>
        </label>

      </form>
      
      <p className="text-sm text-gray-400 text-center mt-6 max-w-prose mx-auto">
        (Your responses are anonymous and confidential. The data collected will be used for research, advocacy, and creative storytelling purposes. Aggregated results may be published in reports or included in the upcoming documentary. Individual responses will never be published or shared without your explicit permission.)
      </p>
    </div>
  );
}
