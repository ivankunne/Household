import type { MascotTrigger, MascotReaction } from '../types'

export const mascotReactions: Record<MascotTrigger, MascotReaction> = {
  task_completed: {
    mood: 'celebrating',
    emoji: '✨',
    messages: [
      'Boom! Knocked that one out! ✨',
      'Look at you go! One down, feeling good!',
      'That task never saw you coming!',
      'One task lighter, one smile brighter ✨',
      'Tick! Another one bites the dust 🎉',
    ],
  },
  streak_milestone: {
    mood: 'excited',
    emoji: '🔥',
    messages: [
      'STREAK! You two are on fire 🔥',
      "Look at this consistency! I'm genuinely impressed.",
      "Days in a row?! You're basically household superheroes.",
      'The streak is REAL. Keep going! 🚀',
    ],
  },
  routine_completed: {
    mood: 'happy',
    emoji: '🌟',
    messages: [
      'Routine complete! Your future self thanks you 🌟',
      'Another one ticked off. The house practically sparkles.',
      "Done and dusted — literally! You're amazing.",
      'Home harmony achieved! Well done 🏡',
    ],
  },
  grocery_session_done: {
    mood: 'celebrating',
    emoji: '🛒',
    messages: [
      'Fridge: stocked. Pantry: happy. You: legendary 🛒',
      'Shopping DONE. The kitchen is grateful.',
      'Groceries secured! Meals can happen now 🎉',
      "You got everything! Well, almost... did you get snacks? I'm asking for a friend.",
    ],
  },
  morning_greeting: {
    mood: 'happy',
    emoji: '☀️',
    messages: [
      'Good morning! Your home is rooting for you today ☀️',
      'Rise and shine! A few small tasks and the day is yours.',
      'Morning! The house is quietly waiting. Let\'s make it happy together.',
      'New day, fresh start. You\'ve got this 🌅',
    ],
  },
  evening_summary: {
    mood: 'encouraging',
    emoji: '🌙',
    messages: [
      "Evening check-in — you've done more than you realize today 🌙",
      'The day is winding down. Take a breath; you earned it.',
      'Rest mode: activated. Good job today, seriously.',
      "Tonight's vibe: cozy and accomplished 🌙",
    ],
  },
  all_tasks_done: {
    mood: 'celebrating',
    emoji: '🎊',
    messages: [
      "ALL DONE! The house is in full celebration mode 🎊",
      'LEGENDARY. Everything is done. I am in awe.',
      "Not a single task left! You've achieved household perfection.",
      "Done! Every. Single. One. Go celebrate! 🎊",
    ],
  },
  routine_missed: {
    mood: 'encouraging',
    emoji: '💛',
    messages: [
      "Hey, no stress — tomorrow is a fresh start 💛",
      "Life happens! The routine will be there when you're ready.",
      "Skipped one? That's okay. You're still doing great overall.",
      "Even rest is productive sometimes 💛",
    ],
  },
  bill_due: {
    mood: 'curious',
    emoji: '📅',
    messages: [
      'Heads up — a bill is coming up soon 📅',
      'Quick reminder: something needs paying soon!',
      "Don't forget — your wallet is whispering your name.",
      'Bill alert! Just a friendly nudge 📅',
    ],
  },
  maintenance_due: {
    mood: 'curious',
    emoji: '🔧',
    messages: [
      'The [object] is asking for a little attention 🔧',
      'Maintenance time! A small fix now saves a big problem later.',
      'Your home is sending a maintenance request!',
      "Something's due for a checkup — better now than later 🔧",
    ],
  },
  encouragement: {
    mood: 'encouraging',
    emoji: '💪',
    messages: [
      "You're doing better than you think. Seriously 💪",
      "A little at a time adds up. Keep going!",
      "The fact that you're trying counts for a lot.",
      "Progress over perfection, always 💛",
    ],
  },
  low_activity: {
    mood: 'curious',
    emoji: '👀',
    messages: [
      "Psst... things are piling up. Want to tackle just one thing? 👀",
      "The house misses you! Even one small task helps.",
      "Gentle nudge: there are a few things waiting when you're ready.",
      "No pressure — but the laundry has been giving me looks 👀",
    ],
  },
  weekly_recap: {
    mood: 'happy',
    emoji: '📊',
    messages: [
      'Week wrapped! Here\'s what you two accomplished together 📊',
      "Weekly review time — spoiler: you did great.",
      "Another week in the books. Let's look at what happened!",
      "7 days, lots of progress. Here's your household recap 🏡",
    ],
  },
}

export function pickMessage(trigger: MascotTrigger): { text: string; mood: string; emoji: string } {
  const reaction = mascotReactions[trigger]
  const text = reaction.messages[Math.floor(Math.random() * reaction.messages.length)]
  return { text, mood: reaction.mood, emoji: reaction.emoji }
}
