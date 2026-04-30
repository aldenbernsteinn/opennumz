// COGS 10 — Exam 1: Lectures 2-8
// Doc groups map question sections to their relevant lecture PDFs

var QUIZ_DOC_GROUPS = {
  'q1': [
    'L2_Things That Make Us Smart \u2014 Part 1.pdf',
    'L2 _ TTMUS \u2014 CH1 \u2014 Human Centered Technology _ COGS 10 - Cognitv Consequence_Technology - Fox [SP26] _ Perusall.pdf',
    'L3_Things That Make Us Smart \u2014 Part 2.pdf',
    'L3 _ TTMUS \u2014 CH10 \u2014 Technology is Not Neutral _ COGS 10 - Cognitv Consequence_Technology - Fox [SP26] _ Perusall.pdf',
    'L3 _ TTMUS \u2014 CH2 \u2014 Experiencing The World _ COGS 10 - Cognitv Consequence_Technology - Fox [SP26] _ Perusall.pdf'
  ],
  'q2': [
    'L4_The Power of Representation.pdf',
    'L4 _ TTMUS \u2014 CH3 \u2014 The Power of Representation _ COGS 10 - Cognitv Consequence_Technology - Fox [SP26] _ Perusall.pdf'
  ],
  'q3': [
    'L5_Affordances \u2014 Part 1.pdf',
    'L5 _ DOET \u2014 CH1 \u2014 The Psychopathology of Everyday Things _ COGS 10 - Cognitv Consequence_Technology - Fox [SP26] _ Perusall.pdf',
    'L6 _ Davis Chouinard (2016) \u2014 Theorizing Affordances _ COGS 10 - Cognitv Consequence_Technology - Fox [SP26] _ Perusall.pdf'
  ],
  'q4': [
    'L7 _ Mayer \u2014 Multimedia Learning _ COGS 10 - Cognitv Consequence_Technology - Fox [SP26] _ Perusall.pdf',
    'L8 _ Dunlosky \u2014 Learning Techniques _ COGS 10 - Cognitv Consequence_Technology - Fox [SP26] _ Perusall.pdf'
  ]
};

