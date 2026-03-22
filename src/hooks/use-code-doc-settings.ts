import { useEffect, useState } from "react";

export function useCodeDocWrap(documentId: string) {
	const [wrap, setWrap] = useState(false);
	const storageKey = `code-doc-wrap-${documentId}`;

	useEffect(() => {
		const savedWrap = localStorage.getItem(storageKey);
		setWrap(savedWrap === "on");
	}, [storageKey]);

	const updateWrap = (nextWrap: boolean) => {
		setWrap(nextWrap);
		localStorage.setItem(storageKey, nextWrap ? "on" : "off");
	};

	return [wrap, updateWrap] as const;
}

export function useCodeDocAutoRun(documentId: string) {
	const [autoRun, setAutoRun] = useState(true);
	const storageKey = `code-doc-auto-run-${documentId}`;

	useEffect(() => {
		const savedAutoRun = localStorage.getItem(storageKey);
		if (savedAutoRun === null) return;
		setAutoRun(savedAutoRun === "on");
	}, [storageKey]);

	const updateAutoRun = (nextAutoRun: boolean) => {
		setAutoRun(nextAutoRun);
		localStorage.setItem(storageKey, nextAutoRun ? "on" : "off");
	};

	return [autoRun, updateAutoRun] as const;
}
