
const helptext =
`Ultima IV: Quest of the Avatar
by Lord British
(c) 1985 Origin Systems
_____________________________________________
Arrows movement
A      attack, plus direction
B      board transport or mount horse
C      cast spell, plus player and spell first letter
D      down ladder to next level
E      enter towne, castle, or structure
F      fire cannon, plus direction
G      get chest
H      hole up and camp
I      ignite torch
J      jimmy a lock, plus direction
K      climb up
L      locate position (requires special item)
M      mix reagents
N      new character order
O      open door, plus direction
P      peer at gem
Q      quit and save game
R      ready weapon
S      search
T      talk, plus direction
U      use item
V      volume, toggle sound
W      wear armour
X      exit transport or mount
Y      yell, speed up or slow down horse
Z      display stats/attributes
---
* Special Note: Talking with the people found in the game is one of the most important features of Ultima IV to master. It is virtually impossible to solve thy quests without talking to virtually all people in each towne. Each person with whom thou dost Talk is capable of a full conversation. They can be asked about their “Name,” “Job,” and “Health.” You may “Look” again at their visual description. From this information thou shouldst be able to discern what else they might know, hinted at directly by use of the precise words in the conversation. E.g., if thou were to ask Dupré about his “Job” and he were to respond “I am hunting Gremlins,” thou might think to ask him about “Hunting” or “Gremlins” - about either of which he might offer some insight.

Each of these people might ask of thee a question as well; be sure to answer the question honestly, for dishonesty will be remembered and not reflect well upon thee for the rest of the game. Often thou shalt not know what to ask a townsperson until thou hast been told by another: E.g., Iolo the Bard might tell thee to ask Shamino the Ranger about swords. Even if thou hadst met Shamino earlier thou wouldst not have known to ask him about swords, and thus thou wouldst have to seek him out again if thou dost wish that knowledge.

Some of the people that thou shalt meet may be willing to become thy travelling companions. If thou dost wish for a character to become a player in thy party, thou must ask them to “Join” thee. Tis most wise to strengthen thy party as rapidly as possible, up to the seven companions thou shalt need to complete the game. When thou art through with a conversation, then speak the word “Bye” as an accepted means of politely ending thy conversation.

Be sure to keep a journal of thy travels! Many of the clues to solving the quests of Ultima IV are contained in the various and diverse conversations thou might have with the various townsfolk. It would be next to impossible to solve this game without some means of referring back to prior conversa- tions held during play.

Be sure to thoroughly explore the cities and townes! Many of the quests within Ultima IV are contained entirely within individual cities. Tis wisest to spend a great deal of time seeking out the answers that lie hidden in each one of the various townes of Britannia, before moving on to another.

NOTE: During thy conversations with people in Ultima IV, thou may feel the impulse to show thy generosity to less fortunate fellows. Thou may do so by saying: “Give”.
`
export const ultima4: GameLibraryItem = {
  address: 0x0200,
  data: [0x84, 0xC2, 0xCC],
  keymap: {},
  gamepad: null,
  joystick: null,
  rumble: null,
  setup: null,
  helptext: helptext}