var QUIZ_QUESTIONS = [

// ═══════════════════════════════════════════════════════
// Lectures 2 & 3: Human-Centered Tech & Modes of Thought
// ═══════════════════════════════════════════════════════

// SA Questions (1-5)
{id:1,tier:"red",type:"sa",docs:"q1",
q:"According to Norman, what is the difference between a technology that makes us \"smart\" and one that makes us \"dumb\"? Provide an example of a \"dumb\" technology.",
answer:"A \"smart\" technology (cognitive artifact) complements human abilities, enhances our memory or reasoning, and fits how the human mind naturally works. A \"dumb\" technology traps us with artificial complexity, forces humans to act like machines, or replaces active thought with passive consumption. An example of a \"dumb\" technology is broadcast television, which provides vicarious experience but requires no active, reflective problem-solving.",
reason:"A \"smart\" technology (cognitive artifact) complements human abilities, enhances our memory or reasoning, and fits how the human mind naturally works. A \"dumb\" technology traps us with artificial complexity, forces humans to act like machines, or replaces active thought with passive consumption. An example of a \"dumb\" technology is broadcast television, which provides vicarious experience but requires no active, reflective problem-solving."},

{id:2,tier:"red",type:"sa",docs:"q1",
q:"Define \"context specificity\" and explain why a technology cannot be universally labeled as \"good\" or \"bad.\"",
answer:"Context specificity means the cognitive impact of a technology depends entirely on who uses it, for what task, and when. A tool is never universally good; for example, a calculator is an excellent cognitive aid for an engineer doing complex modeling, but it is a harmful shortcut for a primary school student who needs to build foundational mental arithmetic skills.",
reason:"Context specificity means the cognitive impact of a technology depends entirely on who uses it, for what task, and when. A tool is never universally good; for example, a calculator is an excellent cognitive aid for an engineer doing complex modeling, but it is a harmful shortcut for a primary school student who needs to build foundational mental arithmetic skills."},

{id:3,tier:"red",type:"sa",docs:"q1",
q:"Identify three of Norman's \"spheres of influence\" and evaluate the impact of a primary school student using a calculator across those three levels.",
answer:"1. Immediate task: The calculator successfully offloads working memory, helping the student pass today's test. 2. Long-term task: It harms the student by preventing the development of internal mental math and retrieval skills. 3. Society: If adopted universally, it alters educational standards and lowers the baseline mathematical literacy of society.",
reason:"1. Immediate task: The calculator successfully offloads working memory, helping the student pass today's test. 2. Long-term task: It harms the student by preventing the development of internal mental math and retrieval skills. 3. Society: If adopted universally, it alters educational standards and lowers the baseline mathematical literacy of society."},

{id:4,tier:"red",type:"sa",docs:"q1",
q:"Define experiential and reflective cognition. Why are both necessary?",
answer:"Experiential cognition is rapid, effortless, and reactive, driven by perceptual patterns (like playing a sport or driving). Reflective cognition is slow, laborious, and involves conscious comparison and decision-making (like writing an essay or learning calculus). Both are essential: experiential is required for skilled, real-time performance and survival, while reflective is required for deep learning, restructuring knowledge, and inventing.",
reason:"Experiential cognition is rapid, effortless, and reactive, driven by perceptual patterns (like playing a sport or driving). Reflective cognition is slow, laborious, and involves conscious comparison and decision-making (like writing an essay or learning calculus). Both are essential: experiential is required for skilled, real-time performance and survival, while reflective is required for deep learning, restructuring knowledge, and inventing."},

{id:5,tier:"red",type:"sa",docs:"q1",
q:"Provide an example of experiencing when we should be reflecting, and reflecting when we should be experiencing.",
answer:"Experiencing instead of Reflecting: Mindlessly watching an educational documentary as visual entertainment without stopping to critically analyze or question the arguments. Reflecting instead of Experiencing: A pilot trying to read a complex digital numerical display during a sudden engine failure, forcing slow, laborious thought when immediate, reactive action is required.",
reason:"Experiencing instead of Reflecting: Mindlessly watching an educational documentary as visual entertainment without stopping to critically analyze or question the arguments. Reflecting instead of Experiencing: A pilot trying to read a complex digital numerical display during a sudden engine failure, forcing slow, laborious thought when immediate, reactive action is required."},

// MCQ Questions (6-16)
{id:6,tier:"yellow",docs:"q1",
q:"Which of the following is strictly an example of general technology rather than cognitive technology?",
opts:["The English language","A calculator","A plow","A notebook"],ans:2,
reason:"Donald Norman splits technology into two buckets. General technology expands our physical muscles (like a plow for digging). Cognitive technology expands our mental muscles. As Norman writes in Chapter 1, cognitive artifacts are \"devices that expand our capabilities. We invent things that make us smart.\" Language, calculators, and notebooks all hold or process information for our brains. A plow just moves dirt."},

{id:7,tier:"yellow",docs:"q1",
q:"Which of the following is an example of cognitive technology?",
opts:["An airplane","A wheel","A hammer","Calculus"],ans:3,
reason:"Following the rule above, airplanes, wheels, and hammers enhance physical travel and force. Calculus is a mental framework. Norman explicitly cheers for \"the development of logic, the invention of encyclopedias and textbooks\" as prime examples of cognitive tools that structure how we think."},

{id:8,tier:"yellow",docs:"q1",
q:"Which of the following is considered an \"abstract\" cognitive technology?",
opts:["Logic","A pen","A computer","A textbook"],ans:0,
reason:"Cognitive tech can be physical (a computer) or abstract (rules in your head). Logic and math are abstract because they don\u2019t have a physical body; their power exists entirely in the structural rules we use to process information."},

{id:9,tier:"orange",docs:"q1",
q:"True/False: Which statement regarding modes of cognition is TRUE?",
opts:["Decision-making is inherently reflective and can never become experiential.","Any cognitive activity can be performed in either mode depending on the context and user expertise.","Perceiving is inherently reflective."],ans:1,
reason:"Norman defines two modes of thinking: Experiential (fast, reactive, instinctual) and Reflective (slow, deep, analytical). Crucially, these are not fixed to specific tasks. They describe how you do the task. A beginner driver uses slow, reflective thought just to turn the steering wheel. A racecar driver steers using fast, experiential thought. It\u2019s about your level of expertise, not the task itself."},

{id:10,tier:"yellow",docs:"q1",
q:"Norman claims that experiential cognition is most critical in situations such as:",
opts:["Writing an essay","Solving a new math equation","Playing sports","Comparing two political arguments"],ans:2,
reason:"Experiential thought is your fast-twitch brain. Norman writes in Chapter 2: \"Experiential thought is essential to skilled performance: It comes rapidly, effortlessly, without the need for planning or problem solving.\" Sports require this exact type of rapid, thoughtless reaction."},

{id:11,tier:"orange",docs:"q1",
q:"Which of the following represents a dangerous mismatch between task demands and cognitive mode?",
opts:["Using reflective thought to write a novel.","Using experiential thought to react to a sudden car swerving into your lane.","Reflecting during an emergency requiring rapid action."],ans:2,
reason:"If you are in an emergency, you need fast, experiential reactions. If a dashboard interface forces you to read numbers, calculate, and reflect before you can act, you will crash. You are trapped in a slow mode when the task demands a fast mode."},

{id:12,tier:"yellow",docs:"q1",
q:"Which is an example of a useful pairing between mode and task?",
opts:["Reflective mode for writing an essay.","Experiential mode for learning calculus.","Reflective mode for playing ping-pong."],ans:0,
reason:"Writing an essay requires comparison, outlining, and deep decision-making. This perfectly matches the slow, deliberate nature of the reflective mode."},

{id:13,tier:"orange",docs:"q1",
q:"Which design approach treats humans like unreliable components, emphasizes strict mechanical efficiency, and blames \"human error\" for accidents?",
opts:["Human-centered design","Machine-centered design","Affordance-based design"],ans:1,
reason:"In Chapter 10, Norman attacks systems that force humans to act like programmable robots. He writes we have \"elevated mechanical, machine-centered modes of thought to the undeserved status of a model for people to emulate.\" When a system is designed for a machine\u2019s perfection rather than a human\u2019s natural behavior, any mistake is unfairly blamed on \"human error.\""},

{id:14,tier:"orange",docs:"q1",
q:"Why does Norman argue that human \"distractibility\" should sometimes be seen as a strength?",
opts:["It prevents cognitive overload.","It allows humans to notice and respond to new, unexpected events in the environment."],ans:1,
reason:"Machines focus perfectly on one task, which is great until the building catches fire and the machine ignores it. Humans are easily distracted, which in a \"human-centered\" view is actually an evolutionary superpower. It means we are constantly scanning our environment and can adapt to sudden changes."},

{id:15,tier:"green",docs:"q1",
q:"If a student uses a calculator on a math test, which sphere of influence relates to their ability to pass the test that day?",
opts:["Immediate task performance","Longer-term task performance","Society"],ans:0,
reason:"When evaluating if a technology is \"good,\" we have to look at different spheres (levels) of time and scale. The \"immediate task\" sphere only cares about the exact moment of use. Right now, during this hour, the calculator helps the student get the right answers."},

{id:16,tier:"green",docs:"q1",
q:"Over time, the student fails to develop mental arithmetic skills. Which sphere of influence does this describe?",
opts:["Immediate task performance","Longer-term task performance","Society"],ans:1,
reason:"This evaluates the user over a timeline. While the tech helped in the immediate moment, relying on it for years caused their internal biological skill (mental math) to atrophy."},

// ═══════════════════════════════════════════
// Lecture 4: The Power of Representation
// ═══════════════════════════════════════════

// SA Question (17)
{id:17,tier:"red",type:"sa",docs:"q2",
q:"Using the context of driving, identify external representations that support experiential thinking, reflective thinking, and one that causes a dangerous mismatch.",
answer:"Experiential: A traditional analog speedometer dial allows the driver to perceive their speed instantly via the angle of the needle without reading numbers. Reflective: A GPS displaying a text list of upcoming street names and exact distances requires the driver to consciously read and plan. Mismatched: A dashboard that flashes exact decimal numbers for tire-pressure during a blowout forces the driver to read and calculate (reflect) rather than physically react to the emergency (experience).",
reason:"Experiential: A traditional analog speedometer dial allows the driver to perceive their speed instantly via the angle of the needle without reading numbers. Reflective: A GPS displaying a text list of upcoming street names and exact distances requires the driver to consciously read and plan. Mismatched: A dashboard that flashes exact decimal numbers for tire-pressure during a blowout forces the driver to read and calculate (reflect) rather than physically react to the emergency (experience)."},

// MCQ Questions (18-24)
{id:18,tier:"orange",docs:"q2",
q:"Why is ticktacktoe easier for humans to play than the game of \"15\", even though they are mathematically identical?",
opts:["Ticktacktoe requires reflective thought.","Ticktacktoe uses spatial/visual representation that can be processed experientially."],ans:1,
reason:"The game of 15 is a math puzzle where you pick numbers that add to 15. It requires holding numbers in your head (slow, reflective). Ticktacktoe is the exact same game mathematically, but the grid turns it into a visual pattern. Humans process visual patterns experientially (instantly, without math), making it vastly easier."},

{id:19,tier:"yellow",docs:"q2",
q:"According to Norman, what is the primary benefit of using external aids like paper, pencil, and writing?",
opts:["They replace the need for experiential thought.","They enhance cognitive abilities by overcoming the biological constraints of memory, thought, and reasoning."],ans:1,
reason:"Norman writes in Chapter 3: \"The power of the unaided mind is highly overrated. Without external aids, memory, thought, and reasoning are all constrained.\" We offload our memory onto paper so our brain has more free space to actually process ideas."},

{id:20,tier:"yellow",docs:"q2",
q:"In triadic semiotics, what term describes the actual \"concept or thing in the world\"?",
opts:["Referent (sign-object)","Representation (sign-vehicle)","Interpretant (sign-mind)"],ans:0,
reason:"The referent is the actual, physical reality. If you see a map of a city, the real concrete streets and buildings are the referent."},

{id:21,tier:"yellow",docs:"q2",
q:"Which component is the external physical thing doing the referring (like an icon on a screen)?",
opts:["Referent","Representation (sign-vehicle)","Interpretant"],ans:1,
reason:"This is the tool carrying the message. The ink on the paper, the pixels making the hamburger menu icon, or the lines drawing the map. It represents the real world."},

{id:22,tier:"yellow",docs:"q2",
q:"Which component describes the internal understanding within the user's mind?",
opts:["Referent","Representation","Interpretant (sign-mind)"],ans:2,
reason:"This is what happens inside your head. You look at the Representation (a red octagon), and your Interpretant translates that to the concept of \"Stop!\""},

{id:23,tier:"green",docs:"q2",
q:"Text uses symbolic characters. A graph uses spatial position. What does a photograph use?",
opts:["Spatial modality","Iconic/naturalistic images","Symbolic logic"],ans:1,
reason:"This asks how the medium encodes data. Text uses abstract symbols (letters) that you have to learn. A photo uses iconic mapping\u2014it literally looks exactly like the natural thing it is capturing."},

// ═══════════════════════════════════════════
// Lectures 5 & 6: Affordances & Mechanisms
// ═══════════════════════════════════════════

// SA Questions (24-26)
{id:24,tier:"red",type:"sa",docs:"q3",
q:"Explain how users might discover unintended affordances, and how designers use signifiers to correct this.",
answer:"Because affordances are relational (based on the physical capabilities of the user), a user might interact with an object in ways the designer never intended\u2014such as using a heavy book to prop open a door. To prevent misuse or confusion, designers must add signifiers (like a \"Push\" label or a specific handle shape) to explicitly communicate where and how the intended action should take place.",
reason:"Because affordances are relational (based on the physical capabilities of the user), a user might interact with an object in ways the designer never intended\u2014such as using a heavy book to prop open a door. To prevent misuse or confusion, designers must add signifiers (like a \"Push\" label or a specific handle shape) to explicitly communicate where and how the intended action should take place."},

{id:25,tier:"red",type:"sa",docs:"q3",
q:"Explain the design flaw of \"ambiguous mapping\" using a door as an example.",
answer:"Ambiguous mapping occurs when signifiers are contradictory, missing, or map poorly to the required action. A classic example is a door that must be pulled to open, but has identical flat push-plates on both sides. It gives the user false perceptual cues, making it impossible to know how to operate it experientially.",
reason:"Ambiguous mapping occurs when signifiers are contradictory, missing, or map poorly to the required action. A classic example is a door that must be pulled to open, but has identical flat push-plates on both sides. It gives the user false perceptual cues, making it impossible to know how to operate it experientially."},

{id:26,tier:"red",type:"sa",docs:"q3",
q:"According to Davis and Chouinard's mechanisms of affordance, what is the difference between an artifact that \"requests\" an action and one that \"demands\" it?",
answer:"Affordances exist on a spectrum of force. A request encourages a behavior but allows the user to easily bypass it (e.g., a speed bump requests that you slow down). A demand strictly conditions use on a specific action and cannot be bypassed (e.g., a software program that demands you check a \"Terms of Service\" box before the \"Install\" button becomes clickable).",
reason:"Affordances exist on a spectrum of force. A request encourages a behavior but allows the user to easily bypass it (e.g., a speed bump requests that you slow down). A demand strictly conditions use on a specific action and cannot be bypassed (e.g., a software program that demands you check a \"Terms of Service\" box before the \"Install\" button becomes clickable)."},

// MCQ Questions (27-37)
{id:27,tier:"yellow",docs:"q3",
q:"According to Norman, what is an affordance?",
opts:["A label that tells you how to use a tool.","A relationship between an object's properties and the capabilities of the agent interacting with it."],ans:1,
reason:"Affordances are not static properties. A heavy set of stairs affords \"climbing\" to an adult, but it does not afford climbing to a crawling baby. The affordance depends entirely on the relationship between the object and the specific user\u2019s body."},

{id:28,tier:"orange",docs:"q3",
q:"Norman distinguishes between affordances and signifiers because:",
opts:["Signifiers define actions; affordances communicate them.","Affordances define possible actions; signifiers communicate where actions should occur."],ans:1,
reason:"The screen of your phone affords touching anywhere. But the little blue button signifies exactly where you are supposed to touch to send a text."},

{id:29,tier:"yellow",docs:"q3",
q:"What does Norman call the property that specifically communicates where an action should take place?",
opts:["Affordance","Signifier","Referent"],ans:1,
reason:"See above. A signifier signifies the correct action."},

{id:30,tier:"orange",docs:"q3",
q:"A smartphone app uses the same swipe gesture to \"delete\" and \"save\" messages, depending on context. Which design problem does this illustrate?",
opts:["Ambiguous mapping","A false affordance","A hidden affordance"],ans:0,
reason:"Mapping is how a control connects to a result (like steering right to turn the car right). If swiping left sometimes deletes, and sometimes saves, the map is broken and ambiguous. The user can\u2019t build a reliable mental model."},

{id:31,tier:"yellow",docs:"q3",
q:"Which of the following represents POOR design according to Norman's principles?",
opts:["A door with a flat push plate on the side that must be pushed.","A door with identical handles on both sides, but one side must be pushed and the other pulled."],ans:1,
reason:"Norman opens The Design of Everyday Things complaining about doors. If a door has a grab-handle, your brain experientially wants to pull it. If the designer puts grab-handles on both sides, but one side must be pushed, they have given you a false signifier."},

{id:32,tier:"orange",docs:"q3",
q:"True or False: According to Davis and Chouinard, affordances are static properties of objects that do not depend on users or context.",
opts:["True","False"],ans:1,
reason:"The core of their paper is that affordances are dynamic, relational, and heavily dependent on the social context and physical dexterity of the specific user."},

{id:33,tier:"orange",docs:"q3",
q:"A dating app limits messages to preset emojis instead of typed text. This most likely ___ expressive communication.",
opts:["Demands","Discourages","Refuses"],ans:1,
reason:"It doesn\u2019t absolutely refuse expression (you could theoretically use 50 emojis to tell a complex story), but the design makes it incredibly frustrating and difficult, heavily discouraging that behavior."},

{id:34,tier:"orange",docs:"q3",
q:"Which example best illustrates a \"demand\" rather than a \"request\"?",
opts:["A speed bump slowing traffic.","Facebook requiring users to select a gender category before registration can proceed."],ans:1,
reason:"A request asks for a behavior, but leaves a loophole (you can speed over a bump if you don\u2019t care about your suspension). A demand is an absolute hard stop. The software literally will not let you create the account without checking the box."},

{id:35,tier:"yellow",docs:"q3",
q:"A car completely fails to start without the proper key fob. This artifact is using which mechanism?",
opts:["Refuse","Discourage","Demand"],ans:0,
reason:"The system explicitly denies a capability to the user. It refuses the action of starting the engine."},

{id:36,tier:"green",docs:"q3",
q:"A speed bump on a residential street is an example of a:",
opts:["Refusal","Demand","Request"],ans:2,
reason:"The physical design of the bump requests that you slow down for safety, but the physical capability to speed over it still exists."},

// ═══════════════════════════════════════════
// Lectures 7 & 8: Multimedia & Learning
// ═══════════════════════════════════════════

// SA Questions (37-39)
{id:37,tier:"red",type:"sa",docs:"q4",
q:"How would a designer apply Mayer's Coherence and Segmenting principles to improve an educational video?",
answer:"The Coherence principle states that learning improves when extraneous material is excluded; the designer must remove all unnecessary background music, decorative animations, and tangent facts. The Segmenting principle states that learners need control over pacing; the designer must break the long video into shorter chunks, requiring the user to click \"continue\" before advancing to prevent cognitive overload.",
reason:"The Coherence principle states that learning improves when extraneous material is excluded; the designer must remove all unnecessary background music, decorative animations, and tangent facts. The Segmenting principle states that learners need control over pacing; the designer must break the long video into shorter chunks, requiring the user to click \"continue\" before advancing to prevent cognitive overload."},

{id:38,tier:"red",type:"sa",docs:"q4",
q:"Distinguish between rote learning and meaningful learning.",
answer:"Rote learning is memorizing facts just well enough to recall them on a test, but failing to apply them to new contexts. Meaningful learning is understanding the underlying concepts deeply enough to successfully apply that knowledge to novel, unseen problems.",
reason:"Rote learning is memorizing facts just well enough to recall them on a test, but failing to apply them to new contexts. Meaningful learning is understanding the underlying concepts deeply enough to successfully apply that knowledge to novel, unseen problems."},

{id:39,tier:"red",type:"sa",docs:"q4",
q:"Based on Dunlosky's framework, why is \"practice testing\" highly effective while \"highlighting\" has low utility?",
answer:"Practice testing is highly effective because it forces the brain to actively retrieve information from memory, which physically strengthens long-term memory traces and aids in reconstruction. Highlighting is a passive activity that only increases surface-level familiarity with the text; it creates a false illusion of competence without requiring any deep cognitive processing.",
reason:"Practice testing is highly effective because it forces the brain to actively retrieve information from memory, which physically strengthens long-term memory traces and aids in reconstruction. Highlighting is a passive activity that only increases surface-level familiarity with the text; it creates a false illusion of competence without requiring any deep cognitive processing."},

// MCQ Questions (40-50)
{id:40,tier:"yellow",docs:"q4",
q:"A narrated animation is divided into short, user-controlled segments that learners can pause between. Which principle is illustrated?",
opts:["Coherence principle","Segmenting principle","Split-attention principle"],ans:1,
reason:"Human working memory gets overwhelmed easily. The \"Segmenting Principle\" proves that chopping a long video into short chunks (segments) that the user must click through significantly improves learning because it prevents cognitive overload."},

{id:41,tier:"yellow",docs:"q4",
q:"A narrated animation presents material in long, uninterrupted sequences without pause controls. This violates the:",
opts:["Segmenting principle","Coherence principle"],ans:0,
reason:"This is the exact opposite of the previous question. Forcing a student to watch a 20-minute video without a pause button overloads their memory."},

{id:42,tier:"yellow",docs:"q4",
q:"A diagram places labels far from the parts they describe, forcing learners to look back and forth. Which principle addresses this issue?",
opts:["Segmenting principle","Split-attention (Spatial contiguity) principle"],ans:1,
reason:"\"Spatial contiguity\" means things are physically next to each other. If the picture of the heart is on page 1, and the labels are on page 2, the student\u2019s attention is split. They waste brainpower just trying to match the text to the image."},

{id:43,tier:"yellow",docs:"q4",
q:"A lesson adds background music and decorative spinning animations unrelated to the core content. Which principle does this violate?",
opts:["Multimedia principle","Coherence principle"],ans:1,
reason:"\"Coherence\" in Mayer\u2019s world means staying strictly on-topic. You might think background music makes a video \"fun,\" but Mayer\u2019s data proves that any extraneous sights or sounds distract the brain and hurt learning. Keep it clean and coherent."},

{id:44,tier:"green",docs:"q4",
q:"Learners benefit when cues highlight important information and structure. This is known as the:",
opts:["Signaling principle","Segmenting principle"],ans:0,
reason:"Adding an arrow pointing to a diagram, or bolding a key vocabulary word, acts as a \"signal\" to the brain telling it exactly what is important."},

{id:45,tier:"green",docs:"q4",
q:"A learner remembers the content and successfully applies it to new, unseen problems. Mayer defines this as:",
opts:["Rote learning","Meaningful learning"],ans:1,
reason:"If you actually understand how a formula works well enough to solve a problem you\u2019ve never seen before, you have achieved deep, meaningful learning."},

{id:46,tier:"green",docs:"q4",
q:"A learner remembers the facts for a test but cannot use them in new contexts. This is defined as:",
opts:["Meaningful learning","Rote learning"],ans:1,
reason:"Rote learning is simple memorization. You can spit the definition back out onto the test paper, but you don\u2019t actually understand the concept."},

{id:47,tier:"orange",docs:"q4",
q:"A student writes brief summaries of each lecture and tests themselves later in the week. Which combination of techniques are they using?",
opts:["Summarization and Practice Testing (with spaced retrieval)","Highlighting and Interleaved practice"],ans:0,
reason:"Writing summaries is \"Summarization.\" Taking a quiz later in the week covers both \"Practice testing\" (forcing the brain to pull data out) and \"spaced retrieval\" (putting a time delay between learning and testing)."},

{id:48,tier:"orange",docs:"q4",
q:"Which statement best summarizes why distributed practice enhances long-term retention?",
opts:["It makes the text easier to read visually.","It inserts delays that require the brain to engage in retrieval and reconstruction, strengthening memory over time."],ans:1,
reason:"Cramming the night before works for exactly one day because the information is just floating in short-term memory. \"Distributed practice\" (studying a little bit every two days) forces your brain to slightly forget the material, and then work hard to retrieve it. That physical effort of retrieval is what carves a permanent memory pathway."},

{id:49,tier:"orange",docs:"q4",
q:"What does Dunlosky suggest about the effectiveness of highlighting and underlining for complex conceptual texts?",
opts:["High effectiveness, because it builds deep semantic networks.","Low effectiveness, because learners often mark text without actually processing its meaning."],ans:1,
reason:"Highlighting is a trap. It makes you feel productive. But Dunlosky found it\u2019s a passive activity\u2014you are just painting a page yellow. It creates a false sense of familiarity, but you aren\u2019t actually forcing your brain to process the concepts."},

{id:50,tier:"yellow",docs:"q4",
q:"The term \"generalizability variables\" refers to:",
opts:["A student's ability to generalize a concept to a new test question.","The factors that influence whether a specific learning technique works across different materials, different learners, and different settings."],ans:1,
reason:"Before Dunlosky crowns a study technique as \"highly effective,\" he checks its generalizability. Does this technique only work for 5th graders learning math? Or does it generalize across all ages, subjects, and environments? The best techniques generalize everywhere."},

// ═══════════════════════════════════════════════════════
// GAP COVERAGE — Readings & Lecture Objectives
// ═══════════════════════════════════════════════════════

// --- L2-L3 Reading Gaps (Norman Ch1, Ch2, Ch10) ---

{id:51,tier:"orange",docs:"q1",
q:"Norman describes three kinds of learning. Which kind involves the slow, effortful process of forming entirely new conceptual structures — the hardest type of learning?",
opts:["Accretion","Tuning","Restructuring","Elaboration"],ans:2,
reason:"Norman (Ch2) identifies three kinds of learning. Accretion is the easiest — simply accumulating new facts into an existing framework. Tuning is practice that gradually transforms reflective skill into automatic/experiential skill (requiring thousands of hours). Restructuring is the hardest — it requires building entirely new mental frameworks through deep reflective thought, often involving moments of insight."},

{id:52,tier:"yellow",docs:"q1",
q:"A medical student memorizes anatomy terms easily because she already has a framework of body systems. But understanding how the immune system works requires her to completely reorganize her mental model. These two scenarios illustrate which kinds of learning?",
opts:["Tuning and Restructuring","Accretion and Restructuring","Accretion and Tuning","Restructuring and Accretion"],ans:1,
reason:"Memorizing new facts into an existing framework is Accretion (easy when the scaffold already exists). Reorganizing your entire mental model to accommodate a new way of understanding is Restructuring (the hardest form of learning, requiring deep reflection)."},

{id:53,tier:"yellow",docs:"q1",
q:"Norman discusses Marshall McLuhan's famous claim that \"the medium is the message.\" What is Norman's position on this?",
opts:["He fully agrees — the medium completely determines the message.","He partially agrees — the medium shapes interpretation, but the message is ultimately what you make of it.","He fully disagrees — the medium is irrelevant to the message.","He argues McLuhan was discussing affordances, not media."],ans:1,
reason:"Norman acknowledges McLuhan's point that the medium shapes how we interpret content (TV vs. book changes the experience), but argues the message is ultimately 'what you make of it; the medium is the carrier, not the contents.' He partially agrees but stops short of McLuhan's determinism."},

{id:54,tier:"orange",docs:"q1",
q:"In Chapter 10, Norman invokes Neil Postman's comparison of two dystopian authors. Orwell feared that books would be banned by external oppression. Huxley feared that no one would want to read because entertainment would be too seductive. Which fear does Norman side with?",
opts:["Orwell's — governments will restrict access to knowledge.","Huxley's — we are 'amusing ourselves to death' through passive experiential consumption.","Neither — Norman argues both fears are outdated.","Both equally — Norman sees them as complementary threats."],ans:1,
reason:"Norman sides with the Huxley/Postman fear: the real danger isn't that someone will take away our ability to think, but that we'll voluntarily stop thinking because experiential entertainment (broadcast TV, passive media) is so effortless and seductive that no one will bother with the hard work of reflection."},

{id:55,tier:"orange",docs:"q1",
q:"Norman contrasts reading and broadcast television as cognitive media. Which statement best captures his argument?",
opts:["Both are equally valid reflective media.","Reading is self-paced and affords reflection; broadcast TV is event-paced and traps the viewer in passive experiential mode.","Television is superior because it engages both visual and auditory channels.","Reading is experiential; television is reflective."],ans:1,
reason:"Norman argues that reading is a reflective medium — it is self-paced (you control when to pause, re-read, and think). Broadcast television is an experiential medium — it is event-paced (the content moves at the producer's speed regardless of the viewer), requires no training to consume, and makes the viewer passive. This is why Norman considers broadcast TV a 'dumb' technology."},

{id:56,tier:"yellow",docs:"q1",
q:"Norman defines a \"compositional medium\" as one that allows the user to add, modify, and compare representations. Which of the following is a compositional medium?",
opts:["A printed novel","Broadcast television","Paper and pencil","A museum painting"],ans:2,
reason:"A compositional medium lets you actively create and modify representations. Paper and pencil allow you to write, erase, sketch, compare — they are compositional. A printed novel has fixed words you cannot change. Broadcast TV moves at its own pace with no user control. The key: compositional media support reflective thought because you can manipulate the representations."},

{id:57,tier:"green",docs:"q1",
q:"The 1933 Chicago World's Fair had the motto \"Science Finds, Industry Applies, Man Conforms.\" Norman proposes a human-centered counter-motto. What is it?",
opts:["\"People Propose, Science Studies, Technology Conforms\"","\"Humans Design, Machines Execute, Society Benefits\"","\"Technology Serves, Humans Lead, Culture Adapts\"","\"Science Creates, Industry Distributes, Man Chooses\""],ans:0,
reason:"Norman uses the 1933 motto as the epitome of machine-centered thinking — humans must conform to technology. His counter-motto, 'People Propose, Science Studies, Technology Conforms,' flips it: technology should be designed around human needs, not the other way around. This frames the entire argument of the book."},

{id:58,tier:"green",docs:"q1",
q:"According to Norman (Ch10), approximately how many items can be held in working memory at one time?",
opts:["About 2","About 5","About 12","About 20"],ans:1,
reason:"Norman states that 'only about five things can be kept active in consciousness at a time.' This biological constraint is why we need cognitive technologies — external tools to extend our limited working memory."},

// --- L4 Reading Gaps (Norman Ch3) ---

{id:59,tier:"orange",docs:"q2",
q:"Norman distinguishes between additive and substitutive representations. Tally marks grow in size as the quantity increases, making comparison instant and experiential. Arabic numerals (like 47 vs. 53) require mental effort to compare. What are these two types called?",
opts:["Iconic and symbolic representations","Additive and substitutive representations","Experiential and reflective representations","Natural and artificial representations"],ans:1,
reason:"Additive representations (like tally marks or bar graphs) have a physical size proportional to the value they represent — you can compare them experientially by just looking. Substitutive representations (like Arabic numerals) replace quantity with arbitrary symbols — you must reflect to compare them. This is why bar charts feel easy and number tables feel hard."},

{id:60,tier:"orange",docs:"q2",
q:"Norman's \"Naturalness Principle\" states that experiential cognition is aided when:",
opts:["The display uses the highest-resolution graphics available.","The properties of the representation match the properties of the thing being represented.","Information is presented in text rather than images.","The user receives explicit training before using the representation."],ans:1,
reason:"The Naturalness Principle means a representation works best experientially when its physical properties naturally correspond to what it represents. A thermometer where higher temperature = higher liquid level is natural. A dial where clockwise = increasing is natural. When the mapping is natural, users can perceive meaning without thinking."},

{id:61,tier:"yellow",docs:"q2",
q:"Norman distinguishes two types of cognitive artifacts. Which type lets you experience events as if you were there (telescope, movie, gas gauge), and which lets you concentrate on representations to find new interpretations?",
opts:["General artifacts and cognitive artifacts","Experiential artifacts and reflective artifacts","Physical artifacts and abstract artifacts","Additive artifacts and substitutive artifacts"],ans:1,
reason:"Experiential artifacts extend your perception — a telescope lets you see faraway things, a movie immerses you in a story, a gas gauge gives you an at-a-glance reading. Reflective artifacts support deliberate analysis — maps, diagrams, mathematical notation let you study representations to discover new relationships and meanings."},

{id:62,tier:"yellow",docs:"q2",
q:"According to Norman (Ch3), what are the three criteria that make a representation effective?",
opts:["It must be colorful, large, and digital.","It must capture important features while ignoring irrelevant ones, be appropriate for the person, and be appropriate for the task.","It must be additive, natural, and compositional.","It must use text, images, and audio simultaneously."],ans:1,
reason:"Norman identifies three criteria: (1) the representation must capture the important features while leaving out irrelevant detail, (2) it must be appropriate for the specific person using it, and (3) it must be appropriate for the specific task. The medical prescription example illustrates this — a list organized by medication is good for doctors, but a matrix organized by time of day is better for patients. Same data, different representation for different users and tasks."},

{id:63,tier:"green",docs:"q2",
q:"In Chapter 3, Norman discusses Socrates' famous argument against a new technology. What was the technology, and what was Socrates' fear?",
opts:["Socrates feared the abacus would replace mental arithmetic.","Socrates feared writing would destroy reflective thought because you cannot question a book the way you question a person.","Socrates feared theater would replace real-world experience.","Socrates feared maps would replace spatial memory."],ans:1,
reason:"Socrates argued against writing — he feared that if people could look things up in books, they would stop actively thinking and reasoning. You can question a teacher and get a dynamic response, but a book just repeats the same words. Norman uses this to argue that the fault lies with the reader, not the medium — a book CAN serve reflection, but only if the reader knows how to reason."},

// --- L5-L6 Reading Gaps (DOET Ch1, Davis & Chouinard) ---

{id:64,tier:"red",docs:"q3",
q:"A glass door at a store entrance appears to have a handle, but pushing or pulling does nothing — the door is actually automatic and opens with a motion sensor. This is an example of:",
opts:["A hidden affordance","A false affordance","An anti-affordance","Ambiguous mapping"],ans:1,
reason:"A false affordance is a perceived affordance that does not actually exist. The handle signals 'pull me' or 'push me,' but neither action works — the door operates on a sensor. The user perceives an action possibility that is not real. This is distinct from ambiguous mapping (where the action works but it's unclear how) and hidden affordance (where the action exists but isn't visible)."},

{id:65,tier:"red",docs:"q3",
q:"A software application has a powerful keyboard shortcut that performs a complex action, but there is no menu item, icon, or tooltip that indicates this shortcut exists. Users can only discover it by reading external documentation. This is an example of:",
opts:["A false affordance","An anti-affordance","A hidden affordance","A signifier"],ans:2,
reason:"A hidden affordance is an action possibility that genuinely exists but has no signifier communicating it to the user. The functionality is real — it works if you know about it — but the design provides no visual or perceptual clue that it's there. Users miss it entirely unless told about it externally."},

{id:66,tier:"red",docs:"q3",
q:"Norman describes how glass simultaneously provides one affordance and one anti-affordance. What are they?",
opts:["Glass affords breaking but anti-affords transparency.","Glass affords seeing through (transparency) but anti-affords physical passage (you can't walk through it).","Glass affords reflection but anti-affords sound transmission.","Glass affords touching but anti-affords gripping."],ans:1,
reason:"Anti-affordance is a property that actively prevents interaction. Glass is Norman's prime example: it affords seeing through (transparency) while simultaneously anti-affording passage (you cannot walk through it). The same material provides both an affordance and an anti-affordance at the same time, depending on the type of action."},

{id:67,tier:"orange",docs:"q3",
q:"Norman argues that designers cannot communicate directly with users. Instead, all communication happens through the product itself. What does Norman call this intermediary?",
opts:["The signifier","The system image","The conceptual model","The affordance"],ans:1,
reason:"The System Image is what the product communicates through its appearance, behavior, documentation, and design. The designer has a conceptual model of how the product works. The user forms their own conceptual model. But the designer can never talk directly to the user — the only connection between them is the system image. If the system image is unclear, the user will form a wrong conceptual model and struggle."},

{id:68,tier:"orange",docs:"q3",
q:"According to Norman, what are the two most important characteristics of good design?",
opts:["Aesthetics and efficiency","Affordance and signifier","Discoverability and understanding","Speed and reliability"],ans:2,
reason:"Discoverability means: can you figure out what actions are possible and how to perform them? Understanding means: what does the whole thing mean, how is the product supposed to be used, what do the controls and settings mean? Norman argues these are THE two most critical qualities — without them, even a powerful product becomes frustrating and unusable."},

{id:69,tier:"yellow",docs:"q3",
q:"Norman identifies feedback as a fundamental design principle. What is feedback?",
opts:["The user's emotional response to a product.","Communicating the results of an action back to the user — it must be immediate and informative.","A designer's review of their own prototype.","The signifier that appears before an action is taken."],ans:1,
reason:"Feedback is communicating the results of an action. When you press an elevator button, it should light up (feedback that your press was registered). When you send an email, you should see 'Message sent.' Norman insists feedback must be immediate (no delay), informative (tells you what happened), and not excessive (don't overwhelm with unnecessary alerts)."},

{id:70,tier:"orange",docs:"q3",
q:"Davis and Chouinard identify six mechanisms of affordance, not just four. The exam already covers Request, Demand, Discourage, and Refuse. Which two mechanisms are missing?",
opts:["Suggest and Block","Encourage and Allow","Invite and Prevent","Nudge and Restrict"],ans:1,
reason:"The full six mechanisms are: Request, Demand, Encourage, Discourage, Allow, and Refuse. Encourage means the artifact actively fosters and nourishes a behavior (e.g., large dinner plates encourage eating more; Instagram's feed algorithm encourages image-sharing). Allow means the artifact is neutral/indifferent — it permits the behavior without pushing for or against it (e.g., a social media platform that allows but doesn't push notifications)."},

{id:71,tier:"orange",docs:"q3",
q:"Instagram's algorithm-curated feed actively fosters and nourishes image-sharing behavior. According to Davis and Chouinard, this mechanism is called:",
opts:["Request","Encourage","Demand","Allow"],ans:1,
reason:"Encourage goes beyond Request. A Request gently suggests (like a speed bump). Encourage means the artifact actively breeds and nourishes the behavior — the design is structured to make that behavior flourish. Instagram's feed doesn't just suggest you share photos; its entire algorithmic reward structure (likes, visibility, engagement metrics) actively cultivates photo-sharing as the dominant behavior."},

{id:72,tier:"red",docs:"q3",
q:"According to Davis and Chouinard, affordances depend on three conditions. A smartphone camera only affords video recording to users who know the feature exists. This is an example of which condition?",
opts:["Dexterity","Cultural legitimacy","Perception","Institutional authority"],ans:2,
reason:"The three conditions of affordance are: Perception (the user must know the feature exists), Dexterity (the user must have the physical and cognitive ability to use it), and Cultural/Institutional Legitimacy (the user's use must be culturally valid and institutionally supported). If you don't know your phone can record video, the camera's video affordance doesn't exist for you — that's a failure of the Perception condition."},

{id:73,tier:"orange",docs:"q3",
q:"A driver's license is not a physical property of a car, but without one, the car's transportation affordances are institutionally blocked. According to Davis and Chouinard, this illustrates which condition of affordance?",
opts:["Perception","Dexterity","Cultural/Institutional Legitimacy","Mechanical constraint"],ans:2,
reason:"Cultural/Institutional Legitimacy means affordances are shaped by social structures, not just physical properties. A 14-year-old has the physical dexterity to drive and the perception that cars can be driven, but lacks institutional legitimacy (no license, age restrictions, insurance requirements). The car's affordances are gated by social and legal systems, not just the object's physical properties."},

// --- L7-L8 Reading Gaps (Mayer, Dunlosky) ---

{id:74,tier:"orange",docs:"q4",
q:"Mayer identifies three metaphors for how multimedia learning has historically been understood. Which metaphor does Mayer endorse?",
opts:["Response Strengthening — learners passively receive stimuli and build habits through drill and practice.","Information Acquisition — learners are empty vessels and the teacher pours in knowledge.","Knowledge Construction — learners actively build mental representations and the teacher is a cognitive guide.","Behavioral Conditioning — learners are shaped by rewards and punishments."],ans:2,
reason:"Mayer describes three metaphors (Table 1.3): Response Strengthening (stimulus-response, learner is passive), Information Acquisition (learner is empty vessel, teacher pours in info), and Knowledge Construction (learner actively builds mental representations, teacher serves as a cognitive guide). Mayer explicitly endorses Knowledge Construction — meaningful learning requires the learner to actively process and integrate information, not passively receive it."},

{id:75,tier:"orange",docs:"q4",
q:"Mayer argues that a technology-centered approach to multimedia design has a consistent track record. What is that track record?",
opts:["100 years of revolutionary success in education.","100 years of failure — film, radio, TV, and computers all promised to revolutionize education but didn't.","Mixed results depending on the specific technology.","Success only when combined with learner-centered approaches."],ans:1,
reason:"Mayer documents that every major technology — film (1920s), radio (1930s), TV (1950s), computers (1980s) — was predicted to revolutionize education. None did. The technology-centered approach asks 'How can we use this cool new tech in education?' instead of the learner-centered question: 'How can we adapt technology to aid human cognition?' Starting from the technology instead of the learner is why they all failed."},

{id:76,tier:"red",docs:"q4",
q:"A student fills in blanks on a computer worksheet while half-watching TV. Another student watches a narrated animation and pauses frequently to explain to herself how each step connects to the previous one. According to Mayer, which student is more likely to achieve meaningful learning?",
opts:["The first — she is behaviorally active (typing answers).","The second — she is cognitively active (self-explaining), which is what matters for meaningful learning.","Both equally — any engagement with material produces learning.","Neither — meaningful learning requires a classroom setting."],ans:1,
reason:"Mayer makes a crucial distinction: behavioral activity (physically doing something) is NOT the same as cognitive activity (mentally processing information). The first student is behaviorally active but cognitively passive — she's filling in blanks mechanically. The second student is behaviorally passive (just watching) but cognitively active — she's pausing, self-explaining, integrating. Meaningful learning depends on cognitive activity, not behavioral activity."},

{id:77,tier:"yellow",docs:"q4",
q:"Which of the following Dunlosky-rated techniques involves mixing different types of problems or topics within a single study session, rather than studying one topic at a time?",
opts:["Distributed practice","Elaborative interrogation","Interleaved practice","Practice testing"],ans:2,
reason:"Interleaved practice means mixing different kinds of problems or material within one study session (e.g., alternating between algebra, geometry, and statistics problems). This contrasts with 'blocking' (doing all algebra, then all geometry). Interleaving forces the brain to continually retrieve different strategies, strengthening discrimination between problem types. Dunlosky rates it moderate utility."},

{id:78,tier:"yellow",docs:"q4",
q:"A student reads a textbook fact: \"The pancreas produces insulin.\" She then asks herself: \"Why would the pancreas specifically produce insulin rather than another organ?\" This technique is called:",
opts:["Self-explanation","Elaborative interrogation","Summarization","Keyword mnemonic"],ans:1,
reason:"Elaborative interrogation involves generating explanations for why a stated fact is true. The student isn't just memorizing — she's forcing herself to reason about causality and connect the fact to deeper knowledge. Dunlosky rates it moderate utility. It works best when the learner already has some background knowledge to draw on."},

{id:79,tier:"yellow",docs:"q4",
q:"According to Dunlosky, which common study habit do most students use as a substitute for more effective techniques, despite its low utility?",
opts:["Practice testing","Rereading","Distributed practice","Interleaved practice"],ans:1,
reason:"Rereading — simply going through the same text again — is one of the most common study strategies students use. Dunlosky rates it low utility because it produces diminishing returns after the first read and creates familiarity without deep processing. Most students default to rereading instead of switching to more effective techniques like practice testing or distributed practice."},

{id:80,tier:"yellow",docs:"q3",
q:"Norman defines natural mapping as a design principle where controls spatially correspond to what they affect. Which of the following is an example of natural mapping?",
opts:["A row of identical light switches on a wall panel with no labels.","Car seat adjustment controls that are shaped like a miniature car seat, where pushing the front of the control tilts the front of the seat.","A door with identical handles on both sides.","A software menu with alphabetically sorted options."],ans:1,
reason:"Natural mapping uses spatial analogy to make the relationship between a control and its effect obvious. Car seat controls shaped like a miniature seat are the classic example — pushing the front forward tilts the actual seat forward. The physical shape of the control maps directly onto the physical effect. This eliminates the need for labels or instructions because the mapping is self-evident."}

];

