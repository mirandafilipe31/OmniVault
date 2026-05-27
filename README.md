# OmniVault — Sistema Integrado de Gestão de Cacifos Inteligentes

O **OmniVault** é um protótipo funcional desenvolvido como parte de um projeto de modernização logística e transformação digital para a distribuição urbana e gestão de encomendas de última milha (*last-mile delivery*). 

Esta aplicação simula o ecossistema completo de interação entre estafetas e clientes finais num cenário de cacifos inteligentes (*Smart Lockers*), validando a integração lógica de componentes de software e simulação de serviços automatizados.

---

## 🏗️ Arquitetura do Sistema

O protótipo foi estruturado seguindo o padrão de **Arquitetura em 3 Camadas**, implementado inteiramente *client-side* como uma Single Page Application (SPA):

1. **Camada de Apresentação (UI):**
   - Interface semântica em HTML5 e estilização modular em CSS3.
   - Alternância dinâmica de perfis (*Área do Estafeta* e *Área do Cliente*) sem recarregamento de página.
   - Consola de monitorização de logs integrada no rodapé para simular o comportamento de um terminal de administração.

2. **Camada de Negócio (Mock API):**
   - Controladores lógicos em JavaScript (ES6+) que simulam rotas e verbos de uma API RESTful (`POST /api/v1/auth/login`, `GET /api/v1/lockers/available`, `POST /api/v1/deposits/confirm`, etc.).
   - Geração dinâmica de tokens algorítmicos de segurança (PIN de 6 dígitos) e controlo de transição de estados dos cacifos.

3. **Camada de Dados (Persistência):**
   - Persistência baseada em `LocalStorage` para emular o comportamento de uma base de dados relacional.
   - Manutenção de consistência de dados mesmo após encerramento ou atualização da sessão do browser.

---

## ⚙️ Modelação de Estados dos Cacifos

O ciclo de vida de cada cacifo dentro do sistema segue rigorosamente o modelo de comportamento planeado:
- **Livre:** Disponível para seleção e reserva por parte de um estafeta autenticado.
- **Reservado:** Bloqueado temporariamente durante o ato físico de abertura de porta e depósito do volume.
- **Ocupado:** Trancado com uma encomenda no interior. O sistema gera o PIN correspondente e aguarda a validação do cliente.

---

## 🧪 Qualidade de Software e Testes Automáticos

A cobertura funcional do sistema foi validada e auditada recorrendo a testes automatizados com o **Katalon Recorder**, estruturados na suite `OmniVaultSuite`:

* **Cenário de Sucesso (Happy Path):** Autenticação do operador -> Reserva de cacifo por volumetria -> Confirmação de depósito -> Captura do token via consola de logs -> Levantamento e libertação de estado por parte do cliente.
* **Cenários de Exceção:** - Tratamento e bloqueio de credenciais inválidas na autenticação do estafeta.
  - Rejeição de tokens incorretos no ecrã de levantamento do cliente.

*Nota: A suite de testes inclui uma rotina automatizada inicial (`runScript` -> `localStorage.clear();`) executada logo após a abertura da aplicação. Esta rotina garante o reset completo do estado dos cacifos no browser, permitindo a reprodutibilidade integral e consistente dos testes de forma 100% isolada e sem interferência de execuções anteriores.*

---

## 🔑 Credenciais Homologadas para Testes

O sistema efetua o *seed* automático de dados no primeiro arranque com as seguintes contas de operador:

| Utilizador | Password | Perfil |
| :--- | :--- | :--- |
| `estafeta1` | `passwordetft1` | Estafeta Autorizado |
| `estafeta2` | `passwordetft2` | Estafeta Autorizado |
