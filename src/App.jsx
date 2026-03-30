import { useState } from 'react'
import './App.css'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="logo">
          <span className="logo-mark">P</span>
          <span className="logo-text">predelo</span>
        </a>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><a href="#product">Product</a></li>
          <li><a href="#solutions">Solutions</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>

        <a href="#demo" className="btn btn-primary nav-cta">
          Request a Demo
        </a>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />
      <div className="container hero-content">
        <div className="badge">AI-Powered Workforce Optimization</div>
        <h1 className="hero-heading">
          Predict. Optimize.<br />
          <span className="gradient-text">Automate.</span>
        </h1>
        <p className="hero-sub">
          Streamline your operations with Predelo's predictive automations.
          Accurate demand forecasting, intelligent scheduling, and real-time
          insights — all in one platform.
        </p>
        <div className="hero-actions">
          <a href="#demo" className="btn btn-primary btn-lg">Request a Demo</a>
          <a href="#product" className="btn btn-ghost btn-lg">See How It Works</a>
        </div>
        <div className="hero-social-proof">
          <div className="proof-item">
            <strong>700+</strong>
            <span>Locations served</span>
          </div>
          <div className="proof-divider" />
          <div className="proof-item">
            <strong>16,000+</strong>
            <span>Staff scheduled</span>
          </div>
          <div className="proof-divider" />
          <div className="proof-item">
            <strong>$1B+</strong>
            <span>Revenue managed</span>
          </div>
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    icon: '⚡',
    title: 'Data Integration',
    desc: 'Connect your existing systems and unify data across every location — no manual exports required.',
  },
  {
    icon: '📈',
    title: 'Demand Forecasting',
    desc: "Our engine factors in each location's unique demand drivers, delivering hyper-accurate hourly predictions.",
  },
  {
    icon: '🎯',
    title: 'Scenario Planning',
    desc: 'Model what-if scenarios in real time and compare outcomes before committing to a plan.',
  },
  {
    icon: '💰',
    title: 'Labor Budget Allocation',
    desc: 'Align headcount spend with forecasted demand — automatically, at every site and shift.',
  },
  {
    icon: '📅',
    title: 'Schedule Creation',
    desc: 'Auto-generate policy-aligned rosters that match labor to demand and keep staff happy.',
  },
  {
    icon: '📊',
    title: 'Performance Insights',
    desc: 'Track labor efficiency, forecast accuracy, and cost variance with live dashboards.',
  },
]