var SA_QUESTIONS = {};
var KEY_TERMS = {};

OVERVIEW_HTML = '<div style="max-width:680px;margin:0 auto">' +

'<div class="card" style="margin-top:8px">' +
'<h2 style="color:#fff;font-size:28px;margin-bottom:8px;font-weight:700">COGS 10: The Only Chapter You Need to Read</h2>' +
'<p style="color:#666;font-size:14px;margin-bottom:24px">Lectures 2\u20138 \u2014 Everything tested on Exam 1. Nothing extra.</p>' +
'<div style="text-align:center;padding:8px 0 0"><button class="btn btn-primary" onclick="toggleOverview()">Back to Quiz</button></div>' +
'</div>' +

// ─── L2-3: Smart vs Dumb Tech ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">Technology Can Make You Smart\u2026 or Dumb</h2>' +

'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:20px">Human cognition is <strong style="color:#fff">capacity-limited</strong>. Your working memory can only hold so much. But one of our most extraordinary abilities is the ability to <strong style="color:#fff">create tools to help us think</strong>. Norman calls these <strong style="color:#4a9eff">cognitive technologies</strong> (or \u201ccognitive artifacts\u201d).</p>' +

'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0">' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:16px">' +
'<div style="color:#4a9eff;font-weight:700;font-size:14px;margin-bottom:6px">General Technology</div>' +
'<div style="color:#9b9b9b;font-size:14px;line-height:1.6">Expands <strong style="color:#ccc">physical</strong> abilities. A plow, a car, a hammer. Muscle extenders.</div>' +
'</div>' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:16px">' +
'<div style="color:#f97316;font-weight:700;font-size:14px;margin-bottom:6px">Cognitive Technology</div>' +
'<div style="color:#9b9b9b;font-size:14px;line-height:1.6">Expands <strong style="color:#ccc">mental</strong> abilities. Language, calculators, logic, calculus. Brain extenders.</div>' +
'</div>' +
'</div>' +

