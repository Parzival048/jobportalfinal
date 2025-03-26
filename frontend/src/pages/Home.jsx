import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogIn, FiUserPlus, FiArrowRight } from 'react-icons/fi';

const Home = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const buttonHover = {
    scale: 1.05,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 }
  };

  const buttonTap = {
    scale: 0.95
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-2xl"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight"
        >
          Welcome to <span className="text-blue-600">JobPortal</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg text-gray-600 mb-10 max-w-lg mx-auto"
        >
          Find your dream job or the perfect candidate with our powerful platform.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <motion.div
            whileHover={buttonHover}
            whileTap={buttonTap}
          >
            <Link
              to="/login"
              className="flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl shadow-md font-medium text-lg hover:bg-gray-50 transition-all"
            >
              <FiLogIn className="mr-3" />
              Login
              <FiArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={buttonHover}
            whileTap={buttonTap}
          >
            <Link
              to="/register"
              className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl shadow-md font-medium text-lg hover:bg-blue-700 transition-all group"
            >
              <FiUserPlus className="mr-3" />
              Register
              <FiArrowRight className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 text-gray-500"
        >
          <p>Trusted by thousands of companies worldwide</p>
          <div className="flex justify-center gap-8 mt-4 opacity-70">
            {/* Placeholder for company logos */}
            <div className="h-8 w-auto bg-gray-300 rounded"></div>
            <div className="h-8 w-auto bg-gray-300 rounded"></div>
            <div className="h-8 w-auto bg-gray-300 rounded"></div>
          </div>
        </motion.div>
      </motion.div>

      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 rounded-full bg-blue-200 opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-indigo-200 opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </motion.div>
  );
};

export default Home;