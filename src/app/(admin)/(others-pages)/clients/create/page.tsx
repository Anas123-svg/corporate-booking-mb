
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";




	type ClientFormState = {
		firstname: string;
		lastname: string;
		email: string;
		address1: string;
		country: string;
		state: string;
		city: string;
		password: string;
		password_repeat: string;
	};

	export default function CreateClientPage() {
		const router = useRouter();
		const [form, setForm] = useState<ClientFormState>({
			firstname: "",
			lastname: "",
			email: "",
			address1: "",
			country: "",
			state: "",
			city: "",
			password: "",
			password_repeat: "",
		});
		const [loading, setLoading] = useState(false);
		const [error, setError] = useState("");
		const [showPassword, setShowPassword] = useState(false);
		const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
		const [countries, setCountries] = useState<Array<{ code: string; countryname: string }>>([]);
		const [countriesLoading, setCountriesLoading] = useState(false);

		useEffect(() => {
			const fetchCountries = async () => {
				setCountriesLoading(true);
				try {
					const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/country/index`, {
						method: "GET",
						headers: { "Content-Type": "application/json" }
					});
					const data = await res.json();
					if (data.success && Array.isArray(data.data)) {
						setCountries(
							data.data
								.filter((item: any) => item?.code && item?.countryname)
								.map((item: any) => ({ code: item.code, countryname: item.countryname }))
						);
					} else {
						setCountries([]);
					}
				} catch (err) {
					setCountries([]);
				} finally {
					setCountriesLoading(false);
				}
			};

			fetchCountries();
		}, []);

		const handleChange = (
			e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
		) => {
			setForm({ ...form, [e.target.name]: e.target.value });
		};

		const handleSubmit = async (e: React.FormEvent) => {
			e.preventDefault();
			setError("");
			// Basic validation
			if (!form.firstname || !form.lastname || !form.email || !form.address1 || !form.country || !form.state || !form.city || !form.password || !form.password_repeat) {
				setError("Please fill all required fields.");
				return;
			}
			if (form.password !== form.password_repeat) {
				setError("Passwords do not match");
				return;
			}
			setLoading(true);
			try {
				// Get admin id from persisted Zustand store in localStorage (auth-storage)
				let corporate_book_host_id = null;
				if (typeof window !== "undefined") {
					const authRaw = localStorage.getItem("auth-storage");
					if (authRaw) {
						try {
							const authObj = JSON.parse(authRaw);
							if (authObj?.state?.user?.id) {
								corporate_book_host_id = authObj.state.user.id;
							}
						} catch (e) {
							// ignore parse error
						}
					}
				}
				if (!corporate_book_host_id) {
					setError("Corporate Host ID not found. Please login again.");
					setLoading(false);
					return;
				}
				const payload = {
					corporate_book_host_id: Number(corporate_book_host_id),
					firstname: form.firstname,
					lastname: form.lastname,
					email: form.email,
					address1: form.address1,
					country: form.country,
					state: form.state,
					city: form.city,
					password: form.password,
					password_repeat: form.password_repeat
				};
				console.log("Request payload sent to server:", payload);
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/signup`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(payload)
				});
				const data = await res.json();
				console.log("API response status:", res.status);
				console.log("API response body:", data);
				if (!res.ok || !data.success) {
					setError(data.message || "Failed to create client");
					setLoading(false);
					return;
				}
				setLoading(false);
				router.push("/clients");
			} catch (err: any) {
				console.error("API error:", err);
				setError("An error occurred. Please try again.");
				setLoading(false);
			}
		};

		return (
			<>
				<style jsx global>{`
					@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600&display=swap');
					:root {
						--primary: #1a1a1a;
						--secondary: #d4a574;
						--accent: #8b7355;
						--bg-light: #fafaf8;
						--bg-card: #ffffff;
						--text-primary: #1a1a1a;
						--text-secondary: #6b6b6b;
						--border: #e8e8e6;
						--shadow: rgba(0, 0, 0, 0.08);
					}
					.dark {
						--primary: #ffffff;
						--secondary: #d4a574;
						--accent: #b8936d;
						--bg-light: #0f0f0f;
						--bg-card: #1a1a1a;
						--text-primary: #ffffff;
						--text-secondary: #a3a3a3;
						--border: #2a2a2a;
						--shadow: rgba(0, 0, 0, 0.3);
					}
					body {
						background: var(--bg-light);
						font-family: 'Inter', sans-serif;
					}
					.playfair {
						font-family: 'Playfair Display', serif;
					}
					@keyframes slideUp {
						from {
							opacity: 0;
							transform: translateY(20px);
						}
						to {
							opacity: 1;
							transform: translateY(0);
						}
					}
					.animate-slide-up {
						animation: slideUp 0.6s ease-out forwards;
					}
					input:focus, select:focus {
						outline: none;
						border-color: var(--secondary) !important;
						box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1) !important;
					}
				`}</style>
				<div className="min-h-screen pt-2 pb-10 px-4 sm:px-6 lg:px-8">
					<div className="max-w-2xl mx-auto">
						<div className="text-center mb-8">
							<div className="inline-block mb-2">
								<div className="w-20 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent mx-auto mb-3"></div>
							</div>
							<h1
								className="playfair text-4xl md:text-5xl font-bold mb-2 tracking-tight"
								style={{ color: 'var(--text-primary)' }}
							>
								Add New Client
							</h1>
							<p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
								Fill in the details to add a new client
							</p>
						</div>
						<form onSubmit={handleSubmit} className="space-y-10 animate-slide-up">
							<section className="bg-card rounded-2xl shadow-lg overflow-hidden border" style={{
								background: 'var(--bg-card)',
								borderColor: 'var(--border)',
								boxShadow: '0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow)'
							}}>
								<div className="p-8 md:p-12">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>First Name</label>
											<input
												type="text"
												name="firstname"
												value={form.firstname}
												onChange={handleChange}
												required
												placeholder="Enter first name"
												className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
												style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
											/>
										</div>
										<div>
											<label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Last Name</label>
											<input
												type="text"
												name="lastname"
												value={form.lastname}
												onChange={handleChange}
												required
												placeholder="Enter last name"
												className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
												style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
											/>
										</div>
										<div className="md:col-span-2">
											<label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Email</label>
											<input
												type="email"
												name="email"
												value={form.email}
												onChange={handleChange}
												required
												placeholder="Enter email address"
												className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
												style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
											/>
										</div>
										<div className="md:col-span-2">
											<label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Address</label>
											<input
												type="text"
												name="address1"
												value={form.address1}
												onChange={handleChange}
												required
												placeholder="Street address, building, etc."
												className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
												style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
											/>
										</div>
											<div>
												<label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Country</label>
												<select
													name="country"
													value={form.country}
													onChange={handleChange}
													required
													disabled={countriesLoading}
													className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
													style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
												>
													<option value="">{countriesLoading ? "Loading countries..." : "Select country"}</option>
													{countries.map((country) => (
														<option key={country.code} value={country.code}>
															{country.countryname}
														</option>
													))}
												</select>
											</div>
										<div>
											<label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>State</label>
											<input
												type="text"
												name="state"
												value={form.state}
												onChange={handleChange}
												required
												placeholder="State"
												className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
												style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
											/>
										</div>
										<div>
											<label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>City</label>
											<input
												type="text"
												name="city"
												value={form.city}
												onChange={handleChange}
												required
												placeholder="City"
												className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50"
												style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
											/>
										</div>
										<div className="md:col-span-2">
											<label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Password</label>
											<div className="relative">
												<input
													type={showPassword ? "text" : "password"}
													name="password"
													value={form.password}
													onChange={handleChange}
													required
													placeholder="Choose a dummy password for your client (they can change it after first login)"
													className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50 pr-12"
													style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
												/>
												<button
													type="button"
													tabIndex={-1}
													onClick={() => setShowPassword((v) => !v)}
													className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary focus:outline-none"
													aria-label={showPassword ? "Hide password" : "Show password"}
												>
													{showPassword ? (
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m2.122-2.122A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-2.122 2.122A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
													) : (
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m2.122-2.122A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-2.122 2.122A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
													)}
												</button>
											</div>
											<span className="text-xs text-gray-500 mt-1 block">Choose a dummy password for your client for their first login. They will be able to change it from their account.</span>
										</div>
										<div className="md:col-span-2">
											<label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Repeat Password</label>
											<div className="relative">
												<input
													type={showPasswordRepeat ? "text" : "password"}
													name="password_repeat"
													value={form.password_repeat}
													onChange={handleChange}
													required
													placeholder="Repeat password"
													className="w-full px-4 py-3.5 rounded-lg border-2 transition-all duration-200 hover:border-secondary/50 pr-12"
													style={{ background: 'var(--bg-light)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
												/>
												<button
													type="button"
													tabIndex={-1}
													onClick={() => setShowPasswordRepeat((v) => !v)}
													className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary focus:outline-none"
													aria-label={showPasswordRepeat ? "Hide password" : "Show password"}
												>
													{showPasswordRepeat ? (
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m2.122-2.122A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-2.122 2.122A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
													) : (
														<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m2.122-2.122A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-2.122 2.122A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
													)}
												</button>
											</div>
										</div>
									</div>
									{error && <div className="text-red-500 mt-4 text-sm">{error}</div>}
								</div>
							</section>
							<div className="flex justify-center mt-8 mb-8 px-4">
								<button
									type="submit"
									disabled={loading}
									className="w-full max-w-md px-12 py-5 rounded-lg font-semibold text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
									style={{ background: 'var(--secondary)', color: 'white' }}
								>
									{loading ? "Adding..." : "Add Client"}
								</button>
							</div>
						</form>
					</div>
				</div>
			</>
		);
	}
