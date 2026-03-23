import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Sparkles, UserRound } from 'lucide-react';
import ClovioMark from '../components/common/ClovioMark';

type SignUpFormValues = {
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
	role: 'student' | 'supervisor' | '';
};

type SignUpFormErrors = Partial<Record<keyof SignUpFormValues, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRules = [
	{ label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
	{ label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
	{ label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
	{ label: 'One number (0–9)', test: (p: string) => /[0-9]/.test(p) },
	{ label: 'One special character (!@#…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const validateStepOne = (values: SignUpFormValues): SignUpFormErrors => {
	const errors: SignUpFormErrors = {};

	if (!values.fullName.trim()) {
		errors.fullName = 'Full name is required.';
	}

	if (!values.email.trim()) {
		errors.email = 'Email is required.';
	} else if (!emailPattern.test(values.email)) {
		errors.email = 'Enter a valid email address.';
	}

	if (!values.role) {
		errors.role = 'Please select a role.';
	}

	return errors;
};

const validateStepTwo = (values: SignUpFormValues): SignUpFormErrors => {
	const errors: SignUpFormErrors = {};

	if (!values.password.trim()) {
		errors.password = 'Password is required.';
	} else if (passwordRules.some((rule) => !rule.test(values.password))) {
		errors.password = 'Password does not meet all requirements.';
	}

	if (!values.confirmPassword.trim()) {
		errors.confirmPassword = 'Please verify your password.';
	} else if (values.confirmPassword !== values.password) {
		errors.confirmPassword = 'Passwords do not match.';
	}

	return errors;
};

const validateSignUpForm = (values: SignUpFormValues): SignUpFormErrors => {
	return {
		...validateStepOne(values),
		...validateStepTwo(values),
	};
};

const SignUp: React.FC = () => {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [currentStep, setCurrentStep] = useState<1 | 2>(1);
	const [formValues, setFormValues] = useState<SignUpFormValues>({
		fullName: '',
		email: '',
		password: '',
		confirmPassword: '',
		role: '',
	});
	const [touchedFields, setTouchedFields] = useState<Record<keyof SignUpFormValues, boolean>>({
		fullName: false,
		email: false,
		password: false,
		confirmPassword: false,
		role: false,
	});
	const [errors, setErrors] = useState<SignUpFormErrors>({});

	const handleChange = (field: keyof SignUpFormValues, value: string) => {
		const nextValues = { ...formValues, [field]: value };
		setFormValues(nextValues);

		if (touchedFields[field] || field === 'password' || field === 'confirmPassword') {
			setErrors(validateSignUpForm(nextValues));
		}
	};

	const handleBlur = (field: keyof SignUpFormValues) => {
		const nextTouchedFields = { ...touchedFields, [field]: true };
		setTouchedFields(nextTouchedFields);
		setErrors(validateSignUpForm(formValues));
	};

	const handleContinue = () => {
		const stepOneErrors = validateStepOne(formValues);
		setTouchedFields((previous) => ({
			...previous,
			fullName: true,
			email: true,
			role: true,
		}));
		setErrors(stepOneErrors);

		if (Object.keys(stepOneErrors).length === 0) {
			setCurrentStep(2);
		}
	};

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();

		const validationErrors = validateSignUpForm(formValues);
		setTouchedFields((previous) => ({
			...previous,
			fullName: true,
			email: true,
			password: true,
			confirmPassword: true,
			role: true,
		}));
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		try {
			// Use the existing register API
			const { register } = await import('../api/apiCalls');
			await register({
				email: formValues.email,
				username: formValues.email.split('@')[0], // Generate username from email
				full_name: formValues.fullName,
				password: formValues.password,
				role: formValues.role as "student" | "supervisor"
			});

			// Navigate to login with success message
			navigate('/login', {
				state: { message: 'Account created successfully! Please sign in.' }
			});
		} catch (error: any) {
			setErrors({
				email: error.response?.data?.detail || 'Registration failed. Please try again.'
			});
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 font-sans">
			
			<div className="relative flex h-[92vh] max-h-[640px] w-full max-w-5xl overflow-hidden rounded-[40px] bg-white shadow-2xl flex-col md:flex-row-reverse">

				
				<div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-b from-emerald-500 via-blue-600 to-indigo-600">
					
					<div className="absolute inset-y-0 -right-20 w-40 rounded-l-[100px] bg-white" />
					<div className="pointer-events-none absolute -top-12 left-12 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
					<div className="pointer-events-none absolute bottom-8 left-24 h-28 w-28 rounded-full bg-indigo-200/20 blur-2xl" />
				</div>

				
				<div className="z-10 flex w-full flex-col justify-center overflow-y-auto p-8 md:w-1/2 md:p-10 lg:p-12">
					<div className="mb-8 flex items-center gap-2 text-[#4F46E5]">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#10B981] shadow-lg shadow-indigo-200">
							<ClovioMark className="h-6 w-6 text-white" />
						</div>
						<span className="text-xs font-bold uppercase tracking-widest text-slate-500">
							Clovio
						</span>
					</div>

					<h1 className="text-4xl font-bold leading-tight text-slate-800">Create an account</h1>
					<p className="mb-6 text-sm text-slate-400">
						Already have an account?{' '}
						<Link
							to="/login"
							className="font-semibold text-[#4F46E5] transition-colors hover:text-[#4338CA]"
						>
							Log in
						</Link>
					</p>

					<div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
						<button
							type="button"
							onClick={() => setCurrentStep(1)}
							className={`flex-1 rounded-xl px-3 py-2 transition ${
								currentStep === 1 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
							}`}
						>
							Step 1: Profile
						</button>
						<button
							type="button"
							onClick={() => {
								if (currentStep === 1) {
									handleContinue();
									return;
								}
								setCurrentStep(2);
							}}
							className={`flex-1 rounded-xl px-3 py-2 transition ${
								currentStep === 2 ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
							}`}
						>
							Step 2: Security
						</button>
					</div>

					<form className="space-y-5" onSubmit={handleSignUp} noValidate>
						{currentStep === 1 ? (
							<>
								<div className="space-y-2">
									<label
										htmlFor="fullName"
										className="block text-sm font-semibold text-slate-700"
									>
										Full Name <span className="text-red-500">*</span>
									</label>
									<input
										id="fullName"
										type="text"
										placeholder="Enter your full name"
										required
										value={formValues.fullName}
										onChange={(e) => handleChange('fullName', e.target.value)}
										onBlur={() => handleBlur('fullName')}
										aria-invalid={Boolean(errors.fullName)}
										className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 outline-none transition-all focus:ring-2 focus:ring-[#4F46E5]/20"
									/>
									{errors.fullName && touchedFields.fullName && (
										<p className="text-sm text-red-500">{errors.fullName}</p>
									)}
								</div>

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
									<label className="block text-sm font-semibold text-slate-700">
										Role <span className="text-red-500">*</span>
									</label>
									<div className="flex gap-3">
										{(['student', 'supervisor'] as const).map((option) => (
											<button
												key={option}
												type="button"
												onClick={() => handleChange('role', option)}
												onBlur={() => handleBlur('role')}
												className={`flex-1 rounded-2xl border py-3 text-sm font-semibold capitalize transition-all ${formValues.role === option
														? 'border-[#4F46E5] bg-[#4F46E5] text-white shadow-lg shadow-indigo-300/30'
														: 'border-slate-100 bg-slate-50 text-slate-500 hover:border-[#4F46E5]/40'
													}`}
											>
												{option.charAt(0).toUpperCase() + option.slice(1)}
											</button>
										))}
									</div>
									{errors.role && touchedFields.role && (
										<p className="text-sm text-red-500">{errors.role}</p>
									)}
								</div>

								<button
									type="button"
									onClick={handleContinue}
									className="mt-2 w-full rounded-2xl bg-[#4F46E5] py-4 text-base font-bold text-white shadow-xl shadow-indigo-400/30 transition-all hover:brightness-110"
								>
									Continue
								</button>
							</>
						) : (
							<>
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
											placeholder="Create a password"
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

									{touchedFields.password && formValues.password && (
										<ul className="space-y-1 pt-1">
											{passwordRules.map((rule) => {
												const passed = rule.test(formValues.password);
												return (
													<li key={rule.label} className={`flex items-center gap-2 text-xs ${passed ? 'text-green-500' : 'text-slate-400'}`}>
														<span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${passed ? 'bg-green-100 text-green-500' : 'bg-slate-100 text-slate-400'}`}>
															{passed ? '✓' : '×'}
														</span>
														{rule.label}
													</li>
												);
											})}
										</ul>
									)}
								</div>

								<div className="space-y-2">
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-semibold text-slate-700"
									>
										Verify Password <span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<input
											id="confirmPassword"
											type={showConfirmPassword ? 'text' : 'password'}
											placeholder="Re-enter your password"
											required
											value={formValues.confirmPassword}
											onChange={(e) => handleChange('confirmPassword', e.target.value)}
											onBlur={() => handleBlur('confirmPassword')}
											aria-invalid={Boolean(errors.confirmPassword)}
											className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 pr-12 outline-none transition-all focus:ring-2 focus:ring-[#4F46E5]/20"
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword((previous) => !previous)}
											className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
											aria-label={showConfirmPassword ? 'Hide verify password' : 'Show verify password'}
										>
											{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
										</button>
									</div>
									{errors.confirmPassword && touchedFields.confirmPassword && (
										<p className="text-sm text-red-500">{errors.confirmPassword}</p>
									)}
								</div>

								<div className="mt-2 flex items-center gap-3">
									<button
										type="button"
										onClick={() => setCurrentStep(1)}
										className="w-1/2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-700 transition-all hover:border-[#4F46E5]/40"
									>
										Back
									</button>
									<button
										type="submit"
										className="w-1/2 rounded-2xl bg-[#4F46E5] py-4 text-sm font-bold text-white shadow-xl shadow-indigo-400/30 transition-all hover:brightness-110"
									>
										Sign up
									</button>
								</div>
							</>
						)}
					</form>
				</div>

				
				<div className="relative z-10 hidden w-1/2 md:flex items-center justify-center p-12">
					<div className="relative h-[24rem] w-full max-w-[23rem]">
						<div className="absolute right-2 top-3 z-20 w-40 rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md shadow-xl rotate-[7deg]">
							<p className="text-[11px] uppercase tracking-[0.12em] text-white/80">Fast Setup</p>
							<p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
								<Sparkles size={14} className="text-emerald-100" />
								Under 3 minutes
							</p>
						</div>

						<div className="absolute left-1 top-5 z-20 w-44 rounded-2xl border border-white/25 bg-slate-900/20 p-4 backdrop-blur-md shadow-xl -rotate-[8deg]">
							<p className="text-xs font-semibold text-white/85">Best for teams</p>
							<p className="mt-1 flex items-center gap-2 text-sm text-white">
								<UserRound size={14} className="text-indigo-100" />
								2-10 members
							</p>
						</div>

						<div className="absolute left-0 top-[8.5rem] z-30 w-44 rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-md shadow-xl rotate-[3deg]">
							<p className="text-[11px] uppercase tracking-[0.12em] text-white/80">Student Mode</p>
							<p className="mt-1 text-sm font-semibold text-white">Track contribution fairly</p>
							<p className="mt-1 text-xs text-emerald-100">Know exactly where to focus</p>
						</div>

						<div className="absolute right-0 top-40 z-20 w-44 rounded-2xl border border-white/25 bg-slate-900/20 p-4 backdrop-blur-md shadow-xl -rotate-[4deg]">
							<p className="text-[11px] uppercase tracking-[0.12em] text-white/80">Supervisor Mode</p>
							<p className="mt-1 text-sm font-semibold text-white">Monitor project health</p>
							<p className="mt-1 text-xs text-indigo-100">Visibility without micromanaging</p>
						</div>

						<div className="absolute bottom-2 left-1/2 z-30 w-52 -translate-x-1/2 rounded-2xl border border-white/30 bg-slate-950/25 p-4 backdrop-blur-md shadow-2xl rotate-[1deg]">
							<p className="text-[11px] uppercase tracking-[0.14em] text-emerald-100">What You Unlock</p>
							<div className="mt-3 space-y-2 text-xs text-white">
								<div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2">
									<CheckCircle2 size={13} className="text-emerald-200" />
									Skill-aware task assignment
								</div>
								<div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2">
									<CheckCircle2 size={13} className="text-indigo-200" />
									Fairness tracking
								</div>
								<div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2">
									<CheckCircle2 size={13} className="text-emerald-200" />
									Milestone visibility
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUp;