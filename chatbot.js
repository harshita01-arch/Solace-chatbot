/* =====================================================
   SOLACE — Mental Wellness Chatbot
   chatbot.js  |  MCA Final Year Project

   Architecture:
     1. Knowledge Base (KB)     — intent categories with regex patterns & responses
     2. Mood Responses          — mood-keyed response sets
     3. Fallback Responses      — generic empathetic replies when no intent matches
     4. NLP Engine              — think(), pick()
     5. Markdown Renderer       — fmt(), esc()
     6. UI Functions            — addUser(), addBot(), scroll()
     7. Event Handlers          — go(), quickSend(), mood()
     8. Textarea Auto-resize    — input event listener
     9. Boot Greeting           — initial bot message on page load
   ===================================================== */


/* =====================================================
   1. KNOWLEDGE BASE
   Each entry contains:
     id  — unique name for the intent
     pat — array of RegExp patterns to match against user input
     res — array of 3 response strings (one is picked randomly)
   ===================================================== */
const KB = [

  // ── Greeting ──────────────────────────────────────
  {
    id: 'greet',
    pat: [/^(hi|hello|hey|namaste|hlo|hii|good\s*(morning|evening|afternoon|day))\b/i],
    res: [
      "Hello there 🌿 I'm Solace, your wellness companion. How are you feeling today? You can click a mood button below or type anything on your mind.",
      "Hey, I'm really glad you're here 😊 This is a safe space — you can share anything. What's going on with you today?",
      "Hi! Welcome to Solace 🌱 I'm here to listen and support you. How are you doing right now?"
    ]
  },

  // ── Thanks ────────────────────────────────────────
  {
    id: 'thanks',
    pat: [/thank(s| you)|helpful|helped|you('re| are) (great|amazing|good)|love this|this is (good|great)/i],
    res: [
      "That means a lot 🌿 I'm really glad I could help. Remember, you don't have to carry things alone — I'm here whenever you need to talk.",
      "You're so welcome 😊 Taking care of your mental health matters. How else can I support you today?",
      "I'm happy this helped 💙 You reached out, and that takes courage. Is there anything else on your mind?"
    ]
  },

  // ── Farewell ──────────────────────────────────────
  {
    id: 'bye',
    pat: [/\b(bye|goodbye|good night|goodnight|see you|cya|take care|have to go|i('m| am) going)\b/i],
    res: [
      "Take care of yourself 🌿 Remember — small acts of self-care every day add up to big changes. Come back anytime. 💙",
      "Goodbye for now 😊 Be gentle with yourself today. You deserve kindness — especially from yourself. 🌱",
      "Wishing you peace and calm ✨ Whenever things feel heavy again, I'm right here. 💙"
    ]
  },

  // ── Anxiety ───────────────────────────────────────
  {
    id: 'anxious',
    pat: [/anxious|anxiety|panic(king)?|nervous|worr(y|ying|ied)|scared|fearful?|dread|uneasy/i],
    res: [
      "I hear you — anxiety can feel so overwhelming, like your mind won't stop racing. 💙\n\nLet's try a quick grounding exercise right now:\n\n**5-4-3-2-1 Technique:**\n- 👀 Name **5 things** you can see around you\n- 🖐 Name **4 things** you can physically touch\n- 👂 Name **3 things** you can hear\n- 👃 Name **2 things** you can smell\n- 👅 Name **1 thing** you can taste\n\nThis brings your mind back to the present moment. Try it — I'll be right here. 🌿",
      "Anxiety is your nervous system being overprotective — it means you care. Let's slow things down. 🌬️\n\n**Box Breathing (4-4-4-4):**\n1. Breathe **in** for 4 seconds\n2. **Hold** for 4 seconds\n3. Breathe **out** for 4 seconds\n4. **Hold** for 4 seconds\n\nRepeat 4 times. This signals safety to your brain. Would you like to share what's triggering the anxiety?",
      "That sounds really hard. Anxiety can be exhausting. 🫂\n\nOne thing that helps: ask yourself — *'Is this threat real right now, in this exact moment?'* Most anxiety is about the future, not the present. You are safe right now.\n\nWhat specifically is making you feel this way?"
    ]
  },

  // ── Sadness / Depression ──────────────────────────
  {
    id: 'sad',
    pat: [/\bsad|sadness|depress(ed|ing)?|unhappy|miserable|hopeless|worthless|cry(ing|ied)?|tears|heartbroken|grief|grieving|numb\b/i],
    res: [
      "I'm really sorry you're feeling this way. Sadness is valid — it's a signal that something matters to you. 💙\n\nYou don't have to be okay right now. Sometimes the most healing thing is to just *let yourself feel it* without judgment.\n\nI'm here. Would you like to tell me what happened?",
      "That heavy, hollow feeling is one of the hardest things to carry. I see you, and I want you to know — *this feeling is not permanent.* 🌱\n\n**A small act of self-care right now:**\n- Place your hand on your heart and take one slow breath\n- Say to yourself: *'I am going through something hard, and that is okay'*\n\nWhat's been weighing on your heart?",
      "Feelings of sadness can make us feel completely alone — but you're not. 🌿 Reaching out like this takes real courage.\n\nIs this sadness tied to something specific, or does it feel more like a fog that's been around for a while?"
    ]
  },

  // ── Anger / Frustration ───────────────────────────
  {
    id: 'angry',
    pat: [/angry|anger|furious|frustrat(ed|ing)?|irritat(ed|ing)?|annoyed|rage|\bmad\b|resentment|hatred/i],
    res: [
      "Anger is energy — it often shows up when something feels deeply unfair or out of our control. It's completely valid. 🔥\n\n**Quick release technique:**\n- Take a **sharp exhale** through your mouth (like blowing out a candle forcefully)\n- Repeat 3 times\n- Then take one slow, deep breath in through your nose\n\nThis helps discharge the physical tension. What happened that made you feel this way?",
      "That frustration makes total sense. Sometimes the world really *is* unfair, and anger is the right response. 💙\n\nBut carrying it weighs us down. Let's try to understand it:\n- *What exactly triggered this?*\n- *What need of yours isn't being met?*\n\nAngry feelings usually have a hurt or fear underneath them. Want to explore that together?",
      "I hear you — it sounds like something really got under your skin. Anger is your inner protector saying *'this isn't right.'*\n\n**Try this:** Say out loud exactly what made you angry in one sentence. No filter. Getting it *out* is the first step to working through it. I'm here to listen without judgment."
    ]
  },

  // ── Sleep / Insomnia / Fatigue ────────────────────
  {
    id: 'sleep',
    pat: [/\bsleep|insomnia|can'?t sleep|awake|nightmare|tired|exhausted|fatigue|\brest\b|waking up/i],
    res: [
      "Sleep struggles are so draining — especially when your body is tired but your mind won't cooperate. 🌙\n\n**Military Sleep Method (works in ~2 min):**\n1. Relax your face completely — jaw, tongue, eyes\n2. Drop your shoulders and arms like dead weight\n3. Breathe out and relax your chest\n4. Relax legs from thighs down\n5. Clear your mind for 10 seconds — imagine a calm scene\n\nAlso: no screens 30 min before bed, keep the room cool. What's keeping you up?",
      "A restless mind at night is one of the most common struggles. You're not alone. 🌿\n\n**4-7-8 Breathing (for sleep):**\n- Inhale through nose for **4** counts\n- Hold breath for **7** counts\n- Exhale completely through mouth for **8** counts\n\nRepeat 3-4 cycles. It triggers your body's rest response. Are the sleepless nights from racing thoughts or stress?",
      "Not sleeping properly affects everything — mood, focus, health. 😴\n\n**Sleep hygiene tips that actually work:**\n- ☕ No caffeine after 2 PM\n- 📱 Blue light filter after sunset\n- 🛁 Warm shower 90 min before bed (lowers core temp, signals sleep)\n- 🕙 Same sleep and wake time every day — even weekends\n\nWhat does your typical evening routine look like?"
    ]
  },

  // ── Overwhelm / Burnout / Stress ──────────────────
  {
    id: 'overwhelmed',
    pat: [/overwhelm|too much|can'?t cope|burned? out|burnt out|stressed|stress|pressure|drowning|falling apart|breaking down/i],
    res: [
      "When everything piles up at once, it's hard to even know where to begin. That's completely understandable. 💙\n\n**The 'One Thing' Method:**\nDon't think about everything. Just ask: *'What is ONE tiny thing I can do in the next 5 minutes?'*\n\nNot the most important thing. Not the urgent thing. Just *one small thing.*\n\nWhat feels most heavy right now?",
      "Overwhelm is your system saying *'I need a moment.'* Honour that. 🌿\n\n**Triage your load:**\n- 🔴 **Must do today** (max 3 things)\n- 🟡 **Can wait till tomorrow**\n- ⚪ **Can be dropped or delegated**\n\nMost things are not as urgent as they feel. *You* are more important than your to-do list. What's taking up the most mental space right now?",
      "Being burned out is real — it's not laziness, it's your nervous system waving a red flag. 🚩\n\n**Immediate reset:**\n1. Stop what you're doing\n2. Splash cold water on your face\n3. Step outside for 2 minutes of natural light\n4. Eat or drink something nourishing\n\nYour brain can't problem-solve when it's in survival mode. Once you've had a moment, we can talk through what's on your plate."
    ]
  },

  // ── Loneliness / Isolation ────────────────────────
  {
    id: 'lonely',
    pat: [/lonely|loneliness|\balone\b|isolated|no one|nobody|no friends|disconnected|left out|abandoned|rejected|unwanted/i],
    res: [
      "Loneliness is one of the most painful human experiences — and it can feel like it will last forever, even though it won't. 🌱\n\nI want you to know: the fact that you're reaching out right now shows strength. You *are* connecting, even here.\n\nIs this a situational loneliness or a deeper feeling of not belonging?",
      "Feeling lonely even when surrounded by people is sometimes the loneliest feeling of all. You don't always need more people — you need *the right connection.*\n\n**Small steps toward connection:**\n- Message one person you haven't spoken to in a while\n- Join one community around something you enjoy\n- Volunteer — giving to others is one of the fastest ways to feel less alone\n\nWhat does your social world look like right now?",
      "You matter — even when it doesn't feel that way. 💙 Loneliness lies to us; it tells us we're unwanted, but that's the feeling talking, not the truth.\n\nSometimes loneliness is a sign we've outgrown where we are, not that we're broken. Tell me more about what's going on for you."
    ]
  },

  // ── Breathing / Mindfulness / Relaxation ──────────
  {
    id: 'breathe',
    pat: [/breath(ing|e)?|\brelax\b|relaxation|meditat|mindful|calm (me|down)/i],
    res: [
      "Let's breathe together. 🌬️\n\n**Deep Belly Breathing:**\n1. Sit comfortably, hands on your belly\n2. Inhale slowly through your nose — feel your belly rise — count to **4**\n3. Hold for **2** counts\n4. Exhale slowly through your mouth — count to **6**\n5. Repeat 5-6 times\n\nThe long exhale activates your vagus nerve and triggers your body's rest response. How do you feel after trying it?",
      "Here's a simple mindfulness moment. 🧘\n\n**Body Scan (2 minutes):**\nClose your eyes. Starting from the top of your head, slowly move your attention down your body.\n- Notice any tension or tightness — without trying to change it\n- Just observe and breathe into each area\n- Forehead → jaw → neck → shoulders → chest → hands → belly → legs → feet\n\nThis gently releases stored tension. How are you feeling right now?",
      "Let's try **4-7-8 breathing** — one of the most effective techniques for instant calm:\n\n1. Empty your lungs with a big exhale 💨\n2. Inhale quietly through your nose for **4 seconds**\n3. Hold your breath for **7 seconds**\n4. Exhale completely through your mouth for **8 seconds**\n\nDo 4 cycles. Take your time. 🌿"
    ]
  },

  // ── Motivation / Affirmations ──────────────────────
  {
    id: 'motivate',
    pat: [/motivat|inspir(e|ation)?|affirmation|encourage|uplift|confidence|give up|giving up|\bquit\b|i can'?t do/i],
    res: [
      "Here's your reminder for today: ✨\n\n*'You have survived 100% of your worst days so far. That's a pretty incredible track record.'*\n\nWhatever you're facing right now — you have more capacity than you realise. You don't need to feel ready to begin. You just need to begin.\n\nWhat's one small step you can take today toward something that matters to you?",
      "Let me tell you something true: **you are further along than you think.** 🌱\n\nProgress isn't always visible. Growth happens underground before it blooms. The days where you just *held on* count too.\n\n**Today's affirmation:**\n*'I am doing the best I can with what I have, and that is enough.'*\n\nSay it out loud. What are you working toward right now?",
      "The fact that you're asking for motivation tells me you haven't given up — you just need a moment to refuel. That's not weakness. That's wisdom. 💙\n\n**3 truths to hold today:**\n1. Difficult roads lead to beautiful destinations\n2. You are not behind — you are on your own path\n3. Rest is not quitting. Rest is preparing.\n\nWhat feels hard for you right now?"
    ]
  },

  // ── Venting ───────────────────────────────────────
  {
    id: 'vent',
    pat: [/vent|talk about it|tell you something|need to say|have to say|get this off|share something/i],
    res: [
      "I'm all ears 🌿 This is a judgment-free zone — say exactly what's on your mind. Sometimes just getting it *out* is the most healing thing. Go ahead, I'm listening.",
      "Of course — vent away. 💙 You don't need to frame it perfectly or have solutions. Just say what's there. I'm here and I won't judge.",
      "I'm here for it. Sometimes we just need to be *heard*, not fixed. Take your time and share whatever's on your mind. 🌱"
    ]
  }

]; // end KB


/* =====================================================
   2. MOOD RESPONSES
   Triggered directly when a mood button is clicked.
   Keyed by mood id: great | okay | sad | anxious | angry | tired
   ===================================================== */
const MOOD_RESPONSES = {

  great: [
    "That's wonderful to hear! 😊 A good mood is worth appreciating — it's easy to rush past the good moments. What's been going well for you?",
    "Love to hear it! 🌟 When we're feeling great, it's a perfect time to build good habits or tackle something we've been putting off. What would you like to focus on today?",
    "Amazing! Happiness is contagious — even through a screen 😄 What's contributing to the good mood? Let's celebrate it!"
  ],

  okay: [
    "Okay is okay — honestly, most days are 'okay' days, and that's perfectly fine 🌿 Is there anything you'd like to feel a little better about today?",
    "That's valid. Sometimes 'okay' just means you're steady, and steady is actually a win 😊 Is there anything on your mind you'd like to explore?",
    "Okay is a good starting point 🌱 Is there anything I can do to help shift today from 'okay' to a little bit brighter?"
  ],

  sad: [
    "I'm sorry you're feeling sad 💙 Sadness is valid — it means something matters to you. You don't have to be okay right now. I'm here. Would you like to tell me what happened?",
    "That heavy feeling is hard to carry. I see you. 🌿 What's been weighing on your heart?",
    "Thank you for telling me. Sadness is a part of being human, and it won't last forever. 🌱 Would you like to talk about what's going on?"
  ],

  anxious: [
    "I hear you — anxiety can feel so overwhelming. 💙\n\nLet's try the **5-4-3-2-1 grounding technique**: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This brings your mind back to the present. Try it — I'll be right here. 🌿",
    "Anxiety is your nervous system being overprotective. Let's slow things down with **box breathing**: breathe in 4 counts → hold 4 → out 4 → hold 4. Repeat 4 times. It signals safety to your brain. 🌬️\n\nWhat's triggering the anxiety?",
    "That sounds really hard. 🫂 Ask yourself: *'Is this threat real right now, in this exact moment?'* Most anxiety is about the future, not the present. You are safe right now."
  ],

  angry: [
    "I hear that you're angry. 🔥 That feeling is valid — it often means something feels deeply unfair.\n\n**Quick release:** Take a sharp exhale through your mouth 3 times, then one slow breath in. This discharges the physical tension.\n\nWhat happened?",
    "Anger is your inner protector saying 'this isn't right.' 💙 Carrying it weighs us down though. What exactly triggered this?",
    "Frustration is exhausting. I'm here to listen without judgment. 🌿 Say what happened — no filter."
  ],

  tired: [
    "Being tired affects everything — mood, patience, focus. Your body is asking for rest. 🌙\n\n**Tonight, try:** Warm shower 90 min before bed, no screens 30 min before, room cool and dark. Your body deserves recovery. What's been draining you?",
    "Exhaustion can be physical *and* emotional. Are you getting enough sleep, or does it feel like a deeper tiredness — like you're emotionally drained too? 💙",
    "Rest is not weakness — it's maintenance. 🌿 Sometimes tired is a signal to slow down and ask: *what am I carrying that I could put down, even temporarily?*"
  ]

}; // end MOOD_RESPONSES


/* =====================================================
   3. FALLBACK RESPONSES
   Used when no intent pattern matches the user's input.
   ===================================================== */
const FALLBACK = [
  "I hear you. Sometimes things are hard to put into words, and that's okay. 💙 Can you tell me a little more about how you're feeling right now?",
  "Thank you for sharing that with me 🌿 I want to make sure I understand what you're going through. Could you tell me more about what's on your mind?",
  "I'm here with you. Whatever you're experiencing right now, you don't have to face it alone. 💙 Would you like to talk about what's been happening?",
  "That sounds like a lot to carry. 🌱 I'd love to understand more so I can be genuinely helpful. What would you most like support with right now?",
  "You've come to the right place to just *be* — no pressure, no judgment. What's weighing on you today? 💙"
];


/* =====================================================
   4. NLP ENGINE
   ===================================================== */

/**
 * think(input)
 * Core intent-classification function.
 * Iterates through KB in order, testing each regex pattern
 * against the user input. Returns a random response string
 * from the first matching intent, or a fallback if none match.
 *
 * @param {string} input - Raw user text (lowercase from caller)
 * @returns {string} - Response text
 */
function think(input) {
  for (const category of KB) {
    // Test every pattern in this category
    if (category.pat.some(pattern => pattern.test(input))) {
      return pick(category.res); // Match found
    }
  }
  // No intent matched — return a fallback
  return pick(FALLBACK);
}

/**
 * pick(arr)
 * Returns a random element from an array.
 * Used to select a response from the matched category's
 * response pool, preventing repetitive replies.
 *
 * @param {Array} arr - Array of strings
 * @returns {string}
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


/* =====================================================
   5. MARKDOWN RENDERER
   ===================================================== */

/**
 * fmt(text)
 * Converts a subset of Markdown to safe HTML.
 * Supported: **bold**, *italic*, \n\n paragraphs, \n line breaks.
 *
 * @param {string} text - Raw response string
 * @returns {string} - HTML string wrapped in <p> tags
 */
function fmt(text) {
  let h = esc(text);                                     // 1. Escape HTML entities
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); // 2. **bold**
  h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');             // 3. *italic*
  h = h.replace(/\n\n/g, '</p><p>');                      // 4. Double newline → paragraph
  h = h.replace(/\n/g, '<br>');                           // 5. Single newline → line break
  return `<p>${h}</p>`;                                   // 6. Wrap in paragraph tag
}

/**
 * esc(s)
 * Escapes HTML special characters to prevent XSS injection.
 *
 * @param {string} s - Raw string
 * @returns {string} - HTML-safe string
 */
function esc(s) {
  return s
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;');
}


/* =====================================================
   6. UI FUNCTIONS
   ===================================================== */

// Global busy flag — prevents sending while a response is pending
let busy = false;

/**
 * addUser(text)
 * Renders a user message bubble in the feed.
 * Also removes the welcome screen and hides the chips
 * after the first user interaction.
 *
 * @param {string} text - User's message
 */
function addUser(text) {
  // Remove welcome screen on first interaction
  const welcome = document.getElementById('welcome');
  if (welcome) {
    welcome.remove();
    document.getElementById('chips').style.display = 'none';
  }

  const feed = document.getElementById('feed');
  const row = document.createElement('div');
  row.className = 'row user';
  row.innerHTML = `
    <div class="av user">U</div>
    <div class="bub">${fmt(text)}</div>
  `;
  feed.appendChild(row);
  scroll();
}

/**
 * addBot(text, delay)
 * Renders a bot message bubble with a realistic typing delay.
 * Shows animated typing dots first, then replaces with the
 * actual response after the delay. Re-enables the input
 * after the response appears.
 *
 * @param {string} text  - Bot's response text
 * @param {number} delay - Base delay in milliseconds (default 850)
 */
function addBot(text, delay) {
  delay = delay || 850;
  const feed = document.getElementById('feed');

  // Step 1: Insert typing indicator
  const typer = document.createElement('div');
  typer.className = 'row bot';
  typer.id = 'typer';
  typer.innerHTML = `
    <div class="av bot">✦</div>
    <div class="bub">
      <div class="dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  feed.appendChild(typer);
  scroll();

  // Step 2: After delay, replace typing indicator with actual response
  // Adding Math.random() * 300 makes each response feel uniquely timed
  setTimeout(() => {
    document.getElementById('typer').remove();

    const row = document.createElement('div');
    row.className = 'row bot';
    row.innerHTML = `
      <div class="av bot">✦</div>
      <div class="bub">${fmt(text)}</div>
    `;
    feed.appendChild(row);
    scroll();

    // Re-enable input
    busy = false;
    document.getElementById('send').disabled =
      !document.getElementById('msg').value.trim();

  }, delay + Math.random() * 300);
}

/**
 * scroll()
 * Smoothly scrolls the feed to the bottom after a short delay
 * to allow the DOM to update before measuring scroll height.
 */
function scroll() {
  const feed = document.getElementById('feed');
  setTimeout(() => { feed.scrollTop = feed.scrollHeight; }, 60);
}


/* =====================================================
   7. EVENT HANDLERS
   ===================================================== */

/**
 * go()
 * Main send handler. Called when the send button is clicked
 * or Enter is pressed. Reads the textarea, sends the message,
 * runs it through the NLP engine, and shows the bot response.
 */
function go() {
  const textarea = document.getElementById('msg');
  const text = textarea.value.trim();

  // Guard: do nothing if input empty or bot is still responding
  if (!text || busy) return;

  busy = true;
  document.getElementById('send').disabled = true;

  // Clear textarea and reset height
  textarea.value = '';
  textarea.style.height = 'auto';

  // Render user message and bot response
  addUser(text);
  addBot(think(text)); // NLP engine called here
}

/**
 * quickSend(chip)
 * Called when a topic chip is clicked.
 * Strips the emoji prefix from the chip label and sends
 * the remaining text as a user message.
 *
 * @param {HTMLElement} chip - The clicked chip element
 */
function quickSend(chip) {
  // Remove leading emoji + space (e.g., "😟 I feel anxious" → "I feel anxious")
  const text = chip.textContent.replace(/^\S+\s/, '').trim();
  document.getElementById('msg').value = text;
  go();
}

/**
 * mood(btn, key)
 * Called when a mood button is clicked.
 * Marks the button as active, shows the mood as a user message,
 * and fetches a mood-specific response directly from MOOD_RESPONSES
 * (bypasses the NLP text matcher).
 *
 * @param {HTMLElement} btn - The clicked mood button
 * @param {string} key      - Mood key (great|okay|sad|anxious|angry|tired)
 */
function mood(btn, key) {
  // Deselect all mood buttons, then select this one
  document.querySelectorAll('.mbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');

  const label = btn.textContent.trim();
  addUser('My mood: ' + label);

  busy = true;
  document.getElementById('send').disabled = true;

  // Use mood-specific responses, fall back to general fallback if key unknown
  addBot(pick(MOOD_RESPONSES[key] || FALLBACK));
}


/* =====================================================
   8. TEXTAREA AUTO-RESIZE
   Expands the textarea as the user types, up to max-height.
   ===================================================== */
const textarea = document.getElementById('msg');

textarea.addEventListener('input', () => {
  // Reset height first so scrollHeight reflects actual content
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 110) + 'px';

  // Enable send button only if there's content and bot is not busy
  document.getElementById('send').disabled =
    !textarea.value.trim() || busy;
});

// Send on Enter (without Shift)
textarea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!document.getElementById('send').disabled) go();
  }
});


/* =====================================================
   9. BOOT GREETING
   Sends the initial greeting from Solace when the page loads.
   A 500ms delay allows the page animations to complete first.
   ===================================================== */
setTimeout(() => {
  addBot(
    "Hello 🌿 I'm Solace — a calm space to talk about how you're feeling. " +
    "You can type anything, click a topic above, or choose your mood below. " +
    "I'm here, and I'm listening.",
    700
  );
}, 500);