'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:16px">Cognitive tech can be <strong style="color:#fff">physical</strong> (a pen, a laptop) or <strong style="color:#fff">abstract</strong> (logic, mathematics \u2014 rules that exist in your head).</p>' +

'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:16px">Technology and cognition are <strong style="color:#fff">mutually elaborated</strong> \u2014 they evolve each other in a feedback loop. We build tools that change how we think, our changed thinking builds better tools, and the cycle reshapes culture.</p>' +

'<div style="background:#1a1a2e;border-left:3px solid #4a9eff;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0">' +
'<div style="color:#4a9eff;font-weight:700;font-size:14px;margin-bottom:6px">Smart vs Dumb</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">A <strong style="color:#fff">\u201csmart\u201d technology</strong> complements human abilities, enhances memory/reasoning, fits how the mind works. A <strong style="color:#fff">\u201cdumb\u201d technology</strong> traps you \u2014 forces you to act like a machine, replaces active thought with passive consumption (e.g., broadcast TV provides vicarious experience but demands no reflective problem-solving).</div>' +
'</div>' +

'<div style="background:#2a1a1a;border-left:3px solid #ef4444;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0">' +
'<div style="color:#ef4444;font-weight:700;font-size:14px;margin-bottom:6px">Exam Trap</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">You <strong style="color:#fff">cannot</strong> label a technology as universally \u201cgood\u201d or \u201cbad.\u201d That\u2019s the whole point of <strong style="color:#fff">context specificity</strong>.</div>' +
'</div>' +
'</div>' +

