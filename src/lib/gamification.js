import FoodLog from "@/models/FoodLog";
import WaterLog from "@/models/WaterLog";
import Plan from "@/models/Plan";
import Achievement from "@/models/Achievement";

export const BADGE_DEFINITIONS = [
  {
    id: "first_meal",
    title: "First Step",
    description: "Log your very first meal into CalorieLens",
    icon: "🌱",
    category: "Milestone",
    rarity: "Common",
    target: 1,
  },
  {
    id: "streak_3",
    title: "Spark Maker",
    description: "Maintain a 3-day consecutive logging streak",
    icon: "🔥",
    category: "Streak",
    rarity: "Common",
    target: 3,
  },
  {
    id: "streak_7",
    title: "Unstoppable Habit",
    description: "Build an ironclad 7-day logging streak",
    icon: "⚡",
    category: "Streak",
    rarity: "Rare",
    target: 7,
  },
  {
    id: "streak_30",
    title: "Consistency Legend",
    description: "Achieve an elite 30-day logging streak",
    icon: "👑",
    category: "Streak",
    rarity: "Legendary",
    target: 30,
  },
  {
    id: "protein_champ",
    title: "Protein Champion",
    description: "Reach your recommended daily protein goal",
    icon: "🥩",
    category: "Nutrition",
    rarity: "Rare",
    target: 1,
  },
  {
    id: "hydration_hero",
    title: "Hydration Hero",
    description: "Drink 100% of your daily water intake target",
    icon: "💧",
    category: "Hydration",
    rarity: "Rare",
    target: 1,
  },
  {
    id: "visionary",
    title: "AI Gourmet",
    description: "Log 10 meals using Gemini Camera Photo Scan or Voice",
    icon: "📸",
    category: "AI",
    rarity: "Rare",
    target: 10,
  },
  {
    id: "century_club",
    title: "Century Club",
    description: "Log 100 total meals in your nutrition diary",
    icon: "🥗",
    category: "Milestone",
    rarity: "Epic",
    target: 100,
  },
  {
    id: "target_locked",
    title: "Target Locked",
    description: "Stay within ±10% of your daily calorie goal for a day",
    icon: "🎯",
    category: "Nutrition",
    rarity: "Epic",
    target: 1,
  },
];

