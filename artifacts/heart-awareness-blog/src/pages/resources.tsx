import { motion } from "framer-motion";
import { Phone, Stethoscope, ExternalLink } from "lucide-react";

export default function Resources() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 font-['Outfit',sans-serif]">

      {/* Header */}
      <div className="bg-[#0f0c0c] pt-20 pb-16 border-b border-white/[0.07]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-400 font-medium mb-5">Emergency & Education</p>
            <h1
              className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-5"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Critical Resources
            </h1>
            <p className="text-base text-white/45 leading-relaxed max-w-lg mx-auto font-light">
              Essential information, emergency warning signs, and trusted organisations for cardiovascular care.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-16 pb-4 max-w-5xl">

        {/* Emergency Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-1 bg-red-700 px-6 py-5 rounded-t-xl">
            <Phone className="h-5 w-5 text-white" />
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Emergency Signs — Call 112 / Emergency Services Immediately
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-[#e8d8d4] rounded-b-xl overflow-hidden">
            {[
              {
                title: "Heart Attack Signs",
                items: [
                  { label: "Chest Discomfort", desc: "Pressure, squeezing, fullness, or pain in the centre of the chest." },
                  { label: "Upper Body Pain", desc: "Discomfort in arms, back, neck, jaw, or stomach." },
                  { label: "Shortness of Breath", desc: "With or without chest discomfort." },
                  { label: "Other Signs", desc: "Cold sweat, nausea, or lightheadedness." },
                ],
              },
              {
                title: "Stroke Signs (F.A.S.T.)",
                items: [
                  { label: "Face Drooping", desc: "Does one side of the face droop or is it numb?" },
                  { label: "Arm Weakness", desc: "Is one arm weak or numb? Ask them to raise both arms." },
                  { label: "Speech Difficulty", desc: "Is speech slurred? Are they unable to speak or understand?" },
                  { label: "Time to Call", desc: "If someone shows any of these symptoms, call emergency services immediately." },
                ],
              },
            ].map((section, si) => (
              <div key={si} className="bg-[#faf8f5] p-8">
                <h3 className="text-sm font-semibold text-[#0f0c0c] uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-red-700" />
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.items.map((item, ii) => (
                    <li key={ii} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-700 mt-1.5 shrink-0" />
                      <span className="text-sm text-[#8a7070] font-light leading-relaxed">
                        <strong className="text-[#0f0c0c] font-semibold">{item.label}:</strong>{" "}
                        {item.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Trusted organisations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-700 font-medium mb-2">Trusted Sources</p>
            <h2
              className="text-3xl font-bold text-[#0f0c0c] tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Trusted Organisations
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-[#e8d8d4]">
            {[
              {
                name: "American Heart Association",
                desc: "The nation's oldest and largest voluntary organisation dedicated to fighting heart disease and stroke.",
                link: "https://www.heart.org/",
              },
              {
                name: "World Health Organization",
                desc: "Global health information regarding cardiovascular diseases, prevention, and statistics.",
                link: "https://www.who.int/health-topics/cardiovascular-diseases",
              },
              {
                name: "Centers for Disease Control",
                desc: "US government public health data and prevention strategies for heart conditions.",
                link: "https://www.cdc.gov/heartdisease/",
              },
              {
                name: "National Heart, Lung, and Blood Institute",
                desc: "Research, training, and education to promote the prevention and treatment of heart disease.",
                link: "https://www.nhlbi.nih.gov/",
              },
            ].map((org, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="bg-[#faf8f5] hover:bg-white transition-colors p-8 flex flex-col"
              >
                <h3
                  className="text-xl font-semibold text-[#0f0c0c] mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {org.name}
                </h3>
                <p className="text-sm text-[#8a7070] leading-relaxed font-light flex-1 mb-6">{org.desc}</p>
                <a
                  href={org.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium text-red-700 hover:text-[#0f0c0c] transition-colors"
                >
                  Visit Website
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
}