// ─── Context Specificity ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">Context Specificity</h2>' +
'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:16px">Whether a technology makes you smart or dumb depends on three questions: <strong style="color:#fff">1)</strong> What specific technology? <strong style="color:#fff">2)</strong> For what user(s)? <strong style="color:#fff">3)</strong> For what task/purpose?</p>' +
'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:16px">A calculator for an engineer = brilliant cognitive aid. The same calculator for a primary school student = harmful shortcut preventing development of mental math. <strong style="color:#fff">Same tool. Different user. Opposite effect.</strong></p>' +
'</div>' +

// ─── Spheres of Influence ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">Spheres of Influence</h2>' +
'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:16px">After nailing down context, evaluate impact across different <strong style="color:#fff">scopes and timescales</strong>:</p>' +
'<ul style="color:#b0b0b0;font-size:15px;line-height:1.8;padding-left:20px;margin-bottom:16px">' +
'<li><strong style="color:#fff">Immediate task</strong> \u2014 The calculator helps the student get the right answer today. Helpful.</li>' +
'<li><strong style="color:#fff">Longer-term task</strong> \u2014 The student never develops mental arithmetic. The biological ability atrophied. Harmful.</li>' +
'<li><strong style="color:#fff">Society</strong> \u2014 If every student uses a calculator from age 5, it alters educational standards and lowers baseline mathematical literacy.</li>' +
'</ul>' +
'<p style="color:#b0b0b0;font-size:15px;line-height:1.8">A technology can be helpful at one sphere and devastating at another.</p>' +
'</div>' +

