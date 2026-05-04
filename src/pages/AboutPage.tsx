import { motion } from "motion/react";
import { MapPin, Phone, Mail, Award, Users, Clock } from "lucide-react";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full px-4 md:px-8 py-8 flex flex-col gap-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">About Us</h1>
        <p className="text-sm text-text-secondary mt-1">Vikramaditya Metrology Center — precision calibration since 2005</p>
      </div>

      {/* Intro card */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-text-primary">Who We Are</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Vikramaditya Metrology Center is an ISO 17025 accredited calibration laboratory based in Kolhapur, Maharashtra. We provide precision calibration, repair, and testing services for a wide range of measuring instruments used across manufacturing, engineering, and quality assurance industries.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              With over two decades of experience, our team of certified metrologists ensures that every instrument we handle meets the highest standards of accuracy and traceability.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Award, label: "ISO 17025", desc: "Accredited laboratory" },
              { icon: Users, label: "500+ Clients", desc: "Across Maharashtra" },
              { icon: Clock, label: "20+ Years", desc: "Industry experience" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-surface-subtle rounded-lg p-4 flex flex-col gap-2">
                <Icon size={20} className="text-brand-orange" />
                <div className="text-sm font-semibold text-text-primary">{label}</div>
                <div className="text-xs text-text-secondary">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-semibold text-text-primary mb-5">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Dimensional Calibration", desc: "Vernier calipers, micrometers, gauges, CMM verification" },
            { title: "Instrument Repair", desc: "Servicing and repair of precision measuring instruments" },
            { title: "Thread Gauging", desc: "Ring gauges, plug gauges, taper thread verification" },
            { title: "Dial Indicator Testing", desc: "Dial gauges, test indicators, bore gauges" },
            { title: "Torque Calibration", desc: "Torque wrenches, screwdrivers, and testers" },
            { title: "On-Site Calibration", desc: "Calibration services at your facility across Kolhapur district" },
          ].map(s => (
            <div key={s.title} className="border border-border rounded-lg p-4">
              <div className="text-sm font-medium text-text-primary mb-1">{s.title}</div>
              <div className="text-xs text-text-secondary leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
