const mongoose = require('mongoose');
const StudySpace = require('../models/StudySpace');
const inMemoryStore = require('./inMemoryStore');
const { enrichSpacesWithLiveAvailability } = require('./reservationService');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Intelligent Rule-Based Campus Space Recommender (Grounded in real DB data)
 */
const generateRuleBasedRecommendation = (query, spaces) => {
  const q = query.toLowerCase();

  let noisePref = null;
  if (q.includes('silent') || q.includes('dead quiet') || q.includes('pin drop')) noisePref = 'silent';
  else if (q.includes('quiet') || q.includes('calm') || q.includes('peaceful')) noisePref = 'quiet';
  else if (q.includes('moderate') || q.includes('group') || q.includes('collaborat') || q.includes('discussion')) noisePref = 'moderate';
  else if (q.includes('noisy') || q.includes('cafe') || q.includes('social') || q.includes('lounge')) noisePref = 'noisy';

  const wantedAmenities = [];
  if (q.includes('power') || q.includes('outlet') || q.includes('plug') || q.includes('charg')) wantedAmenities.push('Power Outlets');
  if (q.includes('whiteboard') || q.includes('marker') || q.includes('board')) wantedAmenities.push('Whiteboards');
  if (q.includes('standing') || q.includes('stand')) wantedAmenities.push('Standing Desks');
  if (q.includes('monitor') || q.includes('screen') || q.includes('display')) wantedAmenities.push('Monitors');
  if (q.includes('coffee') || q.includes('cafe') || q.includes('tea')) wantedAmenities.push('Coffee Station');
  if (q.includes('light') || q.includes('window') || q.includes('view')) wantedAmenities.push('Natural Light');

  const buildingKeywords = ['engineering', 'science', 'arts', 'humanities', 'law', 'library', 'center', 'biomed', 'tech'];
  const matchedBuilding = buildingKeywords.find((b) => q.includes(b));

  const scoredSpaces = spaces.map((space) => {
    let score = 0;
    const reasons = [];

    if (noisePref) {
      if (space.noiseLevel === noisePref) {
        score += 30;
        reasons.push(`matches your requested ${space.noiseLevel} atmosphere`);
      } else if (noisePref === 'quiet' && space.noiseLevel === 'silent') {
        score += 20;
        reasons.push(`very quiet study environment`);
      }
    }

    if (q.includes('wifi') || q.includes('wi-fi') || q.includes('internet')) {
      if (space.wifiAvailable) {
        score += 15;
        reasons.push(`verified high-speed Wi-Fi available`);
      }
    }

    if (space.liveStats && space.liveStats.availableSeats > 0) {
      score += 20;
      score += Math.min(15, space.liveStats.availableSeats);
      reasons.push(`${space.liveStats.availableSeats} seats open right now`);
    } else if (space.status !== 'open') {
      score -= 50;
    }

    wantedAmenities.forEach((amenity) => {
      if (space.amenities && space.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))) {
        score += 15;
        reasons.push(`equipped with ${amenity}`);
      }
    });

    if (matchedBuilding) {
      if (
        space.building.toLowerCase().includes(matchedBuilding) ||
        space.name.toLowerCase().includes(matchedBuilding)
      ) {
        score += 25;
        reasons.push(`located in ${space.building}`);
      }
    }

    if (space.featured) {
      score += 5;
    }

    return {
      space,
      score,
      reasons: reasons.slice(0, 3),
    };
  });

  scoredSpaces.sort((a, b) => b.score - a.score);
  const topMatches = scoredSpaces.slice(0, 3).map((item) => item.space);
  const topItem = scoredSpaces[0];

  let replyText = '';
  if (topMatches.length > 0 && topItem.score > 0) {
    replyText = `Based on your request ("${query}"), here are the best real-time matching study spaces on campus:\n\n` +
      scoredSpaces.slice(0, 3).map((item, idx) => {
        const s = item.space;
        const live = s.liveStats || { availableSeats: s.capacity, occupancyPercentage: 0 };
        const reasonStr = item.reasons.length > 0 ? ` (${item.reasons.join(', ')})` : '';
        return `${idx + 1}. **${s.name}** [${s.building}, ${s.floor}]\n` +
               `   • Atmosphere: *${s.noiseLevel.toUpperCase()}* | Wi-Fi: ${s.wifiAvailable ? '✅ Yes' : '❌ No'}\n` +
               `   • Live Availability: **${live.availableSeats} / ${live.totalSeats || s.capacity} seats open** (${live.occupancyPercentage}% occupied)${reasonStr}`;
      }).join('\n\n') +
      `\n\n💡 *Tip: Click on any recommended card below to view the interactive BookMyShow-style seating layout and reserve your seat instantly.*`;
  } else {
    replyText = `I searched all available campus study locations for you. Here are currently open spaces with good availability:\n\n` +
      spaces.slice(0, 3).map((s, idx) => {
        const live = s.liveStats || { availableSeats: s.capacity };
        return `${idx + 1}. **${s.name}** (${s.building}) - ${live.availableSeats} seats available [${s.noiseLevel}]`;
      }).join('\n');
  }

  return {
    reply: replyText,
    recommendations: topMatches,
    suggestedFollowUps: [
      'Where is the most silent space available now?',
      'Show me spaces with power outlets and monitors',
      'Are there open seats in the Engineering Library?',
    ],
  };
};