// ─── Experiential vs Reflective ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">Two Ways Your Brain Thinks</h2>' +

'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0">' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:16px">' +
'<div style="color:#4a9eff;font-weight:700;font-size:14px;margin-bottom:6px">Experiential Mode</div>' +
'<div style="color:#9b9b9b;font-size:14px;line-height:1.6">Fast, effortless, automatic. Perceive and react without deliberation. Pattern recognition. Expert behavior. <em>A racecar driver steering. Playing sports.</em></div>' +
'</div>' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:16px">' +
'<div style="color:#f97316;font-weight:700;font-size:14px;margin-bottom:6px">Reflective Mode</div>' +
'<div style="color:#9b9b9b;font-size:14px;line-height:1.6">Slow, effortful, deliberate. Compare, contrast, analyze. Requires focused attention. <em>Writing an essay. Solving a new equation.</em></div>' +
'</div>' +
'</div>' +

'<div style="background:#2a1a1a;border-left:3px solid #ef4444;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0">' +
'<div style="color:#ef4444;font-weight:700;font-size:14px;margin-bottom:6px">Critical Point</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">These modes are <strong style="color:#fff">not mutually exclusive</strong> (they can co-occur) and <strong style="color:#fff">do not map onto specific activities</strong>. Any activity can be performed in either mode depending on expertise. A beginner driver reflects to steer. A veteran steers experientially.</div>' +
'</div>' +

'<div style="margin-top:20px">' +
'<div style="color:#fff;font-weight:700;font-size:16px;margin-bottom:12px">Dangerous Mismatches</div>' +
'<ul style="color:#b0b0b0;font-size:15px;line-height:1.8;padding-left:20px">' +
'<li><strong style="color:#fff">Experiencing when you should reflect:</strong> Mindlessly watching an educational documentary without critically analyzing the arguments.</li>' +
'<li><strong style="color:#fff">Reflecting when you should experience:</strong> A pilot reading a complex numerical display during an engine failure. Emergency demands instant reaction, interface forces slow calculation.</li>' +
'</ul>' +
'</div>' +

'<div style="margin-top:24px">' +
'<div style="color:#fff;font-weight:700;font-size:16px;margin-bottom:12px">Machine-Centered vs Human-Centered</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
'<div style="background:#1a1a1a;border:1px solid #ef4444;border-radius:10px;padding:16px">' +
'<div style="color:#ef4444;font-weight:700;font-size:14px;margin-bottom:6px">Machine-Centered</div>' +
'<div style="color:#9b9b9b;font-size:14px;line-height:1.6">Humans = unreliable components. Blames \u201chuman error.\u201d Expects robotic behavior. <strong style="color:#ccc">= task + machine</strong></div>' +
'</div>' +
'<div style="background:#1a1a1a;border:1px solid #22c55e;border-radius:10px;padding:16px">' +
'<div style="color:#22c55e;font-weight:700;font-size:14px;margin-bottom:6px">Human-Centered</div>' +
'<div style="color:#9b9b9b;font-size:14px;line-height:1.6">Accounts for how humans actually think. Distractibility = <strong style="color:#ccc">strength</strong> (scanning for unexpected events). <strong style="color:#ccc">= task + human + machine</strong></div>' +
'</div>' +
'</div>' +
'</div>' +
'</div>' +

// ─── Three Kinds of Learning ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">Three Kinds of Learning (Norman Ch2)</h2>' +
'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:16px 0">' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:14px">' +
'<div style="color:#22c55e;font-weight:700;font-size:13px;margin-bottom:4px">Accretion</div>' +
'<div style="color:#9b9b9b;font-size:13px;line-height:1.5">Accumulating new facts into existing frameworks. Easiest.</div>' +
'</div>' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:14px">' +
'<div style="color:#f97316;font-weight:700;font-size:13px;margin-bottom:4px">Tuning</div>' +
'<div style="color:#9b9b9b;font-size:13px;line-height:1.5">Practice transforms reflective skill into automatic/experiential. 5000+ hours.</div>' +
'</div>' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:14px">' +
'<div style="color:#ef4444;font-weight:700;font-size:13px;margin-bottom:4px">Restructuring</div>' +
'<div style="color:#9b9b9b;font-size:13px;line-height:1.5">Forming entirely new conceptual structures. Hardest. Requires deep reflection.</div>' +
'</div>' +
'</div>' +
'</div>' +

// ─── Media & Culture (Ch10 Readings) ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">Media, Culture, and Cognition (Norman Ch10)</h2>' +
'<ul style="color:#b0b0b0;font-size:15px;line-height:1.8;padding-left:20px;margin-bottom:16px">' +
'<li><strong style="color:#fff">McLuhan: \u201cThe medium is the message.\u201d</strong> Norman partially agrees \u2014 the medium shapes interpretation, but the message is ultimately \u201cwhat you make of it.\u201d</li>' +
'<li><strong style="color:#fff">Orwell vs. Huxley (via Postman):</strong> Orwell feared books would be banned. Huxley feared no one would want to read. Norman sides with Huxley \u2014 we are \u201camusing ourselves to death\u201d through passive experiential consumption.</li>' +
'<li><strong style="color:#fff">Reading vs. TV:</strong> Reading is self-paced, affords reflection. Broadcast TV is event-paced, traps viewer in passive experiential mode.</li>' +
'<li><strong style="color:#fff">Compositional medium:</strong> One that lets you add, modify, and compare representations. Paper + pencil = compositional. Printed book = NOT. Broadcast TV = NOT.</li>' +
'<li><strong style="color:#fff">1933 World\u2019s Fair motto:</strong> \u201cScience Finds, Industry Applies, Man Conforms.\u201d Norman\u2019s counter: <strong style="color:#4a9eff">\u201cPeople Propose, Science Studies, Technology Conforms.\u201d</strong></li>' +
'<li><strong style="color:#fff">Working memory:</strong> Only about <strong style="color:#4a9eff">5 items</strong> can be held in consciousness at once.</li>' +
'</ul>' +
'</div>' +

// ─── Representation ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">The Power of Representation</h2>' +

'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:16px">Norman: <em>\u201cThe power of the unaided mind is highly overrated.\u201d</em> External aids like paper and writing overcome the biological limits of our brains. But <strong style="color:#fff">how</strong> you represent information determines how your brain processes it.</p>' +

'<div style="background:#1a2a1a;border-left:3px solid #22c55e;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0">' +
'<div style="color:#22c55e;font-weight:700;font-size:14px;margin-bottom:6px">Ticktacktoe vs The Game of 15</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">These games are <strong style="color:#fff">mathematically identical</strong>. But ticktacktoe is easy because the visual grid lets you process patterns experientially. The Game of 15 forces mental arithmetic (reflective). <strong style="color:#fff">The right representation turns a reflective task into an experiential one.</strong></div>' +
'</div>' +

