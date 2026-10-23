/**
 * Life reels: one clip = one speaker on screen + matching voice.
 * Narrator clips = scene only (no character bounce). Dialogue clips = cast portrait animates.
 */
export const SPEAKER_CAST = {
  Rohan: "/images/char-raja.png",
  Friend: "/images/char-chotu.png",
  Aman: "/images/char-vikram.png",
  Papa: "/images/char-guruji.png",
  Kabir: "/images/char-vikram.png",
  Arjun: "/images/char-raja.png",
  Boss: "/images/char-guruji.png",
  Meera: "/images/char-meera.png",
  Behen: "/images/char-sana.png",
  Neeraj: "/images/char-sonu.png",
  Chaiwala: "/images/char-bommi.png",
  Hero: "/images/char-vikram.png",
};

export const lifeReels = [
  {
    id: "life-last-seen",
    title: "The Last Seen",
    end: "Aaj kisi ek dost ko call kar lena. Sirf message nahi.",
    caption: "The Last Seen 📱 #Friendship #MentalHealth #HindiReels #KathaStudio",
    clips: [
      {
        scene: "/images/panel-sana-1.png",
        speaker: "Narrator",
        text: "Uske 500 Instagram followers the… par us raat uske paas baat karne ke liye ek bhi insaan nahi tha.",
      },
      {
        scene: "/images/panel-sana-2.png",
        speaker: "Narrator",
        text: "Rohan roz stories post karta tha. Jokes, parties, smiles. Har photo par likes aate the.",
      },
      {
        scene: "/images/panel-sana-1.png",
        speaker: "Rohan",
        text: "Lekin jab raat ko usne apne best friend ko message kiya — Bhai, baat karni hai — message seen bhi nahi hua.",
      },
      {
        scene: "/images/panel-chotu-2.png",
        speaker: "Narrator",
        text: "Agli subah uske dost ka call aaya.",
      },
      {
        scene: "/images/panel-chotu-2.png",
        speaker: "Friend",
        text: "Bhai, kal raat phone silent tha. Tu theek hai na?",
        dramaticPause: true,
      },
      {
        scene: "/images/panel-chotu-3.png",
        speaker: "Narrator",
        text: "Rohan kuch seconds chup raha.",
      },
      {
        scene: "/images/panel-chotu-3.png",
        speaker: "Rohan",
        text: "Haan bhai, ab theek hoon. Tune pooch liya na.",
      },
      {
        scene: "/images/panel-sana-2.png",
        speaker: "Narrator",
        text: "Kabhi-kabhi kisi ki jaan bachane ke liye advice nahi… bas ek insaan chahiye hota hai jo pooch le — sach mein theek ho?",
      },
    ],
  },
  {
    id: "life-papa-missed-call",
    title: "Papa Ka Missed Call",
    end: "Call your parents before it becomes a memory.",
    caption: "Papa ka missed call 📞 #Family #Parents #HindiReels #KathaStudio",
    clips: [
      {
        scene: "/images/panel-vikram-1.png",
        speaker: "Narrator",
        text: "Ek din Papa ke 17 missed calls dekhkar usne phone silent kar diya… aur agle din uske paas call karne ke liye koi nahi tha.",
      },
      {
        scene: "/images/panel-vikram-2.png",
        speaker: "Narrator",
        text: "Aman office mein busy tha. Papa baar-baar phone kar rahe the.",
      },
      {
        scene: "/images/panel-vikram-2.png",
        speaker: "Aman",
        text: "Papa, meeting mein hoon. Baad mein call karta hoon.",
      },
      {
        scene: "/images/char-amma.png",
        speaker: "Papa",
        text: "Theek hai beta, bas teri awaaz sunni thi.",
      },
      {
        scene: "/images/panel-vikram-3.png",
        speaker: "Narrator",
        text: "Aman ne message padha, smile kiya, aur kaam mein lag gaya.",
      },
      {
        scene: "/images/panel-vikram-1.png",
        speaker: "Papa",
        text: "Beta, aaj tumhari bachpan wali photo mili. Yaad hai, tum mujhe har chhoti baat batate the?",
        dramaticPause: true,
      },
      {
        scene: "/images/panel-vikram-3.png",
        speaker: "Narrator",
        text: "Aman ne turant call kiya.",
      },
      {
        scene: "/images/char-amma.png",
        speaker: "Papa",
        text: "Arre, kuch nahi hua. Bas yaad aa gaya tu kitni jaldi bada ho gaya.",
      },
      {
        scene: "/images/panel-vikram-2.png",
        speaker: "Narrator",
        text: "Hum bade hokar kehte hain, Papa, aap samajhte kyun nahi? Kabhi hum bhi samjhein… unke paas ab humein dene ke liye waqt hai, par shayad humein dene ke liye hamare paas waqt kam hai.",
      },
    ],
  },
  {
    id: "life-stolen-idea",
    title: "The Friend Who Stole His Idea",
    end: "Protect your work. Never compromise your character.",
    caption: "Idea vs character 💼 #Office #Integrity #HindiReels #KathaStudio",
    clips: [
      {
        scene: "/images/panel-vikram-2.png",
        speaker: "Narrator",
        text: "Uske best friend ne uska idea chura liya… aur poori company ke saamne usi idea ka credit le gaya.",
      },
      {
        scene: "/images/panel-vikram-3.png",
        speaker: "Narrator",
        text: "Kabir ne teen hafte ek presentation par kaam kiya tha. Usne apne dost Arjun par bharosa karke draft share kiya.",
      },
      {
        scene: "/images/panel-raja-4.png",
        speaker: "Narrator",
        text: "Meeting mein Arjun ne wahi presentation apne naam se dikha di.",
      },
      {
        scene: "/images/panel-raja-4.png",
        speaker: "Boss",
        text: "Brilliant work, Arjun!",
      },
      {
        scene: "/images/panel-vikram-1.png",
        speaker: "Narrator",
        text: "Kabir chup raha. Sabko laga woh kamzor hai.",
      },
      {
        scene: "/images/panel-vikram-1.png",
        speaker: "Narrator",
        text: "Agle round mein boss ne technical questions poochhe. Arjun ke paas jawab nahi the.",
        dramaticPause: true,
      },
      {
        scene: "/images/panel-vikram-2.png",
        speaker: "Narrator",
        text: "Kabir ne calmly whiteboard par poora model samjha diya.",
      },
      {
        scene: "/images/panel-vikram-2.png",
        speaker: "Boss",
        text: "Yeh tumne banaya tha?",
      },
      {
        scene: "/images/panel-vikram-3.png",
        speaker: "Kabir",
        text: "Sir, idea se zyada zaroori hai usse execute karna. Main aapko poora process dikha sakta hoon.",
      },
      {
        scene: "/images/panel-vikram-1.png",
        speaker: "Narrator",
        text: "Kisi ka credit chura kar tum ek meeting jeet sakte ho. Lekin skill, character aur consistency ko kitni der churaoge?",
      },
    ],
  },
  {
    id: "life-everyone-ahead",
    title: "Everyone Was Ahead of Her",
    end: "Your timeline is not their timeline.",
    caption: "Highlight reel vs real life 🌱 #SelfWorth #HindiReels #KathaStudio",
    clips: [
      {
        scene: "/images/panel-leela-1.png",
        speaker: "Narrator",
        text: "Usne Instagram par apne saare friends ko successful dekha… aur pehli baar apni zindagi se nafrat hone lagi.",
      },
      {
        scene: "/images/panel-leela-2.png",
        speaker: "Narrator",
        text: "Ek friend Europe mein tha. Doosre ne new car li. Teesre ki salary double ho gayi.",
      },
      {
        scene: "/images/panel-meera-4.png",
        speaker: "Meera",
        text: "Aur Meera? Wahi job, wahi room, wahi problems. Shayad main life mein kuch kar hi nahi rahi.",
      },
      {
        scene: "/images/panel-meera-2.png",
        speaker: "Behen",
        text: "Didi, aapko pata hai? Main jab bhi give up karne wali hoti hoon, aapko dekhti hoon. Aap itni problems ke baad bhi try karti ho.",
        dramaticPause: true,
      },
      {
        scene: "/images/panel-meera-2.png",
        speaker: "Narrator",
        text: "Meera ko pehli baar ehsaas hua ki jis zindagi ko woh ordinary samajh rahi thi, wahi kisi aur ke liye inspiration thi.",
      },
      {
        scene: "/images/panel-leela-1.png",
        speaker: "Narrator",
        text: "Tum apni life ka behind-the-scenes dekhte ho aur doosron ki life ka highlight reel. Phir khud ko loser kyun bolte ho?",
      },
    ],
  },
  {
    id: "life-chaiwala",
    title: "The Man Who Never Asked for Money",
    end: "Respect everyone. You never know what someone carries.",
    caption: "Chai ki dukaan wali kindness ☕ #Kindness #HindiReels #KathaStudio",
    clips: [
      {
        scene: "/images/panel-bommi-1.png",
        speaker: "Narrator",
        text: "Woh chaiwale ko roz 20 rupaye extra deta tha… phir ek din pata chala ki chaiwala uske baare mein sab jaanta tha.",
      },
      {
        scene: "/images/panel-chotu-1.png",
        speaker: "Narrator",
        text: "Neeraj roz office jaate waqt ek chai ki dukaan par rukta tha.",
      },
      {
        scene: "/images/panel-bommi-2.png",
        speaker: "Chaiwala",
        text: "Sir, aaj thake hue lag rahe ho.",
      },
      {
        scene: "/images/panel-chotu-1.png",
        speaker: "Narrator",
        text: "Neeraj hanskar taal deta. Ek din uski job chali gayi. Paise bachane ke liye usne chai peena bhi band kar diya.",
      },
      {
        scene: "/images/panel-bommi-1.png",
        speaker: "Chaiwala",
        text: "Sir, chai nahi piyoge aaj?",
        dramaticPause: true,
      },
      {
        scene: "/images/panel-chotu-2.png",
        speaker: "Neeraj",
        text: "Abhi thoda budget tight hai.",
      },
      {
        scene: "/images/panel-bommi-2.png",
        speaker: "Chaiwala",
        text: "Sir, paise baad mein de dena. Aap roz meri chai peete the. Aaj meri baari hai.",
      },
      {
        scene: "/images/panel-chotu-2.png",
        speaker: "Narrator",
        text: "Neeraj ko us din samajh aaya — kindness hamesha bade gharon se nahi aati. Kabhi-kabhi woh ek chhoti si chai ki dukaan se bhi mil jaati hai.",
      },
    ],
  },
  {
    id: "life-rejection-letter",
    title: "The Rejection Letter",
    end: "Rejection is information, not your identity.",
    caption: "28 rejections, 29th try 📧 #Career #HindiReels #KathaStudio",
    clips: [
      {
        scene: "/images/panel-vikram-3.png",
        speaker: "Narrator",
        text: "Usko 27 companies ne reject kiya. 28th company ka email dekhkar usne laptop band kar diya.",
      },
      {
        scene: "/images/panel-vikram-1.png",
        speaker: "Narrator",
        text: "Har interview ke baad wahi line: We regret to inform you…",
      },
      {
        scene: "/images/panel-vikram-2.png",
        speaker: "Narrator",
        text: "Doston ne kaha: Bhai, kuch aur kar le. Gharwale kehte: Kitna time lagega?",
      },
      {
        scene: "/images/panel-vikram-1.png",
        speaker: "Hero",
        text: "Usne 28th email khola. Rejected. Us raat usne apna resume delete karne ka socha.",
      },
      {
        scene: "/images/panel-leela-2.png",
        speaker: "Narrator",
        text: "Laptop band karne se pehle ek purana email dikha — pehli company ka feedback. Your technical skills need improvement. Please apply again after six months.",
        dramaticPause: true,
      },
      {
        scene: "/images/panel-vikram-3.png",
        speaker: "Narrator",
        text: "Usne us email ko gusse mein delete nahi kiya tha. Usne feedback par kaam kiya, projects banaye, aur interview practice ki.",
      },
      {
        scene: "/images/panel-vikram-2.png",
        speaker: "Hero",
        text: "Agli subah usne 29th application bheji.",
      },
      {
        scene: "/images/panel-vikram-1.png",
        speaker: "Narrator",
        text: "Success ka matlab har baar jeetna nahi. Kabhi-kabhi success bas itna hota hai ki 28 baar haarne ke baad tum 29vi baar try karte ho.",
      },
    ],
  },
  {
    id: "life-friend-stopped-calling",
    title: "The Friend Who Stopped Calling",
    end: "If the relationship matters, let your ego lose once.",
    caption: "Pehle kaun jhukega? 🤝 #Friendship #HindiReels #KathaStudio",
    clips: [
      {
        scene: "/images/panel-chotu-1.png",
        speaker: "Narrator",
        text: "Teen saal tak usne apne best friend ko call nahi kiya… kyunki woh wait kar raha tha ki pehle phone woh kare.",
      },
      {
        scene: "/images/panel-chotu-2.png",
        speaker: "Narrator",
        text: "Dono school se dost the. Pehle har din baat hoti thi. Phir jobs, relationships, responsibilities aayi.",
      },
      {
        scene: "/images/panel-chotu-3.png",
        speaker: "Narrator",
        text: "Ek din chhoti si baat par argument hua. Dono ne socha: Ab woh call karega. Din mahino mein badle. Mahine saalon mein.",
      },
      {
        scene: "/images/panel-chotu-4.png",
        speaker: "Narrator",
        text: "Ek mutual friend ne bataya ki uska dost doosre shehar shift ho raha hai.",
      },
      {
        scene: "/images/panel-chotu-4.png",
        speaker: "Narrator",
        text: "Usne turant call kiya.",
      },
      {
        scene: "/images/panel-chotu-4.png",
        speaker: "Rohan",
        text: "Bhai, itne saal ho gaye…",
        dramaticPause: true,
      },
      {
        scene: "/images/panel-chotu-2.png",
        speaker: "Friend",
        text: "Haan bhai. Main bhi soch raha tha tu call karega.",
      },
      {
        scene: "/images/panel-chotu-3.png",
        speaker: "Narrator",
        text: "Dono hansne lage, phir chup ho gaye.",
      },
      {
        scene: "/images/panel-chotu-1.png",
        speaker: "Narrator",
        text: "Kabhi-kabhi rishta kisi bade dhokhe se nahi tootta. Do logon ke is intezaar mein toot jaata hai ki pehle jhukega kaun.",
      },
    ],
  },
];
