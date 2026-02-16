"use client";
import type { Match, Team } from "./types/match";
import { useState } from "react";
import TeamsForm from "./TeamsForm";
import { useRouter } from 'next/navigation';

type MatchCreationFormProps = {
  onMatchCreated: (match: Match) => void;
};


const MatchCreationForm: React.FC<MatchCreationFormProps> = ({ }) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const [date, setDate] = useState(today);
  const [time, setTime] = useState("13:00"); // 24-hour format
  const [duration, setDuration] = useState("1:00");
  const [minRating, setMinRating] = useState(800);
  const [maxRating, setMaxRating] = useState(1600);
  const [selectedMode, setSelectedMode] = useState<"classic" | "replace">("classic");
  const [selectedGridSize, setSelectedGridSize] = useState<number>(5);
  const [replaceIncrement, setReplaceIncrement] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeoutMinutes, setTimeoutMinutes] = useState("0:00");
  const [showRatings, setShowRatings] = useState<boolean>(true);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (teams.length < 2) {
      alert("At least 2 teams are required.");
      return;
    }
    const usedColors = new Set();
    for (const team of teams) {
      if (!team.name.trim()) {
        alert("Each team must have a name.");
        return;
      }
      if (!team.color || usedColors.has(team.color)) {
        alert("Each team must have a unique color.");
        return;
      }
      usedColors.add(team.color);

      if (team.members.length < 1 || team.members.length > 16) {
        alert("Each team must have 1 to 16 members.");
        return;
      }
      if (team.members.some(m => !m.trim())) {
        alert("All member handles must be filled.");
        return;
      }
      for (const member of team.members) {
        const submissionsRes = await fetch(
          `https://codeforces.com/api/user.info?handles=${member}`
        )
        const submissionsData = await submissionsRes.json()

        if (submissionsData.status !== 'OK') {
          alert("All member handles must be valid");
          return;
        }
      }
    }
    const allHandles = teams.flatMap((team) =>
      team.members.map((h) => h.trim().toLowerCase())
    );
    const uniqueHandles = new Set(allHandles);
    if (uniqueHandles.size !== allHandles.length) {
      alert("Each Codeforces handle must be unique across all teams.");
      return;
    }

    const teamNames = teams.map((t) => t.name.trim().toLowerCase());
    const uniqueNames = new Set(teamNames);
    if (uniqueNames.size !== teamNames.length) {
      alert("Each team must have a unique name.");
      return;
    }


    const [hours, minutes] = duration.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      alert("Invalid duration format. Please use hh:mm.");
      return;
    }
    const [hoursT, minutesT] = timeoutMinutes.split(":").map(Number);
    if (isNaN(hoursT) || isNaN(minutesT)) {
      alert("Invalid timeout format. Please use hh:mm.");
      return;
    }
    const timeoutMinutesValue = timeoutMinutes === '' ? null : (hoursT * 60 + minutesT);
    if (isNaN(minRating)) {
      alert("Invalid minimum Rating format.");
      return;
    }
    if (isNaN(maxRating)) {
      alert("Invalid maximum Rating format.");
      return;
    }
    if (isNaN(replaceIncrement)) {
      alert("Invalid replace value");
      return;
    }
    if (!Number.isInteger(minRating)) {
      alert("Minimum rating must be an integer.");
      return;
    }
    if (!Number.isInteger(maxRating)) {
      alert("Maximum rating must be an integer.");
      return;
    }
    if (!Number.isInteger(replaceIncrement)) {
      alert("Replace value must be an integer.");
      return;
    }
    if (maxRating < 800 || maxRating > 3500) {
      alert("Maximum rating should be in the range of [800,3500].");
      return;
    }
    if (minRating < 800 || minRating > 3500) {
      alert("Minimum rating should be in the range of [800,3500].");
      return;
    }
    if (replaceIncrement < 100 || replaceIncrement > 2700) {
      alert("Replace value should be in the range of [100,2700].");
      return;
    }
    if (minRating % 100 != 0) {
      alert("Minimum rating must be in increments of 100 (e.g., 800, 900, 1000).");
      return;
    }
    if (maxRating % 100 != 0) {
      alert("Maximum rating must be in increments of 100 (e.g., 800, 900, 1000).");
      return;
    }
    if (replaceIncrement % 100 != 0) {
      alert("Replace value must be in increments of 100 (e.g., 800, 900, 1000).");
      return;
    }



    const durationMinutes = hours * 60 + minutes;
    if (durationMinutes > 420) {
      alert("Duration cannot exceed 7 hours (420 minutes).");
      return;
    }
    if (maxRating < minRating) {
      alert("Maximum rating should be greater than minimum rating")
      return;
    }


    const startTime = new Date(`${date}T${time}`);
    if (isNaN(startTime.getTime())) {
      alert("Invalid start time.");
      return;
    }
    if (startTime.getTime() < Date.now()) {
      alert("Match cannot start before the current time.");
      return;
    }

    const matchData = {
      startTime: startTime.toISOString(),
      durationMinutes,
      minRating,
      maxRating,
      mode: selectedMode,
      gridSize: selectedGridSize,
      replaceIncrement: selectedMode == 'replace' ? replaceIncrement : undefined,
      teams: teams,
      timeoutMinutes: timeoutMinutesValue,
      problems: [],
      solveLog: [],
      showRatings,
    };
    setIsSubmitting(true);
    try {
      // console.time("matchCreation")
      const res = await fetch("../../api/createMatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData),
      });
      // console.timeEnd("matchCreation");

      if (!res.ok) {
        const errorText = await res.text(); // Read the error body
        console.error("Failed to create match:", errorText);
        alert("Failed to create match: " + errorText);
        setIsSubmitting(false);
        return;
      }
      const created = await res.json();
      const newMatchId = created?.id ?? created?.match?.id ?? created?.id;
      if (!newMatchId) {
        alert("Could not create match, no id returned");
        setIsSubmitting(false);
        return;
      }
      router.push(`/match/${newMatchId}`);
    } catch (err) {
      console.error("Error creating match", err);
      alert("Error creating match");
      setIsSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex flex-col gap-4 w-full max-w-md">
        <TeamsForm onTeamsChange={setTeams} />
      </div>

      {/* Match options (right side on large screens) */}
      <div className="flex flex-col gap-2 sm:ml-4">
        <label className="text-sm font-medium">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <label className="text-sm font-medium">Time </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border p-2 rounded w-full"
          step="60"
        />

        <label className="text-sm font-medium">Duration (hh:mm)</label>
        <input
          type="text"
          placeholder="e.g. 1:30"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="border p-2 rounded w-full"
          pattern="^\d+:\d{2}$"
          required
        />
        <label className="text-sm font-medium">Minimum Rating</label>
        <input
          type="text"
          placeholder="e.g. 800"
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="border p-2 rounded w-full"
          pattern="[0-9]+"
          required
        />
        <label className="text-sm font-medium">Maximum Rating</label>
        <input
          type="text"
          placeholder="e.g. 1600"
          value={maxRating}
          onChange={(e) => setMaxRating(Number(e.target.value))}
          className="border p-2 rounded w-full"
          pattern="[0-9]+"
          required
        />

        <label className="text-sm font-medium">Game Mode</label>

        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value as "classic" | "replace")}
          className="border p-2 rounded w-full"
        >
          <option value="classic" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Classic
          </option>
          <option value="replace" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            Replace
          </option>
        </select>
        {selectedMode === 'replace' && (
          <>
            <label className="text-sm font-medium">Replace increment</label>
            <input
              type="text"
              placeholder="e.g. 100"
              value={replaceIncrement}
              onChange={(e) => setReplaceIncrement(Number(e.target.value))}
              className="border p-2 rounded w-full"
              pattern="[0-9]+"
              required
            />
          </>
        )}
        <label className="text-sm font-medium">Grid Size</label>
        <select
          value={selectedGridSize}
          onChange={(e) => setSelectedGridSize(parseInt(e.target.value))}
          className="border p-2 rounded w-full"
        >
          {[3, 4, 5, 6].map((size) => (
            <option key={size} value={size} className="bg-gray-100 text-gray-800 hover:bg-gray-200">
              {size} x {size}
            </option>
          ))}
        </select>
        <label className="text-sm font-medium mb-1">Show problem ratings</label>
        <div className="inline-flex rounded-md shadow-sm" role="group" aria-label="Show ratings">
          <button
            type="button"
            onClick={() => setShowRatings(true)}
            className={`px-3 py-2 text-sm rounded-l ${showRatings ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Show
          </button>
          <button
            type="button"
            onClick={() => setShowRatings(false)}
            className={`px-3 py-2 text-sm rounded-r ${!showRatings ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Hide
          </button>
        </div>

        <label className="text-sm font-medium">Timeout (hh:mm)</label>
        <input
          type="text"
          placeholder="e.g. 1:30"
          value={timeoutMinutes}
          onChange={(e) => setTimeoutMinutes(e.target.value)}
          className="border p-2 rounded w-full"
          pattern="^\d+:\d{2}$"
          required
        />
      </div>


      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition mt-4 sm:mt-0"
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Creating...
          </span>
        ) : (
          'Create Match'
        )}

      </button>
    </form>

  );
};

export default MatchCreationForm;
