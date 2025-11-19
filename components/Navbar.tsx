
import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { href: '#home', label: 'Início' },
    { href: '#details', label: 'O Evento' },
    { href: '#gallery', label: 'Fotos' },
    { href: '#faq', label: 'Dúvidas' },
    { href: '#contact', label: 'Contato' },
    { href: '#checkin', label: 'Confirme sua presença', isButton: true },
  ];

  const navClass = isScrolled 
    ? 'bg-gradient-nav shadow-lg' 
    : 'bg-transparent';

  const linkClasses = "text-white hover:text-solar-yellow transition duration-300 font-semibold uppercase tracking-wider text-sm cursor-pointer";
  
  // Manual smooth scroll function to guarantee navigation works perfectly
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      const navbarHeight = 80; // Height of the fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      setIsOpen(false); // Close mobile menu if open
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a 
                href="#home" 
                onClick={(e) => handleScrollTo(e, '#home')}
                className="cursor-pointer block"
              >
                <img 
                    src="https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/tardezinhadaSpace_logo.png" 
                    alt="Tardezinha da Space" 
                    className="h-16 w-auto"
                />
              </a>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4 lg:space-x-6">
                {navLinks.map(link => {
                  if (link.isButton) {
                    return (
                      <a 
                        key={link.href} 
                        href={link.href} 
                        onClick={(e) => handleScrollTo(e, link.href)}
                        className="bg-solar-pink hover:bg-solar-orange text-white font-bold py-2 px-5 rounded-full transition duration-300 transform hover:scale-105 shadow-md text-sm uppercase tracking-wider cursor-pointer"
                      >
                          {link.label}
                      </a>
                    );
                  }
                  return (
                      <a 
                          key={link.href} 
                          href={link.href} 
                          onClick={(e) => handleScrollTo(e, link.href)}
                          className={linkClasses}
                      >
                          {link.label}
                      </a>
                  );
                })}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-solar-yellow focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

       {/* Mobile Menu */}
      <div className={`fixed top-0 left-0 w-full h-screen bg-gradient-nav z-40 transform ${isOpen ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300 ease-in-out md:hidden`} id="mobile-menu">
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            {navLinks.map(link => {
              if (link.isButton) {
                return (
                  <a 
                    key={link.href} 
                    href={link.href} 
                    onClick={(e) => handleScrollTo(e, link.href)} 
                    className="bg-solar-pink hover:bg-solar-orange text-white font-bold py-4 px-8 my-2 rounded-full transition duration-300 transform hover:scale-105 shadow-md text-lg uppercase cursor-pointer"
                  >
                      {link.label}
                  </a>
                )
              }
              return (
                <a 
                    key={link.href} 
                    href={link.href} 
                    onClick={(e) => handleScrollTo(e, link.href)} 
                    className="block text-white text-2xl font-bold py-2 cursor-pointer"
                >
                    {link.label}
                </a>
              )
            })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
