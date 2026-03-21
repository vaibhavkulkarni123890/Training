const stringSimilarity = require('string-similarity');

const analyzeReport = (text, allReports, roadmapTexts, currentUserId) => {
    let maxSimilarity = 0;
    let source = 'Original';

    if (!text) return { similarityScore: 0, performanceScore: 0, strengths: [], improvements: [] };

    // Function to extract owner/repo from GitHub URL
    const getRepoBase = (url) => {
        try {
            if (!url.includes('github.com')) return null;
            const parts = url.split('github.com/')[1].split('/');
            if (parts.length >= 2) return `${parts[0]}/${parts[1]}`.toLowerCase();
            return null;
        } catch (e) { return null; }
    };

    const currentRepoBase = getRepoBase(text);

    // 1. Check against other students' reports (Global Plagiarism)
    if (allReports && allReports.length > 0) {
        let bestRating = 0;
        let matchSource = 'Original';

        allReports.forEach(report => {
            const isOtherUser = report.user && report.user.toString() !== currentUserId.toString();
            if (!isOtherUser) return;

            const targetText = report.textContent;
            if (!targetText || targetText.length < 10) return;

            let currentSimilarity = 0;
            const targetRepoBase = getRepoBase(targetText);

            // Logic for URL comparisons
            if (currentRepoBase && targetRepoBase) {
                // If both are URLs, only flag if it's the exact SAME repo
                if (currentRepoBase === targetRepoBase) {
                    currentSimilarity = 1.0; // 100% same repo
                } else {
                    // Different repos shouldn't be flagged for similarity just because they are on github.com
                    currentSimilarity = 0.05; // Keep it less than 10% (5%)
                }
            } else if (currentRepoBase || targetRepoBase) {
                // One is a URL, the other is code content? Very low similarity.
                currentSimilarity = 0.02;
            } else {
                // Both are code content - use normal string similarity
                currentSimilarity = stringSimilarity.compareTwoStrings(text, targetText);
            }

            if (currentSimilarity > bestRating) {
                bestRating = currentSimilarity;
                matchSource = 'Another student';
            }
        });

        // 2. Check against OWN previous reports (Self-plagiarism)
        allReports.forEach(report => {
            const isSameUser = report.user && report.user.toString() === currentUserId.toString();
            if (!isSameUser) return;

            const targetText = report.textContent;
            if (!targetText || targetText.length < 10) return;

            let currentSimilarity = 0;
            const targetRepoBase = getRepoBase(targetText);

            if (currentRepoBase && targetRepoBase) {
                if (currentRepoBase === targetRepoBase) currentSimilarity = 1.0;
                else currentSimilarity = 0.05;
            } else if (currentRepoBase || targetRepoBase) {
                currentSimilarity = 0.02;
            } else {
                currentSimilarity = stringSimilarity.compareTwoStrings(text, targetText);
            }

            if (currentSimilarity > bestRating) {
                bestRating = currentSimilarity;
                matchSource = 'Your own previous work';
            }
        });

        maxSimilarity = bestRating;
        source = matchSource;
    }

    // 3. Check against Roadmap descriptions (copying instructions)
    if (roadmapTexts && roadmapTexts.length > 0 && !currentRepoBase) {
        const roadmapMatches = stringSimilarity.findBestMatch(text, roadmapTexts.filter(t => t && t.length > 10));
        if (roadmapMatches.bestMatch.rating > maxSimilarity) {
            maxSimilarity = roadmapMatches.bestMatch.rating;
            source = 'Project roadmap';
        }
    }

    const similarityScore = (maxSimilarity * 100);

    // Dynamic Feedback Logic (CRITICAL IMPROVEMENT)
    const words = text.trim().split(/\s+/).length;
    const technicalKeywords = ["implemented", "integrated", "optimized", "designed", "developed", "configured"];
    const technicalKeywordCount = technicalKeywords.reduce((count, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        return count + (text.match(regex) || []).length;
    }, 0);

    // Initial score calculation
    let performanceScore = 0;
    if (words > 120) performanceScore += 40;
    else if (words > 60) performanceScore += 25;
    else performanceScore += 10;

    if (technicalKeywordCount > 4) performanceScore += 40;
    else if (technicalKeywordCount > 2) performanceScore += 20;
    else performanceScore += 5;

    if (similarityScore < 25) performanceScore += 20;
    else if (similarityScore > 70) performanceScore -= 30;
    else if (similarityScore > 40) performanceScore -= 10;

    const finalScore = Math.max(0, Math.min(100, performanceScore));

    const generateFeedback = (score, similarity, wordCount, techCount) => {
        const strengths = [];
        const improvements = [];

        // Analysis of Strengths
        if (score > 70) {
            strengths.push("High-quality submission with strong technical depth.");
        }
        if (techCount >= 4) {
            strengths.push("Excellent use of technical terminology and implementation verbs.");
        } else if (techCount >= 2) {
            strengths.push("Good technical context provided in the explanation.");
        }
        if (wordCount > 100) {
            strengths.push("Comprehensive documentation of the implementation steps.");
        }
        if (similarity < 15) {
            strengths.push("Highly original content with no significant external matches.");
        }

        // Analysis of Improvements
        if (score < 40) {
            improvements.push("Add more technical detail to improve the performance score.");
        }
        if (wordCount < 60) {
            improvements.push("Increase the word count to explain the edge cases and challenges.");
        }
        if (techCount < 2) {
            improvements.push("Incorporate more industry-standard verbs (e.g., 'optimized', 'integrated').");
        }
        if (similarity > 40) {
            improvements.push("High similarity detected. Rephrase to reflect your independent implementation.");
        } else if (similarity > 20) {
            improvements.push("Moderate similarity found. Ensure all external logic is properly explained.");
        }

        // Fallback
        if (strengths.length === 0 && score >= 50) strengths.push("Baseline implementation achieved.");
        if (improvements.length === 0 && score >= 80) strengths.push("Consistent and professional reporting style.");

        return { strengths, improvements, feedback: [...strengths, ...improvements] };
    };

    const { strengths, improvements, feedback } = generateFeedback(finalScore, similarityScore, words, technicalKeywordCount);

    return {
        similarityScore: similarityScore.toFixed(2),
        performanceScore: finalScore,
        strengths,
        improvements,
        feedback, // Backward compatibility
        source: similarityScore > 20 ? source : 'Original',
        wordCount: words,
        technicalKeywordCount
    };
};

module.exports = { analyzeReport };
