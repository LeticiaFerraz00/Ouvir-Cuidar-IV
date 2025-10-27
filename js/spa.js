// js/spa.js - Código de Roteamento SPA, Delegação de Eventos e Funções Dinâmicas

// 1. Definição das Rotas e Conteúdo
const rotas = {};
const MAIN_CONTENT_ID = 'spa-content'; // ID do elemento <main>

// 2. Função para Carregar o Conteúdo de uma Rota (Página)
async function carregarConteudoDaRota(caminho) {
    try {
        const response = await fetch(caminho);
        if (!response.ok) {
            throw new Error(`Erro ao carregar a página: ${response.statusText}`);
        }
        const html = await response.text();
        return html;
    } catch (error) {
        console.error("Falha ao carregar a rota:", error);
        return `
            <section style="padding: 20px; text-align: center;">
                <h2>Erro de Carregamento</h2>
                <p>Não foi possível carregar a página solicitada.</p>
            </section>
        `;
    }
}

// 3. Função Principal de Roteamento SPA
async function rotear(caminho, empurrarEstado = true) {
    const urlBase = window.location.origin + '/';
    let rotaNome = caminho.replace(urlBase, '');
    if (rotaNome === '' || rotaNome.endsWith('/')) rotaNome = 'index.html';

    let doc = null;

    if (!rotas[rotaNome]) {
        const htmlCompleto = await carregarConteudoDaRota(rotaNome);
        const parser = new DOMParser();
        doc = parser.parseFromString(htmlCompleto, 'text/html');
        const mainContent = doc.querySelector('main');

        if (mainContent) {
            rotas[rotaNome] = mainContent.innerHTML;
        } else {
            rotas[rotaNome] = `
                <section style="padding: 20px; text-align: center;">
                    <h2>Erro de Estrutura</h2>
                    <p>A página ${rotaNome} está incompleta ou sem a tag &lt;main&gt;.</p>
                </section>
            `;
        }
    } else {
        // Se já estiver em cache, cria um doc temporário para pegar o título, se necessário
        const parser = new DOMParser();
        doc = parser.parseFromString(`<!DOCTYPE html><html><head><title></title></head><body><main>${rotas[rotaNome]}</main></body></html>`, 'text/html');
    }

    // 3.4. Injeta o conteúdo no DOM
    const contentElement = document.getElementById(MAIN_CONTENT_ID);
    if (contentElement) {
        contentElement.innerHTML = rotas[rotaNome];

        // 3.5. Atualiza o estado da URL
        if (empurrarEstado) {
            window.history.pushState({ rota: rotaNome }, '', rotaNome);
        }

        // 3.6. Atualiza o título da página
        const tituloDaPagina = doc.querySelector('title') ? doc.querySelector('title').textContent : `Ouvir&Cuidar - ${rotaNome.replace('.html', '')}`;
        document.title = tituloDaPagina;

        // 3.7. Executa scripts específicos da página (máscara e validação)
        executarScripts(rotaNome);

    } else {
        console.error(`Elemento com ID '${MAIN_CONTENT_ID}' não encontrado.`);
    }
}

// 4. Implementação de Templates (Garante o ID no <main> inicial)
function aplicarTemplateSPA() {
    const mainElement = document.querySelector('main');
    if (mainElement) {
        mainElement.id = MAIN_CONTENT_ID;
    }
}

// 5. DELEGAÇÃO DE EVENTOS PARA LINKS 

function configurarDelegaçãoDeLinks() {
    document.body.addEventListener('click', function (e) {
        // Verifica se o elemento clicado é um link <a>
        const link = e.target.closest('a');
        
        if (link) {
            const href = link.getAttribute('href');
            
            // Verifica se é um link interno .html
            if (href && href.endsWith('.html') && !href.startsWith('http') && !href.startsWith('mailto')) {
                e.preventDefault(); 
                rotear(href);
            }
        }
    });
}


