import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, Menu, MoveUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const images = [
    { src: "/image/landing.jpeg", label: "Light-filled living" },
    { src: "/image/landing2.jpeg", label: "A place to settle" },
    { src: "/image/landing3.jpeg", label: "Room to breathe" },
];

const rotatingWords = ["your peace.", "your rhythm.", "your place."];

const ease = [0.22, 1, 0.36, 1];

const LandingPage = () => {
    const { isAuthenticated, user, isCheckingAuth } = useAuthStore();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [rotatingWordIndex, setRotatingWordIndex] = useState(0);

    useEffect(() => {
        const handleInstallPrompt = (event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            setIsInstallable(true);
        };
        const handleInstalled = () => setIsInstallable(false);

        window.addEventListener("beforeinstallprompt", handleInstallPrompt);
        window.addEventListener("appinstalled", handleInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setRotatingWordIndex((index) => (index + 1) % rotatingWords.length);
        }, 3600);
        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setCurrentImageIndex((index) => (index + 1) % images.length);
        }, 6500);
        return () => window.clearInterval(interval);
    }, []);

    const getDashboardUrl = () => {
        if (isCheckingAuth || !isAuthenticated || !user) return "/login";
        if (user.role === "landlord") return "/landlord/dashboard";
        if (user.role === "tenant") return "/tenant/dashboard";
        return "/login";
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    const moveImage = (direction) => {
        setCurrentImageIndex((index) => (index + direction + images.length) % images.length);
    };

    return (
        <main className="landing-page">
            <div className="landing-grain" aria-hidden="true" />
            <nav className="landing-nav" aria-label="Primary navigation">
                <Link to="/" className="landing-brand" aria-label="RentFlow home">
                    <img className="brand-mark" src="/brand-mark.svg" alt="" />
                    <span>RentFlow</span>
                </Link>
                <div className="landing-nav-links">
                    <a href="#how-it-works">How it works</a>
                    <a href="#for-everyone">For everyone</a>
                </div>
                <div className="landing-nav-actions">
                    {isAuthenticated ? (
                        <Link className="nav-login" to={getDashboardUrl()}>Dashboard</Link>
                    ) : (
                        <Link className="nav-login" to="/login">Sign in</Link>
                    )}
                    <Link className="nav-join" to="/signup">Join RentFlow <ArrowUpRight size={16} /></Link>
                    <button className="nav-menu" type="button" aria-expanded={isMenuOpen} aria-label={isMenuOpen ? "Close menu" : "Open menu"} onClick={() => setIsMenuOpen((isOpen) => !isOpen)}><Menu size={20} /></button>
                </div>
                {isMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How it works</a>
                        <a href="#for-everyone" onClick={() => setIsMenuOpen(false)}>For everyone</a>
                        <Link to={isAuthenticated ? getDashboardUrl() : "/login"} onClick={() => setIsMenuOpen(false)}>{isAuthenticated ? "Dashboard" : "Sign in"}</Link>
                    </div>
                )}
            </nav>

            <section className="landing-hero" aria-labelledby="hero-title">
                <div className="hero-copy">
                    <motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
                        A better way to live together
                    </motion.p>
                    <motion.h1 id="hero-title" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease }}>
                        Find your place.<br /><em className="hero-rotating-word"><AnimatePresence mode="wait" initial={false}><motion.span key={rotatingWords[rotatingWordIndex]} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.42, ease }}>{rotatingWords[rotatingWordIndex]}</motion.span></AnimatePresence></em>
                    </motion.h1>
                    <motion.p className="hero-description" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16, ease }}>
                        RentFlow brings homes, people, and the everyday details of renting into one calm, clear space.
                    </motion.p>
                    <motion.div className="hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.24, ease }}>
                        <Link className="primary-action" to={isAuthenticated ? getDashboardUrl() : "/browse-apartments"}>
                            {isAuthenticated ? "Open your dashboard" : "Start exploring"}<MoveUpRight size={18} />
                        </Link>
                        {isInstallable && (
                            <button className="secondary-action" type="button" onClick={handleInstallClick}>
                                <Download size={17} /> Install app
                            </button>
                        )}
                    </motion.div>
                    <div className="hero-note"><span className="live-dot" /> Designed for the way renting actually feels</div>
                </div>

                <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.12, ease }}>
                    <div className="image-frame">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={images[currentImageIndex].src}
                                src={images[currentImageIndex].src}
                                alt={images[currentImageIndex].label}
                                loading={currentImageIndex === 0 ? "eager" : "lazy"}
                                onError={(event) => {
                                    event.currentTarget.onerror = null;
                                    event.currentTarget.src = "/brand-mark.svg";
                                }}
                                initial={{ opacity: 0, scale: 1.04 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.75, ease }}
                            />
                        </AnimatePresence>
                        <div className="image-caption"><span>0{currentImageIndex + 1}</span><span>{images[currentImageIndex].label}</span></div>
                    </div>
                    <div className="image-controls">
                        <span>Homes that feel like yours</span>
                        <div className="carousel-buttons">
                            <button type="button" onClick={() => moveImage(-1)} aria-label="Previous image"><ChevronLeft size={18} /></button>
                            <button type="button" onClick={() => moveImage(1)} aria-label="Next image"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                </motion.div>
            </section>

            <section className="landing-strip" id="how-it-works">
                <div className="strip-intro"><span className="strip-number">01</span><p>Everything you need to make a place feel like home, without the noise.</p></div>
                <div className="strip-item" id="for-everyone"><span>For tenants</span><strong>Discover, apply, settle in.</strong><Link to="/signup" aria-label="Explore tenant tools"><ArrowUpRight size={18} /></Link></div>
                <div className="strip-item"><span>For landlords</span><strong>Manage the details that matter.</strong><Link to={isAuthenticated ? getDashboardUrl() : "/login"} aria-label="Open landlord tools"><ArrowUpRight size={18} /></Link></div>
            </section>
        </main>
    );
};

export default LandingPage;
