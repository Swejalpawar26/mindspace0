export interface InspirationStory {
  id: string;
  title: string;
  name: string;
  category: "entrepreneur" | "scientist" | "athlete" | "spiritual";
  summary: string;
  image: string;
  fullStory: string;
  challenges: string[];
  lessons: string[];
  quote: string;
  mindsetTip: string;
}

export const STORIES: InspirationStory[] = [
  {
    id: "1",
    title: "From Rejection to Revolution",
    name: "Steve Jobs",
    category: "entrepreneur",
    summary: "Fired from his own company, then built the most valuable brand in the world.",
    image: "🍎",
    fullStory:
      "Steve Jobs co-founded Apple in his parents' garage at age 21. By 30, he was ousted from the company he created. Instead of giving up, he founded NeXT and Pixar, which became a massive success. When Apple was on the brink of bankruptcy, they brought him back. He then revolutionized music (iPod), phones (iPhone), and tablets (iPad). His journey proves that setbacks are setups for comebacks.",
    challenges: ["Fired from Apple at 30", "Failed NeXT computer hardware", "Battled pancreatic cancer", "Faced public criticism constantly"],
    lessons: ["Stay hungry, stay foolish", "Connect the dots looking backward", "Quality over quantity in everything", "Innovation requires saying no to 1000 things"],
    quote: "Your time is limited, don't waste it living someone else's life.",
    mindsetTip:
      "When facing rejection, ask yourself: 'What can I create from this?' Every 'no' redirects you to a better 'yes'.",
  },
  {
    id: "2",
    title: "The Quiet Genius Who Changed the World",
    name: "Marie Curie",
    category: "scientist",
    summary: "First woman to win a Nobel Prize, and the only person to win in two different sciences.",
    image: "⚗️",
    fullStory:
      "Born in Poland when women couldn't attend university, Marie Curie moved to Paris with almost no money. She studied physics and math, often skipping meals. She discovered radioactivity, polonium, and radium. She won two Nobel Prizes — in Physics and Chemistry. During WWI, she developed mobile X-ray units. Despite facing sexism in academia, she never stopped pushing boundaries.",
    challenges: ["Poverty during early studies", "Sexism in 19th century academia", "Death of husband Pierre", "Health issues from radiation exposure"],
    lessons: ["Passion conquers poverty", "Break barriers others set for you", "Persistence in the face of prejudice", "Science serves humanity"],
    quote: "Nothing in life is to be feared, it is only to be understood.",
    mindsetTip:
      "When you feel limited by circumstances, remember: your curiosity is your superpower. Keep learning, no matter what.",
  },
  {
    id: "3",
    title: "The Greatest of All Time",
    name: "Michael Jordan",
    category: "athlete",
    summary: "Cut from his high school team, became the most iconic basketball player ever.",
    image: "🏀",
    fullStory:
      "Michael Jordan was cut from his high school varsity basketball team. That rejection fueled an obsession with improvement. He practiced relentlessly, earned a scholarship to UNC, and was drafted by the Chicago Bulls. He won 6 NBA championships, 5 MVP awards, and became a global icon. His secret? He embraced failure as fuel and outworked everyone around him.",
    challenges: ["Cut from high school team", "Father's murder in 1993", "Failed baseball career", "Multiple playoff heartbreaks early on"],
    lessons: ["Failure is the best teacher", "Work ethic beats talent", "Embrace pressure situations", "Never stop improving"],
    quote: "I've failed over and over and over again in my life. And that is why I succeed.",
    mindsetTip:
      "Track your small wins daily. Every practice session, every effort counts. Success is built in the boring moments.",
  },
  {
    id: "4",
    title: "The Power of Nonviolence",
    name: "Mahatma Gandhi",
    category: "spiritual",
    summary: "Led India to independence through peace, proving that gentleness is true strength.",
    image: "🕊️",
    fullStory:
      "Mohandas Gandhi was a shy, average student who became a lawyer in South Africa. There, he experienced racism and injustice that transformed his life mission. He returned to India and led the independence movement through nonviolent civil disobedience — Salt March, fasting, peaceful protests. He inspired millions worldwide and proved that moral courage is the highest form of bravery.",
    challenges: ["Racism in South Africa", "Multiple imprisonments", "British Empire opposition", "Internal political conflicts"],
    lessons: ["Nonviolence requires more courage than violence", "Be the change you wish to see", "Simplicity is strength", "Persistence moves mountains"],
    quote: "In a gentle way, you can shake the world.",
    mindsetTip:
      "Practice one act of kindness today. Strength isn't about force — it's about consistency in doing what's right.",
  },
  {
    id: "5",
    title: "Dreaming Beyond Gravity",
    name: "Elon Musk",
    category: "entrepreneur",
    summary: "From bullied kid in South Africa to sending rockets to space and revolutionizing electric cars.",
    image: "🚀",
    fullStory:
      "Elon Musk was bullied so badly as a child he was hospitalized. He taught himself programming at 12, moved to Canada with almost nothing, and eventually co-founded PayPal. He invested everything into SpaceX and Tesla — both nearly went bankrupt. SpaceX's first three rockets exploded. But the fourth succeeded, and the rest is history. He now leads the charge for sustainable energy and interplanetary life.",
    challenges: ["Severe childhood bullying", "Three rocket failures at SpaceX", "Tesla nearly bankrupt in 2008", "Divorced, overworked, and publicly criticized"],
    lessons: ["Think in first principles", "Embrace calculated risk", "Long-term vision over short-term comfort", "Sleep at the factory if you must"],
    quote: "When something is important enough, you do it even if the odds are not in your favor.",
    mindsetTip:
      "Break your biggest goal into tiny first-principle steps. What's the absolute smallest action you can take today?",
  },
  {
    id: "6",
    title: "From Poverty to Nobel Peace",
    name: "Malala Yousafzai",
    category: "spiritual",
    summary: "Shot by the Taliban at 15 for advocating girls' education, became the youngest Nobel laureate.",
    image: "📖",
    fullStory:
      "Malala grew up in Pakistan's Swat Valley where the Taliban banned girls from attending school. At 11, she began blogging for the BBC about life under Taliban rule. At 15, a gunman shot her in the head on her school bus. She survived, recovered in the UK, and became a global advocate for education. At 17, she became the youngest-ever Nobel Peace Prize laureate.",
    challenges: ["Taliban death threats", "Shot in the head at 15", "Exile from homeland", "Global spotlight at a young age"],
    lessons: ["One voice can change the world", "Education is the most powerful weapon", "Fear is conquered by purpose", "Age is no barrier to impact"],
    quote: "One child, one teacher, one book, one pen can change the world.",
    mindsetTip:
      "What injustice bothers you most? Start speaking about it — even in small ways. Your voice matters more than you think.",
  },
  {
    id: "7",
    title: "Dreams of a Missile Man",
    name: "A. P. J. Abdul Kalam",
    category: "scientist",
    summary: "A small-town boy who became India’s iconic rocket scientist and president.",
    image: "🚀",
    fullStory:
      "Born into a humble family in Rameswaram, Kalam sold newspapers as a boy and studied physics and aerospace engineering. He led India’s missile programs and later became the nation’s beloved president, inspiring millions with his simple wisdom and relentless optimism.",
    challenges: ["Financial hardship in childhood", "Early career doubts", "High-risk defense research", "Balancing science and public life"],
    lessons: ["Dream, dream, dream", "Perseverance changes your world", "Science can serve the nation", "Stay humble even at the top"],
    quote: "Dreams are not those which you see while sleeping, but dreams are those when you don't sleep before fulfilling them.",
    mindsetTip:
      "Treat every challenge as a launchpad. Small daily efforts build the rocket that carries your biggest goals.",
  },
  {
    id: "8",
    title: "Building Beyond Boundaries",
    name: "Ratan Tata",
    category: "entrepreneur",
    summary: "An industrialist who kept ethics and innovation at the heart of every bold move.",
    image: "🏭",
    fullStory:
      "Ratan Tata transformed his family business into a global conglomerate while staying true to his values. He backed risky projects like the Nano and invested in people-first ventures, proving that entrepreneurial success can also be compassionate and responsible.",
    challenges: ["Modernizing a traditional organization", "Managing global acquisitions", "Facing financial setbacks", "Keeping purpose over profit"],
    lessons: ["Lead with values", "Innovation is a long-term game", "Success is built on trust", "Great companies care about more than money"],
    quote: "Ups and downs in life are very important to keep us going, because a straight line even in an ECG means we are not alive.",
    mindsetTip:
      "Choose growth that lifts others. Impact that lasts is built by solving problems for people, not just markets.",
  },
  {
    id: "9",
    title: "From Chennai to the World",
    name: "Sundar Pichai",
    category: "entrepreneur",
    summary: "A soft-spoken engineer who rose to lead one of the world's biggest tech companies.",
    image: "💻",
    fullStory:
      "Grown up in Chennai with a mother who stitched clothes to support his education, Pichai studied metallurgical engineering before moving to the US. He joined Google and helped build Chrome, then led the company through ambitious growth with calm leadership and user-first focus.",
    challenges: ["Limited resources growing up", "Navigating global culture", "Leading rapid-scale innovation", "Balancing complexity and simplicity"],
    lessons: ["Soft power can be strong", "Focus on users first", "Calm leadership matters", "Take on hard problems step by step"],
    quote: "Wear your failure as a badge of honor!",
    mindsetTip:
      "Stay curious and keep learning. The biggest opportunities appear when you solve problems for billions of people.",
  },
  {
    id: "10",
    title: "Reaching for the Stars",
    name: "Kalpana Chawla",
    category: "scientist",
    summary: "The first Indian-born woman astronaut who followed her dream into space.",
    image: "🪐",
    fullStory:
      "Kalpana Chawla grew up in a small town in India with a passion for flying. She moved to the US, became an aerospace engineer, and flew on NASA space missions. Her bravery and curiosity continue to inspire young girls to pursue science and space exploration.",
    challenges: ["Cultural expectations", "Distance from home", "Intense astronaut training", "Pioneering in a male-dominated field"],
    lessons: ["Aim higher than anyone says you should", "Passion can take you anywhere", "Preparation opens doors", "Be a role model through action"],
    quote: "The path from dreams to success does exist. May you have the vision to find it, the courage to get on to it, and the perseverance to follow it.",
    mindsetTip:
      "Keep your eyes on the horizon. Even if the journey is hard, every small step takes you closer to the impossible.",
  },
  {
    id: "11",
    title: "Gold That Broke the Ground",
    name: "Neeraj Chopra",
    category: "athlete",
    summary: "A farmer's son who became India’s first Olympic gold medalist in track and field.",
    image: "🥇",
    fullStory:
      "Neeraj Chopra started throwing javelin in Punjab and quickly found a rare combination of speed, strength, and grace. He stayed focused through injury and pressure, eventually winning India’s first Olympic gold in athletics and inspiring a new generation of sportspersons.",
    challenges: ["Rural training conditions", "Injury recovery", "Olympic pressure", "High national expectations"],
    lessons: ["Stay grounded when you soar", "Consistency beats flashes of talent", "Your mindset is your strongest muscle", "Success is built on preparation and belief"],
    quote: "I do not think of records. I only think of the process and the approach.",
    mindsetTip:
      "Train your mind as much as your body. The clearest goal makes the hardest journey feel possible.",
  },
  {
    id: "12",
    title: "Punching Above the Limits",
    name: "Mary Kom",
    category: "athlete",
    summary: "A mother and boxer from Manipur who became one of the greatest women athletes in India.",
    image: "🥊",
    fullStory:
      "Growing up in a remote village, Mary Kom turned to boxing when she found her calling. She defeated physical and social barriers, winning world championships and an Olympic medal, while also balancing family life and mentoring young girls.",
    challenges: ["Limited training access", "Gender bias", "Balancing motherhood and sport", "Heavy competition worldwide"],
    lessons: ["Strength comes from heart", "Fight for your dreams every day", "Support others while rising", "Never let labels define you"],
    quote: "If you want to fly, give up everything that weighs you down.",
    mindsetTip:
      "Use every setback as fuel. Your resilience becomes the story that motivates others.",
  },
  {
    id: "13",
    title: "From Shuttle to Glory",
    name: "Saina Nehwal",
    category: "athlete",
    summary: "A badminton star who made India proud on courts around the world.",
    image: "🏸",
    fullStory:
      "Saina Nehwal started training in badminton as a child and soon became a national champion. She battled injuries and doubt, then won medals at the Olympics, Commonwealth Games, and World Championships, proving that a focused athlete can change a nation’s sporting dreams.",
    challenges: ["Recurring injuries", "Intense international competition", "Mental pressure", "High expectations from fans"],
    lessons: ["Never stop believing in yourself", "Recovery is part of the race", "Success needs patience", "Representing your country is sacred"],
    quote: "I have always believed that if you have commitment and are willing to work hard, there is nothing you cannot achieve.",
    mindsetTip:
      "Push through the hard days. Those are the moments when champions are built.",
  },
  {
    id: "14",
    title: "Founding India’s Tech Awakening",
    name: "N. R. Narayana Murthy",
    category: "entrepreneur",
    summary: "A humble engineer who helped build India’s global software industry.",
    image: "🖥️",
    fullStory:
      "Narayana Murthy started Infosys in a small Bangalore apartment with six people and a vision for ethical software business. He insisted on values like transparency, quality, and employee respect, and helped create millions of jobs while making India a tech powerhouse.",
    challenges: ["Starting with zero capital", "Convincing global clients", "Maintaining ethics under pressure", "Scaling a startup internationally"],
    lessons: ["Build trust before revenue", "Leadership is service", "Values create lasting organizations", "Start small, think big"],
    quote: "Your best work is ahead of you. Do not settle for where you are now.",
    mindsetTip:
      "Let your integrity guide your ambition. Strong character unlocks opportunity more than quick wins.",
  },
  {
    id: "15",
    title: "Breaking the Genetic Code",
    name: "Hargobind Khorana",
    category: "scientist",
    summary: "An Indian-born scientist whose research helped crack DNA’s message.",
    image: "🧬",
    fullStory:
      "Born in a small Punjab village, Khorana pursued science through relentless curiosity. His work on nucleic acids earned him a Nobel Prize and helped humanity understand how genes code for life.",
    challenges: ["Limited early resources", "Complex scientific puzzles", "Competition in research", "Translating fundamental science into impact"],
    lessons: ["Curiosity can change the world", "Big discoveries start with basic questions", "Persistence is the scientist’s best trait", "Knowledge grows from small experiments"],
    quote: "The gene is the basic unit of life.",
    mindsetTip:
      "Ask the questions others avoid. The answer may be the breakthrough the world needs.",
  },
  {
    id: "16",
    title: "Awakening a Generation",
    name: "Swami Vivekananda",
    category: "spiritual",
    summary: "A visionary thinker who brought Indian spirituality to the global stage.",
    image: "🕉️",
    fullStory:
      "Swami Vivekananda rose from a questioning young monk to a voice for India at the 1893 World's Parliament of Religions. His message of strength, self-belief, and unity inspired people worldwide and continues to remind seekers that spiritual courage is also social courage.",
    challenges: ["Spiritual doubt", "Cultural resistance", "Traveling far from home", "Balancing tradition with modern thought"],
    lessons: ["Strength is the essence of spirituality", "Serve humanity as worship", "Stay true to your own path", "Inspire others through action"],
    quote: "Arise, awake, and stop not till the goal is reached.",
    mindsetTip:
      "Wake up your inner power. A calm mind and brave heart make the impossible possible.",
  },
];

export const STORY_LINKS = STORIES.reduce<Record<string, string>>((map, story) => {
  map[story.name] = `/inspiration#${story.id}`;
  map[`${story.name.toLowerCase()} story`] = `/inspiration#${story.id}`;
  map[`${story.name}'s story`] = `/inspiration#${story.id}`;
  map[`the ${story.name}`] = `/inspiration#${story.id}`;
  map[`${story.name.toLowerCase()}`] = `/inspiration#${story.id}`;
  return map;
}, {});

export function replaceStoryReferences(text: string) {
  const placeholders: Record<string, string> = {};
  let result = text;

  const protect = (value: string) => {
    const token = `__LINK_PROTECTED_${Object.keys(placeholders).length}__`;
    placeholders[token] = value;
    return token;
  };

  // Preserve existing markdown links so we don't rewrite them.
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => protect(`[${label}](${url})`));

  const keys = Object.keys(STORY_LINKS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    const escaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(regex, (match) => protect(`[${match}](${STORY_LINKS[key]})`));
  }

  return result.replace(/__LINK_PROTECTED_\d+__/g, (token) => placeholders[token]);
}
