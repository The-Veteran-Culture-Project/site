import { useStore } from "@nanostores/react";
import { answersStore } from "@/stores/answersStore.ts";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const ageRanges = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
];

const genders = [
  "Male",
  "Female",
  "Self-describe",
];

const races = [
  "White",
  "Black or African American",
  "Hispanic or Latino",
  "Asian",
  "Native American or Alaska Native",
  "Native Hawaiian or Pacific Islander",
  "Other",
];

const militaryStatuses = [
  "Active Duty",
  "Veteran",
  "National Guard",
  "Reserves",
  "Civilian",
];

const yearsSinceSeparation = [
  "0-1",
  "2-5",
  "6-10",
  "11-20",
  "21+",
  "Still serving",
];

const branches = [
  "Army",
  "Navy",
  "Air Force",
  "Marine Corps",
  "Coast Guard",
  "Space Force",
  "Other",
];

function setValue(key: string, value: any) {
  const currentStore = answersStore.get();
  const demographics = (currentStore.demographics ?? {}) as Record<string, any>;
  
  // Extract the field name from the key (e.g., "demographics.age_range" -> "age_range")
  const fieldName = key.replace('demographics.', '');
  
  answersStore.set({
    ...currentStore,
    demographics: {
      ...demographics,
      [fieldName]: value,
    },
  });
}

function DemographicsForm() {
  // Store values from answersStore or initialize as empty string/array
  const store = useStore(answersStore);
  const demographics = (store.demographics ?? {}) as Record<string, any>;
  const [age, setAge] = useState<string>(demographics.age_range || "");
  const [gender, setGender] = useState<string>(demographics.gender || "");
  const [genderSelf, setGenderSelf] = useState<string>(demographics.gender_self_described || "");
  const [raceSelected, setRaceSelected] = useState<string[]>(demographics.race || []);
  const [militaryStatus, setMilitaryStatus] = useState<string>(demographics.military_status || "");
  const [yearsSep, setYearsSep] = useState<string>(demographics.years_since_separation || "");
  const [branch, setBranch] = useState<string>(demographics.branch || "");
  const [mos, setMos] = useState<string>(demographics.mos || "");
  const [combat, setCombat] = useState<string>(demographics.combat || "");

  // Update store and local state
  function handleRaceChange(race: string) {
    let updated: string[];
    if (raceSelected.includes(race)) {
      updated = raceSelected.filter((r: string) => r !== race);
    } else {
      updated = [...raceSelected, race];
    }
    setRaceSelected(updated);
    setValue("demographics.race", updated);
  }

  // Required fields check
  const requiredFieldsFilled =
    age && gender && raceSelected.length > 0 && militaryStatus && combat;

  // Sync local state to store on change
  function setValueAndState(key: string, value: any, setter: (v: any) => void) {
    setter(value);
    setValue(key, value);
  }

  return (
    <form className="flex flex-col gap-6">
      {/* Age Range */}
      <div>
        <label className="text-white font-semibold mb-2 block">Age Range *</label>
        <select
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors"
          value={age}
          onChange={e => setValueAndState("demographics.age_range", e.target.value, setAge)}
          required
        >
          <option value="" className="bg-gray-800">Select...</option>
          {ageRanges.map((a) => (
            <option key={a} value={a} className="bg-gray-800">{a}</option>
          ))}
        </select>
      </div>

          {/* Gender */}
          <div>
            <label className="text-white font-semibold mb-2 block">Gender *</label>
            <select
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors"
              value={gender}
              onChange={e => {
                setValueAndState("demographics.gender", e.target.value, setGender);
                if (e.target.value !== "Self-describe") {
                  setValueAndState("demographics.gender_self_described", "", setGenderSelf);
                }
              }}
              required
            >
                            <option value="" className="bg-gray-800">Select...</option>
              {genders.map((g) => (
                <option key={g} value={g} className="bg-gray-800">{g}</option>
              ))}
            </select>
            {gender === "Self-describe" && (
              <input
                type="text"
                className="w-full p-3 mt-2 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors"
                placeholder="Describe your gender"
                value={genderSelf}
                onChange={e => setValueAndState("demographics.gender_self_described", e.target.value, setGenderSelf)}
              />
            )}
          </div>

          {/* Race */}
          <div>
            <label className="text-white font-semibold mb-2 block">Race/Ethnicity *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {races.map((r) => (
                <label key={r} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    className="accent-[#CBB87C] scale-110"
                    checked={raceSelected.includes(r)}
                    onChange={() => handleRaceChange(r)}
                  />
                  <span className="text-white">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Military Status */}
          <div>
            <label className="text-white font-semibold mb-2 block">Military Status *</label>
            <select
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors"
              value={militaryStatus}
              onChange={e => setValueAndState("demographics.military_status", e.target.value, setMilitaryStatus)}
              required
            >
              <option value="" className="bg-gray-800">Select...</option>
              {militaryStatuses.map((m) => (
                <option key={m} value={m} className="bg-gray-800">{m}</option>
              ))}
            </select>
          </div>

          {/* Years Since Separation */}
          <div>
            <label className="text-white font-semibold mb-2 block">Years Since Separation (if applicable)</label>
            <select
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors"
              value={yearsSep}
              onChange={e => setValueAndState("demographics.years_since_separation", e.target.value, setYearsSep)}
            >
              <option value="" className="bg-gray-800">Select...</option>
              {yearsSinceSeparation.map((y) => (
                <option key={y} value={y} className="bg-gray-800">{y}</option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="text-white font-semibold mb-2 block">Branch of Service (if applicable)</label>
            <select
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors"
              value={branch}
              onChange={e => setValueAndState("demographics.branch", e.target.value, setBranch)}
            >
              <option value="" className="bg-gray-800">Select...</option>
              {branches.map((b) => (
                <option key={b} value={b} className="bg-gray-800">{b}</option>
              ))}
            </select>
          </div>

          {/* MOS */}
          <div>
            <label className="text-white font-semibold mb-2 block">MOS / Job in the military (optional)</label>
            <textarea
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 hover:border-[#CBB87C] focus:border-[#CBB87C] focus:outline-none transition-colors resize-vertical"
              rows={3}
              placeholder="Enter your MOS or job"
              value={mos}
              onChange={e => setValueAndState("demographics.mos", e.target.value, setMos)}
              style={{ minHeight: "3rem" }}
            />
          </div>

          {/* Combat */}
          <div>
            <label className="text-white font-semibold mb-2 block">Did you see combat? *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["Yes", "No", "Prefer not to say"].map((opt) => (
                <label key={opt} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 border border-gray-600 hover:border-[#CBB87C] hover:bg-gray-700 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="combat"
                    value={opt}
                    className="accent-[#CBB87C] scale-110"
                    checked={combat === opt}
                    onChange={e => setValueAndState("demographics.combat", e.target.value, setCombat)}
                    required
                  />
                  <span className="text-white">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      );
    }
    export default DemographicsForm;