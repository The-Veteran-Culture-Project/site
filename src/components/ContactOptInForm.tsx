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

  const validate = () => {
    if (!email) {
      setEmailError('Email is required.');
      return false;
    }
    setEmailError('');
    return true;
  };

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block font-semibold mb-2 text-white">First Name</label>
          <input 
            type="text" 
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors" 
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-white">Last Name</label>
          <input 
            type="text" 
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors" 
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-white">Email *</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors" 
            required 
          />
          {emailError && <p className="text-red-400 mt-1 text-sm">{emailError}</p>}
        </div>

        <label className="flex items-start gap-2 text-white">
          <input 
            type="checkbox" 
            checked={subscribe} 
            onChange={(e) => setSubscribe(e.target.checked)} 
            className="mt-1 accent-[#CBB87C]"
            required 
          />
          <span>
            Subscribe to updates about the final project and future Veteran Culture research.
            <br />
            <span className="text-sm text-gray-400">You'll receive a few emails about the film, survey findings, and how to stay involved.</span>
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
            <br />
            <span className="text-sm text-gray-400">We may contact you for a follow-up interview if interested. This is optional.</span>
          </span>
        </label>

      </form>
      
      <p className="text-sm text-gray-400 text-center mt-6 max-w-prose mx-auto">
        <strong>Your responses are anonymous and confidential.</strong> 
        {" "}The data collected will be used for research, advocacy, and creative storytelling purposes. 
        {" "}Aggregated results may be published in reports or included in the upcoming documentary. 
        {" "}Individual responses will never be published or shared without your explicit permission.
      </p>
    </div>
  );
}
