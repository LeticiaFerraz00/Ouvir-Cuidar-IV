const rotas={};const MAIN_CONTENT_ID='spa-content';async function carregarConteudoDaRota(caminho){try{const response=await fetch(caminho);if(!response.ok){throw new Error(`Erro ao carregar a página: ${response.statusText}`)}
const html=await response.text();return html}catch(error){return `
            <section style="padding: 20px; text-align: center;">
                <h2>Erro de Carregamento</h2>
                <p>Não foi possível carregar a página solicitada.</p>
            </section>
        `}}
async function rotear(caminho,empurrarEstado=!0){const urlBase=window.location.origin+'/';let rotaNome=caminho.replace(urlBase,'');if(rotaNome===''||rotaNome.endsWith('/'))rotaNome='index.html';let doc=null;if(!rotas[rotaNome]){const htmlCompleto=await carregarConteudoDaRota(rotaNome);const parser=new DOMParser();doc=parser.parseFromString(htmlCompleto,'text/html');const mainContent=doc.querySelector('main');if(mainContent){rotas[rotaNome]=mainContent.innerHTML}else{rotas[rotaNome]=`
                <section style="padding: 20px; text-align: center;">
                    <h2>Erro de Estrutura</h2>
                    <p>A página ${rotaNome} está incompleta ou sem a tag <main>.</p>
                </section>
            `}}else{const parser=new DOMParser();doc=parser.parseFromString(`<!DOCTYPE html><html><head><title></title></head><body><main>${rotas[rotaNome]}</main></body></html>`,'text/html')}
const contentElement=document.getElementById(MAIN_CONTENT_ID);if(contentElement){contentElement.innerHTML=rotas[rotaNome];if(empurrarEstado){window.history.pushState({rota:rotaNome},'',rotaNome)}
const tituloDaPagina=doc.querySelector('title')?doc.querySelector('title').textContent:`Ouvir&Cuidar - ${rotaNome.replace('.html', '')}`;document.title=tituloDaPagina;executarScripts(rotaNome)}}
function aplicarTemplateSPA(){const mainElement=document.querySelector('main');if(mainElement){mainElement.id=MAIN_CONTENT_ID}}
function configurarDelegaçãoDeLinks(){document.body.addEventListener('click',function(e){const link=e.target.closest('a');if(link){const href=link.getAttribute('href');if(href&&href.endsWith('.html')&&!href.startsWith('http')&&!href.startsWith('mailto')){e.preventDefault();rotear(href)}}})}
function configurarToggleAcessibilidade(){const toggleButton=document.getElementById('toggle-contrast');const body=document.body;if(localStorage.getItem('high-contrast')==='enabled'){body.classList.add('high-contrast');toggleButton.textContent='☀️'}
toggleButton.addEventListener('click',function(){if(body.classList.contains('high-contrast')){body.classList.remove('high-contrast');localStorage.setItem('high-contrast','disabled');toggleButton.textContent='🌙'}else{body.classList.add('high-contrast');localStorage.setItem('high-contrast','enabled');toggleButton.textContent='☀️'}})}
function executarScripts(rota){if(rota==='cadastro.html'){configurarValidacaoFormulario()}}
function configurarValidacaoFormulario(){const form=document.querySelector('.formulario form');if(form){form.addEventListener('submit',function(e){e.preventDefault();let isValid=!0;document.querySelectorAll('.mensagem-erro').forEach(el=>el.remove());document.querySelectorAll('.erro-validacao').forEach(el=>el.classList.remove('erro-validacao'));function exibirErro(inputElement,mensagem){isValid=!1;if(document.activeElement!==inputElement){}
inputElement.classList.add('erro-validacao');const erroElement=document.createElement('p');erroElement.classList.add('mensagem-erro');erroElement.setAttribute('role','alert');erroElement.textContent='❌ '+mensagem;inputElement.parentNode.insertBefore(erroElement,inputElement.nextSibling)}
if(isValid){alert("✅ Cadastro enviado com sucesso! Entraremos em contato.");form.reset()}else{const primeiroErro=document.querySelector('.mensagem-erro');if(primeiroErro){primeiroErro.scrollIntoView({behavior:'smooth',block:'center'});primeiroErro.previousElementSibling.focus()}}})}}
window.addEventListener('popstate',(e)=>{rotear(e.state.rota||'index.html',!1)});window.addEventListener('DOMContentLoaded',()=>{aplicarTemplateSPA();configurarDelegaçãoDeLinks();configurarToggleAcessibilidade();const caminhoInicial=window.location.pathname.replace(/^\/|\/$/g,'')||'index.html';rotear(caminhoInicial,!1)})
