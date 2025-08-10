import React from 'react';
import { motion } from 'framer-motion';

const Pastoral = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Pastoral Educativa
          </h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Acompañamiento Espiritual
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Página de pastoral educativa en desarrollo. Aquí se incluirán los programas pastorales, 
              protocolos y recursos para la formación espiritual.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pastoral;