'<div style="color:#fff;font-weight:700;font-size:16px;margin:24px 0 12px">Triadic Semiotics (The Semiotic Triangle)</div>' +
'<ul style="color:#b0b0b0;font-size:15px;line-height:1.8;padding-left:20px;margin-bottom:16px">' +
'<li><strong style="color:#4a9eff">Referent (sign-object)</strong> \u2014 The actual thing in the real world. Physical streets of a city.</li>' +
'<li><strong style="color:#4a9eff">Representation (sign-vehicle)</strong> \u2014 The external physical thing doing the referring. Ink on a map. Pixels on screen.</li>' +
'<li><strong style="color:#4a9eff">Interpretant (sign-mind)</strong> \u2014 The understanding inside the user\u2019s mind. Red octagon \u2192 \u201cStop!\u201d</li>' +
'</ul>' +
'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:16px">Media encode info differently: <strong style="color:#fff">Text</strong> = symbolic characters. <strong style="color:#fff">Graphs</strong> = spatial position. <strong style="color:#fff">Photos</strong> = iconic/naturalistic images.</p>' +

'<div style="color:#fff;font-weight:700;font-size:16px;margin:24px 0 12px">Mode Matching</div>' +
'<ul style="color:#b0b0b0;font-size:15px;line-height:1.8;padding-left:20px">' +
'<li><strong style="color:#22c55e">Good:</strong> Analog speedometer dial \u2192 driver perceives speed instantly (experiential).</li>' +
'<li><strong style="color:#22c55e">Good:</strong> GPS text list \u2192 driver consciously reads and plans (reflective).</li>' +
'<li><strong style="color:#ef4444">Deadly mismatch:</strong> Dashboard flashing decimal tire-pressure numbers during a blowout \u2192 forces reflective processing when the situation demands experiential reaction.</li>' +
'</ul>' +

'<div style="color:#fff;font-weight:700;font-size:16px;margin:24px 0 12px">Deeper Concepts from Ch3 Reading</div>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0">' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:14px">' +
'<div style="color:#4a9eff;font-weight:700;font-size:13px;margin-bottom:4px">Additive Representations</div>' +
'<div style="color:#9b9b9b;font-size:13px;line-height:1.5">Size proportional to value (tally marks, bar graphs). Comparison is experiential \u2014 just look.</div>' +
'</div>' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:14px">' +
'<div style="color:#f97316;font-weight:700;font-size:13px;margin-bottom:4px">Substitutive Representations</div>' +
'<div style="color:#9b9b9b;font-size:13px;line-height:1.5">Arbitrary symbols replace quantity (Arabic numerals: 47 vs 53). Comparison requires reflection.</div>' +
'</div>' +
'</div>' +
'<ul style="color:#b0b0b0;font-size:15px;line-height:1.8;padding-left:20px;margin-bottom:16px">' +
'<li><strong style="color:#4a9eff">Naturalness Principle:</strong> Experiential cognition is aided when the properties of the representation match the properties of the thing being represented.</li>' +
'<li><strong style="color:#4a9eff">Experiential vs Reflective artifacts:</strong> Experiential artifacts let you experience events (telescope, movie, gas gauge). Reflective artifacts let you study representations to find new interpretations (maps, diagrams, math notation).</li>' +
'<li><strong style="color:#4a9eff">3 criteria for a good representation:</strong> (1) Capture important features while ignoring irrelevant ones. (2) Appropriate for the person. (3) Appropriate for the task.</li>' +
'<li><strong style="color:#4a9eff">Socrates feared writing</strong> would destroy reflective thought because you can\u2019t question a book like you question a person. Norman\u2019s response: the fault is with the reader, not the book.</li>' +
'</ul>' +
'</div>' +

// ─── Affordances ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">Affordances</h2>' +

'<div style="background:#1a1a2e;border-left:3px solid #4a9eff;padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 20px">' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7"><strong style="color:#4a9eff">Affordance</strong> = a possibility for action; a <strong style="color:#fff">relationship</strong> between an object\u2019s properties and the user\u2019s capabilities. Affordances are <strong style="color:#fff">relational</strong>. Stairs afford climbing to an adult, not to a crawling baby. Same stairs, different affordance.</div>' +
'</div>' +

'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:16px">Concept invented by <strong style="color:#fff">J.J. Gibson</strong> (1979, ecological psychology). Norman adapted it for product design.</p>' +

'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0">' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:16px">' +
'<div style="color:#4a9eff;font-weight:700;font-size:14px;margin-bottom:6px">Affordance</div>' +
'<div style="color:#9b9b9b;font-size:14px;line-height:1.6">What actions are <strong style="color:#ccc">physically possible</strong>. A touchscreen affords touching anywhere.</div>' +
'</div>' +
'<div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:16px">' +
'<div style="color:#f97316;font-weight:700;font-size:14px;margin-bottom:6px">Signifier</div>' +
'<div style="color:#9b9b9b;font-size:14px;line-height:1.6">Communicates <strong style="color:#ccc">where and how</strong> to act. The blue button signifies \u201ctap here to send.\u201d</div>' +
'</div>' +
'</div>' +

'<div style="color:#fff;font-weight:700;font-size:16px;margin:24px 0 12px">When Design Goes Wrong</div>' +
'<ul style="color:#b0b0b0;font-size:15px;line-height:1.8;padding-left:20px;margin-bottom:16px">' +
'<li><strong style="color:#fff">Ambiguous mapping:</strong> A door with identical handles on both sides, but one must be pushed. A swipe gesture meaning \u201cdelete\u201d and \u201csave\u201d depending on context.</li>' +
'<li><strong style="color:#fff">Unintended affordances:</strong> Users interact in ways the designer never planned (book as doorstop). Designers add signifiers to guide toward intended use.</li>' +
'<li><strong style="color:#ef4444">False affordance:</strong> A perceived action that doesn\u2019t actually exist (handle on an automatic sensor door).</li>' +
'<li><strong style="color:#ef4444">Hidden affordance:</strong> Action exists but no signifier shows you (a keyboard shortcut with no menu item).</li>' +
'<li><strong style="color:#ef4444">Anti-affordance:</strong> A property that prevents interaction. Glass affords seeing through but anti-affords passage.</li>' +
'</ul>' +

'<div style="color:#fff;font-weight:700;font-size:16px;margin:24px 0 12px">DOET Ch1 Design Principles</div>' +
'<ul style="color:#b0b0b0;font-size:15px;line-height:1.8;padding-left:20px;margin-bottom:16px">' +
'<li><strong style="color:#4a9eff">Discoverability:</strong> Can you figure out what actions are possible?</li>' +
'<li><strong style="color:#4a9eff">Understanding:</strong> What does the whole thing mean? How is it supposed to be used?</li>' +
'<li><strong style="color:#4a9eff">Feedback:</strong> Communicating the results of an action. Must be immediate and informative (elevator button lights up when pressed).</li>' +
'<li><strong style="color:#4a9eff">Conceptual models:</strong> Simplified explanations of how something works. The <strong style="color:#fff">System Image</strong> is the product itself \u2014 the only connection between designer and user. If the system image is unclear, the user forms a wrong conceptual model.</li>' +
'<li><strong style="color:#4a9eff">Natural mapping:</strong> Controls spatially correspond to what they affect (car seat controls shaped like a miniature seat).</li>' +
'</ul>' +
'</div>' +

// ─── Davis & Chouinard Spectrum ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">The Spectrum of Force (Davis & Chouinard)</h2>' +
'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:20px">Affordances exist on a spectrum from gentle suggestion to absolute compulsion:</p>' +

'<div style="background:#1a1a1a;border-left:3px solid #22c55e;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:10px">' +
'<strong style="color:#22c55e">Request</strong><span style="color:#9b9b9b;font-size:14px"> \u2014 Encourages behavior, you can bypass. A <strong style="color:#ccc">speed bump</strong> requests you slow down. You can speed over it.</span>' +
'</div>' +

'<div style="background:#1a1a1a;border-left:3px solid #f97316;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:10px">' +
'<strong style="color:#f97316">Discourage</strong><span style="color:#9b9b9b;font-size:14px"> \u2014 Makes behavior frustratingly difficult. A dating app with <strong style="color:#ccc">preset emojis only</strong> discourages expressive communication.</span>' +
'</div>' +

'<div style="background:#1a1a1a;border-left:3px solid #ef4444;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:10px">' +
'<strong style="color:#ef4444">Demand</strong><span style="color:#9b9b9b;font-size:14px"> \u2014 Conditions use on a specific action, <strong style="color:#ccc">cannot bypass</strong>. Facebook requiring gender before registration. A mandatory Terms of Service checkbox.</span>' +
'</div>' +

'<div style="background:#1a1a1a;border-left:3px solid #b91c1c;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:16px">' +
'<strong style="color:#dc2626">Refuse</strong><span style="color:#9b9b9b;font-size:14px"> \u2014 Absolutely denies a capability. A car that <strong style="color:#ccc">won\u2019t start</strong> without the key fob. No workaround.</span>' +
'</div>' +

'<div style="background:#1a1a1a;border-left:3px solid #4a9eff;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:10px">' +
'<strong style="color:#4a9eff">Encourage</strong><span style="color:#9b9b9b;font-size:14px"> \u2014 Actively fosters/nourishes behavior. Large plates <strong style="color:#ccc">encourage</strong> eating more. Instagram\u2019s algorithm encourages image-sharing.</span>' +
'</div>' +

'<div style="background:#1a1a1a;border-left:3px solid #9b9b9b;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:16px">' +
'<strong style="color:#9b9b9b">Allow</strong><span style="color:#9b9b9b;font-size:14px"> \u2014 Neutral/indifferent. Permits behavior without pushing for or against it.</span>' +
'</div>' +