// 6. Tratamento de Scripts Específicos (Máscara e Validação)
function executarScripts(rota) {
    if (rota === 'cadastro.html') {
        
        // --- 1. MÁSCARA DE CPF ---
        const cpfInput = document.getElementById('cpf');
        if (cpfInput && !cpfInput.hasAttribute('data-mask-initialized-cpf')) {
            cpfInput.setAttribute('data-mask-initialized-cpf', 'true');
            cpfInput.addEventListener('input', function (e) {
                var value = e.target.value.replace(/\D/g, '');
                var formattedValue = '';

                if (value.length > 11) { value = value.substring(0, 11); }

                if (value.length > 9) {
                    formattedValue = value.substring(0, 3) + '.' + value.substring(3, 6) + '.' + value.substring(6, 9) + '-' + value.substring(9, 11);
                } else if (value.length > 6) {
                    formattedValue = value.substring(0, 3) + '.' + value.substring(3, 6) + '.' + value.substring(6, 9);
                } else if (value.length > 3) {
                    formattedValue = value.substring(0, 3) + '.' + value.substring(3, 6);
                } else {
                    formattedValue = value;
                }
                e.target.value = formattedValue;
            });
        }
        
        // --- 2. MÁSCARA DE TELEFONE ---
        const telInput = document.getElementById('telefone');
        if (telInput && !telInput.hasAttribute('data-mask-initialized-tel')) {
            telInput.setAttribute('data-mask-initialized-tel', 'true');
            telInput.addEventListener('input', function(e) {
                var value = e.target.value.replace(/\D/g, ''); 
                var formattedValue = '';

                if (value.length > 11) { value = value.substring(0, 11); }

                if (value.length > 10) { 
                    formattedValue = '(' + value.substring(0, 2) + ') ' + value.substring(2, 7) + '-' + value.substring(7, 11);
                } else if (value.length > 6) {
                    formattedValue = '(' + value.substring(0, 2) + ') ' + value.substring(2, 6) + '-' + value.substring(6, 10);
                } else if (value.length > 2) {
                    formattedValue = '(' + value.substring(0, 2) + ') ' + value.substring(2);
                } else {
                    formattedValue = value;
                }
                e.target.value = formattedValue;
            });
        }

        // --- 3. MÁSCARA DE CEP ---
        const cepInput = document.getElementById('cep');
        if (cepInput && !cepInput.hasAttribute('data-mask-initialized-cep')) {
            cepInput.setAttribute('data-mask-initialized-cep', 'true');
            cepInput.addEventListener('input', function(e) {
                var value = e.target.value.replace(/\D/g, ''); 
                var formattedValue = '';

                if (value.length > 8) { value = value.substring(0, 8); }

                if (value.length > 5) {
                    formattedValue = value.substring(0, 5) + '-' + value.substring(5, 8);
                } else {
                    formattedValue = value;
                }
                e.target.value = formattedValue;
            });
        }
        
        // --- 4. VALIDAÇÃO DO FORMULÁRIO ---
        configurarValidacaoFormulario();
    }
}


