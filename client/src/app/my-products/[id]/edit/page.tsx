"use client";

import React, { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import ProductForm from "@/app/my-products/_components/ProductForm";
import { getProductById } from "@/actions/product";
import { Product } from "@/types/types";

export default function EditProductPage() {
	const { id } = useParams<{ id: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadProduct = async () => {
			try {
				const result = await getProductById(id);

				if (result.success && result.data) {
					setProduct(result.data);
				}
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			loadProduct();
		}
	}, [id]);

	if (loading) {
		return <div className="h-64 w-full animate-pulse rounded-xl bg-gray-100" />;
	}

	if (!product) {
		notFound();
	}

	return <ProductForm initialData={product} />;
}