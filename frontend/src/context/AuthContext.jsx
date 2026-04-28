import { createContext, useEffect, useMemo, useState } from "react";

import authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		authService
			.me()
			.then((data) => mounted && setUser(data))
			.catch(() => mounted && setUser(null))
			.finally(() => mounted && setIsLoading(false));

		return () => {
			mounted = false;
		};
	}, []);

	const login = async (credentials) => {
		const data = await authService.login(credentials);
		setUser(data);
		return data;
	};

	const register = async (payload) => authService.register(payload);

	const logout = async () => {
		await authService.logout();
		setUser(null);
	};

	const value = useMemo(
		() => ({ user, isLoading, login, register, logout }),
		[user, isLoading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