// 7. Configuração da Validação do Formulário (Função completa com todas as regras)
function configurarValidacaoFormulario() {
    const form = document.querySelector('.formulario form');
    
    if (form) {
        console.log("DEBUG: Formulário de Cadastro encontrado e Validação configurada.");
        
        form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            let isValid = true;
            
            document.querySelectorAll('.mensagem-erro').forEach(el => el.remove());
            document.querySelectorAll('.erro-validacao').forEach(el => el.classList.remove('erro-validacao'));

            function exibirErro(inputElement, mensagem) {
                isValid = false;
                inputElement.classList.add('erro-validacao');
                const erroElement = document.createElement('p');
                erroElement.classList.add('mensagem-erro');
                erroElement.textContent = '❌ ' + mensagem;
                inputElement.parentNode.insertBefore(erroElement, inputElement.nextSibling);
            }

            const campos = form.querySelectorAll('input[required]');

            // 3. Validação de Campos Vazios
            campos.forEach(input => {
                if (!input.value.trim()) {
                    const labelText = input.previousElementSibling && input.previousElementSibling.tagName === 'LABEL' 
                                      ? input.previousElementSibling.textContent.replace(':', '').trim() 
                                      : 'Este campo';
                    exibirErro(input, `${labelText} é obrigatório.`);
                }
            });
            
            // --- VALIDAÇÕES ESPECÍFICAS (CONSISTÊNCIA DE DADOS) ---
            
            // 4. Validação de Telefone (10 ou 11 dígitos)
            const telefoneInput = document.getElementById('telefone');
            if (telefoneInput && telefoneInput.value.trim()) {
                const numLimpo = telefoneInput.value.replace(/\D/g, ''); 
                if (numLimpo.length < 10 || numLimpo.length > 11) {
                    exibirErro(telefoneInput, 'O Telefone/Celular deve incluir o DDD e ter 10 ou 11 dígitos.');
                }
            }


            // 5. Validação de Email
            const emailInput = document.getElementById('email');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput && emailInput.value.trim() && !emailPattern.test(emailInput.value)) {
                exibirErro(emailInput, 'Por favor, insira um e-mail válido.');
            }
            
            // 6. Validação de Endereço/Cidade (Mínimo 3 letras)
            const enderecoInput = document.getElementById('endereco');
            const cidadeInput = document.getElementById('cidade');
            const textoPattern = /[a-zA-Z].*[a-zA-Z].*[a-zA-Z]/; // Mínimo 3 letras
            
            if (enderecoInput && enderecoInput.value.trim() && !textoPattern.test(enderecoInput.value)) {
                exibirErro(enderecoInput, 'O Endereço deve ser válido e conter pelo menos 3 letras.');
            }
            if (cidadeInput && cidadeInput.value.trim() && !textoPattern.test(cidadeInput.value)) {
                exibirErro(cidadeInput, 'O nome da Cidade deve ser válido e conter pelo menos 3 letras.');
            }


            // 7. Validação de Estado (EXATO 2 letras)
            const estadoInput = document.getElementById('estado');
            const estadoPattern = /^[a-zA-Z]{2}$/;
            if (estadoInput && estadoInput.value.trim() && !estadoPattern.test(estadoInput.value)) {
                exibirErro(estadoInput, 'O Estado deve ter exatamente 2 letras (Ex: SP).');
            }


            // 8. Validação de CEP (padrão 00000-000)
            const cepInput = document.getElementById('cep');
            const cepPattern = /^\d{5}-\d{3}$/; 
            if (cepInput && cepInput.value.trim() && !cepPattern.test(cepInput.value)) {
                exibirErro(cepInput, 'O CEP deve estar no formato 00000-000.');
            }

            // 9. Validação de CPF (após a máscara, formato 000.000.000-00)
            const cpfInput = document.getElementById('cpf');
            const cpfPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
            if (cpfInput && cpfInput.value.trim() && !cpfPattern.test(cpfInput.value)) {
                exibirErro(cpfInput, 'O CPF deve estar completo e no formato 000.000.000-00.');
            }
            
            // 10. Validação da Idade (Maior de 18 anos) e Data Futura
            const dataNascimentoInput = document.getElementById('dataNascimento');
            if (dataNascimentoInput && dataNascimentoInput.value.trim()) {
                const dataNascimento = new Date(dataNascimentoInput.value);
                const hoje = new Date();
                
                if (dataNascimento > hoje) {
                    exibirErro(dataNascimentoInput, 'A data de nascimento não pode ser futura.');
                } else {
                    let idade = hoje.getFullYear() - dataNascimento.getFullYear();
                    const mes = hoje.getMonth() - dataNascimento.getMonth();
                    
                    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) { idade--; }
                    
                    if (idade < 18) {
                        exibirErro(dataNascimentoInput, 'É necessário ter no mínimo 18 anos para se cadastrar.');
                    }
                }
            }


            // 11. Finalização
            if (isValid) {
                alert("✅ Cadastro enviado com sucesso! Entraremos em contato.");
                form.reset(); 
            } else {
                const primeiroErro = document.querySelector('.mensagem-erro');
                if (primeiroErro) {
                    primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
}


// 8. Evento 'popstate' para navegação com o botão Voltar/Avançar
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.rota) {
        rotear(e.state.rota, false); 
    } else {
        rotear(window.location.pathname, false); 
    }
});

// 9. Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
    // 1. Aplica o ID 'spa-content' no <main>
    aplicarTemplateSPA();

    // 2. CONFIGURA DELEGAÇÃO: APENAS UMA VEZ. Funciona para todos os links futuros.
    configurarDelegaçãoDeLinks(); 
    
    // 3. Roteia para a página atual (inicia o SPA)
    rotear(window.location.pathname, false);
});