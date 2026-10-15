import { useRouter } from "next/navigation";
import { Modal } from "antd";

interface SignInModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const SignInModal = (
	{
		isOpen,
		onClose
	}: SignInModalProps
) => {
	const router = useRouter();
	const handleClick = ()=> router.push("/sign-in")

	return (
		<Modal
			open={isOpen}
			onCancel={onClose}
			footer={null}
			title={null}
			centered
		>
			<div className="text-center font-sans py-4 px-2">
				<h2 className="text-3xl font-semibold mb-4">Sign in to continue</h2>

				<p className="text-lg mb-8 px-2">
					Join our community of thinkers and share what you've learned.
				</p>

				<button
					type="button"
					onClick={handleClick}
					className="p-3 w-full bg-black hover:bg-black/80 text-white text-lg font-medium rounded-3xl transition-colors duration-200 cursor-pointer"
				>
					Continue
				</button>
			</div>
		</Modal>
	);
}
