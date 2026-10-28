import { cookies } from "next/headers";
import { BASE_URL } from "@/config/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserType } from "@/types/types";
import { UserRow } from "@/components/ui/UserRow";

const UsersPage = async () => {
	const token = (await cookies()).get("token")?.value;

	const [usersRes, meRes] = await Promise.all([
		fetch(`${BASE_URL}/user`, { next: { revalidate: 60 } }),
		fetch(`${BASE_URL}/user/me`, {
			headers: token ? { "Authorization": `Bearer ${token}` } : {},
			cache: "no-store"
		})
	]);

	if (!usersRes.ok || !meRes.ok) {
		return <EmptyState />;
	}

	const [rawUsers, rawCurrentUser] = await Promise.all([
		usersRes.json(),
		meRes.json()
	]);

	if (!rawUsers.success || !rawUsers.users?.length || !rawCurrentUser.success) {
		return <EmptyState />;
	}

	const currentUser: UserType = rawCurrentUser.user;
	const friendIds = new Set(currentUser.friends?.map(f => f.id) || []);
	const incomingRequestIds = new Set(currentUser.incomingRequests?.map(user => user.id) || []);
	const outgoingRequestIds = new Set(currentUser.outgoingRequests?.map(user => user.id) || []);
	const users = rawUsers.users.filter((user: UserType) => currentUser.id !== user.id);

	return (
		<div className="py-5 flex flex-col gap-4">
			{users.map((user: UserType) => (
				<UserRow
					key={user.id}
					user={user}
					relationshipStatus={
						friendIds.has(user.id)
							? "accepted"
							: incomingRequestIds.has(user.id)
								? "incoming"
								: outgoingRequestIds.has(user.id)
									? "outgoing"
									: "none"
					}
				/>
			))}
		</div>
	)
}

export default UsersPage;
