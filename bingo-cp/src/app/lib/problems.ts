import { type NextApiRequest, type NextApiResponse } from 'next';

export type Problem = {
    contestId: number;
    index: string;
    name: string;
    rating?: number;
    tags: string[];
};

export type Submission = {
    problem: Problem;
    verdict: string;
};

export type GetProblemsOptions = {
    minRating?: number;
    maxRating?: number;
    userHandles?: string[];
    count?: number;
    exclude?: string[];
};

export async function fetchAndFilterProblems(options: GetProblemsOptions): Promise<Problem[]> {
    const {
        minRating = 800,
        maxRating = 3500,
        userHandles = [],
        count = 25,
        exclude = [],
    } = options;

    try {
        const response = await fetch('https://codeforces.com/api/problemset.problems');
        const data = await response.json();
        if (data.status !== 'OK') {
            throw new Error('Failed to fetch problems from Codeforces.');
        }

        let problems: Problem[] = data.result.problems;

        problems = problems.filter(
            (p) =>
                !p.tags.includes('*special') &&
                p.rating &&
                p.rating >= minRating &&
                p.rating <= maxRating &&
                !exclude.includes(String(p.contestId) + p.index)
        );

        const solvedSet = new Set<string>();

        for (const handle of userHandles) {
            try {
                const submissionsRes = await fetch(
                    `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`
                );
                const submissionsData = await submissionsRes.json();

                if (submissionsData.status !== 'OK') continue;

                const submissions: Submission[] = submissionsData.result;

                for (const sub of submissions) {
                    if (sub.verdict === 'OK') {
                        solvedSet.add(`${sub.problem.contestId}-${sub.problem.index}`);
                    }
                }
            } catch (err) {
                console.error(`Error fetching submissions for ${handle}`, err);
                // Continue even if one user fails
            }
        }

        const unsolved = problems.filter(
            (p) => !solvedSet.has(`${p.contestId}-${p.index}`) && !exclude.includes(`${p.contestId}-${p.index}`)
        );

        // Fill up to count if needed by reusing problems (circularly) - logic from original code
        // Original logic:
        // let idx = 0;
        // if(unsolved.length < count) {
        //   while(unsolved.length < count) {
        //     unsolved.push(problems[idx]);
        //     idx += 1;
        //   }
        // }
        // However, original code used `problems` (all filtered problems, including solved ones?)
        // Line 71: unsolved.push(problems[idx]);
        // This seems to add from the filtered pool (rating constrained), not excluding solved.
        // I will preserve this behavior.

        let idx = 0;
        const finalPool = [...unsolved];

        if (finalPool.length < count) {
            // Create a pool to pick from if we run out of unsolved problems
            // Original code used `problems` which is the filtered list based on rating/tags
            // It did NOT filter out solved problems for the backfill

            while (finalPool.length < count) {
                if (idx >= problems.length) idx = 0; // wrapping safety
                finalPool.push(problems[idx]);
                idx += 1;
            }
        }

        const shuffled = finalPool.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, count);

        return selected;
    } catch (error) {
        console.error('Error in fetchAndFilterProblems:', error);
        throw error;
    }
}
