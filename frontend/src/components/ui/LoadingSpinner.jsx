import { motion } from "framer-motion";

const LoadingSpinner = () => {
	return (
		<div className='min-h-screen bg-gradient-to-br from-[#0b1729] via-[#173c6b] to-[#0d203b] flex items-center justify-center relative overflow-hidden'>
			<motion.div
				className='w-12 h-12 border-4 border-[#82c7ff]/20 border-t-[#82c7ff] rounded-full'
				animate={{ rotate: 360 }}
				transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
			/>
		</div>
	);
};

export default LoadingSpinner;