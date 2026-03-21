import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

type SignUpFormValues = {
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
	role: 'student' | 'supervisor';
};

type SignUpFormErrors = Partial<Record<keyof SignUpFormValues, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateSignUpForm = (values: SignUpFormValues): SignUpFormErrors => {
	const errors: SignUpFormErrors = {};

	if (!values.fullName.trim()) {
		errors.fullName = 'Full name is required.';
	}

	if (!values.email.trim()) {
		errors.email = 'Email is required.';
	} else if (!emailPattern.test(values.email)) {
		errors.email = 'Enter a valid email address.';
	}

	if (!values.password.trim()) {
		errors.password = 'Password is required.';
	}

	if (!values.confirmPassword.trim()) {
		errors.confirmPassword = 'Confirm password is required.';
	} else if (values.confirmPassword !== values.password) {
		errors.confirmPassword = 'Passwords do not match.';
	}

	return errors;
};

const SignUp: React.FC = () => {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [formValues, setFormValues] = useState<SignUpFormValues>({
		fullName: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [touchedFields, setTouchedFields] = useState<Record<keyof SignUpFormValues, boolean>>({
		fullName: false,
		email: false,
		password: false,
		confirmPassword: false,
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

	const handleSignUp = (e: React.FormEvent) => {
		e.preventDefault();

		const validationErrors = validateSignUpForm(formValues);
		setTouchedFields({
			fullName: true,
			email: true,
			password: true,
			confirmPassword: true,
		});
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		navigate('/dashboard');
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#f3f4f9] p-4 font-sans">
			
			<div className="relative flex w-full max-w-5xl overflow-hidden rounded-[40px] bg-white shadow-2xl min-h-[650px] flex-col md:flex-row-reverse">

				
				<div className="absolute left-0 top-0 h-full w-1/2 bg-[#7c3aed]">
					
					<div className="absolute inset-y-0 -right-20 w-40 rounded-l-[100px] bg-white" />
				</div>

				
				<div className="z-10 flex w-full flex-col justify-center p-12 md:w-1/2 lg:p-20">
					<div className="mb-12 flex items-center gap-2 text-[#7c3aed]">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-current shadow-lg shadow-purple-200">
							<span className="text-xl font-bold text-white">C</span>
						</div>
						<span className="text-xs font-bold uppercase tracking-widest text-slate-500">
							System logo
						</span>
					</div>

					<h1 className="text-4xl font-bold leading-tight text-slate-800">Create an account</h1>
					<p className="mb-10 text-sm text-slate-400">
						Already have an account?{' '}
						<Link
							to="/login"
							className="font-semibold text-[#7c3aed] transition-colors hover:text-[#6d28d9]"
						>
							Log in
						</Link>
					</p>

					<form className="space-y-5" onSubmit={handleSignUp} noValidate>
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
								className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 outline-none transition-all focus:ring-2 focus:ring-[#7c3aed]/20"
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
								className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 outline-none transition-all focus:ring-2 focus:ring-[#7c3aed]/20"
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
									placeholder="Create a password"
									required
									value={formValues.password}
									onChange={(e) => handleChange('password', e.target.value)}
									onBlur={() => handleBlur('password')}
									aria-invalid={Boolean(errors.password)}
									className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 pr-12 outline-none transition-all focus:ring-2 focus:ring-[#7c3aed]/20"
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
						</div>

						<div className="space-y-2">
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-semibold text-slate-700"
							>
								Confirm Password <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<input
									id="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="Confirm your password"
									required
									value={formValues.confirmPassword}
									onChange={(e) => handleChange('confirmPassword', e.target.value)}
									onBlur={() => handleBlur('confirmPassword')}
									aria-invalid={Boolean(errors.confirmPassword)}
									className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 pr-12 outline-none transition-all focus:ring-2 focus:ring-[#7c3aed]/20"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword((previous) => !previous)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
									aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
								>
									{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
							{errors.confirmPassword && touchedFields.confirmPassword && (
								<p className="text-sm text-red-500">{errors.confirmPassword}</p>
							)}
						</div>

						<button
							type="submit"
							className="mt-4 w-full rounded-2xl bg-[#7c3aed] py-4 text-base font-bold text-white shadow-xl shadow-purple-400/30 transition-all hover:brightness-110"
						>
							Sign up
						</button>
					</form>
				</div>

				
				<div className="relative z-10 hidden w-1/2 md:flex items-center justify-center p-12">
					<div className="w-full h-72 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 transform -rotate-3 shadow-2xl flex items-center justify-center p-6 text-center">
						<div className="space-y-2">
							<p className="text-lg font-bold text-white">AI Task Distribution</p>
							<p className="text-xs italic text-white/60">
								Fairly assigning tasks based on skills and learning goals.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUp;