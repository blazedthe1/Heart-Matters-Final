import { motion } from "framer-motion";
import { Heart, Users, Lightbulb, Target } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 font-['Outfit',sans-serif]">

      {/* Hero */}
      <section className="bg-[#0f0c0c] pt-20 pb-20 border-b border-white/[0.07]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-400 font-medium mb-5">
              Rajagiri Public School — Student-Led Initiative
            </p>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Empowering Every <em className="text-red-600 not-italic">Heartbeat</em>
            </h1>
            <p className="text-base text-white/45 leading-relaxed max-w-xl mx-auto font-light">
              Heart Matters is a student-led initiative by Rajagiri Public School. We believe cardiovascular health information should be empowering, warm, and clear — not scary or clinical.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Philosophy */}
      <section className="py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-px bg-[#e8d8d4]">
            {[
              {
                icon: Target,
                title: "Our Mission",
                body: "As students of Rajagiri Public School, we set out to translate complex cardiological science into everyday wisdom. We want to close the gap between clinical knowledge and everyday choices, helping our community make informed decisions before a crisis occurs.",
              },
              {
                icon: Lightbulb,
                title: "Our Philosophy",
                body: "We believe in prevention through education. Health is a deeply personal journey, not a destination. Our tone is like a trusted friend who happens to be a cardiologist — honest, supportive, and deeply invested in your well-being.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[#faf8f5] hover:bg-white transition-colors p-10"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-6">
                  <item.icon className="h-5 w-5 text-red-700" />
                </div>
                <h2
                  className="text-3xl font-bold text-[#0f0c0c] mb-4 tracking-tight"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {item.title}
                </h2>
                <p className="text-sm text-[#8a7070] leading-relaxed font-light">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 md:px-6 bg-[#0f0c0c]">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-400 font-medium mb-3">Principles</p>
            <h2
              className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Core Values
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            {[
              {
                num: "01",
                title: "Compassion",
                desc: "We lead with empathy. Health struggles are real, and shame has no place in healing.",
                icon: Heart,
              },
              {
                num: "02",
                title: "Clarity",
                desc: "We banish medical jargon. Knowledge is only power if you can understand it.",
                icon: Lightbulb,
              },
              {
                num: "03",
                title: "Community",
                desc: "We are in this together. A rising tide of awareness lifts all boats.",
                icon: Users,
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[#0f0c0c] hover:bg-[#1c1414] transition-colors p-10"
              >
                <div
                  className="text-4xl font-semibold text-white/10 mb-5 leading-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {value.num}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed font-light">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
