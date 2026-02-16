"use client";
import type { Match, Team } from "../types/match";
import { useState } from "react";
import TeamsForm from "../TeamsForm";
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Create Bingo Match</CardTitle>
        <CardDescription className="text-center">Configure teams and match settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} id="create-match-form">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Teams Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xl font-semibold">Teams</h3>
                <p className="text-sm text-muted-foreground">At least 2 teams required</p>
              </div>
              <TeamsForm onTeamsChange={setTeams} />
            </div>

            {/* Match Options Section */}
            <div className="space-y-6 border-l pl-12">
              <div className="border-b pb-2">
                <h3 className="text-xl font-semibold">Match Options</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    step="60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration (hh:mm)</Label>
                <Input
                  type="text"
                  placeholder="e.g. 1:30"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  pattern="^\d+:\d{2}$"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Rating</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 800"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    pattern="[0-9]+"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Rating</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 1600"
                    value={maxRating}
                    onChange={(e) => setMaxRating(Number(e.target.value))}
                    pattern="[0-9]+"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Game Mode</Label>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value as "classic" | "replace")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="classic">Classic</option>
                  <option value="replace">Replace</option>
                </select>
              </div>

              {selectedMode === 'replace' && (
                <div className="space-y-2">
                  <Label>Replace increment</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 100"
                    value={replaceIncrement}
                    onChange={(e) => setReplaceIncrement(Number(e.target.value))}
                    pattern="[0-9]+"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Grid Size</Label>
                <select
                  value={selectedGridSize}
                  onChange={(e) => setSelectedGridSize(parseInt(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {[3, 4, 5, 6].map((size) => (
                    <option key={size} value={size}>
                      {size} x {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="mb-1 block">Show problem ratings</Label>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <Button
                    type="button"
                    variant={showRatings ? "default" : "outline"}
                    onClick={() => setShowRatings(true)}
                    className="rounded-r-none"
                  >
                    Show
                  </Button>
                  <Button
                    type="button"
                    variant={!showRatings ? "default" : "outline"}
                    onClick={() => setShowRatings(false)}
                    className="rounded-l-none"
                  >
                    Hide
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timeout (hh:mm)</Label>
                <Input
                  type="text"
                  placeholder="e.g. 1:30"
                  value={timeoutMinutes}
                  onChange={(e) => setTimeoutMinutes(e.target.value)}
                  pattern="^\d+:\d{2}$"
                  required
                />
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end pt-6">
        <Button
          type="submit"
          form="create-match-form"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
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
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MatchCreationForm;
