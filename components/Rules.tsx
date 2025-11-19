
import React from 'react';

interface RulesProps {
  onBack: () => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode; icon: React.ReactNode }> = ({ children, icon }) => (
  <h3 className="text-xl md:text-2xl font-bold text-dark-navy mb-4 flex items-center gap-3 border-b border-gray-200 pb-2">
    <span className="text-solar-orange">{icon}</span>
    {children}
  </h3>
);

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-2 mb-2 text-gray-700">
    <span className="mt-1.5 w-1.5 h-1.5 bg-solar-pink rounded-full flex-shrink-0"></span>
    <span>{children}</span>
  </li>
);

const Rules: React.FC<RulesProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 z-[200] relative font-sans">
      {/* Header */}
      <header className="bg-gradient-solar text-white py-8 px-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="font-display text-2xl md:text-4xl tracking-wide drop-shadow-md">Regulamento do Evento</h1>
          <button 
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold flex items-center gap-2 backdrop-blur-sm border border-white/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Voltar
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 pb-20 space-y-8">
        
        {/* Intro */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-solar-yellow">
          <p className="text-lg text-gray-800 leading-relaxed">
            A <strong>Tardezinha da Space</strong> é o nosso evento oficial de encerramento do ano, com música, piscina, churrasco e atividades ao ar livre, além da cerimônia do Space Awards 2025. Abaixo estão as regras e informações essenciais para garantir a diversão de todos.
          </p>
        </div>

        {/* Grid for sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Data e Local */}
          <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col h-full">
            <SectionTitle icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            }>
              Data e Local
            </SectionTitle>
            <ul className="space-y-3 mb-4">
              <li className="flex flex-col">
                <span className="font-bold text-gray-900">Data:</span>
                <span className="text-gray-700">21 de Dezembro de 2025 (Domingo)</span>
              </li>
              <li className="flex flex-col">
                 <span className="font-bold text-gray-900">Local:</span>
                 <span className="text-gray-700">Sitio do Barba</span>
                 <span className="text-sm text-gray-500">Estrada Bom Jesus da Santa Capela, Estr. Capuavinha, 1049-1143 – Mairiporã/SP</span>
              </li>
            </ul>
            <div className="mt-auto rounded-lg overflow-hidden h-48 border border-gray-200 shadow-inner">
               <iframe
                 width="100%"
                 height="100%"
                 frameBorder="0"
                 style={{ border: 0 }}
                 src="https://maps.google.com/maps?q=Estrada+Bom+Jesus+da+Santa+Capela,+1049-1143+-+Mairipora+SP&t=&z=14&ie=UTF8&iwloc=&output=embed"
                 allowFullScreen
                 title="Mapa do local do evento"
               ></iframe>
            </div>
          </div>

          {/* Transporte */}
          <div className="bg-white p-6 rounded-xl shadow-sm h-full">
            <SectionTitle icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            }>
              Transporte Oficial
            </SectionTitle>
            <p className="text-sm text-gray-600 mb-4">Teremos 2 ônibus com 46 lugares cada, contratados exclusivamente.</p>
            <ul className="space-y-2">
               <li className="font-semibold text-solar-purple">Ponto de encontro: Rua Antônio Napolli, 229</li>
               <ListItem>Ônibus disponível: 08h30</ListItem>
               <ListItem><strong>Saída: 09h00</strong> (tolerância até 09h30)</ListItem>
               <ListItem>Retorno: 17h00</ListItem>
               <ListItem>Valor: R$ 64,19 à vista ou parcelado conforme taxas da plataforma</ListItem>
               <ListItem>Crianças até 5 anos: podem ir no colo</ListItem>
               <li className="mt-2 text-sm text-red-500 font-semibold border-t border-gray-100 pt-2">
                 ⚠️ Embarque somente para quem estiver na lista (nome + documento).
               </li>
            </ul>
          </div>
        </div>

        {/* Alimentação */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
           <SectionTitle icon={
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
           }>
             Alimentação e Bebidas
           </SectionTitle>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-solar-orange mb-2">Churrasco</h4>
                <ul className="text-gray-700 text-sm space-y-1 mb-4">
                  <li>Contra filé</li>
                  <li>Frango</li>
                  <li>Linguiça</li>
                  <li>Coração</li>
                  <li>Pão de alho</li>
                </ul>
                
                <h4 className="font-bold text-solar-orange mb-2">Bebidas</h4>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>Coca-Cola</li>
                  <li>Guaraná Antártica</li>
                  <li>Soda Antártica</li>
                  <li>Água mineral</li>
                  <li>+ Open Chopp</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-solar-orange mb-2">Guarnições e Entradas</h4>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>Arroz branco</li>
                  <li>Vinagrete</li>
                  <li>Farofa temperada</li>
                  <li>Alface</li>
                  <li>Salada de maionese</li>
                  <li>Salgadinhos sortidos fritos</li>
                </ul>
              </div>
           </div>
        </div>

        {/* Regras e Vestimenta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Regras Gerais */}
           <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-red-400">
              <SectionTitle icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              }>
                Regras de Convivência e Bebida
              </SectionTitle>
              <ul className="space-y-3">
                 <ListItem>Permitido consumir <strong>somente bebidas fornecidas no evento</strong>.</ListItem>
                 <ListItem><span className="text-red-600 font-bold">Proibido</span> levar bebidas alcoólicas de fora.</ListItem>
                 <ListItem><span className="text-red-600 font-bold">Proibido</span> uso de narguilé.</ListItem>
                 <ListItem>Evitar brincadeiras constrangedoras.</ListItem>
                 <ListItem>Manter o espaço limpo e cuidar dos pertences pessoais.</ListItem>
                 <li className="bg-red-50 p-3 rounded-lg text-sm text-red-700 mt-2">
                   Em caso de excesso, o colaborador poderá ser orientado a se retirar.
                 </li>
              </ul>
           </div>

           {/* Piscina e Vestimenta */}
           <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-400">
              <SectionTitle icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              }>
                Vestimenta e Piscina
              </SectionTitle>
              <ul className="space-y-3">
                 <ListItem>Traje confortável e adequado ao ambiente.</ListItem>
                 <ListItem>Piscina liberada com roupas apropriadas (maiô, biquíni, sunga, shorts, camiseta UV).</ListItem>
                 <ListItem><span className="text-red-600 font-bold">Proibido</span> uso de roupa íntima ou peças transparentes na piscina.</ListItem>
                 <ListItem><span className="text-red-600 font-bold">Proibido</span> correr ou empurrar na área da piscina.</ListItem>
                 <li className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 mt-2">
                   <strong>Atenção:</strong> Crianças devem estar sempre acompanhadas dos responsáveis.
                 </li>
              </ul>
           </div>
        </div>

        <div className="text-center pt-8">
          <button 
            onClick={onBack}
            className="bg-dark-navy hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            Voltar para o site
          </button>
        </div>

      </div>
    </div>
  );
};

export default Rules;