export async function computeGamificationStats(userId, clientTimezoneOffset = 0) {
  // 1. Fetch user FoodLogs
  const allLogs = await FoodLog.find({ userId }).select("date createdAt total text").sort({ date: -1 });
  
  // Format dates as YYYY-MM-DD
  const formatDateString = (d) => {
    const dateObj = new Date(d);
    return dateObj.toISOString().split("T")[0];
  };

  const todayStr = formatDateString(new Date());
  
  // Collect unique active days
  const activeDaysSet = new Set();
  let aiLoggedCount = 0;

  allLogs.forEach((log) => {
    const dStr = formatDateString(log.date || log.createdAt);
    activeDaysSet.add(dStr);

    if (log.text && (log.text.toLowerCase().includes("image analysis") || log.text.toLowerCase().includes("logged via ai") || log.text.toLowerCase().includes("photo"))) {
      aiLoggedCount += 1;
    }
  });

  const sortedActiveDays = Array.from(activeDaysSet).sort().reverse(); // Most recent first

  // 2. Compute Consecutive Day Streak
  let currentStreak = 0;
  let loggedToday = activeDaysSet.has(todayStr);

  const oneDayMs = 24 * 60 * 60 * 1000;
  let checkDate = new Date();
  
  if (!loggedToday) {
    // If not logged today, check if yesterday was logged to keep streak active
    checkDate = new Date(Date.now() - oneDayMs);
  }

  while (true) {
    const dateStr = formatDateString(checkDate);
    if (activeDaysSet.has(dateStr)) {
      currentStreak += 1;
      checkDate = new Date(checkDate.getTime() - oneDayMs);
    } else {
      break;
    }
  }

  // 3. Compute Longest Streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  // Traverse sorted chronologically (oldest to newest)
  const chronologicalDays = Array.from(activeDaysSet).sort();
  for (let i = 0; i < chronologicalDays.length; i++) {
    const curr = new Date(chronologicalDays[i]);
    if (prevDate) {
      const diffDays = Math.round((curr - prevDate) / oneDayMs);
      if (diffDays === 1) {
        tempStreak += 1;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    prevDate = curr;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 4. Last 7 Days Overview
  const last7Days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * oneDayMs);
    const dStr = formatDateString(d);
    last7Days.push({
      date: dStr,
      dayName: dayNames[d.getDay()],
      hasLogged: activeDaysSet.has(dStr),
      isToday: dStr === todayStr,
    });
  }

  // 5. Check Water and Plan achievements
  const todayWater = await WaterLog.findOne({ userId, date: todayStr });
  const hasMetWaterGoal = todayWater && todayWater.totalAmount >= todayWater.dailyGoal && todayWater.totalAmount > 0;

  const userPlan = await Plan.findOne({ userId });
  let hasMetProteinGoal = false;
  let hasHitTargetCalorie = false;

  if (userPlan && userPlan.targetCalories) {
    // Sum up today's nutrition
    const todayLogs = allLogs.filter((l) => formatDateString(l.date || l.createdAt) === todayStr);
    const todayTotals = todayLogs.reduce(
      (acc, l) => ({
        calories: acc.calories + (l.total?.calories || 0),
        protein: acc.protein + (l.total?.protein || 0),
      }),
      { calories: 0, protein: 0 }
    );

    if (userPlan.protein && todayTotals.protein >= userPlan.protein) {
      hasMetProteinGoal = true;
    }

    const calDiff = Math.abs(todayTotals.calories - userPlan.targetCalories);
    if (todayTotals.calories > 0 && calDiff <= userPlan.targetCalories * 0.1) {
      hasHitTargetCalorie = true;
    }
  }

  // 6. Fetch or Create Achievement record
  let achievement = await Achievement.findOne({ userId });
  if (!achievement) {
    achievement = new Achievement({
      userId,
      currentStreak,
      longestStreak,
      lastActiveDate: loggedToday ? todayStr : sortedActiveDays[0] || null,
      unlockedBadges: [],
    });
  } else {
    achievement.currentStreak = currentStreak;
    if (longestStreak > achievement.longestStreak) {
      achievement.longestStreak = longestStreak;
    }
    if (loggedToday) {
      achievement.lastActiveDate = todayStr;
    }
  }

  const existingUnlockedMap = new Map();
  achievement.unlockedBadges.forEach((b) => {
    existingUnlockedMap.set(b.badgeId, b.unlockedAt);
  });

  const newlyUnlocked = [];

  // Evaluate each badge
  const totalMeals = allLogs.length;

  const badges = BADGE_DEFINITIONS.map((def) => {
    let isUnlocked = existingUnlockedMap.has(def.id);
    let progressCurrent = 0;
    let unlockedAt = existingUnlockedMap.get(def.id) || null;

    switch (def.id) {
      case "first_meal":
        progressCurrent = Math.min(1, totalMeals);
        if (progressCurrent >= 1 && !isUnlocked) isUnlocked = true;
        break;

      case "streak_3":
        progressCurrent = Math.min(3, Math.max(currentStreak, longestStreak));
        if (progressCurrent >= 3 && !isUnlocked) isUnlocked = true;
        break;

      case "streak_7":
        progressCurrent = Math.min(7, Math.max(currentStreak, longestStreak));
        if (progressCurrent >= 7 && !isUnlocked) isUnlocked = true;
        break;

      case "streak_30":
        progressCurrent = Math.min(30, Math.max(currentStreak, longestStreak));
        if (progressCurrent >= 30 && !isUnlocked) isUnlocked = true;
        break;

      case "protein_champ":
        progressCurrent = hasMetProteinGoal || isUnlocked ? 1 : 0;
        if (hasMetProteinGoal && !isUnlocked) isUnlocked = true;
        break;

      case "hydration_hero":
        progressCurrent = hasMetWaterGoal || isUnlocked ? 1 : 0;
        if (hasMetWaterGoal && !isUnlocked) isUnlocked = true;
        break;

      case "visionary":
        progressCurrent = Math.min(10, aiLoggedCount);
        if (progressCurrent >= 10 && !isUnlocked) isUnlocked = true;
        break;

      case "century_club":
        progressCurrent = Math.min(100, totalMeals);
        if (progressCurrent >= 100 && !isUnlocked) isUnlocked = true;
        break;

      case "target_locked":
        progressCurrent = hasHitTargetCalorie || isUnlocked ? 1 : 0;
        if (hasHitTargetCalorie && !isUnlocked) isUnlocked = true;
        break;

      default:
        break;
    }

    if (isUnlocked && !existingUnlockedMap.has(def.id)) {
      unlockedAt = new Date();
      achievement.unlockedBadges.push({ badgeId: def.id, unlockedAt });
      newlyUnlocked.push(def);
    }

    const progressPercent = Math.min(100, Math.round((progressCurrent / def.target) * 100));

    return {
      ...def,
      unlocked: isUnlocked,
      unlockedAt,
      progress: {
        current: progressCurrent,
        target: def.target,
        percent: progressPercent,
      },
    };
  });

  await achievement.save();

  return {
    currentStreak,
    longestStreak,
    loggedToday,
    totalMeals,
    last7Days,
    badges,
    newlyUnlocked,
  };
}
