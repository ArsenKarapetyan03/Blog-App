import { CustomLoadingSpinner } from './CustomLoadingSpinner';

export const LoadingComponent = () => (
	<div className="my-2 md:my-10 w-full md:min-w-2xl flex flex-col items-center justify-center gap-5">
		<CustomLoadingSpinner colorClass="text-indigo-500"  />
		<div className="md:text-2xl text-indigo-500">Loading...</div>
	</div>
)