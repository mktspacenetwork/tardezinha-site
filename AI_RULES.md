# Regras de Desenvolvimento e Stack Tecnológico

Este documento serve como guia para o desenvolvimento e manutenção do projeto "Tardezinha da Space". Ele detalha a pilha de tecnologia atual e estabelece regras claras sobre o uso de bibliotecas para garantir a consistência e a qualidade do código.

## 1. Stack Tecnológico

O projeto é construído com foco em performance, responsividade e simplicidade, utilizando a seguinte pilha:

*   **Frontend:** React 19.2.0 (via Vite).
*   **Linguagem:** TypeScript 5.8.2.
*   **Estilização:** Tailwind CSS (via CDN) para todos os aspectos de design e responsividade (abordagem mobile-first).
*   **Backend & Database:** Supabase (PostgreSQL) para armazenamento de dados (confirmações, colaboradores, etc.).
*   **Interação com Banco de Dados:** Uso do `@supabase/supabase-js` para operações CRUD e funções RPC (Remote Procedure Call) para transações atômicas complexas.
*   **Gerenciamento de Estado:** Uso exclusivo de hooks nativos do React (`useState`, `useEffect`, `useContext`). O `WizardContext` é o principal mecanismo de estado global.
*   **Navegação:** O roteamento é baseado em âncoras (`#section`) e gerenciamento de estado de componentes (e.g., `useState` para alternar entre Admin/Site/Wizard). Não utilizamos React Router.
*   **Ícones:** Utilização de ícones SVG inline ou, preferencialmente, da biblioteca `lucide-react` (se instalada).

## 2. Regras de Uso de Bibliotecas e Componentes

Para manter a consistência do projeto, siga estas regras:

| Propósito | Biblioteca/Tecnologia Obrigatória | Regras de Uso |
| :--- | :--- | :--- |
| **Estilização** | Tailwind CSS | **Obrigatório** usar classes Tailwind para todo o layout, cores, tipografia e responsividade. Evitar estilos inline, exceto para cálculos dinâmicos. |
| **Componentes UI** | Componentes Customizados | Construir componentes a partir de elementos HTML puros e Tailwind. **Não introduzir** bibliotecas de componentes externas (como shadcn/ui, Material UI, etc.) sem aprovação prévia. |
| **Acesso a Dados** | `supabaseClient.ts` | Todas as operações de leitura e escrita no banco de dados devem usar a instância `supabase` exportada de `supabaseClient.ts`. |
| **Transações Complexas** | Supabase RPC | Para operações que exigem atomicidade (e.g., `upsert_companions`), utilize funções RPC do Supabase. Lembre-se que os parâmetros devem ser passados em ordem alfabética. |
| **Notificações** | `canvas-confetti` | Usar a função `confetti()` globalmente disponível para efeitos visuais de sucesso. |
| **Gerenciamento de Formulários** | React Hooks | Utilizar `useState` para gerenciar o estado de formulários e `useContext` para compartilhar dados entre os passos do Wizard. |