function Features() {
  return (
    <section className="features section" id="product">
      <div className="container">
        <div className="section-label">Platform</div>
        <h2 className="section-heading">
          Everything you need to run<br />a smarter operation
        </h2>
        <p className="section-sub">
          From raw data to optimized rosters — Predelo handles the entire
          operations workflow so your team can focus on what matters.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Connect your data',
      desc: 'Plug in your POS, HR, and operations systems. Predelo unifies everything into a single forecasting foundation.',
    },
    {
      num: '02',
      title: 'Predict demand',
      desc: "Predelo's multi-algorithm engine forecasts demand at the location level — by hour, by day, by season.",
    },
    {
      num: '03',
      title: 'Auto-optimize',
      desc: 'Forecasts are transformed into automated, policy-aligned schedules and budget allocations — instantly.',
    },
    {
      num: '04',
      title: 'Measure & improve',
      desc: 'Live dashboards close the loop, letting you refine models and improve performance over time.',
    },
  ]

  return (
    <section className="how-it-works section" id="solutions">
      <div className="container">
        <div className="section-label">How It Works</div>
        <h2 className="section-heading">From forecast to roster in minutes</h2>
        <div className="steps">
          {steps.map((s, i) => (
            <div className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <div className="step-body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
              {i < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SocialProof() {
  return (
    <section className="social-proof section">
      <div className="container">
        <div className="proof-card">
          <div className="quote-mark">"</div>
          <blockquote>
            Predelo's AI-first approach anchors our Auto-Scheduling, reducing
            administrative overhead, increasing accuracy of labor matching, and
            enhancing fairness through policy-aligned roster generation.
          </blockquote>
          <div className="proof-attribution">
            <div className="attribution-logo">Deputy</div>
            <div className="attribution-meta">
              <strong>Official Partnership</strong>
              <span>Enterprise Workforce Platform</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PWM() {
  return (
    <section className="pwm section" id="solutions">
      <div className="container pwm-inner">
        <div className="pwm-text">
          <div className="section-label">Featured Solution</div>
          <h2 className="section-heading">
            Predictive Workforce<br />Management
          </h2>
          <p className="section-sub">
            Purpose-built for multi-location operators. Predelo takes your
            historical demand data, learns the patterns unique to each site,
            and generates optimized rosters — automatically, at scale.
          </p>
          <ul className="pwm-list">
            <li>Hourly demand prediction per location</li>
            <li>Auto-scheduling aligned to labor policies</li>
            <li>Real-time variance tracking vs forecast</li>
            <li>Integrates directly with scheduling platforms</li>
          </ul>
          <a href="#demo" className="btn btn-primary">Get Started</a>
        </div>
        <div className="pwm-visual">
          <div className="dashboard-mock">
            <div className="mock-header">
              <span className="mock-dot red" />
              <span className="mock-dot yellow" />
              <span className="mock-dot green" />
              <span className="mock-title">Workforce Dashboard</span>
            </div>
            <div className="mock-body">
              <div className="mock-stat">
                <span className="mock-stat-label">Forecast Accuracy</span>
                <span className="mock-stat-value">94.2%</span>
                <div className="mock-bar">
                  <div className="mock-bar-fill" style={{ width: '94%' }} />
                </div>
              </div>
              <div className="mock-stat">
                <span className="mock-stat-label">Schedule Compliance</span>
                <span className="mock-stat-value">97.8%</span>
                <div className="mock-bar">
                  <div className="mock-bar-fill" style={{ width: '98%' }} />
                </div>
              </div>
              <div className="mock-stat">
                <span className="mock-stat-label">Labor Cost Variance</span>
                <span className="mock-stat-value">−3.1%</span>
                <div className="mock-bar">
                  <div className="mock-bar-fill green" style={{ width: '30%' }} />
                </div>
              </div>
              <div className="mock-chart">
                {[40, 65, 50, 80, 70, 90, 75, 95, 85, 100, 88, 92].map((h, i) => (
                  <div
                    key={i}
                    className="mock-bar-col"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="about section" id="about">
      <div className="container about-inner">
        <div className="about-text">
          <div className="section-label">Our Mission</div>
          <h2 className="section-heading">
            Making the future<br />accessible to all
          </h2>
          <p className="section-sub">
            We're an AI SaaS startup on a mission to empower businesses with
            next-gen predictive and optimization capabilities. Predelo doesn't
            just forecast — it transforms predictions into automated,
            highly optimized actions.
          </p>
          <p className="section-sub">
            Founded in Sydney, Australia and backed by Jelix Ventures and
            Flying Fox Ventures, we're building the prediction machine that
            puts every operator on a level playing field.
          </p>
          <a href="#about-page" className="btn btn-outline">Meet the Team</a>
        </div>
        <div className="about-stats">
          <div className="about-stat-card">
            <span className="about-stat-num">2022</span>
            <span className="about-stat-label">Founded in Sydney, AU</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-num">VC</span>
            <span className="about-stat-label">Backed by Jelix & Flying Fox Ventures</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-num">AI</span>
            <span className="about-stat-label">Context-agnostic optimization engine</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-num">∞</span>
            <span className="about-stat-label">Scales to any industry, any size</span>
          </div>
        </div>
      </div>
    </section>
  )
}

const faqs = [
  {
    q: 'What industries does Predelo serve?',
    a: 'Predelo is context-agnostic and works across hospitality, retail, healthcare, logistics, and any industry with recurring workforce scheduling needs.',
  },
  {
    q: 'How does Predelo integrate with my existing tools?',
    a: 'Predelo connects with your POS, HRIS, and scheduling platforms via API. We support integrations with Deputy and other major workforce management tools.',
  },
  {
    q: 'How accurate is the demand forecasting?',
    a: "Our multi-algorithm engine consistently delivers 90%+ forecast accuracy by learning the unique demand patterns for each of your locations individually.",
  },
  {
    q: 'How long does it take to get started?',
    a: 'Most customers are live within weeks. Our team handles the integration setup and model training — you focus on running your operations.',
  },
]

function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section className="faq section" id="faq">
      <div className="container faq-inner">
        <div className="section-label">FAQ</div>
        <h2 className="section-heading">Common questions</h2>
        <div className="faq-list">
          {faqs.map((item, i) => (
            <div
              key={i}
              className={`faq-item ${open === i ? 'open' : ''}`}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="faq-question">
                <span>{item.q}</span>
                <span className="faq-chevron">{open === i ? '−' : '+'}</span>
              </div>
              {open === i && <div className="faq-answer">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="cta-section section" id="demo">
      <div className="container">
        <div className="cta-card">
          <div className="cta-glow" />
          <div className="section-label light">Get Started</div>
          <h2 className="cta-heading">
            Ready to optimize your operations?
          </h2>
          <p className="cta-sub">
            See Predelo in action. Our team will walk you through a
            personalized demo tailored to your business.
          </p>
          <a href="https://www.predelo.com/request-a-demo" className="btn btn-primary btn-lg">
            Request a Demo
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <a href="/" className="logo">
            <span className="logo-mark">P</span>
            <span className="logo-text">predelo</span>
          </a>
          <p>Making the future accessible to all.</p>
          <p className="footer-location">Sydney, Australia</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#product">Features</a></li>
              <li><a href="#solutions">Predictive Workforce</a></li>
              <li><a href="#solutions">Automation</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#demo">Request a Demo</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="https://www.predelo.com/privacy-policy">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© {new Date().getFullYear()} Predelo. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="site">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <SocialProof />
      <PWM />
      <About />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
