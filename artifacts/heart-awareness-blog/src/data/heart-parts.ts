export type HeartPartId =
  | "right-atrium"
  | "left-atrium"
  | "right-ventricle"
  | "left-ventricle"
  | "tricuspid-valve"
  | "mitral-valve"
  | "pulmonary-valve"
  | "aortic-valve"
  | "aorta"
  | "pulmonary-artery"
  | "pulmonary-veins"
  | "superior-vena-cava"
  | "inferior-vena-cava"
  | "septum";

export interface HeartPart {
  id: HeartPartId;
  name: string;
  type: "Chamber" | "Valve" | "Vessel" | "Structure";
  shortDescription: string;
  longDescription: string;
  fastFacts: string[];
  color: string;
  hoverColor: string;
}

export const heartParts: Record<HeartPartId, HeartPart> = {
  "right-atrium": {
    id: "right-atrium",
    name: "Right Atrium",
    type: "Chamber",
    shortDescription: "Receives deoxygenated blood from the body.",
    longDescription:
      "The right atrium is the upper right chamber of the heart. It acts as a receiving room for deoxygenated blood returning from the body tissues through the superior and inferior vena cava.\n\nOnce filled, it contracts to pump this blood through the tricuspid valve and into the right ventricle below. It plays a crucial role in the initial stage of pulmonary circulation.",
    fastFacts: [
      "Pumps blood at low pressure",
      "Contains the SA node (the heart's natural pacemaker)",
      "Holds about 50ml of blood at rest",
    ],
    color: "#8b1a1a",
    hoverColor: "#e74c3c",
  },
  "left-atrium": {
    id: "left-atrium",
    name: "Left Atrium",
    type: "Chamber",
    shortDescription: "Receives oxygenated blood from the lungs.",
    longDescription:
      "The left atrium is the upper left chamber of the heart. It receives freshly oxygenated blood from the lungs via the pulmonary veins.\n\nWhen it contracts, it pushes this oxygen-rich blood through the mitral valve and into the powerful left ventricle, setting the stage for systemic circulation.",
    fastFacts: [
      "Slightly smaller than the right atrium but has thicker walls",
      "Connects to four pulmonary veins",
      "Essential for loading the left ventricle",
    ],
    color: "#c0392b",
    hoverColor: "#ff6b6b",
  },
  "right-ventricle": {
    id: "right-ventricle",
    name: "Right Ventricle",
    type: "Chamber",
    shortDescription: "Pumps blood to the lungs.",
    longDescription:
      "The right ventricle is the lower right chamber. It receives deoxygenated blood from the right atrium and pumps it under low pressure into the pulmonary artery, sending it to the lungs for oxygenation.\n\nIts walls are thinner than the left ventricle because pumping blood to the nearby lungs requires less force than pumping it to the rest of the body.",
    fastFacts: [
      "Crescent-shaped in cross-section",
      "Pumps against a low resistance system",
      "Ejects about 70ml of blood per beat",
    ],
    color: "#6c1212",
    hoverColor: "#d35400",
  },
  "left-ventricle": {
    id: "left-ventricle",
    name: "Left Ventricle",
    type: "Chamber",
    shortDescription: "Pumps oxygenated blood to the body; the strongest chamber.",
    longDescription:
      "The left ventricle is the largest and most powerful chamber of the heart. It receives oxygenated blood from the left atrium and pumps it forcefully through the aortic valve into the aorta, distributing it to the entire body.\n\nBecause it must overcome the high resistance of the systemic circulation, its muscular walls are the thickest of any heart chamber.",
    fastFacts: [
      "Walls are roughly 3× thicker than the right ventricle",
      "Conical in shape",
      "Generates the blood pressure measured in your arm",
    ],
    color: "#a32626",
    hoverColor: "#e056fd",
  },
  "tricuspid-valve": {
    id: "tricuspid-valve",
    name: "Tricuspid Valve",
    type: "Valve",
    shortDescription: "Valve between right atrium and right ventricle.",
    longDescription:
      "The tricuspid valve sits between the right atrium and right ventricle. It consists of three thin but strong flaps (cusps) of tissue.\n\nIt opens to allow blood to flow into the ventricle and tightly closes when the ventricle contracts, preventing blood from leaking back into the atrium.",
    fastFacts: [
      "Has three leaflets (anterior, posterior, and septal)",
      "Supported by chordae tendineae ('heart strings')",
    ],
    color: "#d4a5a5",
    hoverColor: "#f8c291",
  },
  "mitral-valve": {
    id: "mitral-valve",
    name: "Mitral Valve",
    type: "Valve",
    shortDescription: "Valve between left atrium and left ventricle.",
    longDescription:
      "The mitral (or bicuspid) valve regulates blood flow between the left atrium and left ventricle.\n\nUnlike other heart valves, it only has two flaps. It must withstand the highest pressures in the heart, sealing completely during the powerful contraction of the left ventricle.",
    fastFacts: [
      "Named 'mitral' because it resembles a bishop's miter (hat)",
      "Most commonly affected by valvular disease",
    ],
    color: "#d4a5a5",
    hoverColor: "#f8c291",
  },
  "pulmonary-valve": {
    id: "pulmonary-valve",
    name: "Pulmonary Valve",
    type: "Valve",
    shortDescription: "Valve at the exit of the right ventricle.",
    longDescription:
      "The pulmonary valve acts as a one-way door from the right ventricle into the pulmonary artery.\n\nIt opens when the right ventricle contracts to let deoxygenated blood flow to the lungs, and closes immediately after to prevent backflow into the heart.",
    fastFacts: [
      "A semilunar valve with three half-moon-shaped cusps",
      "Lacks the 'heart strings' found in atrioventricular valves",
    ],
    color: "#c8b0b0",
    hoverColor: "#f5cd79",
  },
  "aortic-valve": {
    id: "aortic-valve",
    name: "Aortic Valve",
    type: "Valve",
    shortDescription: "Valve at the base of the aorta.",
    longDescription:
      "The aortic valve is located between the left ventricle and the aorta.\n\nIt opens precisely during ventricular contraction to allow oxygenated blood to surge into the systemic circulation, then snaps shut to maintain aortic pressure and prevent regurgitation.",
    fastFacts: [
      "Another semilunar valve with three cusps",
      "Subjected to immense mechanical stress with every heartbeat",
    ],
    color: "#c8b0b0",
    hoverColor: "#f5cd79",
  },
  aorta: {
    id: "aorta",
    name: "Aorta",
    type: "Vessel",
    shortDescription: "The main artery carrying blood away from the heart.",
    longDescription:
      "The aorta is the largest artery in the human body. It originates from the left ventricle and extends down to the abdomen, branching off to supply oxygenated blood to all organs and tissues.\n\nIts highly elastic walls absorb the massive pressure generated by the left ventricle's contraction.",
    fastFacts: [
      "About the diameter of a garden hose",
      "Blood travels through it at about 40 cm per second",
    ],
    color: "#c23616",
    hoverColor: "#ff4757",
  },
  "pulmonary-artery": {
    id: "pulmonary-artery",
    name: "Pulmonary Artery",
    type: "Vessel",
    shortDescription: "Carries deoxygenated blood to the lungs.",
    longDescription:
      "The main pulmonary artery (or pulmonary trunk) begins at the right ventricle and quickly splits into the left and right pulmonary arteries.\n\nIt is unique among arteries because it is the only one (along with umbilical arteries in a fetus) that carries oxygen-poor blood.",
    fastFacts: [
      "Directs blood into the pulmonary circulation",
      "Splits into left and right branches for each lung",
    ],
    color: "#2980b9",
    hoverColor: "#3498db",
  },
  "pulmonary-veins": {
    id: "pulmonary-veins",
    name: "Pulmonary Veins",
    type: "Vessel",
    shortDescription: "Bring oxygenated blood from the lungs.",
    longDescription:
      "The four pulmonary veins (two from each lung) transport freshly oxygenated blood from the lungs back to the left atrium of the heart.\n\nLike the pulmonary artery, they are unique — these are the only veins in the adult human body that carry highly oxygenated blood.",
    fastFacts: [
      "Typically four in number (two left, two right)",
      "Connect directly into the posterior wall of the left atrium",
    ],
    color: "#c0392b",
    hoverColor: "#ff6b6b",
  },
  "superior-vena-cava": {
    id: "superior-vena-cava",
    name: "Superior Vena Cava",
    type: "Vessel",
    shortDescription: "Brings deoxygenated blood from upper body.",
    longDescription:
      "The superior vena cava is a large, short vein that carries deoxygenated blood from the upper half of the body (head, neck, and arms) directly into the right atrium.\n\nIt is one of the two main venous return pathways to the heart.",
    fastFacts: ["About 24mm in diameter", "Lacks valves entirely"],
    color: "#1a4a7a",
    hoverColor: "#4bcffa",
  },
  "inferior-vena-cava": {
    id: "inferior-vena-cava",
    name: "Inferior Vena Cava",
    type: "Vessel",
    shortDescription: "Brings deoxygenated blood from lower body.",
    longDescription:
      "The inferior vena cava is the largest vein in the human body. It collects deoxygenated blood from the lower half of the body (abdomen, pelvis, and legs) and delivers it to the right atrium.\n\nIt runs parallel to the abdominal aorta.",
    fastFacts: [
      "The body's largest vein",
      "Has a rudimentary valve at its entrance to the right atrium",
    ],
    color: "#1a4a7a",
    hoverColor: "#4bcffa",
  },
  septum: {
    id: "septum",
    name: "Septum",
    type: "Structure",
    shortDescription: "The wall dividing left and right sides of the heart.",
    longDescription:
      "The interventricular and interatrial septum form a continuous, muscular wall that completely separates the right (oxygen-poor) and left (oxygen-rich) sides of the heart.\n\nThis separation is vital for maintaining the efficiency of the double-circulation system in mammals, preventing the mixing of oxygenated and deoxygenated blood.",
    fastFacts: [
      "A defect here is commonly called a 'hole in the heart'",
      "Made of dense cardiac muscle tissue",
    ],
    color: "#7a2a2a",
    hoverColor: "#d25a5a",
  },
};
