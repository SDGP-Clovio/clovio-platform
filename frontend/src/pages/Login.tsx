import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Clock3, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import ClovioMark from '../components/common/ClovioMark';
import { login as loginRequest } from '../api/apiCalls';
import { fetchCurrentUserAsAppUser, fetchCurrentUserSettingsAsAppUser } from '../services/users';
import { useApp } from '../context/AppContext';

type LoginFormValues = {
	email: string;
	password: string;
};

type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateLoginForm = (values: LoginFormValues): LoginFormErrors => {
	const errors: LoginFormErrors = {};

	if (!values.email.trim()) {
		errors.email = 'Email is required.';
	} else if (!emailPattern.test(values.email)) {
		errors.email = 'Enter a valid email address.';
	}

	if (!values.password.trim()) {
		errors.password = 'Password is required.';
	}

	return errors;
};

const Login: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { setCurrentUser } = useApp();
	const [showPassword, setShowPassword] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [formValues, setFormValues] = useState<LoginFormValues>({
		email: '',
		password: '',
	});
	const [touchedFields, setTouchedFields] = useState<Record<keyof LoginFormValues, boolean>>({
		email: false,
		password: false,
	});
	const [errors, setErrors] = useState<LoginFormErrors>({});

	// Check for success message from registration
	useEffect(() => {
		if (location.state?.message) {
			setSuccessMessage(location.state.message);
			// Clear the message from location state
			navigate(location.pathname, { replace: true });
		}
	}, [location.state, navigate, location.pathname]);

	const handleChange = (field: keyof LoginFormValues, value: string) => {
		const nextValues = { ...formValues, [field]: value };
		setFormValues(nextValues);

		if (touchedFields[field]) {
			setErrors(validateLoginForm(nextValues));
		}
	};

	const handleBlur = (field: keyof LoginFormValues) => {
		const nextTouchedFields = { ...touchedFields, [field]: true };
		setTouchedFields(nextTouchedFields);
		setErrors(validateLoginForm(formValues));
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		const validationErrors = validateLoginForm(formValues);
		setTouchedFields({ email: true, password: true });
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		try {
			const response = await loginRequest({
				username: formValues.email, // Backend accepts email as username
				password: formValues.password
			});

			// Store token
			localStorage.setItem('access_token', response.access_token);

			// Resolve app user and route to the correct dashboard
			let user;
			try {
				user = await fetchCurrentUserSettingsAsAppUser();
			} catch {
				user = await fetchCurrentUserAsAppUser();
			}

			setCurrentUser(user);
			const destination = user.role === 'supervisor' ? '/supervisor' : '/dashboard';

			navigate(destination);
		} catch (error: any) {
			if (error?.response?.status === 401) {
				localStorage.removeItem('access_token');
			}
			const isNetworkOrCorsError = !error?.response;
			setErrors({
				password: isNetworkOrCorsError
					? 'Cannot reach backend API. Verify VITE_API_BASE_URL on Vercel and redeploy.'
					: error.response?.data?.detail || 'Login failed. Please try again.'
			});
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4">
			{/* 1. Parent Container: Must have overflow-hidden and relative position */}
			<div className="relative flex w-full max-w-5xl overflow-hidden rounded-[40px] bg-white shadow-2xl min-h-[600px]">

				{/* 2. THE PURPLE BACKGROUND LAYER */}
				{/* We use an absolute div that spans the right half but extends behind the curve */}
				<div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-b from-indigo-600 via-blue-600 to-emerald-500">
					{/* 3. THE CURVE: This white div creates the "cut-out" look */}
					<div className="absolute inset-y-0 -left-20 w-40 rounded-r-[100px] bg-white" />
					<div className="pointer-events-none absolute -top-10 right-8 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
					<div className="pointer-events-none absolute bottom-6 right-20 h-28 w-28 rounded-full bg-emerald-200/20 blur-2xl" />
				</div>

				{/* 4. CONTENT LAYERS (Must be z-10 to sit above the background) */}
				<div className="z-10 flex w-full flex-col justify-center p-12 md:w-1/2 lg:p-20">
					<div className="mb-12 flex items-center gap-2.5">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#10B981] shadow-lg shadow-indigo-200">
							<ClovioMark className="h-6 w-6 text-white" />
						</div>
						<span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Clovio</span>
					</div>

					<h1 className="text-4xl font-bold text-slate-800 leading-tight">Log in</h1>
					<p className="mb-10 text-sm text-slate-400">
						Don&apos;t have an account?{' '}
						<Link
							to="/signup"
							className="font-semibold text-[#4F46E5] transition-colors hover:text-[#4338CA]"
						>
							Create an account
						</Link>
					</p>

					{/* Success Message */}
					{successMessage && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
							<p className="text-green-700 text-sm">{successMessage}</p>
						</div>
					)}

					<form className="space-y-5" onSubmit={handleLogin} noValidate>
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="block text-sm font-semibold text-slate-700"
							>
								Email <span className="text-red-500">*</span>
							</label>
							<input
								id="email"
								type="email"
								placeholder="Enter your email"
								required
								value={formValues.email}
								onChange={(e) => handleChange('email', e.target.value)}
								onBlur={() => handleBlur('email')}
								aria-invalid={Boolean(errors.email)}
								className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 outline-none transition-all focus:ring-2 focus:ring-[#4F46E5]/20"
							/>
							{errors.email && touchedFields.email && (
								<p className="text-sm text-red-500">{errors.email}</p>
							)}
						</div>

						<div className="space-y-2">
							<label
								htmlFor="password"
								className="block text-sm font-semibold text-slate-700"
							>
								Password <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter your password"
									required
									value={formValues.password}
									onChange={(e) => handleChange('password', e.target.value)}
									onBlur={() => handleBlur('password')}
									aria-invalid={Boolean(errors.password)}
									className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 pr-12 outline-none transition-all focus:ring-2 focus:ring-[#4F46E5]/20"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((previous) => !previous)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
							{errors.password && touchedFields.password && (
								<p className="text-sm text-red-500">{errors.password}</p>
							)}

							<div className="flex justify-end">
								<button
									type="button"
									className="text-sm font-medium text-[#4F46E5] transition-colors hover:text-[#4338CA]"
								>
									Forgot password?
								</button>
							</div>
						</div>

						<button
							type="submit"
							className="mt-4 w-full rounded-2xl bg-[#4F46E5] py-4 text-base font-bold text-white shadow-xl shadow-indigo-400/30 transition-all hover:brightness-110"
						>
							Log in
						</button>
					</form>
				</div>

				{/* Right Side Illustration Layer */}
				<div className="relative z-10 hidden w-1/2 md:flex items-center justify-center p-12">
					<div className="relative h-[24rem] w-full max-w-[23rem]">
						<div className="absolute left-1 top-3 z-20 w-40 rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md shadow-xl -rotate-[7deg]">
							<p className="text-[11px] uppercase tracking-[0.12em] text-white/80">Team Health</p>
							<p className="mt-1 text-xl font-bold text-white">82%</p>
							<p className="text-xs text-emerald-100">On track this week</p>
						</div>

						<div className="absolute right-2 top-5 z-20 w-44 rounded-2xl border border-white/25 bg-slate-900/20 p-4 backdrop-blur-md shadow-xl rotate-[8deg]">
							<p className="text-xs font-semibold text-white/85">Next Meeting</p>
							<p className="mt-1 flex items-center gap-2 text-sm text-white">
								<Clock3 size={14} className="text-emerald-200" />
								10:00 AM tomorrow
							</p>
						</div>

						<div className="absolute left-0 top-[8.5rem] z-30 w-44 rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-md shadow-xl -rotate-[3deg]">
							<p className="text-[11px] uppercase tracking-[0.12em] text-white/80">Bus Factor</p>
							<p className="mt-1 text-sm font-semibold text-white">Low Risk</p>
							<p className="mt-1 text-xs text-emerald-100">3 owners on critical tasks</p>
						</div>

						<div className="absolute right-1 top-40 z-20 w-44 rounded-2xl border border-white/25 bg-slate-900/20 p-4 backdrop-blur-md shadow-xl rotate-[4deg]">
							<p className="text-[11px] uppercase tracking-[0.12em] text-white/80">Sprint Velocity</p>
							<p className="mt-1 text-sm font-semibold text-white">+6% this week</p>
							<p className="mt-1 text-xs text-indigo-100">Ahead of baseline</p>
						</div>

						<div className="absolute bottom-2 left-1/2 z-30 w-52 -translate-x-1/2 rounded-2xl border border-white/30 bg-slate-950/25 p-4 backdrop-blur-md shadow-2xl -rotate-[1deg]">
							<p className="text-[11px] uppercase tracking-[0.14em] text-indigo-100">Today Snapshot</p>
							<div className="mt-3 space-y-2">
								<div className="flex items-center justify-between rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white">
									<span className="flex items-center gap-2">
										<CheckCircle2 size={13} className="text-emerald-200" />
										Tasks done
									</span>
									<strong>18/22</strong>
								</div>
								<div className="flex items-center justify-between rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white">
									<span className="flex items-center gap-2">
										<ShieldCheck size={13} className="text-indigo-200" />
										Fairness
									</span>
									<strong>88%</strong>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>
		</div>
	);
};

export default Login;