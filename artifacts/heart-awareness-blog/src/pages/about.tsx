import { motion } from "framer-motion";
import { Heart, Users, Lightbulb, Target, Sparkles } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 font-['Outfit',sans-serif]">

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

      <section className="py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-700 font-medium mb-3">The Creators</p>
            <h2
              className="text-4xl md:text-5xl font-bold text-[#0f0c0c] leading-tight tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Meet Our Team
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="relative bg-white border border-[#e8d8d4] rounded-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700" />

            <div className="p-10 md:p-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-red-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f0c0c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Mishal & Alby
                  </h3>
                  <p className="text-[10px] tracking-widest uppercase text-red-700 font-medium">
                    Grade 10 — Rajagiri Public School, Qatar
                  </p>
                </div>
              </div>

              <p className="text-[#5a4a4a] leading-[1.85] text-[15px] font-light mb-6">
                Heart Matters was built from the ground up by Mishal and Alby, two Grade 10 students at Rajagiri Public School in Qatar. What started as a shared curiosity about cardiovascular health quickly grew into something much bigger — a platform designed to make life-saving information accessible, approachable, and genuinely useful for people of all ages.
              </p>
              <p className="text-[#5a4a4a] leading-[1.85] text-[15px] font-light mb-6">
                Every article, every feature, and every line of code on this website represents hours of research, late-night problem-solving, and a deep belief that young people can make a real difference. We wanted to prove that meaningful health education does not have to come from a hospital or a textbook — it can come from students who care enough to build something worth sharing.
              </p>
              <p className="text-[#5a4a4a] leading-[1.85] text-[15px] font-light">
                We poured our hearts (pun intended) into this project, and we sincerely hope it helps you or someone you love learn something new about keeping their heart healthy. If even one person takes a small step toward better cardiovascular health because of this site, then every bit of effort was worth it. Thank you for being here.
              </p>
            </div>

            <div className="border-t border-[#e8d8d4] bg-[#faf8f5] px-10 md:px-14 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#8a7070] font-light">
                Built with dedication at Rajagiri Public School, Qatar
              </p>
              <div className="flex items-center gap-1.5 text-xs text-red-700 font-medium">
                <Heart className="h-3.5 w-3.5 fill-red-700" />
                Made with our hearts
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
