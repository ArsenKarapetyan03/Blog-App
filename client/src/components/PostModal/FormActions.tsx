import { useFormStatus } from "react-dom";
import { CustomLoadingSpinner } from "@/components/ui/CustomLoadingSpinner";

export const FormActions = ({onCancel}: { onCancel: () => void }) => {
	const {pending} = useFormStatus();

	return (
		<div className="flex justify-end gap-2 mt-2">
			<button
				type="button"
				onClick={onCancel}
				disabled={pending}
				className="px-4 py-2 text-sm text-zinc-300 rounded-lg bg-zinc-800 transition cursor-pointer
				hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={pending}
				className="flex items-center gap-2 px-4 py-2 text-sm text-white font-medium rounded-lg transition cursor-pointer
				 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:cursor-not-allowed"
			>
				{
					pending
						? <>
								<CustomLoadingSpinner size="sm" />
								Publishing...
							</>
						: "Publish"
				}
			</button>
		</div>
	)
}