"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// MUAY THAI HEAVY BAG TRACKER v3
// Design: "Ivory" light theme, Outfit font
// ═══════════════════════════════════════════════════════

const LS = "fab-mt-bag-v3";

const loadData = async () => {
  try {
    const raw = localStorage.getItem(LS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
};

const saveData = async (d) => {
  try { localStorage.setItem(LS, JSON.stringify(d)); } catch (e) {}
};

// ── Colors by mode ──
const MODES = {
  session: { accent: "#D4702C", light: "#FFF3EB", label: "SESSION", icon: "🥊" },
  log: { accent: "#7C3AED", light: "#F3EDFF", label: "HISTORIQUE", icon: "📊" },
};

// ── Combo Library ──
const COMBO_LIB = [
  { id: "c01", strikes: ["Jab"], level: 1, desc: "Jab main avant. Snap rapide depuis la garde, ramène la main au visage. Pas de wind-up, c'est la vitesse qui compte.", defense: "Pull back après le jab. Recule la tête d'un demi-pas." },
  { id: "c02", strikes: ["Cross"], level: 1, desc: "Cross main arrière. Rotation de hanche complète, le pied arrière pivote à 45°. Tout le poids passe dans le poing.", defense: "Ramène la main en garde immédiatement. Lean back." },
  { id: "c03", strikes: ["Jab", "Cross"], level: 1, desc: "1-2 classique. Le jab main avant mesure, le cross main arrière punit. Le jab prépare la rotation du cross.", defense: "Après le cross : slip à droite ou circle out. Ne reste pas en face." },
  { id: "c04", strikes: ["Jab", "Cross", "Hook avant"], level: 2, desc: "1-2-3. Le hook MAIN AVANT arrive quand l'adversaire shell up après le cross. Coude à 90°, tourne les hanches.", defense: "Après le hook : dip la tête et circle à gauche." },
  { id: "c05", strikes: ["Jab", "Hook avant"], level: 1, desc: "Jab main avant, hook main avant. Même main, deux angles. Le jab fait lever la garde, le hook contourne.", defense: "Pull back après le hook. Mains hautes." },
  { id: "c06", strikes: ["Cross", "Hook avant", "Cross"], level: 2, desc: "2-3-2. Cross main arrière, hook main avant, cross main arrière. Le hook sert de pivot entre les deux cross. Rythme rapide.", defense: "Circle out à droite après le dernier cross." },
  { id: "c07", strikes: ["Jab", "Uppercut arrière"], level: 2, desc: "Jab main avant fait monter la garde adverse, uppercut MAIN ARRIÈRE passe en dessous. Pousse avec les jambes, pas juste le bras.", defense: "Après l'uppercut : step back + garde haute." },
  { id: "c08", strikes: ["Jab", "Cross corps", "Hook avant tête"], level: 3, desc: "Change de niveau. Cross MAIN ARRIÈRE au corps (l'adversaire baisse les mains), hook MAIN AVANT remonte à la tête. IMPRÉVISIBLE : haut, bas, haut.", defense: "Après le hook tête : slip + circle out. Tu es exposé après le changement de niveau." },
  { id: "c09", strikes: ["Teep jambe avant"], level: 1, desc: "Lead teep JAMBE AVANT. TON ARME #1 à 198cm. Hip snap avec la hanche avant, pousse avec la plante du pied. Ramène vite en garde. Plus rapide que le rear teep mais moins puissant.", defense: "Ramène la jambe en position check, pas au sol. Garde les mains hautes pendant le teep." },
  { id: "c10", strikes: ["Front kick jambe arrière"], level: 1, desc: "Rear front kick JAMBE ARRIÈRE. Plus puissant que le lead teep. Extension de hanche complète, monte sur la pointe du pied avant. Tout le poids du corps passe dedans.", defense: "Ramène en garde immédiatement. Couvre la tête, le counter vient pendant le retour." },
  { id: "c11", strikes: ["Jab", "Front kick jambe arrière"], level: 2, desc: "Jab main avant mesure la distance, front kick JAMBE ARRIÈRE exploite l'ouverture. L'adversaire recule après le jab = le kick arrive sur un appui instable.", defense: "Après le kick : 2 pas en arrière + garde. Reviens à ta distance." },
  { id: "c12", strikes: ["Front kick jambe avant", "Jab"], level: 2, desc: "INVERSÉ = imprévisible. Front kick JAMBE AVANT en premier (casse le pattern habituel poings-puis-pieds), le jab main avant punit le déséquilibre.", defense: "Circle à droite après le jab. Sors de la ligne." },
  { id: "c13", strikes: ["Jab", "Cross", "Low kick jambe arrière"], level: 2, desc: "Le classique Muay Thai. 1-2 haut fait monter la garde, low kick JAMBE ARRIÈRE chop la cuisse avant exposée. Tourne la hanche, frappe avec le tibia.", defense: "Check un kick imaginaire après ton low kick. Ramène en position de garde." },
  { id: "c14", strikes: ["Low kick jambe avant", "Jab", "Cross"], level: 2, desc: "INVERSÉ. Low kick JAMBE AVANT attaque en bas (switch ou lead low kick rapide), puis jab-cross punissent en haut. L'adversaire regarde ses jambes = mains ouvertes.", defense: "Après le cross : teep jambe avant pour repousser et recréer la distance." },
  { id: "c15", strikes: ["Teep jambe avant", "Cross", "Hook avant"], level: 3, desc: "Teep JAMBE AVANT déstabilise, pose le pied en avançant, cross main arrière dans la foulée, hook main avant finit. Transition distance → close range.", defense: "Après le hook : push off + teep jambe avant reset. Reviens à ta distance de teep." },
  { id: "c16", strikes: ["Hook avant", "Teep jambe avant"], level: 2, desc: "INVERSÉ. Hook main avant surprend à courte distance, teep JAMBE AVANT repousse immédiatement. Tu reprends le contrôle de la distance.", defense: "Le teep EST ta défense ici. Après le teep : circle out." },
  { id: "c17", strikes: ["Jab", "Cross", "Body kick jambe arrière"], level: 2, desc: "1-2 haut, body kick JAMBE ARRIÈRE au milieu. Le cross charge la rotation pour le kick. Pied d'appui (avant) pivote à 180°. Vise les côtes flottantes.", defense: "Après le kick : ramène la jambe vite, couvre la tête. Le counter arrive pendant le retour du kick." },
  { id: "c18", strikes: ["Low kick jambe arrière"], level: 1, desc: "Low kick JAMBE ARRIÈRE seul (ton power leg). Tourne la hanche à fond, frappe avec le tibia sur la cuisse avant adverse. Traverse la cible, ne t'arrête pas au contact.", defense: "Check un kick imaginaire immédiatement après. Entraîne le réflexe check-counter." },
  { id: "c19", strikes: ["Body kick jambe arrière"], level: 1, desc: "Body kick JAMBE ARRIÈRE seul. Vise les côtes flottantes. Tout le corps tourne : pied d'appui, hanche, épaule, bras opposé descend. UN mouvement, pas une jambe qui monte.", defense: "Ramène en position haute. Couvre le visage pendant le retour de jambe." },
  { id: "c20", strikes: ["High kick jambe arrière"], level: 2, desc: "High kick JAMBE ARRIÈRE. À 198cm, il arrive de TRÈS haut. Setup avec une feinte de low kick du même côté ou un jab. Même mécanique que le body kick, juste plus haut.", defense: "Garde la main avant tendue pendant le kick pour frame. Circle après." },
  { id: "c21", strikes: ["Jab", "Jab", "Cross", "Low kick jambe arrière"], level: 3, desc: "Double jab main avant charge le rythme (1-1), cross main arrière engage, low kick JAMBE ARRIÈRE finit en bas. 4 frappes : haut-haut-haut-bas.", defense: "Après le low kick : step back + parry position. Prêt pour le counter." },
  { id: "c22", strikes: ["Jab", "Cross", "Hook avant", "Body kick jambe arrière"], level: 3, desc: "1-2-3 puis body kick JAMBE ARRIÈRE. Le hook main avant tourne les hanches vers la gauche = setup parfait pour le body kick arrière qui revient de la droite.", defense: "Après le body kick : teep jambe avant reset. Tu es loin après cette séquence." },
  { id: "c23", strikes: ["Teep jambe avant", "Cross", "Coude avant"], level: 3, desc: "Teep JAMBE AVANT crée la réaction, pose le pied en step in, cross main arrière ferme la distance, coude AVANT horizontal coupe. Frappe avec la pointe de l'ulna.", defense: "Mains en garde IMMÉDIATEMENT après le coude. Le coude expose ta garde." },
  { id: "c24", strikes: ["Jab", "Cross", "Coude avant horizontal"], level: 3, desc: "1-2 puis coude MAIN/BRAS AVANT horizontal (sok tat). Le cross main arrière ferme la distance, le coude avant tranche au visage. Pointe de l'os.", defense: "Après le coude : mains au visage, step back ou clinch. Ne reste pas à mi-distance." },
  { id: "c25", strikes: ["Hook avant", "Coude arrière"], level: 2, desc: "Hook MAIN AVANT ouvre la garde, coude ARRIÈRE horizontal tranche. Même rotation, flow naturel. Le hook crée le mouvement, le coude utilise le retour.", defense: "Après le coude : clinch ou push off + teep. Tu es trop près pour rester passif." },
  { id: "c26", strikes: ["Jab", "Jab", "Clinch entry"], level: 2, desc: "Double jab main avant occupe les mains adverses, tu step in pour verrouiller le clinch. Les jabs cachent ton entrée. Coudes serrés en entrant.", defense: "En entrant en clinch : coudes EN AVANT, tête sur le côté. Protège-toi pendant la transition." },
  { id: "c27", strikes: ["Hook avant", "Clinch entry", "Genou arrière"], level: 3, desc: "Hook MAIN AVANT déséquilibre, tu attrapes la nuque avec les deux mains (plum), genou JAMBE ARRIÈRE monte au corps. Tire l'adversaire VERS le genou.", defense: "Après le genou : maintiens le clinch OU push off + teep reset. Décide vite." },
  { id: "c28", strikes: ["Teep jambe avant", "Step in", "Genou arrière", "Coude avant"], level: 3, desc: "Séquence Dieselnoi. Teep JAMBE AVANT crée la réaction, step in agressif, genou JAMBE ARRIÈRE au corps, coude AVANT à la tête. Distance → clinch → damage.", defense: "Après le coude : push off avec les deux mains + teep jambe avant pour revenir à distance. TOUJOURS reset." },
  { id: "c29", strikes: ["Cross", "Hook avant", "High kick jambe arrière"], level: 3, desc: "Cross main arrière, hook MAIN AVANT fait baisser la garde sur les côtés, high kick JAMBE ARRIÈRE passe par-dessus la garde. À 198cm = létal.", defense: "Après le high kick : ramène la jambe en check, puis repose. Garde haute." },
  { id: "c30", strikes: ["Front kick jambe avant", "Jab", "Cross", "Low kick jambe arrière"], level: 3, desc: "4 niveaux : front kick JAMBE AVANT au milieu, jab-cross en haut, low kick JAMBE ARRIÈRE en bas. Totalement imprévisible. L'adversaire ne sait pas où regarder.", defense: "Après le low kick : circle out + garde. Tu as frappé 4 niveaux, il est perdu." },
  { id: "c31", strikes: ["Side kick jambe avant"], level: 2, desc: "Side kick JAMBE AVANT. Plus de portée que le teep car tu tournes le corps de profil. Pousse avec le talon, pas la plante. Arme de distance par excellence pour les grands.", defense: "Ramène en garde face vite. Le side kick te tourne de profil = vulnérable au counter." },
  { id: "c32", strikes: ["Switch low kick"], level: 2, desc: "SWITCH : change de stance (jambe avant passe derrière), low kick immédiat de la nouvelle jambe arrière (qui était ta jambe avant). Le timing surprend parce que le kick vient du côté inattendu.", defense: "Reviens en stance orthodoxe immédiatement après. Ne reste PAS en southpaw." },
  { id: "c33", strikes: ["Jab", "Switch body kick"], level: 3, desc: "Jab main avant en orthodoxe, puis SWITCH instantané, body kick de la nouvelle jambe arrière. L'angle est totalement inattendu car le kick vient de l'autre côté.", defense: "Reviens en orthodoxe + circle après le kick. Très exposé après un switch kick." },
  { id: "c34", strikes: ["Genou D", "Genou G", "Genou D"], level: 2, desc: "Clinch plum : 3 genoux droits alternés (droit-gauche-droit). Tire le sac vers toi à chaque genou. Ramène le pied DERRIÈRE toi avant de driver le genou vers l'avant.", defense: "Après le 3ème genou : push off + teep jambe avant. Ne reste jamais en clinch sans frapper." },
  { id: "c35", strikes: ["Long Guard", "Genou arrière", "Genou avant", "Teep jambe avant"], level: 3, desc: "Frame avec le BRAS AVANT sur l'épaule (long guard), tire vers toi, genou JAMBE ARRIÈRE puis genou JAMBE AVANT, push off + teep JAMBE AVANT pour revenir à distance.", defense: "Le teep EST le reset défensif. Après : circle et recommence." },
  // ── Combos défensifs : la défense déclenche l'attaque ──
  { id: "c36", strikes: ["Check jambe avant", "Low kick jambe arrière"], level: 2, desc: "CHECK-COUNTER classique. Lève le tibia JAMBE AVANT pour bloquer le low kick adverse, repose le pied, balance immédiatement ton low kick JAMBE ARRIÈRE sur sa cuisse. Le check et le counter sont UN seul mouvement.", defense: "Après le counter low kick : step back + garde. Tu es en position ouverte après le check." },
  { id: "c37", strikes: ["Check jambe avant", "Cross", "Body kick jambe arrière"], level: 3, desc: "CHECK puis punition double. Check tibia JAMBE AVANT, repose, cross MAIN ARRIÈRE au visage (il est déséquilibré par son kick raté), body kick JAMBE ARRIÈRE aux côtes. Trois niveaux : jambes, tête, corps.", defense: "Après le body kick : teep jambe avant reset. Tu as contre-attaqué, maintenant reprends la distance." },
  { id: "c38", strikes: ["Parry main arrière", "Cross", "Hook avant"], level: 2, desc: "PARRY-COUNTER. Pare le jab adverse avec ta MAIN ARRIÈRE (tape-le sur le côté), cross MAIN ARRIÈRE dans la foulée (même main, pare puis frappe), hook MAIN AVANT finit. Le parry crée l'ouverture.", defense: "Après le hook : circle out. Le parry t'a mis en angle, profites-en pour sortir." },
  { id: "c39", strikes: ["Parry main arrière", "Cross", "Low kick jambe arrière"], level: 2, desc: "PARRY puis haut-bas. Pare le jab avec MAIN ARRIÈRE, cross MAIN ARRIÈRE punit en haut, low kick JAMBE ARRIÈRE chop en bas. L'adversaire ne sait pas où défendre après un jab paré.", defense: "Check après le low kick. Entraîne le réflexe défensif automatique." },
  { id: "c40", strikes: ["Slip intérieur", "Uppercut arrière", "Hook avant"], level: 3, desc: "SLIP-COUNTER boxing. Slip à l'intérieur du jab adverse (baisse le torse vers la droite), uppercut MAIN ARRIÈRE monte de dessous (tu es déjà chargé du côté droit), hook MAIN AVANT finit. Combo de counter-puncher.", defense: "Après le hook : dip la tête + circle gauche. Tu es à courte distance après le slip." },
  { id: "c41", strikes: ["Slip extérieur", "Cross", "Teep jambe avant"], level: 2, desc: "SLIP-CROSS-RESET. Slip à l'extérieur du cross adverse (baisse le torse vers la gauche), cross MAIN ARRIÈRE dans l'ouverture, teep JAMBE AVANT repousse immédiatement. Defence → punition → reset distance.", defense: "Le teep est ton reset. Circle après." },
  { id: "c42", strikes: ["Check jambe avant", "Teep jambe avant"], level: 1, desc: "CHECK-TEEP. Le plus simple des counters. Check tibia JAMBE AVANT, sans reposer le pied, lance un teep JAMBE AVANT depuis la position de check. Deux défenses en une : tu bloques ET tu repousses.", defense: "Après le teep : repose la jambe, step back. Distance recréée." },
  { id: "c43", strikes: ["Parry main arrière", "Jab", "Front kick jambe arrière"], level: 2, desc: "PARRY-JAB-KICK. Pare le jab avec MAIN ARRIÈRE, jab MAIN AVANT immédiat (il est ouvert après le parry), front kick JAMBE ARRIÈRE pousse au corps. Du counter pur à la distance.", defense: "Après le front kick : 2 pas arrière. Tu as tout fait à distance, garde-la." },
  { id: "c44", strikes: ["Lean back", "Cross", "Hook avant", "Low kick jambe arrière"], level: 3, desc: "LEAN BACK-COUNTER. Penche le buste en arrière pour esquiver un jab/cross (le poids va sur la jambe arrière), reviens avec un cross MAIN ARRIÈRE chargé, hook MAIN AVANT, low kick JAMBE ARRIÈRE. Le lean back CHARGE le cross.", defense: "Après le low kick : teep jambe avant pour reset. Le lean back t'a mis en arrière, le low kick t'a ramené en avant." },
];

// ── 5-Round Session Structure ──
const ROUNDS = [
  { num: 1, title: "Technique & Distance", zone: "60-70%", focus: "Précision. Chaque teep mesure. 50% puissance max. Footwork entre chaque combo.",
    combos: ["c09", "c03", "c11", "c12", "c42"],
    defense: {
      rule: "Après chaque combo : 2-3 pas latéraux. Ne JAMAIS frapper deux fois depuis le même angle.",
      actions: [
        { name: "Circle out", desc: "Après chaque combo, sors en angle 45° à droite OU à gauche. Alterne." },
        { name: "Pull back", desc: "Après ton cross, recule la tête d'un demi-pas. Simule l'esquive du counter." },
        { name: "Garde active", desc: "Entre chaque combo, vérifie ta garde : mains au visage, coudes serrés, menton rentré." },
      ],
    },
    restDrill: { name: "Équilibre unipodal", desc: "30s par jambe, mains en garde, yeux ouverts. Ne pose pas le pied." },
    coaching: { pourquoi: "Calibrer ta distance avant de monter en intensité. Le round 1 construit le rythme.", comment: "Slide-step jab. Teep le sac, laisse revenir, intercepte. Circle après chaque combo.", focus: "TIMING > puissance. Visualise un adversaire." },
    inspo: [
      { fighter: "Samart Payakaroon", url: "https://www.youtube.com/results?search_query=samart+payakaroon+teep+technique+highlights" },
      { fighter: "Tawanchai teep", url: "https://www.youtube.com/results?search_query=tawanchai+teep+highlights+one+championship" },
    ],
    videos: [
      { label: "🔍 Teep technique", url: "https://www.youtube.com/results?search_query=muay+thai+teep+push+kick+technique+tutorial" },
      { label: "🔍 Jab Muay Thai", url: "https://www.youtube.com/results?search_query=muay+thai+jab+technique+tutorial+distance" },
      { label: "🔍 Footwork angles", url: "https://www.youtube.com/results?search_query=muay+thai+footwork+drills+angles+movement" },
    ],
  },
  { num: 2, title: "Combos + Défense", zone: "70-80%", focus: "Chaque combo inclut une défense AVANT le suivant. Check, parry, slip, puis contre.",
    combos: ["c36", "c37", "c38", "c39", "c40", "c41"],
    defense: {
      rule: "Chaque combo DOIT commencer par une action défensive. Tu ne frappes jamais en premier dans ce round.",
      actions: [
        { name: "Parry (parade main)", desc: "Le sac revient vers toi = jab adverse. Tape-le sur le côté avec la main arrière, puis contre avec 2-3-T." },
        { name: "Slip (esquive tête)", desc: "Après chaque cross, slip à l'intérieur (comme si tu évitais un crochet). Puis relance." },
        { name: "Check (parade tibia)", desc: "Lève le tibia pour bloquer un low kick imaginaire. Depuis le check, lance un MK sans reposer le pied." },
        { name: "Head movement", desc: "Pull back après le cross, dip après le hook. Ne reste JAMAIS statique entre deux combos." },
      ],
    },
    restDrill: { name: "Teep au ralenti (8 temps)", desc: "Chamber (1-2), extension (3-4), tenue (5-6), retour (7-8). 3 par jambe. Travaille l'équilibre." },
    coaching: { pourquoi: "En combat, tu ne frappes jamais sans avoir défendu. La défense crée l'ouverture.", comment: "Le sac revient = jab adverse. Pare-le, puis contre. Slip après chaque cross.", focus: "DÉFENSE avant attaque. Head movement entre chaque combo." },
    inspo: [
      { fighter: "Lerdsila contres", url: "https://www.youtube.com/results?search_query=lerdsila+counter+elusive+muay+thai+highlights" },
      { fighter: "Namsaknoi (Emperor)", url: "https://www.youtube.com/results?search_query=namsaknoi+counter+muay+thai+highlights" },
    ],
    videos: [
      { label: "🔍 Check kicks", url: "https://www.youtube.com/results?search_query=muay+thai+check+kick+defense+technique" },
      { label: "🔍 Parry + counter", url: "https://www.youtube.com/results?search_query=muay+thai+parry+counter+technique+tutorial" },
      { label: "🔍 Head movement Muay Thai", url: "https://www.youtube.com/results?search_query=muay+thai+head+movement+defense+technique" },
      { label: "🔍 Slip + counter", url: "https://www.youtube.com/results?search_query=muay+thai+slip+counter+punch+technique" },
    ],
  },
  { num: 3, title: "Puissance", zone: "85-100%", focus: "FULL POWER. Reset complet entre chaque combo. Chaque kick doit faire tourner le sac.",
    combos: ["c17", "c21", "c22", "c29", "c44"],
    defense: {
      rule: "Reset ta stance COMPLÈTEMENT entre chaque power shot. La puissance vient d'une position propre, pas du rush.",
      actions: [
        { name: "Stance reset", desc: "Après chaque combo : pieds en position, poids centré, mains en garde. Pas de raccourci." },
        { name: "Cover après le kick", desc: "Après un body kick, ramène la jambe et couvre la tête. En combat, le counter vient pendant le retour du kick." },
        { name: "Lean back sur le cross", desc: "Après un power cross, shift le poids sur la jambe arrière. Tu es hors de portée du counter." },
      ],
    },
    restDrill: { name: "Round Kick au ralenti (10 temps)", desc: "Transfer (1-3), levée + rotation (4-6), extension (7-8), retour contrôlé (9-10). 3/jambe." },
    coaching: { pourquoi: "Construire la puissance de frappe. Le système nerveux doit apprendre à recruter toutes les fibres.", comment: "5-8s entre chaque combo. Rotation de hanche COMPLÈTE sur chaque kick. Pied d'appui à 180°.", focus: "QUALITÉ > quantité. Si la vitesse drop, arrête la série." },
    inspo: [
      { fighter: "Buakaw power", url: "https://www.youtube.com/results?search_query=buakaw+heavy+bag+power+kick+training" },
      { fighter: "Superbon précision", url: "https://www.youtube.com/results?search_query=superbon+muay+thai+power+combos+highlights" },
    ],
    videos: [
      { label: "🔍 Power roundhouse", url: "https://www.youtube.com/results?search_query=muay+thai+roundhouse+body+kick+power+technique" },
      { label: "🔍 Low kick power", url: "https://www.youtube.com/results?search_query=muay+thai+low+kick+power+heavy+bag" },
    ],
  },
  { num: 4, title: "Clinch : Coudes & Genoux", zone: "80-90%", focus: "Ta kill zone à 198cm. Dieselnoi : ramène le pied DERRIÈRE avant de driver le genou.",
    combos: ["c24", "c25", "c27", "c28", "c34", "c35"],
    defense: {
      rule: "Après chaque séquence clinch : push off + teep pour revenir à TA distance. Ne reste jamais en clinch passivement.",
      actions: [
        { name: "Frame avec les coudes", desc: "Quand tu clinches le sac, les coudes sont EN AVANT, serrés. Ils protègent ton visage et tes côtes." },
        { name: "Push off → teep reset", desc: "Après tes genoux : pousse le sac, recule d'un pas, teep pour maintenir la distance recréée." },
        { name: "Guard up après le coude", desc: "Le coude expose ta garde. Après CHAQUE coude : main immédiatement en garde. Non négociable." },
        { name: "Knee guard", desc: "Après un genou, garde la jambe en position haute (check position) avant de reposer. Protège des contres." },
      ],
    },
    restDrill: { name: "Équilibre yeux fermés", desc: "20s par jambe, yeux FERMÉS. Puis 2 genoux au ralenti par jambe (6 temps : step 1-2, drive 3-4, retour 5-6)." },
    coaching: { pourquoi: "Une fois le plum verrouillé, tes genoux sont dévastateurs. La transition distance → clinch est la clé.", comment: "Clinch le haut du sac. Tire vers toi en montant le genou. 20 genoux alternés sans pause.", focus: "TRANSITION : distance → clinch → damage → teep reset." },
    inspo: [
      { fighter: "Dieselnoi knees", url: "https://www.youtube.com/results?search_query=dieselnoi+knee+clinch+highlights+breakdown" },
      { fighter: "Yodkhunpon elbows", url: "https://www.youtube.com/results?search_query=yodkhunpon+elbow+hunter+muay+thai+knockout" },
      { fighter: "Rodtang clinch", url: "https://www.youtube.com/results?search_query=rodtang+clinch+knee+elbow+highlights+one" },
    ],
    videos: [
      { label: "🔍 Clinch technique", url: "https://www.youtube.com/results?search_query=muay+thai+clinch+basic+positions+technique" },
      { label: "🔍 Coudes Muay Thai", url: "https://www.youtube.com/results?search_query=muay+thai+elbow+strikes+all+types+sok+tutorial" },
      { label: "🔍 Straight knee", url: "https://www.youtube.com/results?search_query=muay+thai+straight+knee+spear+technique" },
      { label: "🔍 Clinch defense / escape", url: "https://www.youtube.com/results?search_query=muay+thai+clinch+escape+defense+technique" },
    ],
  },
  { num: 5, title: "Fight Simulation", zone: "MAX", focus: "All-out 30s / récup 30s. Les combats se gagnent dans les 30 dernières secondes.",
    combos: ["c13", "c17", "c22", "c28", "c30", "c37", "c43"],
    defense: {
      rule: "Même épuisé : GARDE HAUTE, head movement, check les kicks. La discipline sous fatigue = la différence entre gagner et perdre.",
      actions: [
        { name: "Garde haute sous fatigue", desc: "Quand tu es mort : les mains MONTENT, pas descendent. Vérifie ta garde entre chaque burst." },
        { name: "Circle entre les bursts", desc: "Pendant la récup active : ne reste pas planté. Circle, jabs légers, teeps. Continue de bouger." },
        { name: "Check automatique", desc: "Pendant les phases all-out, intègre un check toutes les 3-4 frappes. Force l'habitude." },
        { name: "Clinch defense", desc: "Quand tu passes en clinch : coudes serrés, tête sur le côté, contrôle la nuque. Ne laisse pas le sac (l'adversaire) t'écraser." },
      ],
    },
    restDrill: { name: "Cooldown", desc: "2 min de shadow boxing très léger. Respire. Étire doucement les épaules et les hanches. 5 teeps lents par jambe." },
    coaching: { pourquoi: "Simuler les demandes métaboliques du combat. Ratio effort 2:3 comme en vrai.", comment: "0-30s ALL OUT → 30-60s jabs légers → 60-90s ALL OUT → 90-120s circle → 120-150s CLINCH → 150-180s BURNOUT.", focus: "Sous fatigue : GARDE HAUTE. C'est quand tu es épuisé que la discipline compte." },
    inspo: [
      { fighter: "Dieselnoi vs Samart", url: "https://www.youtube.com/results?search_query=dieselnoi+vs+samart+payakaroon+fight+muay+thai" },
      { fighter: "Rodtang vs Haggerty", url: "https://www.youtube.com/results?search_query=rodtang+vs+haggerty+highlights+one+championship" },
      { fighter: "Buakaw K-1 Finals", url: "https://www.youtube.com/results?search_query=buakaw+k1+max+final+highlights+knockout" },
    ],
    videos: [
      { label: "🔍 Fight simulation bag", url: "https://www.youtube.com/results?search_query=muay+thai+fight+simulation+heavy+bag+workout" },
      { label: "🔍 Defense under pressure", url: "https://www.youtube.com/results?search_query=muay+thai+defense+under+pressure+tired+technique" },
    ],
  },
];

// ── Quotes ──
const QUOTES = [
  { t: "Le teep est ton jab avec le pied. Lance-le plus que toute autre arme.", a: "Principe longiligne" },
  { t: "Ne laisse JAMAIS un adversaire exister à mi-distance. Loin ou clinch.", a: "Stratégie tall fighter" },
  { t: "110 victoires, 4 défaites. Il ne frappait pas fort. Il frappait JUSTE.", a: "Dieselnoi" },
  { t: "Un combattant qui ne peut pas te toucher ne peut pas te battre.", a: "Semmy Schilt" },
  { t: "Set up left, kill with right.", a: "Dieselnoi via Sylvie" },
  { t: "La différence entre gagnants et perdants : la maîtrise technique, pas la condition.", a: "Sweet Science of Fighting" },
  { t: "L'entraînement proprioceptif réduit les entorses de cheville de 81%.", a: "Étude 6 ans" },
  { t: "Casse les patterns. Jab > front kick. Front kick > jab. Sois imprévisible.", a: "Conseil coach" },
  { t: "La discipline sous fatigue, c'est la seule discipline qui compte.", a: "Principe combat" },
  { t: "La distance est ta meilleure défense.", a: "Semmy Schilt" },
];

// ── Helpers ──
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const getCombo = (id) => COMBO_LIB.find(c => c.id === id);

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("session");
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [openRound, setOpenRound] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [quoteIdx, setQuoteIdx] = useState(Math.floor(Math.random() * QUOTES.length));
  const [loggedMsg, setLoggedMsg] = useState(false);

  // Surprise combos
  const [surprises, setSurprises] = useState(() => {
    const s = {};
    ROUNDS.forEach(r => {
      const pool = COMBO_LIB.filter(c => !r.combos.includes(c.id) && c.level >= 2);
      const picked = shuffle(pool).slice(0, 2);
      s[r.num] = picked.map(p => p.id);
    });
    return s;
  });

  // Load data on mount
  useEffect(() => {
    loadData().then(saved => {
      if (saved && Object.keys(saved).length > 0) {
        setData(saved);
        dataRef.current = saved;
        if (saved.surprises) setSurprises(saved.surprises);
      }
      setLoaded(true);
    });
  }, []);

  const refreshSurprises = (roundNum) => {
    const r = ROUNDS[roundNum - 1];
    const pool = COMBO_LIB.filter(c => !r.combos.includes(c.id) && c.level >= 2);
    const picked = shuffle(pool).slice(0, 2);
    const newS = { ...surprises, [roundNum]: picked.map(p => p.id) };
    setSurprises(newS);
    const d = { ...dataRef.current, surprises: newS };
    dataRef.current = d;
    setData(d);
    saveData(d);
  };

  // Reset modal
  const [showReset, setShowReset] = useState(false);
  const [resetText, setResetText] = useState("");

  const m = MODES[view];

  // Use ref for persist closure
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const persist = useCallback((newData) => {
    const d = { ...dataRef.current, ...newData };
    dataRef.current = d;
    setData(d);
    saveData(d);
  }, []);

  // ── Round completion (includes surprise combos) ──
  const getRoundCompletion = (roundNum) => {
    const r = ROUNDS[roundNum - 1];
    const allCombos = [...r.combos, ...(surprises[roundNum] || [])];
    const done = allCombos.filter(cid => dataRef.current[`r${roundNum}_${cid}`]).length;
    return { done, total: allCombos.length, pct: Math.round((done / allCombos.length) * 100) };
  };

  const toggleCombo = (roundNum, comboId) => {
    const key = `r${roundNum}_${comboId}`;
    persist({ [key]: !dataRef.current[key] });
  };

  const resetSession = () => {
    const fresh = {};
    // Keep logs
    Object.keys(dataRef.current).forEach(k => { if (k.startsWith("log_")) fresh[k] = dataRef.current[k]; });
    // New surprises
    const s = {};
    ROUNDS.forEach(r => {
      const pool = COMBO_LIB.filter(c => !r.combos.includes(c.id) && c.level >= 2);
      const picked = shuffle(pool).slice(0, 2);
      s[r.num] = picked.map(p => p.id);
    });
    fresh.surprises = s;
    setSurprises(s);
    dataRef.current = fresh;
    setData(fresh);
    saveData(fresh);
    setShowReset(false);
    setResetText("");
    setOpenRound(null);
  };

  const logSession = () => {
    const ts = Date.now();
    const completions = ROUNDS.map(r => getRoundCompletion(r.num));
    const avgPct = Math.round(completions.reduce((a, c) => a + c.pct, 0) / 5);
    const totalDone = completions.reduce((a, c) => a + c.done, 0);
    const totalCombos = completions.reduce((a, c) => a + c.total, 0);
    const key = `log_${ts}`;
    const logEntry = { ts, pct: avgPct, done: totalDone, total: totalCombos };
    // Direct write to ensure it saves
    const newData = { ...dataRef.current, [key]: logEntry };
    dataRef.current = newData;
    setData(newData);
    saveData(newData);
    setLoggedMsg(true);
    setTimeout(() => setLoggedMsg(false), 3000);
  };

  // ── Styles ──
  const font = "'Outfit', sans-serif";
  const bg = "#F8F7F4";
  const cardBg = "#FFFFFF";
  const border = "#E8E4DF";
  const textPrimary = "#1A1A1A";
  const textSecondary = "#6B6560";
  const textMuted = "#A8A29E";

  return (
    <div style={{ fontFamily: font, background: bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", paddingBottom: 80, color: textPrimary }}>

      {/* ── HEADER ── */}
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: m.accent, letterSpacing: 2, marginBottom: 4 }}>{m.icon} MUAY THAI BAG</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: textPrimary, letterSpacing: -0.5 }}>Heavy Bag Tracker</h1>
          </div>
          <div onClick={() => setQuoteIdx((quoteIdx + 1) % QUOTES.length)} style={{ cursor: "pointer", textAlign: "right", maxWidth: 180 }}>
            <div style={{ fontSize: 11, color: textSecondary, lineHeight: 1.4, fontStyle: "italic" }}>"{QUOTES[quoteIdx].t}"</div>
            <div style={{ fontSize: 10, color: m.accent, fontWeight: 600, marginTop: 2 }}>— {QUOTES[quoteIdx].a}</div>
          </div>
        </div>
      </div>

      {/* ── NAV TABS ── */}
      <div style={{ display: "flex", gap: 4, padding: "12px 20px", borderBottom: `1px solid ${border}` }}>
        {Object.entries(MODES).map(([k, v]) => (
          <button key={k} onClick={() => setView(k)}
            style={{
              flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              background: view === k ? v.light : "transparent",
              color: view === k ? v.accent : textMuted,
              fontSize: 11, fontWeight: 700, fontFamily: font, letterSpacing: 0.5,
              transition: "all 0.2s",
            }}>
            <div style={{ fontSize: 16 }}>{v.icon}</div>
            <div>{v.label}</div>
          </button>
        ))}
      </div>

      {/* ═══ SESSION VIEW ═══ */}
      {view === "session" && (
        <div style={{ padding: "16px 20px" }}>
          {ROUNDS.map(round => {
            const comp = getRoundCompletion(round.num);
            const isOpen = openRound === round.num;
            const complete = comp.pct === 100;
            return (
              <div key={round.num} style={{
                background: cardBg, borderRadius: 14, marginBottom: 10,
                border: complete ? `2px solid ${MODES.session.accent}40` : `1px solid ${border}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}>
                {/* Round header - always visible */}
                <div onClick={() => { setOpenRound(isOpen ? null : round.num); setOpenSection(null); }}
                  style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    background: complete ? MODES.session.accent : `${MODES.session.accent}12`,
                    color: complete ? "#fff" : MODES.session.accent, fontSize: 14, fontWeight: 800, fontFamily: font,
                  }}>
                    {complete ? "✓" : `R${round.num}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: complete ? textMuted : textPrimary, textDecoration: complete ? "line-through" : "none" }}>
                      {round.title}
                    </div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 1 }}>{round.zone} · {comp.done}/{comp.total} combos</div>
                  </div>
                  {/* Progress ring */}
                  <div style={{ position: "relative", width: 32, height: 32 }}>
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="13" fill="none" stroke={border} strokeWidth="3" />
                      <circle cx="16" cy="16" r="13" fill="none" stroke={MODES.session.accent} strokeWidth="3"
                        strokeDasharray={`${comp.pct * 0.817} 100`} strokeLinecap="round"
                        transform="rotate(-90 16 16)" style={{ transition: "stroke-dasharray 0.4s" }} />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: textSecondary }}>{comp.pct}%</div>
                  </div>
                </div>

                {/* Round content */}
                {isOpen && (
                  <div style={{ padding: "0 16px 16px" }}>
                    {/* Focus */}
                    <div style={{ background: `${MODES.session.accent}08`, borderRadius: 10, padding: 12, marginBottom: 12, borderLeft: `3px solid ${MODES.session.accent}40` }}>
                      <div style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>{round.focus}</div>
                    </div>

                    {/* Combos checklist */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: textMuted, letterSpacing: 1, marginBottom: 8 }}>ENCHAÎNEMENTS</div>
                      {round.combos.map(cid => {
                        const combo = getCombo(cid);
                        if (!combo) return null;
                        const done = data[`r${round.num}_${cid}`];
                        const expanded = openSection === `combo_${round.num}_${cid}`;
                        return (
                          <div key={cid} style={{
                            background: done ? `${MODES.session.accent}04` : cardBg,
                            borderRadius: 10, marginBottom: 6, overflow: "hidden",
                            border: `1px solid ${done ? MODES.session.accent + "30" : border}`,
                            transition: "all 0.2s",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer" }}
                              onClick={() => toggleCombo(round.num, cid)}>
                              <div style={{
                                width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? MODES.session.accent : border}`,
                                background: done ? MODES.session.accent : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "all 0.2s",
                              }}>{done ? "✓" : ""}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: done ? textMuted : textPrimary, textDecoration: done ? "line-through" : "none" }}>
                                  {combo.strikes.join("  →  ")}
                                </div>
                              </div>
                              <span onClick={(e) => { e.stopPropagation(); setOpenSection(expanded ? null : `combo_${round.num}_${cid}`); }}
                                style={{ fontSize: 11, color: textMuted, padding: "4px 8px", cursor: "pointer", transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                            </div>
                            {expanded && (
                              <div style={{ padding: "0 12px 12px" }}>
                                <div style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6, marginBottom: 8 }}>{combo.desc}</div>
                                <div style={{ background: "#FEF9EE", borderRadius: 6, padding: "6px 10px", borderLeft: "3px solid #D97706" }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: "#92400E", marginBottom: 2 }}>🛡️ APRÈS LE COMBO</div>
                                  <div style={{ fontSize: 11, color: "#78716C", lineHeight: 1.5 }}>{combo.defense}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Surprise combos */}
                      {(surprises[round.num] || []).length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", letterSpacing: 1 }}>🎲 SURPRISE</div>
                            <button onClick={(e) => { e.stopPropagation(); refreshSurprises(round.num); }}
                              style={{ background: "#2563EB10", border: "none", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#2563EB", fontFamily: font }}>
                              ↻ Piocher
                            </button>
                          </div>
                          {(surprises[round.num] || []).map(cid => {
                            const combo = getCombo(cid);
                            if (!combo) return null;
                            const done = data[`r${round.num}_${cid}`];
                            const expanded = openSection === `combo_s_${round.num}_${cid}`;
                            return (
                              <div key={`s_${cid}`} style={{
                                background: done ? "#2563EB06" : "#FAFAFF",
                                borderRadius: 10, marginBottom: 6, overflow: "hidden",
                                border: `1px dashed ${done ? "#2563EB40" : "#2563EB20"}`,
                                transition: "all 0.2s",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", cursor: "pointer" }}
                                  onClick={() => toggleCombo(round.num, cid)}>
                                  <div style={{
                                    width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? "#2563EB" : "#2563EB40"}`,
                                    background: done ? "#2563EB" : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0, transition: "all 0.2s",
                                  }}>{done ? "✓" : ""}</div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: done ? textMuted : textPrimary, textDecoration: done ? "line-through" : "none" }}>
                                      {combo.strikes.join("  →  ")}
                                    </div>
                                  </div>
                                  <span onClick={(e) => { e.stopPropagation(); setOpenSection(expanded ? null : `combo_s_${round.num}_${cid}`); }}
                                    style={{ fontSize: 11, color: textMuted, padding: "4px 8px", cursor: "pointer", transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                                </div>
                                {expanded && (
                                  <div style={{ padding: "0 12px 12px" }}>
                                    <div style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6, marginBottom: 8 }}>{combo.desc}</div>
                                    <div style={{ background: "#EEF2FF", borderRadius: 6, padding: "6px 10px", borderLeft: "3px solid #2563EB" }}>
                                      <div style={{ fontSize: 10, fontWeight: 700, color: "#1E40AF", marginBottom: 2 }}>🛡️ APRÈS LE COMBO</div>
                                      <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>{combo.defense}</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Expandable sections - simplified: rest, coaching, inspo, videos */}
                    {[
                      { key: "rest", icon: "⚖️", label: "REPOS ACTIF (1 min)", render: () => (
                        <div style={{ background: "#F0FDF4", borderRadius: 8, padding: 12, borderLeft: "3px solid #16A34A" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 4 }}>{round.restDrill.name}</div>
                          <div style={{ fontSize: 12, color: "#15803D", lineHeight: 1.5 }}>{round.restDrill.desc}</div>
                        </div>
                      )},
                      { key: "coaching", icon: "🧠", label: "COACHING", render: () => (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[["POURQUOI", round.coaching.pourquoi], ["COMMENT", round.coaching.comment], ["FOCUS", round.coaching.focus]].map(([l, v]) => (
                            <div key={l}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: MODES.session.accent, marginBottom: 2 }}>{l}</div>
                              <div style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5 }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      )},
                      { key: "inspo", icon: "🏆", label: "INSPIRATION PROS", render: () => (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {round.inspo.map((ins, i) => (
                            <a key={i} href={ins.url} target="_blank" rel="noopener noreferrer" style={{
                              display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8,
                              border: `1px solid ${border}`, textDecoration: "none", background: "#FEFCF9",
                            }}>
                              <span style={{ fontSize: 14 }}>🥊</span>
                              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: textPrimary }}>{ins.fighter}</span>
                              <span style={{ fontSize: 10, color: textMuted }}>▶ YouTube ↗</span>
                            </a>
                          ))}
                        </div>
                      )},
                      { key: "videos", icon: "🎬", label: "VIDÉOS TECHNIQUE", render: () => (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {round.videos.map((v, i) => (
                            <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" style={{
                              display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8,
                              border: `1px solid ${border}`, textDecoration: "none",
                            }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: MODES.session.accent }}>{v.label}</span>
                              <span style={{ marginLeft: "auto", fontSize: 10, color: textMuted }}>↗</span>
                            </a>
                          ))}
                        </div>
                      )},
                    ].map(sec => {
                      const secOpen = openSection === `${round.num}_${sec.key}`;
                      return (
                        <div key={sec.key} style={{ marginBottom: 6 }}>
                          <div onClick={(e) => { e.stopPropagation(); setOpenSection(secOpen ? null : `${round.num}_${sec.key}`); }}
                            style={{
                              display: "flex", alignItems: "center", gap: 8, padding: "8px 0", cursor: "pointer",
                              borderTop: `1px solid ${border}`,
                            }}>
                            <span style={{ fontSize: 13 }}>{sec.icon}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: textSecondary, letterSpacing: 0.5, flex: 1 }}>{sec.label}</span>
                            <span style={{ fontSize: 12, color: textMuted, transition: "transform 0.2s", transform: secOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                          </div>
                          {secOpen && <div style={{ paddingBottom: 8 }}>{sec.render()}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* ═══ ÉTIREMENTS POST-SÉANCE ═══ */}
          <div style={{
            background: cardBg, borderRadius: 14, marginBottom: 10, overflow: "hidden",
            border: `1px solid ${border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div onClick={() => setOpenRound(openRound === "stretch" ? null : "stretch")}
              style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#7C3AED12", color: "#7C3AED", fontSize: 16 }}>🧘</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary }}>Étirements Post-Séance</div>
                <div style={{ fontSize: 11, color: textMuted }}>10-15 min · {Array.from({length:10}).filter((_,i) => dataRef.current[`stretch_${i}`]).length}/10 complétés</div>
              </div>
              {(() => { const done = Array.from({length:10}).filter((_,i) => dataRef.current[`stretch_${i}`]).length; const pct = Math.round(done/10*100); return pct > 0 ? (
                <div style={{ fontSize: 13, fontWeight: 800, color: pct >= 80 ? "#16A34A" : pct >= 50 ? "#7C3AED" : textMuted }}>{pct}%</div>
              ) : null; })()}
              <span style={{ fontSize: 12, color: textMuted, transition: "transform 0.2s", transform: openRound === "stretch" ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
            </div>

            {openRound === "stretch" && (
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ background: "#7C3AED08", borderRadius: 10, padding: 12, marginBottom: 12, borderLeft: "3px solid #7C3AED40" }}>
                  <div style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6 }}>
                    Les étirements STATIQUES se font APRÈS la séance, jamais avant (ça réduit la puissance de tes kicks). Tiens chaque position 45 à 90 secondes. Respire profondément, descends un peu plus à chaque expiration. Pas de rebond.
                  </div>
                </div>

                {[
                  { name: "Pigeon Pose (chaque côté)", time: "60-90s/côté", target: "Fessiers + rotateurs externes de hanche",
                    desc: "Jambe avant pliée à 90° devant toi, jambe arrière tendue derrière. Descends le buste vers le sol. C'est LE stretch #1 pour les high kicks : il ouvre les rotateurs qui bloquent ta hanche quand tu montes la jambe.",
                    tip: "Si c'est trop dur, rapproche le pied avant de ta hanche. À 198cm, tes longs fémurs rendent le pigeon plus difficile, sois patient.",
                    video: "https://www.youtube.com/results?search_query=pigeon+pose+stretch+tutorial+hip+opener+fighters" },
                  { name: "Fente basse (Hip Flexor Stretch)", time: "60s/côté", target: "Psoas + quadriceps + hip flexors",
                    desc: "Genou arrière au sol, pied avant à plat, pousse les hanches EN AVANT. Garde le buste droit. Le psoas est le muscle qui LIMITE ta hauteur de kick : s'il est court, ta jambe ne monte pas.",
                    tip: "Serre la fesse du côté de la jambe arrière pendant le stretch. Ça intensifie le stretch du psoas.",
                    video: "https://www.youtube.com/results?search_query=hip+flexor+lunge+stretch+psoas+tutorial+martial+arts" },
                  { name: "Hamstring Stretch debout", time: "45-60s/côté", target: "Ischio-jambiers",
                    desc: "Pied sur une surface à hauteur de hanche (rack, chaise). Jambe tendue, orteils vers le plafond. Penche le buste EN GARDANT LE DOS PLAT. C'est le dos plat qui stretch les ischios, pas le dos rond.",
                    tip: "Si tu arrondis le dos, c'est les fessiers qui prennent, pas les ischios. Garde le dos plat même si tu descends moins bas.",
                    video: "https://www.youtube.com/results?search_query=standing+hamstring+stretch+elevated+leg+technique" },
                  { name: "Butterfly Stretch", time: "60-90s", target: "Adducteurs + aine",
                    desc: "Assis, plantes de pieds collées, genoux vers le sol. Pousse les genoux avec les coudes. Les adducteurs sont essentiels pour le roundhouse kick : s'ils sont raides, ta hanche ne tourne pas à fond.",
                    tip: "Penche le buste EN AVANT (dos plat) pour intensifier. Plus les pieds sont proches du corps, plus le stretch est fort.",
                    video: "https://www.youtube.com/results?search_query=butterfly+stretch+groin+adductor+flexibility+tutorial" },
                  { name: "Straddle Stretch (écart facial)", time: "60-90s", target: "Adducteurs + aine + ischio-jambiers",
                    desc: "Assis, jambes écartées le plus possible, penche le buste au milieu puis vers chaque jambe. C'est la progression vers le grand écart facial. À ta taille, tes longues jambes donnent un levier énorme.",
                    tip: "Alterne : centre 30s, droite 30s, gauche 30s. Expire en descendant. Ne force jamais avec les mains.",
                    video: "https://www.youtube.com/results?search_query=middle+splits+straddle+stretch+progression+flexibility" },
                  { name: "Frog Stretch", time: "45-60s", target: "Adducteurs profonds + aine",
                    desc: "À quatre pattes, écarte les genoux le plus possible, pieds tournés vers l'extérieur. Descends les hanches vers le sol. Ce stretch cible les adducteurs profonds que le butterfly n'atteint pas.",
                    tip: "Avance et recule doucement les hanches pour trouver l'angle le plus intense. Pas de douleur, juste de la tension.",
                    video: "https://www.youtube.com/results?search_query=frog+stretch+deep+groin+adductor+hip+opener+tutorial" },
                  { name: "Quadriceps couché (chaque côté)", time: "45s/côté", target: "Quadriceps + hip flexors",
                    desc: "Allongé sur le côté, attrape le pied de la jambe du dessus et tire le talon vers la fesse. Pousse la hanche EN AVANT. Le quad est le moteur du kick, s'il est raide tu perds du snap.",
                    tip: "Garde les genoux collés et la hanche poussée vers l'avant. C'est la hanche qui fait la différence, pas juste plier le genou.",
                    video: "https://www.youtube.com/results?search_query=lying+side+quad+stretch+hip+flexor+technique" },
                  { name: "Lézard Pose (Lizard Stretch)", time: "45-60s/côté", target: "Hip flexors + adducteurs + aine",
                    desc: "Depuis la fente basse, pose les DEUX mains (ou avant-bras) à l'INTÉRIEUR du pied avant. Enfonce la hanche. Combine le stretch du psoas et des adducteurs en un seul mouvement.",
                    tip: "Si tu arrives sur les avant-bras, c'est le niveau avancé. Sinon, reste sur les mains. Ouvre le genou avant vers l'extérieur.",
                    video: "https://www.youtube.com/results?search_query=lizard+pose+stretch+hip+flexor+groin+tutorial+yoga" },
                  { name: "Split progressif (frontal)", time: "60s", target: "Ischio-jambiers + hip flexors + aine",
                    desc: "Depuis la fente basse, glisse le pied avant vers l'avant et le genou arrière vers l'arrière. Descends aussi bas que possible. C'est la progression ultime vers le grand écart.",
                    tip: "Utilise des blocs ou des livres sous les mains pour te stabiliser. Descends 1mm de plus chaque semaine. La constance bat l'intensité.",
                    video: "https://www.youtube.com/results?search_query=front+splits+progression+tutorial+martial+arts+flexibility" },
                  { name: "Mollets (mur)", time: "30s/côté", target: "Gastrocnémien + soléaire",
                    desc: "Face au mur, un pied devant l'autre. Talon arrière collé au sol, pousse le mur. Puis plie le genou arrière pour le soléaire. Le pivot du pied d'appui pendant le kick dépend de la souplesse des mollets.",
                    tip: "Fais les deux versions : jambe tendue (gastro) + jambe pliée (soléaire). 30s chaque.",
                    video: "https://www.youtube.com/results?search_query=calf+stretch+wall+gastrocnemius+soleus+technique" },
                ].map((stretch, i) => {
                  const isOpen = openSection === `stretch_${i}`;
                  const stretchDone = dataRef.current[`stretch_${i}`];
                  return (
                    <div key={i} style={{
                      background: stretchDone ? "#F0FDF4" : isOpen ? "#FAFAFF" : cardBg, borderRadius: 10, marginBottom: 6, overflow: "hidden",
                      border: `1px solid ${stretchDone ? "#16A34A40" : isOpen ? "#7C3AED25" : border}`, transition: "all 0.2s",
                    }}>
                      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div onClick={(e) => { e.stopPropagation(); persist({ [`stretch_${i}`]: !stretchDone }); }}
                          style={{
                            width: 28, height: 28, borderRadius: 8, flexShrink: 0, cursor: "pointer",
                            background: stretchDone ? "#16A34A" : "#7C3AED10",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: stretchDone ? 14 : 13, fontWeight: 800, color: stretchDone ? "#fff" : "#7C3AED",
                          }}>{stretchDone ? "✓" : i + 1}</div>
                        <div onClick={() => setOpenSection(isOpen ? null : `stretch_${i}`)} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: stretchDone ? "#16A34A" : textPrimary, textDecoration: stretchDone ? "line-through" : "none" }}>{stretch.name}</div>
                          <div style={{ fontSize: 10, color: textMuted }}>{stretch.time} · {stretch.target}</div>
                        </div>
                        <span onClick={() => setOpenSection(isOpen ? null : `stretch_${i}`)} style={{ fontSize: 11, color: textMuted, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)", cursor: "pointer" }}>▾</span>
                      </div>
                      {isOpen && (
                        <div style={{ padding: "0 12px 12px" }}>
                          <div style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6, marginBottom: 8 }}>{stretch.desc}</div>
                          <div style={{ background: "#7C3AED08", borderRadius: 6, padding: "6px 10px", borderLeft: "3px solid #7C3AED30", marginBottom: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", marginBottom: 2 }}>💡 ASTUCE</div>
                            <div style={{ fontSize: 11, color: "#78716C", lineHeight: 1.5 }}>{stretch.tip}</div>
                          </div>
                          <a href={stretch.video} target="_blank" rel="noopener noreferrer" style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6,
                            background: "#7C3AED08", border: "1px solid #7C3AED15", textDecoration: "none",
                          }}>
                            <span style={{ fontSize: 14 }}>▶️</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#7C3AED", flex: 1 }}>Voir la démo vidéo</span>
                            <span style={{ fontSize: 10, color: textMuted }}>YouTube ↗</span>
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Log + Reset */}
          {loggedMsg && (
            <div style={{ background: "#16A34A", color: "#fff", borderRadius: 10, padding: "10px 16px", marginTop: 12, textAlign: "center", fontSize: 13, fontWeight: 700, fontFamily: font }}>
              ✓ Session logguée ! ({ROUNDS.map(r => getRoundCompletion(r.num)).reduce((a, c) => a + c.done, 0)} combos complétés)
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: loggedMsg ? 8 : 12 }}>
            <button onClick={logSession} disabled={loggedMsg} style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none", cursor: loggedMsg ? "default" : "pointer",
              background: loggedMsg ? "#A8A29E" : MODES.session.accent, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font,
              opacity: loggedMsg ? 0.6 : 1, transition: "all 0.2s",
            }}>{loggedMsg ? "✓ Logguée !" : "✓ Logger la session"}</button>
            <button onClick={() => setShowReset(true)} style={{
              padding: "12px 16px", borderRadius: 10, border: `1px solid ${border}`, cursor: "pointer",
              background: cardBg, color: textMuted, fontSize: 12, fontWeight: 600, fontFamily: font,
            }}>↺</button>
          </div>
        </div>
      )}

      {/* ═══ LOG VIEW ═══ */}
      {view === "log" && (
        <div style={{ padding: "20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: textMuted, letterSpacing: 2, marginBottom: 16 }}>HISTORIQUE DES SESSIONS</div>
          {(() => {
            const logs = Object.entries(dataRef.current)
              .filter(([k, v]) => k.startsWith("log_") && v && typeof v === "object" && v.ts)
              .sort((a, b) => (b[1].ts || 0) - (a[1].ts || 0));
            if (logs.length === 0) return (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
                <div style={{ color: textMuted, fontSize: 13 }}>Aucune session logguée.</div>
                <div style={{ color: textMuted, fontSize: 12, marginTop: 4 }}>Complète des combos puis tape "Logger la session".</div>
              </div>
            );
            return (
              <>
                {logs.map(([k, v]) => {
                  const d = new Date(v.ts);
                  const pct = v.pct || 0;
                  const done = v.done || 0;
                  const total = v.total || 0;
                  return (
                    <div key={k} style={{ background: cardBg, borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: pct >= 80 ? "#DCFCE7" : pct >= 50 ? "#FFF3EB" : "#F5F5F4",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0,
                      }}>{pct >= 80 ? "🔥" : pct >= 50 ? "👊" : "🥊"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
                          {d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                        </div>
                        <div style={{ fontSize: 11, color: textMuted }}>
                          {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          {total > 0 ? ` · ${done}/${total} combos` : ""}
                        </div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: pct >= 80 ? "#16A34A" : pct >= 50 ? MODES.session.accent : textMuted, flexShrink: 0 }}>{pct}%</div>
                      <button onClick={() => {
                        const newData = { ...dataRef.current };
                        delete newData[k];
                        dataRef.current = newData;
                        setData(newData);
                        saveData(newData);
                      }} style={{
                        background: "transparent", border: "none", cursor: "pointer", padding: "4px 8px",
                        fontSize: 14, color: textMuted, borderRadius: 6, flexShrink: 0,
                      }}>✕</button>
                    </div>
                  );
                })}
                {logs.length > 0 && (
                  <button onClick={() => {
                    const newData = {};
                    Object.entries(dataRef.current).forEach(([k, v]) => { if (!k.startsWith("log_")) newData[k] = v; });
                    dataRef.current = newData;
                    setData(newData);
                    saveData(newData);
                  }} style={{
                    width: "100%", padding: 10, borderRadius: 8, border: `1px solid #FEE2E2`, marginTop: 12,
                    background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font,
                  }}>Effacer tout l'historique</button>
                )}
              </>
            );
          })()}

          {/* Reset session */}
          <div style={{ marginTop: 24 }}>
            <button onClick={() => setShowReset(true)} style={{
              width: "100%", padding: 12, borderRadius: 10, border: `1px solid ${border}`,
              background: cardBg, color: textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font,
            }}>Réinitialiser la session en cours</button>
          </div>
        </div>
      )}

      {/* ═══ RESET MODAL ═══ */}
      {showReset && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: cardBg, borderRadius: 16, padding: 24, maxWidth: 320, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: textPrimary, marginBottom: 8 }}>Réinitialiser ?</div>
            <div style={{ fontSize: 12, color: textSecondary, marginBottom: 16, lineHeight: 1.5 }}>Tape RESET pour confirmer. Cette action remet les rounds à zéro (l'historique est conservé).</div>
            <input value={resetText} onChange={(e) => setResetText(e.target.value)} placeholder="Tape RESET"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${border}`, fontSize: 14, fontFamily: font, fontWeight: 700, boxSizing: "border-box", marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setShowReset(false); setResetText(""); }}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${border}`, background: cardBg, color: textSecondary, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Annuler</button>
              <button onClick={() => { if (resetText === "RESET") resetSession(); }}
                style={{
                  flex: 1, padding: 10, borderRadius: 8, border: "none", cursor: "pointer", fontFamily: font,
                  background: resetText === "RESET" ? "#EF4444" : "#E0E0E0",
                  color: resetText === "RESET" ? "#fff" : textMuted,
                  fontSize: 13, fontWeight: 700, transition: "all 0.2s",
                }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
