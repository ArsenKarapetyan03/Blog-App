import { Price } from "@/types/types";

export const formatPrice = (amount?: number, currency: string = "usd") => {
	if (amount === undefined || amount === null) return null;
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency.toUpperCase(),
	}).format(amount / 100);
};

export const formatInterval = (interval?: string | null, count?: number | null): string => {
	if (!interval) return "";
	const n = count ?? 1;
	return n > 1 ? `/ ${n} ${interval}s` : `/ ${interval}`;
};

export const formatPriceInterval = (price?: Partial<Price> | null): string => {
	if (!price) return "";
	if (price.type && price.type !== "recurring") return "";

	return formatInterval(price.interval, price.intervalCount);
};

export const getPriceOptionLabel = (price: Price) => {
	if (price.type !== "recurring" || !price.interval) return "One-time";
	const count = price.intervalCount ?? 1;
	if (count === 1) {
		const labels: Record<string, string> = {
			day: "Daily",
			week: "Weekly",
			month: "Monthly",
			year: "Yearly",
		};
		return labels[price.interval] ?? `Every ${price.interval}`;
	}
	return `Every ${count} ${price.interval}s`;
};

export const getDefaultPrice = (prices?: Price[]) => {
	if (!prices || prices.length === 0) return undefined;
	return prices.find((p) => p.type !== "recurring") ?? prices[0];
};