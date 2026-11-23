import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom';
import './Home.css';

const Home = (props) => {
	const [Isuser, setIsuser] = useState("0")

	const checkForUser = async () => {
		try {
			const res = await fetch('/checkforUser', {
				method: "GET",
				headers: {
					Accept: 'application/json',
					"Content-Type": "application/json"
				},
				credentials: "include"
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Unable to check your sign-in status");
			}
			setIsuser(data.isuser);
		} catch (error) {
			console.error(error);
		}
	}

	useEffect(() => {
		checkForUser();
	}, [])

	useEffect(() => {
		if (props.isLogout === "1") {
			window.location.reload();
		}
	}, [props.isLogout])

	return (
		<main className="home-page">
			<nav className="navbar navbar-expand-lg navbar-dark fixed-top home-navbar">
				<div className="container">
					<NavLink exact to="/" className="navbar-brand home-brand">LiveCodeX<span>.</span></NavLink>
					<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#homeNavigation" aria-controls="homeNavigation" aria-expanded="false" aria-label="Toggle navigation">
						<span className="navbar-toggler-icon"></span>
					</button>
					<div className="collapse navbar-collapse" id="homeNavigation">
						<ul className="navbar-nav ml-auto align-items-lg-center">
							<li className="nav-item"><a className="nav-link" href="#features">Features</a></li>
							<li className="nav-item"><a className="nav-link" href="#workflow">How it works</a></li>
							<li className="nav-item"><a className="nav-link" href="#about">About</a></li>
							{Isuser === '0' ? (
								<>
									<li className="nav-item"><NavLink className="nav-link" to="/login">Sign in</NavLink></li>
									<li className="nav-item ml-lg-2"><Link className="home-nav-cta" to="/signup">Create account</Link></li>
								</>
							) : (
								<>
									<li className="nav-item"><NavLink className="nav-link" to="/rooms">Rooms</NavLink></li>
									<li className="nav-item ml-lg-2"><NavLink className="home-nav-cta" to="/logout">Sign out</NavLink></li>
								</>
							)}
						</ul>
					</div>
				</div>
			</nav>

			<header className="home-hero">
				<div className="container home-hero-content">
					<div className="home-hero-copy">
						<span className="home-eyebrow"><span className="home-status-dot"></span> A better way to build together</span>
						<h1>CODE <span>&</span><br />DISCUSS<span className="home-title-dot">.</span></h1>
						<p>Bring your ideas and your team into one shared coding space. Write code together, talk through the tricky parts, and see every change as it happens.</p>
						<div className="home-hero-actions">
							{Isuser === '0' ? (
								<>
									<Link to="/signup" className="home-button home-button-primary">Get started <span aria-hidden="true">→</span></Link>
									<Link to="/login" className="home-button home-button-quiet">I already have an account</Link>
								</>
							) : (
								<Link to="/rooms" className="home-button home-button-primary">Open your workspace <span aria-hidden="true">→</span></Link>
							)}
						</div>
						<div className="home-hero-note"><span>●</span> Real-time collaboration, without the back-and-forth</div>
					</div>
					<div className="home-hero-visual" aria-hidden="true">
						<div className="home-code-window">
							<div className="home-window-bar"><i></i><i></i><i></i><span>collaboration.js</span></div>
							<div className="home-code-lines">
								<div><b>01</b><span><em>const</em> idea = <strong>"great work"</strong>;</span></div>
								<div><b>02</b><span><em>const</em> team = <strong>["you", "me"]</strong>;</span></div>
								<div><b>03</b><span></span></div>
								<div><b>04</b><span><em>await</em> team.<u>buildTogether</u>(idea);</span></div>
								<div><b>05</b><span className="home-cursor-line">▍</span></div>
							</div>
							<div className="home-collab-badge"><span>AK</span><span>JS</span><small>2 people in this room</small></div>
						</div>
						<div className="home-orbit home-orbit-one"></div>
						<div className="home-orbit home-orbit-two"></div>
					</div>
				</div>
				<a className="home-scroll-cue" href="#features"><span></span> Scroll to explore</a>
			</header>

			<section className="home-section home-features" id="features">
				<div className="container">
					<div className="home-section-heading">
						<span className="home-eyebrow home-eyebrow-dark">Everything in sync</span>
						<h2>Less switching.<br /><span>More creating.</span></h2>
						<p>All the essentials for a focused pair-programming session, together in one thoughtfully simple workspace.</p>
					</div>
					<div className="home-feature-grid">
						<article className="home-feature-card">
							<div className="home-feature-icon home-icon-blue">&lt;/&gt;</div>
							<h3>One shared editor</h3>
							<p>See code changes instantly and work through a problem in the same live workspace.</p>
							<span className="home-card-index">01</span>
						</article>
						<article className="home-feature-card">
							<div className="home-feature-icon home-icon-violet">↗</div>
							<h3>Talk it through</h3>
							<p>Keep conversation beside your code so ideas, questions, and decisions stay connected.</p>
							<span className="home-card-index">02</span>
						</article>
						<article className="home-feature-card">
							<div className="home-feature-icon home-icon-green">▶</div>
							<h3>Try ideas quickly</h3>
							<p>Run your code in the room and review the output together as you iterate.</p>
							<span className="home-card-index">03</span>
						</article>
					</div>
				</div>
			</section>

			<section className="home-section home-workflow" id="workflow">
				<div className="container">
					<div className="home-workflow-heading">
						<div>
							<span className="home-eyebrow">Good work happens together</span>
							<h2>From first line<br />to <span>finished idea.</span></h2>
						</div>
						<p>Start a room in seconds. Invite someone in. Then stay in the flow while you solve the problem together.</p>
					</div>
					<div className="home-steps">
						<article className="home-step"><span>01</span><div><h3>Create a room</h3><p>Open a private coding space whenever an idea is ready to take shape.</p></div></article>
						<article className="home-step"><span>02</span><div><h3>Share the code</h3><p>Send your room code to a teammate so they can join your session.</p></div></article>
						<article className="home-step"><span>03</span><div><h3>Build in real time</h3><p>Edit, chat, and run code together—with everyone on the same page.</p></div></article>
					</div>
					<div className="home-workflow-footer"><span>One room. Two perspectives. Better solutions.</span><span className="home-workflow-line"></span></div>
				</div>
			</section>

			<section className="home-section home-about" id="about">
				<div className="container home-about-layout">
					<div className="home-about-art" aria-hidden="true">
						<div className="home-about-card">
							<div className="home-about-card-top"><span></span><span></span><span></span><b>your-workspace</b></div>
							<div className="home-about-card-body">
								<div className="home-mini-sidebar"><i></i><i></i><i></i><i></i></div>
								<div className="home-mini-editor"><b>function</b> solveTogether(problem) {'{'}<br /><i> &nbsp; // good ideas get better</i><br /> &nbsp; return team + focus;<br />{'}'}<div className="home-mini-chat"><span>AK</span><span>Nice, let's try it.</span></div></div>
							</div>
						</div>
						<div className="home-floating-chip"><span>✦</span> Made for the flow state</div>
					</div>
					<div className="home-about-copy">
						<span className="home-eyebrow home-eyebrow-dark">A workspace for shared thinking</span>
						<h2>Great code is a <span>team sport.</span></h2>
						<p>LiveCodeX makes it easier to learn from each other, move through bugs, and turn a blank editor into something real. No long setup, no lost context—just a room for your team to think out loud and build.</p>
						<ul>
							<li><span>✓</span> Keep code and conversation side by side</li>
							<li><span>✓</span> Choose the language that fits your project</li>
							<li><span>✓</span> Share a room and pick up where you left off</li>
						</ul>
						<Link to={Isuser === '0' ? "/signup" : "/rooms"} className="home-text-link">Make something together <span>→</span></Link>
					</div>
				</div>
			</section>

			<section className="home-section home-cta">
				<div className="container home-cta-inner">
					<span className="home-eyebrow">Your next great idea starts here</span>
					<h2>Ready to code<br />in good company?</h2>
					<p>Start a room, bring your people, and see what you can make together.</p>
					<Link to={Isuser === '0' ? "/signup" : "/rooms"} className="home-button home-button-primary">{Isuser === '0' ? "Create your free account" : "Go to your rooms"} <span aria-hidden="true">→</span></Link>
				</div>
				<footer className="home-footer"><div className="container"><span className="home-brand">LiveCodeX<span>.</span></span><span>Think together. Build better.</span><a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Back to top ↑</a></div></footer>
			</section>
		</main>
	)
}

export default Home
