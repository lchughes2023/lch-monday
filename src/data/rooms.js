export const zones = [
  {
    id: 'intake',
    name: 'Intake & Sorting',
    color: '#20c060',
    rooms: ['front-garden', 'porch', 'hallway'],
  },
  {
    id: 'social',
    name: 'Social & Relational',
    color: '#e07040',
    rooms: ['kindergarten', 'living-room', 'kitchen'],
  },
  {
    id: 'refinement',
    name: 'Refinement & Correction',
    color: '#c060d0',
    rooms: ['laundry', 'stairs'],
  },
  {
    id: 'archival',
    name: 'Archival',
    color: '#4090ff',
    rooms: ['downstairs-bathroom', 'upstairs-bathroom'],
  },
  {
    id: 'governance',
    name: 'Governance & Identity',
    color: '#60d030',
    rooms: ['quiet-room', 'parents-room', 'my-room'],
  },
  {
    id: 'innovation',
    name: 'Innovation & Development',
    color: '#e0c030',
    rooms: ['treehouse', 'sandbox', 'playground'],
  },
]

export const rooms = {
  'front-garden': {
    id: 'front-garden',
    emoji: '🌱',
    name: 'Front Garden',
    zone: 'intake',
    theme: 'Raw Incoming Ideas',
    description:
      'The very first point of contact with your mind. Unfiltered input from life — nothing has been sorted, judged, or processed here yet.',
    routeWhen:
      'New, unformed ideas that just arrived. Raw observations, sudden inspiration, or anything that needs to enter the system fresh.',
  },
  porch: {
    id: 'porch',
    emoji: '🚪',
    name: 'Porch',
    zone: 'intake',
    theme: 'Initial Triage',
    description:
      'The decision gate before full entry. Quick, high-velocity judgment about what to do with an idea: explore it, discard it, or escalate it immediately.',
    routeWhen:
      'Ideas needing a quick yes/no/maybe decision. When you need to decide fast whether something deserves more attention.',
  },
  hallway: {
    id: 'hallway',
    emoji: '🚶',
    name: 'Hallway',
    zone: 'intake',
    theme: 'Idea Routing',
    description:
      'The central routing hub of the palace. This is where meta-thinking happens — figuring out where something belongs rather than processing it directly.',
    routeWhen:
      'Meta-thinking about where something belongs. When you are deciding which domain, project, or room an idea should live in.',
  },
  kindergarten: {
    id: 'kindergarten',
    emoji: '🏫',
    name: 'Kindergarten Room',
    zone: 'social',
    theme: 'External Relationships',
    description:
      'The professional outward-facing social layer. Clients, network contacts, business relationships, and all external-facing interactions live here.',
    routeWhen:
      'Professional contacts, clients, networking, business relationships, or any outward-facing social interaction.',
  },
  'living-room': {
    id: 'living-room',
    emoji: '🛋',
    name: 'Living Room',
    zone: 'social',
    theme: 'Close Relationships',
    description:
      'The inner circle. Emotionally strong, long-standing bonds with people who matter most. This is the warmest, most personal relational space.',
    routeWhen:
      'Family, close friends, deep personal bonds, or anyone in your innermost circle of trust.',
  },
  kitchen: {
    id: 'kitchen',
    emoji: '🍳',
    name: 'Kitchen',
    zone: 'social',
    theme: 'Relationship Maintenance',
    description:
      'Where relationships are actively tended. Ongoing conversations, check-ins, and the active work of keeping bonds strong and healthy.',
    routeWhen:
      'Maintaining and nurturing close relationships — scheduling check-ins, following up, keeping connections alive.',
  },
  laundry: {
    id: 'laundry',
    emoji: '🧺',
    name: 'Laundry Room',
    zone: 'refinement',
    theme: 'Idea Cleaning',
    description:
      'The reframing and clarification chamber. Ideas that are messy, emotionally charged, or confused come here to be cleaned, sorted, and reset before they can move forward.',
    routeWhen:
      'Confused, messy, or emotionally charged ideas. When an argument or event is still clouding your thinking on a topic.',
  },
  stairs: {
    id: 'stairs',
    emoji: '🪜',
    name: 'The Stairs',
    zone: 'refinement',
    theme: 'Escalation & Mistakes',
    description:
      'Height equals severity, and growth comes through correction. Recurring mistakes, error patterns, and lessons learned live here — each step up represents a harder lesson.',
    routeWhen:
      'Recurring mistakes, error patterns, behavioral habits you keep repeating, and lessons you need to integrate.',
  },
  'downstairs-bathroom': {
    id: 'downstairs-bathroom',
    emoji: '🚽',
    name: 'Downstairs Bathroom',
    zone: 'archival',
    theme: 'Short-Term Archive',
    description:
      'The recently closed loops archive. Projects, decisions, and ideas that have been completed recently but are still fresh enough to reference quickly.',
    routeWhen:
      'Projects or decisions recently completed — wrapped up in the last weeks or months, still recent enough to recall easily.',
  },
  'upstairs-bathroom': {
    id: 'upstairs-bathroom',
    emoji: '🚿',
    name: 'Upstairs Bathroom',
    zone: 'archival',
    theme: 'Long-Term Archive',
    description:
      'The permanent archive of finalized wisdom. Durable frameworks, long-standing conclusions, and hard-won philosophies that have proven reliable over years.',
    routeWhen:
      'Permanent, long-standing frameworks, philosophies, or conclusions that have been validated over years of use.',
  },
  'quiet-room': {
    id: 'quiet-room',
    emoji: '🤫',
    name: 'Quiet Room',
    zone: 'governance',
    theme: 'Respectful Deep Thinking',
    description:
      'A space for measured, structured discourse. Collaborative thinking that requires care, sensitivity, and disciplined reasoning lives here.',
    routeWhen:
      'Collaborative thinking, sensitive discussions, or any situation requiring everyone to be thoughtful and measured.',
  },
  'parents-room': {
    id: 'parents-room',
    emoji: '👨‍👩‍👦',
    name: "Parents' Room",
    zone: 'governance',
    theme: 'Authority & Standards',
    description:
      "The governance center. Rules, approval processes, authority figures, and institutional standards all route through here. This room represents external power structures and what they require.",
    routeWhen:
      'Authority interactions, approval processes, governance decisions, or anything requiring sign-off from those in power.',
  },
  'my-room': {
    id: 'my-room',
    emoji: '🛏',
    name: 'My Room',
    zone: 'governance',
    theme: 'Personal Identity',
    description:
      'The innermost sanctum of self. Private identity, core motivations, values that are never publicly shared. This is the most protected space in the palace.',
    routeWhen:
      'Core values, private thoughts, personal identity questions, fundamental motivations — things known only to you.',
  },
  treehouse: {
    id: 'treehouse',
    emoji: '🌲',
    name: 'Treehouse',
    zone: 'innovation',
    theme: 'Deep Solitary Strategy',
    description:
      'Elevated isolation for deep work. The harder the problem, the higher you climb. Strategic thinking that requires complete solitude and uninterrupted focus lives up here.',
    routeWhen:
      'Complex strategic problems requiring deep, solitary focus. When you need to think completely alone without interruption.',
  },
  sandbox: {
    id: 'sandbox',
    emoji: '🏖',
    name: 'Sandbox',
    zone: 'innovation',
    theme: 'Idea Building',
    description:
      'The early-stage prototype space. Systems, workflows, and ideas that are still being built and evolved. Nothing here is finished — everything is in flux.',
    routeWhen:
      'Evolving workflows, new systems being built, early-stage prototypes, and ideas that are developing but not yet tested.',
  },
  playground: {
    id: 'playground',
    emoji: '🎠',
    name: 'Playground & Swings',
    zone: 'innovation',
    theme: 'Testing Ideas',
    description:
      'The collaborative stress-testing arena. Ideas come here to be pitched, debated, and stress-tested with groups. Energetic, fast-paced, and social — this is where ideas prove themselves.',
    routeWhen:
      'Testing ideas with groups, brainstorming sessions, pitching concepts, or seeking energetic collaborative feedback.',
  },
}

export const roomOrder = [
  'front-garden',
  'porch',
  'hallway',
  'kindergarten',
  'living-room',
  'kitchen',
  'laundry',
  'stairs',
  'downstairs-bathroom',
  'upstairs-bathroom',
  'quiet-room',
  'parents-room',
  'my-room',
  'treehouse',
  'sandbox',
  'playground',
]

export function getRoomZone(roomId) {
  return zones.find((z) => z.rooms.includes(roomId))
}

export function getRoomColor(roomId) {
  const zone = getRoomZone(roomId)
  return zone ? zone.color : '#64b4ff'
}