'<div style="color:#fff;font-weight:700;font-size:16px;margin:24px 0 12px">Three Conditions of Affordance</div>' +
'<ul style="color:#b0b0b0;font-size:15px;line-height:1.8;padding-left:20px;margin-bottom:16px">' +
'<li><strong style="color:#4a9eff">Perception:</strong> User must know the feature exists. A phone camera only affords video to users who know it has that feature.</li>' +
'<li><strong style="color:#4a9eff">Dexterity:</strong> User must have physical AND cognitive ability to use it.</li>' +
'<li><strong style="color:#4a9eff">Cultural/Institutional Legitimacy:</strong> Use must be socially valid. A driver\u2019s license unlocks a car\u2019s transportation affordances. Without one, the affordance is institutionally blocked.</li>' +
'</ul>' +

'<div style="background:#2a1a1a;border-left:3px solid #ef4444;padding:14px 18px;border-radius:0 8px 8px 0;margin:16px 0">' +
'<div style="color:#ef4444;font-weight:700;font-size:14px;margin-bottom:6px">Exam Distinction</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">Can you bypass it? Speed bump = request (yes). Mandatory checkbox = demand (no). Also: affordances are <strong style="color:#fff">NOT static properties of objects</strong>. They are dynamic, relational, context-dependent. If exam says static \u2192 <strong style="color:#fff">False</strong>.</div>' +
'</div>' +
'</div>' +

// ─── Multimedia Learning ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">Multimedia Learning (Mayer)</h2>' +
'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:20px">The brain\u2019s processing capacity is limited. Everything on screen either helps learning or competes with it.</p>' +

'<div style="background:#1a1a2e;border-left:3px solid #4a9eff;padding:12px 18px;border-radius:0 8px 8px 0;margin-bottom:10px">' +
'<strong style="color:#4a9eff">Coherence</strong><span style="color:#b0b0b0;font-size:14px"> \u2014 Remove all extraneous material. No background music, decorative animations, tangent facts. They steal processing power.</span>' +
'</div>' +

'<div style="background:#1a1a2e;border-left:3px solid #4a9eff;padding:12px 18px;border-radius:0 8px 8px 0;margin-bottom:10px">' +
'<strong style="color:#4a9eff">Segmenting</strong><span style="color:#b0b0b0;font-size:14px"> \u2014 Break material into short, user-controlled chunks with pause points. Not one long uninterrupted stream.</span>' +
'</div>' +

'<div style="background:#1a1a2e;border-left:3px solid #4a9eff;padding:12px 18px;border-radius:0 8px 8px 0;margin-bottom:10px">' +
'<strong style="color:#4a9eff">Split-Attention (Spatial Contiguity)</strong><span style="color:#b0b0b0;font-size:14px"> \u2014 Text and images physically close together. Labels next to diagram parts, not on a separate page.</span>' +
'</div>' +

'<div style="background:#1a1a2e;border-left:3px solid #4a9eff;padding:12px 18px;border-radius:0 8px 8px 0;margin-bottom:10px">' +
'<strong style="color:#4a9eff">Signaling</strong><span style="color:#b0b0b0;font-size:14px"> \u2014 Use arrows, bold, highlights to tell the brain where to focus.</span>' +
'</div>' +

'<div style="background:#1a1a2e;border-left:3px solid #4a9eff;padding:12px 18px;border-radius:0 8px 8px 0;margin-bottom:10px">' +
'<strong style="color:#4a9eff">Multimedia</strong><span style="color:#b0b0b0;font-size:14px"> \u2014 Words + pictures together > words alone.</span>' +
'</div>' +

'<div style="color:#fff;font-weight:700;font-size:16px;margin:24px 0 12px">Deeper Concepts from Mayer</div>' +
'<ul style="color:#b0b0b0;font-size:15px;line-height:1.8;padding-left:20px;margin-bottom:16px">' +
'<li><strong style="color:#4a9eff">3 Metaphors of Learning:</strong> Response Strengthening (passive drill), Information Acquisition (empty vessel), <strong style="color:#fff">Knowledge Construction</strong> (learner actively builds mental representations, teacher is cognitive guide). Mayer endorses Knowledge Construction.</li>' +
'<li><strong style="color:#4a9eff">Technology-centered vs Learner-centered:</strong> Technology-centered (\u201chow can we use this cool tech?\u201d) has a 100-year history of failure (film, radio, TV, computers all promised to revolutionize education). Learner-centered (\u201chow can we adapt tech to aid cognition?\u201d) works.</li>' +
'<li><strong style="color:#ef4444">Behavioral activity \u2260 Cognitive activity:</strong> Filling in blanks on a computer = behaviorally active but <strong style="color:#fff">cognitively passive</strong>. Watching an animation and self-explaining = behaviorally passive but <strong style="color:#fff">cognitively active</strong>. Meaningful learning depends on cognitive activity.</li>' +
'</ul>' +
'</div>' +

// ─── Learning Techniques ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">Learning Techniques (Dunlosky)</h2>' +
'<p style="color:#b0b0b0;font-size:15px;line-height:1.8;margin-bottom:16px">Dunlosky evaluated study strategies by checking <strong style="color:#fff">generalizability variables</strong> \u2014 does it work across different materials, ages, and settings?</p>' +

'<div style="background:#1a2a1a;border-left:3px solid #22c55e;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:10px">' +
'<div style="color:#22c55e;font-weight:700;font-size:14px;margin-bottom:6px">Practice Testing \u2014 HIGH</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">Forces <strong style="color:#fff">active retrieval</strong> from memory. The act of pulling information out physically strengthens the trace. Even getting it wrong helps \u2014 the retrieval effort builds the pathway.</div>' +
'</div>' +

'<div style="background:#1a2a1a;border-left:3px solid #22c55e;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:10px">' +
'<div style="color:#22c55e;font-weight:700;font-size:14px;margin-bottom:6px">Distributed Practice \u2014 HIGH</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">Space studying over time. The delay forces your brain to partially forget, then <strong style="color:#fff">work hard to retrieve and reconstruct</strong>. That effort carves permanent pathways. Cramming only works for one day.</div>' +
'</div>' +

'<div style="background:#2a1a1a;border-left:3px solid #ef4444;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:10px">' +
'<div style="color:#ef4444;font-weight:700;font-size:14px;margin-bottom:6px">Highlighting/Underlining \u2014 LOW</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">Feels productive. Actually <strong style="color:#fff">passive</strong>. You mark text without processing meaning. Creates a <strong style="color:#fff">false illusion of competence</strong> \u2014 you recognize highlighted words but can\u2019t retrieve them from memory.</div>' +
'</div>' +

'<div style="background:#1a1a2e;border-left:3px solid #4a9eff;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:16px">' +
'<div style="color:#4a9eff;font-weight:700;font-size:14px;margin-bottom:6px">Summarization \u2014 MODERATE</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">Forces more processing than highlighting, but not as powerful as testing yourself.</div>' +
'</div>' +

'<div style="background:#1a1a2e;border-left:3px solid #4a9eff;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:10px">' +
'<div style="color:#4a9eff;font-weight:700;font-size:14px;margin-bottom:6px">Interleaved Practice \u2014 MODERATE</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">Mixing different problem types within one study session (algebra + geometry + stats) instead of blocking one topic at a time.</div>' +
'</div>' +

'<div style="background:#1a1a2e;border-left:3px solid #4a9eff;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:10px">' +
'<div style="color:#4a9eff;font-weight:700;font-size:14px;margin-bottom:6px">Elaborative Interrogation \u2014 MODERATE</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">Generating explanations for WHY a stated fact is true (\u201cWhy would the pancreas produce insulin?\u201d). Works best with prior knowledge.</div>' +
'</div>' +

'<div style="background:#2a1a1a;border-left:3px solid #ef4444;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:16px">' +
'<div style="color:#ef4444;font-weight:700;font-size:14px;margin-bottom:6px">Rereading \u2014 LOW</div>' +
'<div style="color:#b0b0b0;font-size:14px;line-height:1.7">Most common student habit. Diminishing returns after first read. Students substitute rereading for more effective techniques.</div>' +
'</div>' +

'<p style="color:#b0b0b0;font-size:15px;line-height:1.8"><strong style="color:#fff">Winning combo:</strong> Write summaries, then test yourself later in the week = summarization + practice testing + spaced retrieval.</p>' +
'</div>' +

// ─── Rote vs Meaningful ───
'<div class="card" style="margin-top:24px">' +
'<h2 style="color:#fff;font-size:22px;margin-bottom:20px;font-weight:700">Rote vs Meaningful Learning</h2>' +
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">' +
'<div style="background:#1a1a1a;border:1px solid #ef4444;border-radius:10px;padding:16px">' +
'<div style="color:#ef4444;font-weight:700;font-size:14px;margin-bottom:6px">Rote Learning</div>' +
'<div style="color:#9b9b9b;font-size:14px;line-height:1.6">Memorize facts for a test. <strong style="color:#ccc">Cannot apply</strong> to new situations. Rephrased question = stuck.</div>' +
'</div>' +
'<div style="background:#1a1a1a;border:1px solid #22c55e;border-radius:10px;padding:16px">' +
'<div style="color:#22c55e;font-weight:700;font-size:14px;margin-bottom:6px">Meaningful Learning</div>' +
'<div style="color:#9b9b9b;font-size:14px;line-height:1.6">Understand deeply enough to <strong style="color:#ccc">apply to novel, unseen problems</strong>. The real goal.</div>' +
'</div>' +
'</div>' +
'<p style="color:#b0b0b0;font-size:15px;line-height:1.8">The trap: highlighting and rote memorization create the <em>illusion</em> of meaningful learning while only producing rote learning.</p>' +
'</div>' +

'<div style="text-align:center;padding:32px 0"><button class="btn btn-primary" onclick="toggleOverview()">Back to Quiz</button></div>' +

'</div>';
