
import React from 'react';

interface FooterProps {
  onAdminClick: () => void;
  onOpenRules: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick, onOpenRules }) => {
  const address = "Estrada Bom Jesus da Santa Capela, 1049-1143, Estr. Capuavinha - Mairiporã/SP, CEP: 07600-003";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent("Estrada Bom Jesus da Santa Capela, 1049-1143 - Mairiporã/SP")}`;

  return (
    <footer id="contact" className="bg-dark-navy text-gray-300 py-16 px-4 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Column 1: About */}
        <div className="lg:col-span-2">
          <img 
            src="https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/tardezinhadaSpace_logo.png" 
            alt="Tardezinha da Space" 
            className="h-16 w-auto mb-6"
          />
          <p className="text-gray-400 mb-4 max-w-md">
            Muito mais que um evento: é o nosso orgulho em festa, brindando à união, às vitórias e ao time que faz tudo acontecer.
          </p>
           <div className="mb-4">
             <p className="text-gray-400">
               <span className="font-bold text-solar-orange">21 de Dezembro de 2025</span> <br/> Sábado • 14:00h
             </p>
             <button 
               type="button"
               onClick={onOpenRules} 
               className="mt-2 text-sm text-gray-400 hover:text-white transition-colors underline flex items-center group"
             >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:text-solar-orange transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 Ler Regulamento do Evento
             </button>
           </div>
        </div>

        {/* Column 2: Contact & Location */}
        <div>
          <h4 className="font-bold text-xl text-white mb-4">Contato e Local</h4>
          <ul className="space-y-4 text-gray-400">
            <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 text-solar-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <div>
                    <span className="font-semibold">Para dúvidas:</span><br/>
                    <a href="mailto:rh@spacenetwork.com.br" className="hover:text-solar-orange transition-colors">rh@spacenetwork.com.br</a>
                </div>
            </li>
            <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-1 text-solar-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 <div>
                    <span className="font-semibold">Local:</span><br/>
                    Estrada Bom Jesus da Santa Capela, 1049-1143<br />
                    Estr. Capuavinha - Mairiporã/SP<br />
                    CEP: 07600-003
                    <div className="flex flex-wrap gap-2 mt-3">
                        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors">
                            Google Maps
                        </a>
                        <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors">
                            Waze
                        </a>
                    </div>
                </div>
            </li>
          </ul>
        </div>

        {/* Column 3: Social */}
        <div>
          <h4 className="font-bold text-xl text-white mb-4">Redes Sociais</h4>
          <div className="flex space-x-3">
              <a href="https://www.facebook.com/vocespace" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a>
              <a href="https://www.instagram.com/vocespace" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-pink-600 hover:bg-pink-700 flex items-center justify-center text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"></path></svg></a>
          </div>
        </div>
      </div>
      
      <hr className="mt-12 border-gray-700" />

      <div className="max-w-7xl mx-auto mt-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
        <p className="text-sm text-gray-500 mb-4 md:mb-0">© {new Date().getFullYear()} Space Network. Todos os direitos reservados.</p>
        <button
          onClick={onAdminClick}
          aria-label="Admin Login" 
          className="text-gray-500 hover:text-solar-orange transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
