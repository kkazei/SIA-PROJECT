const Input = ({ icon: Icon, ...props }) => {
	return (
		<div className='relative mb-6'>
			<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
				<Icon className='size-5 text-blue-300' />
			</div>
			<input
				{...props}
				className='w-full pl-10 pr-3 py-3 bg-slate-950/40 rounded-xl border border-white/15 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/30 text-white placeholder-gray-400 transition duration-200 outline-none'
			/>
		</div>
	);
};
export default Input;