/**
 * Handle AI Chat with student, grounded in real space data
 */
const handleAIChat = async (userQuery, conversationHistory = []) => {
  if (!userQuery || typeof userQuery !== 'string') {
    throw new Error('Valid query string is required');
  }

  let spaces = [];

  if (isDbConnected()) {
    const rawSpaces = await StudySpace.find({ status: { $ne: 'closed' } }).limit(20);
    spaces = await enrichSpacesWithLiveAvailability(rawSpaces);
  } else {
    await inMemoryStore.init();
    const now = new Date();
    spaces = inMemoryStore.spaces.map((sp) => {
      const spSeats = inMemoryStore.seats.filter((st) => st.spaceId === sp._id && st.status !== 'blocked');
      const activeRes = inMemoryStore.reservations.filter(
        (r) => (r.studySpace._id === sp._id || r.studySpace === sp._id) && r.status === 'active' && new Date(r.startTime) <= now && new Date(r.endTime) >= now
      );
      const total = spSeats.length || sp.capacity;
      const occupied = activeRes.length;
      const available = Math.max(0, total - occupied);
      const pct = Math.round((occupied / Math.max(1, total)) * 100);

      return {
        ...sp,
        liveStats: {
          totalSeats: total,
          occupiedSeats: occupied,
          availableSeats: available,
          occupancyPercentage: pct,
          isAvailableNow: available > 0 && sp.status === 'open',
        },
      };
    });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const aiApiKey = process.env.AI_API_KEY;
  const apiKey = (groqApiKey && groqApiKey.trim()) || (aiApiKey && aiApiKey.trim());

  if (apiKey && apiKey.length > 0 && !apiKey.includes('your_') && !apiKey.includes('placeholder')) {
    try {
      const simplifiedSpaces = spaces.map((s) => ({
        id: s._id,
        name: s.name,
        building: s.building,
        floor: s.floor,
        room: s.room,
        noiseLevel: s.noiseLevel,
        wifiAvailable: s.wifiAvailable,
        amenities: s.amenities,
        status: s.status,
        availableSeats: s.liveStats?.availableSeats,
        totalSeats: s.liveStats?.totalSeats || s.capacity,
        occupancyPercentage: s.liveStats?.occupancyPercentage,
      }));

      const systemPrompt = `You are the Campus Study Space AI Assistant. Your job is to help university students find and reserve the best study spaces on campus.
CRITICAL RULE: You MUST ONLY recommend study spaces that exist in the following verified database list. Do NOT invent spaces or buildings.
Current Campus Study Spaces Database:
${JSON.stringify(simplifiedSpaces, null, 2)}

Provide concise, friendly, formatted markdown advice. Always mention exact available seats, noise level, and building floor.`;

      const isGroqKey = (groqApiKey && groqApiKey.trim().length > 0) || apiKey.startsWith('gsk_');

      if (isGroqKey) {
        const groqKeyToUse = (groqApiKey && groqApiKey.trim()) || apiKey;
        const groqModelsToTry = ['groq/compound-mini', 'groq/compound', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

        let generatedText = null;

        for (const model of groqModelsToTry) {
          try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqKeyToUse}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userQuery },
                ],
                temperature: 0.5,
                max_tokens: 1024,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              generatedText = data?.choices?.[0]?.message?.content;
              if (generatedText) break;
            }
          } catch (err) {
            console.warn(`[AI Service] Error calling Groq model ${model}:`, err.message);
          }
        }

        if (generatedText) {
          const matchedSpaces = spaces.filter((s) =>
            generatedText.toLowerCase().includes(s.name.toLowerCase()) ||
            generatedText.toLowerCase().includes(s.building.toLowerCase())
          ).slice(0, 3);

          return {
            reply: generatedText,
            recommendations: matchedSpaces.length > 0 ? matchedSpaces : spaces.slice(0, 3),
            suggestedFollowUps: [
              'Show me spaces with power outlets',
              'Which space has the highest availability right now?',
              'Find a group discussion room',
            ],
            source: 'groq-grounded',
          };
        }
      } else {
        // Fallback to Gemini if not a Groq key
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nStudent asks: "${userQuery}"` }],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (generatedText) {
            const matchedSpaces = spaces.filter((s) =>
              generatedText.toLowerCase().includes(s.name.toLowerCase()) ||
              generatedText.toLowerCase().includes(s.building.toLowerCase())
            ).slice(0, 3);

            return {
              reply: generatedText,
              recommendations: matchedSpaces.length > 0 ? matchedSpaces : spaces.slice(0, 3),
              suggestedFollowUps: [
                'Show me spaces with power outlets',
                'Which space has the highest availability right now?',
                'Find a group discussion room',
              ],
              source: 'gemini-grounded',
            };
          }
        }
      }
    } catch (err) {
      console.warn('[AI Service] API call fallback to rule engine:', err.message);
    }
  }

  const ruleResult = generateRuleBasedRecommendation(userQuery, spaces);
  return {
    ...ruleResult,
    source: 'grounded-engine',
  };
};

module.exports = { handleAIChat };
