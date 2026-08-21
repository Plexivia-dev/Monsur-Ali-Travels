import React from 'react';
import { Plane, Map, FileText, Globe2 } from 'lucide-react';
import { motion } from 'motion/react';

const services = [
  {
    icon: <Plane className="w-8 h-8" />,
    title: "Air Tickets",
    description: "Global flight bookings with premium carriers. We secure the best routes and competitive corporate rates."
  },
  {
    icon: <Map className="w-8 h-8" />,
    title: "Hajj & Umrah",
    description: "Complete spiritual journey packages including visa, premium accommodation, and guided assistance."
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: "Visa Processing",
    description: "End-to-end visa application support for tourist, business, and medical travel worldwide."
  },
  {
    icon: <Globe2 className="w-8 h-8" />,
    title: "Custom Tours",
    description: "Tailor-made itineraries for corporate retreats, family vacations, and specialized group travel."
  }
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-[#0A2540] mb-6">Our Premium Services</h2>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed">Comprehensive travel solutions designed for reliability, comfort, and ultimate peace of mind.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 group"
            >
              <div className="bg-emerald-50 w-16 h-16 rounded-xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 group-hover:bg-emerald-100 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0A2540] mb-4">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
