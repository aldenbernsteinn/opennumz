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
reason:"Before Dunlosky crowns a study technique as \"highly effective,\" he checks its generalizability. Does this technique only work for 5th graders learning math? Or does it generalize across all ages, subjects, and environments? The best techniques generalize everywhere."}

];

var SA_QUESTIONS = {};
var KEY_TERMS = {};
