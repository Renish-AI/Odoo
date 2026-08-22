import { GLOBAL_DESTINATIONS } from '../data/destinations';

export const aiService = {
  // Analyze trip health and pacing
  analyzeTripHealth(trip) {
    if (!trip) return null;

    const stops = trip.stops || [];
    const activities = trip.activities || [];
    const expenses = trip.expenses || [];
    const totalBudget = Number(trip.totalBudget) || 2000;
    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const issues = [];
    const strengths = [];
    let healthScore = 92;

    // 1. Pacing & Stop Duration Check
    if (stops.length === 0) {
      issues.push({
        type: 'warning',
        title: 'No stops added yet',
        description: 'Add at least one city destination to unlock full route analysis and day-by-day planning.'
      });
      healthScore -= 20;
    } else {
      stops.forEach((stop) => {
        const start = new Date(stop.arrivalDate);
        const end = new Date(stop.departureDate);
        const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        
        if (days < 2) {
          issues.push({
            type: 'warning',
            title: `Fast turnaround in ${stop.cityName}`,
            description: `Only ${days} day planned in ${stop.cityName}. Consider adding 1 more day to absorb local culture without fatigue.`
          });
          healthScore -= 8;
        } else {
          strengths.push({
            title: `Ideal pacing in ${stop.cityName}`,
            description: `${days} days allows a comfortable balance of sightseeing and relaxation.`
          });
        }
      });
    }

    // 2. Activity Density Check
    const activitiesByDay = {};
    activities.forEach((act) => {
      const dayNum = act.dayNumber || 1;
      const key = `Day ${dayNum}`;
      activitiesByDay[key] = (activitiesByDay[key] || 0) + 1;
    });

    Object.entries(activitiesByDay).forEach(([dayLabel, count]) => {
      if (count >= 3) {
        issues.push({
          type: 'caution',
          title: `⚠️ ${dayLabel} looks packed.`,
          description: `Having ${count} scheduled activities on ${dayLabel} looks packed. Consider spacing afternoon activities to prevent fatigue.`
        });
        healthScore -= 6;
      }
    });

    // 3. Category Variety & Balance
    const categories = new Set(activities.map((a) => a.category));
    if (categories.size >= 3) {
      strengths.push({
        title: 'Great Experience Diversity',
        description: `Trip features ${categories.size} distinct activity categories (food, culture, sightseeing, etc.).`
      });
    } else if (activities.length > 2 && categories.size < 2) {
      issues.push({
        type: 'suggestion',
        title: 'Monotonous Activity Blend',
        description: 'Try adding food tours or scenic nature walks to enrich the journey experience.'
      });
      healthScore -= 5;
    }

    // 4. Budget Overrun Check
    if (totalSpent > totalBudget) {
      issues.push({
        type: 'critical',
        title: 'Budget Overrun Detected',
        description: `Actual spend ($${totalSpent.toLocaleString()}) exceeds planned budget ($${totalBudget.toLocaleString()}) by $${(totalSpent - totalBudget).toLocaleString()}.`
      });
      healthScore -= 25;
    } else if (totalSpent > totalBudget * 0.85) {
      issues.push({
        type: 'warning',
        title: 'Budget Tight (85%+ spent)',
        description: 'Less than 15% budget remaining. Keep reserves for unexpected transit or emergency expenses.'
      });
      healthScore -= 10;
    } else {
      strengths.push({
        title: 'Healthy Financial Reserve',
        description: `$${(totalBudget - totalSpent).toLocaleString()} available buffer remaining for spontaneous experiences.`
      });
    }

    // Clamp score
    healthScore = Math.max(20, Math.min(98, healthScore));

    let ratingGrade = 'A+';
    let summaryText = 'Your itinerary is masterfully balanced for comfort, exploration, and budget control!';
    if (healthScore < 60) {
      ratingGrade = 'Needs Attention';
      summaryText = 'Critical pacing or budget adjustments recommended before departure.';
    } else if (healthScore < 80) {
      ratingGrade = 'Good';
      summaryText = 'Solid itinerary with minor optimization opportunities available.';
    }

    return {
      score: healthScore,
      grade: ratingGrade,
      summary: summaryText,
      issues,
      strengths,
      metrics: {
        totalStops: stops.length,
        totalActivities: activities.length,
        categorySpread: categories.size,
        budgetBurnRate: stops.length > 0 ? Math.round(totalSpent / Math.max(1, stops.length * 3)) : 0
      }
    };
  },

  // AI Assistant Chat & Generation
  async askTravelAssistant(query, contextTrip = null) {
    // Simulate high-quality intelligent AI travel concierge
    await new Promise((resolve) => setTimeout(resolve, 600));

    const q = query.toLowerCase();

    // Context destination check
    const currentCity = contextTrip?.stops?.[0]?.cityName || 'Tokyo';
    const dest = GLOBAL_DESTINATIONS.find(
      (d) => d.city.toLowerCase() === currentCity.toLowerCase()
    ) || GLOBAL_DESTINATIONS[0];

    if (q.includes('hidden gem') || q.includes('off the beaten')) {
      return {
        reply: `Here are 3 handpicked hidden gems for **${currentCity}** curated by local travelers:
1. **Secret Courtyard Cafés**: Tucked behind the main boulevard, peaceful haven with artisan roasts.
2. **Sunset Viewpoint at Hilltop Quarter**: Far less crowded than tourist observation decks, unmatched panoramic golden hour.
3. **Local Evening Food Arcade**: Family-run stalls serving authentic century-old specialties for half the tourist price!`,
        suggestions: [
          'Add hidden café walk to Day 2',
          'Calculate walking distance to viewpoint',
          'Search food arcade tour'
        ],
        generatedActivities: [
          {
            title: `Hidden Gems & Alleyway Walk in ${currentCity}`,
            category: 'Culture',
            cost: 0,
            duration: '2.5h',
            description: 'Stroll through historic residential lanes and artisanal craft shops.'
          }
        ]
      };
    }

    if (q.includes('budget') || q.includes('save') || q.includes('cheaper')) {
      return {
        reply: `💡 **Smart Cost Optimization Strategy for ${contextTrip?.title || 'your trip'}**:
- **Transit Pass**: Buying a multi-day metro/rail pass will save approximately $35-$50 per person compared to single tickets.
- **Lunch Specials**: Enjoy fine dining during lunch service (typically 40% cheaper than dinner menus for identical dishes).
- **Free Museum Days**: Check local museum schedules; many offer free entry on first Sundays or weekday evenings.`,
        suggestions: [
          'Log planned transit pass expense',
          'Check free attraction days',
          'Adjust daily spending target'
        ]
      };
    }

    if (q.includes('food') || q.includes('restaurant') || q.includes('eat')) {
      return {
        reply: `🍽️ **Culinary Recommendations for ${currentCity}**:
- **Must Try Dish**: Regional signature tasting menu.
- **Breakfast**: Neighborhood bakery for warm fresh pastries & espresso.
- **Dinner**: Lively bistro/izakaya with local seasonal specialties.
- **Pro Tip**: Reserve dinner tables 3-5 days in advance for top-rated spots.`,
        suggestions: [
          'Add Dinner reservation to itinerary',
          'Find street food market',
          'Explore cooking classes'
        ],
        generatedActivities: [
          {
            title: `Authentic Tasting Tour in ${currentCity}`,
            category: 'Food',
            cost: 45,
            duration: '3h',
            description: 'Sample 5 iconic local specialties with a resident food connoisseur.'
          }
        ]
      };
    }

    if (q.includes('itinerary') || q.includes('schedule') || q.includes('plan day')) {
      return {
        reply: `🗺️ **Optimized Full-Day Itinerary for ${currentCity}**:
- **09:00 AM - 11:30 AM**: Major landmark visit during early quiet hours.
- **12:00 PM - 01:30 PM**: Traditional lunch at historic market.
- **02:30 PM - 05:00 PM**: Art museum or cultural quarter walking tour.
- **06:00 PM - 08:30 PM**: Scenic sunset dinner & ambient evening stroll.`,
        suggestions: [
          'Auto-populate Day 1 schedule',
          'Check transit time between locations',
          'Add relaxing coffee break'
        ],
        generatedActivities: [
          {
            title: `Morning Architectural Landmark in ${currentCity}`,
            category: 'Sightseeing',
            cost: 25,
            duration: '2.5h',
            description: 'Visit the city center centerpiece before peak midday crowds.'
          },
          {
            title: `Sunset River / Rooftop Promenade in ${currentCity}`,
            category: 'Relax',
            cost: 0,
            duration: '2h',
            description: 'Golden hour photography and evening atmosphere.'
          }
        ]
      };
    }

    // Default intelligent response
    return {
      reply: `I have analyzed your **${contextTrip?.title || 'Multi-City Adventure'}**. 

${dest ? `For **${dest.city}, ${dest.country}**, best conditions are during **${dest.bestSeason}** with an average daily budget of **$${dest.avgDailyBudget}/day**.` : ''}

Would you like me to optimize your daily pacing, suggest top-rated local activities, or balance your budget allocation?`,
      suggestions: [
        `Suggest top 3 activities for ${currentCity}`,
        'Optimize day-by-day pacing',
        'Find budget-saving tips'
      ]
    };
  }
};
