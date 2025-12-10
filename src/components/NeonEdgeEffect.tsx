
import { motion } from 'framer-motion';

interface NeonEdgeEffectProps {
  isActive: boolean;
  color?: 'blue' | 'purple' | 'pink' | 'green' | 'multi';
}

const NeonEdgeEffect = ({ 
  isActive,
  color = 'multi'
}: NeonEdgeEffectProps) => {
  
  if (!isActive) return null;
  
  // Color mappings
  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-pink-600",
    green: "from-green-500 to-green-600",
    multi: "from-blue-500 via-purple-500 to-pink-500"
  };
  
  const gradientClass = colorMap[color];
  
  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      {/* Top edge */}
      <motion.div 
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientClass}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Bottom edge */}
      <motion.div 
        className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${gradientClass}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Left edge */}
      <motion.div 
        className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${gradientClass}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Right edge */}
      <motion.div 
        className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${gradientClass}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Corner glows */}
      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => {
        const position = {
          'top-left': 'top-0 left-0',
          'top-right': 'top-0 right-0',
          'bottom-left': 'bottom-0 left-0',
          'bottom-right': 'bottom-0 right-0'
        }[corner];
        
        return (
          <motion.div
            key={corner}
            className={`absolute ${position} w-6 h-6 rounded-full blur-[10px] bg-gradient-to-br ${gradientClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ 
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        );
      })}
      
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-blue-900/5" />
    </div>
  );
};

export default NeonEdgeEffect;
