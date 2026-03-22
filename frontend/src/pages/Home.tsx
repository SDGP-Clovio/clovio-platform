import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Menu,
  MessageCircleMore,
  ShieldAlert,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import ClovioMark from '../components/common/ClovioMark';

type FeatureCard = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type WorkflowStep = {
  title: string;
  description: string;
};

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const featureCards: FeatureCard[] = [
  {
    title: 'AI Task Distribution',
    description:
      'Match tasks to each member\'s strengths so work is balanced and progress stays steady.',
    icon: BrainCircuit,
  },
  {
    title: 'Progress Prediction',
    description:
      'See delay risk early and adjust your sprint before deadlines become a problem.',
    icon: BarChart3,
  },
  {
    title: 'Bus Factor Alerts',
    description:
      'Catch critical single-owner tasks before they become project bottlenecks.',
    icon: ShieldAlert,
  },
  {
    title: 'Smart Scheduling',
    description:
      'Coordinate meetings faster with availability-aware scheduling for student teams.',
    icon: CalendarClock,
  },
  {
    title: 'Fairness Tracking',
    description:
      'Keep contribution levels visible with fairness scoring and team health metrics.',
    icon: Users,
  },
  {
    title: 'Team Chat',
    description:
      'Keep project communication in one place with context right next to your tasks.',
    icon: MessageCircleMore,
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    title: 'Create Your Project Workspace',
    description:
      'Set milestones, invite members, and define what success looks like for your team.',
  },
  {
    title: 'Map Skills and Assign with AI',
    description:
      'Clovio recommends ownership based on proficiency and current workload.',
  },
  {
    title: 'Track Health in Real Time',
    description:
      'Monitor milestone progress, fairness, and risk signals from a single dashboard.',
  },
  {
    title: 'Deliver with Confidence',
    description:
      'Finish with fewer surprises, cleaner collaboration, and stronger outcomes.',
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      'Clovio ended the weekly argument over who does what. Task ownership finally felt fair.',
    name: 'Alex Johnson',
    role: 'Computer Science Student',
  },
  {
    quote:
      'The delay prediction warned us before our deadline crunch. We rebalanced and still hit our target.',
    name: 'Taylor Smith',
    role: 'Business Analytics Student',
  },
  {
    quote:
      'Meetings, tasks, progress and alerts all in one place. It made our capstone way less chaotic.',
    name: 'Jordan Lee',
    role: 'Software Engineering Student',
  },
];

const taskPreview = [
  { title: 'API Endpoints', owner: 'Alex (Expert)', status: 'done' as const },
  { title: 'Literature Review', owner: 'Taylor (Expert)', status: 'active' as const },
  { title: 'Dashboard UX', owner: 'Jordan (Intermediate)', status: 'todo' as const },
];

const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setHasScrolled(window.scrollY > 18);
    };

    onScroll();
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 [font-family:'Poppins',Segoe_UI,sans-serif]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute right-0 top-0 h-[24rem] w-[24rem] rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
      </div>

      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          hasScrolled
            ? 'border-b border-slate-200 bg-slate-50/95 py-3 shadow-sm backdrop-blur'
            : 'bg-slate-50/80 py-5 backdrop-blur'
        }`}
      >
        <div className="mx-auto flex w-[92%] max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-emerald-500 text-lg font-bold text-white shadow-lg shadow-indigo-300/40">
              <ClovioMark className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900">Clovio</span>
              <span className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Academic Collaboration
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-700 transition hover:text-indigo-600">
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-700 transition hover:text-indigo-600"
            >
              How It Works
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-slate-700 transition hover:text-indigo-600"
            >
              Testimonials
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200 transition hover:brightness-110"
            >
              Get Started Free
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            className="inline-flex rounded-xl border border-slate-300 p-2 text-slate-700 md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mx-auto mt-3 w-[92%] max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl md:hidden">
            <div className="flex flex-col gap-3">
              <a
                href="#features"
                className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                onClick={closeMobileMenu}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                onClick={closeMobileMenu}
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                onClick={closeMobileMenu}
              >
                Testimonials
              </a>
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="rounded-lg border border-slate-300 px-3 py-2 text-center font-semibold text-slate-700"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={closeMobileMenu}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-500 px-3 py-2 text-center font-semibold text-white"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-[92%] max-w-7xl pt-28">
        <section className="grid scroll-mt-28 gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
              Free AI-Powered Academic Collaboration
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
              Transform Group Projects with{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
                AI Intelligence
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              Clovio removes project chaos with smarter task assignment, fairness visibility, and actionable
              progress signals for students and supervisors.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-300/30 transition hover:brightness-110"
              >
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-indigo-600">2,500+</p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Students Empowered</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-emerald-600">98%</p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Success Rate</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-2xl font-bold text-indigo-600">4.9/5</p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/40">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">AI Task Distribution</h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Live Preview
              </span>
            </div>

            <div className="space-y-3">
              {taskPreview.map((task) => (
                <div
                  key={task.title}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <UserRound size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">Assigned to: {task.owner}</p>
                  </div>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      task.status === 'done'
                        ? 'bg-emerald-500'
                        : task.status === 'active'
                          ? 'bg-amber-400'
                          : 'bg-indigo-500'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>Project Completion Forecast</span>
                <span className="text-emerald-600">+5 days ahead</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
                  Fairness score: <strong>88%</strong>
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  Bus factor risk: <strong>Low</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-28 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Smart Features for Smarter Collaboration
            </h2>
            <p className="mt-4 text-slate-600">
              Built for real student project workflows with clear accountability and practical automation.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-emerald-100 text-indigo-700">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-28 py-16">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 md:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">How Clovio Works</h2>
              <p className="mt-4 text-slate-600">
                From setup to submission, your team gets clear direction at every stage.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {workflowSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="scroll-mt-28 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">What Students Are Saying</h2>
            <p className="mt-4 text-slate-600">Teams using Clovio report calmer workflows and better outcomes.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm leading-relaxed text-slate-700">"{item.quote}"</p>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="rounded-[2.2rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 px-7 py-12 text-center text-white shadow-2xl shadow-indigo-300/40 md:px-12">
            <h2 className="text-3xl font-bold md:text-4xl">Ready to Revolutionize Your Group Projects?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-indigo-50 md:text-base">
              Join thousands of students and make collaboration fair, predictable, and actually enjoyable.
            </p>
            <div className="mt-7">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold uppercase tracking-[0.1em] text-slate-900 transition hover:scale-[1.02]"
              >
                Get Started Free
                <CheckCircle2 size={16} />
              </Link>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-indigo-100">
              No credit card required. Forever free for students.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-[92%] max-w-7xl gap-8 py-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Clovio</h3>
            <p className="mt-3 max-w-xs text-sm text-slate-600">
              Free AI-powered academic collaboration for project teams and supervisors.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Product</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
              <a href="#features" className="transition hover:text-indigo-600">Features</a>
              <a href="#how-it-works" className="transition hover:text-indigo-600">How it Works</a>
              <a href="#testimonials" className="transition hover:text-indigo-600">Testimonials</a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Access</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
              <Link to="/login" className="transition hover:text-indigo-600">Log in</Link>
              <Link to="/signup" className="transition hover:text-indigo-600">Create account</Link>
              <Link to="/dashboard" className="transition hover:text-indigo-600">View dashboard</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Support</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-700">
              <span>Help Center</span>
              <span>Contact</span>
              <span>FAQ</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Clovio. Built for students by students.
        </div>
      </footer>
    </div>
  );
};

export default Home;