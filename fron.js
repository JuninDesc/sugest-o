
        // Import the functions you need from the SDKs you need
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';


        const firebaseConfig = {
            apiKey: "AIzaSyBMq2mLGtmzdn_7H3C6Qm_kVztDlv3E0HI",
            authDomain: "sugestoesalunos.firebaseapp.com",
            projectId: "sugestoesalunos",
            storageBucket: "sugestoesalunos.firebasestorage.app",
            messagingSenderId: "1071749368955",
            appId: "1:1071749368955:web:81a189a99ebb23dbf966de"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // Variáveis globais
        const SENHA_ADMIN = '12345678GCO@';
        let filtroAtual = '';
        let todasSugestoes = [];
        let isConnected = false;

        // Função para verificar senha
        function verificarSenha(acao) {
            const senha = prompt(`Para ${acao}, digite a senha de administrador:`);
            if (senha === null) {
                return false; // Usuário cancelou
            }
            if (senha !== SENHA_ADMIN) {
                alert('Senha incorreta! Acesso negado.');
                return false;
            }
            return true;
        }

        // Função para atualizar status de conexão
        function atualizarStatusConexao(conectado) {
            const statusIndicator = document.getElementById('statusIndicator');
            isConnected = conectado;
            
            if (conectado) {
                statusIndicator.textContent = '☁️ Online';
                statusIndicator.classList.remove('offline');
            } else {
                statusIndicator.textContent = '⚠️ Offline';
                statusIndicator.classList.add('offline');
            }
        }

        // Função para atualizar contador
        function atualizarContador(sugestoesFiltradas) {
            const contador = document.getElementById('contador');
            const total = sugestoesFiltradas.length;
            const totalGeral = todasSugestoes.length;
            
            if (filtroAtual) {
                contador.textContent = total === 1 ? 
                    `1 registro (de ${totalGeral} total)` : 
                    `${total} registros (de ${totalGeral} total)`;
            } else {
                contador.textContent = total === 1 ? '1 registro' : `${total} registros`;
            }
        }

        // Função para aplicar filtro
        function aplicarFiltro() {
            const filtroSelect = document.getElementById('filtroPlataforma');
            filtroAtual = filtroSelect.value;
            
            const filtroInfo = document.getElementById('filtroInfo');
            const plataformaFiltrada = document.getElementById('plataformaFiltrada');
            
            if (filtroAtual) {
                filtroInfo.classList.add('ativo');
                plataformaFiltrada.textContent = filtroAtual;
            } else {
                filtroInfo.classList.remove('ativo');
            }
            
            exibirSugestoes();
        }

        // Função para criar card de sugestão
        function criarCardSugestao(sugestao) {
            const card = document.createElement('div');
            card.classList.add('sugestao-card');
            card.dataset.id = sugestao.id;
            card.dataset.plataforma = sugestao.plataforma;

            const textoP = document.createElement('p');
            textoP.textContent = sugestao.texto;

            const metaDiv = document.createElement('div');
            metaDiv.classList.add('meta');

            const nomeSpan = document.createElement('span');
            nomeSpan.classList.add('nome');
            nomeSpan.textContent = `Sugerido por: ${sugestao.nome}`;

            const etiquetaSpan = document.createElement('span');
            etiquetaSpan.classList.add('etiqueta');
            etiquetaSpan.textContent = sugestao.plataforma;

            const dataSpan = document.createElement('span');
            dataSpan.classList.add('data');
            dataSpan.textContent = sugestao.data;

            // Botão de deletar
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.innerHTML = '×'; 
            deleteButton.title = 'Remover esta sugestão';
            deleteButton.onclick = () => removerSugestao(sugestao.id);

            metaDiv.appendChild(nomeSpan);
            metaDiv.appendChild(etiquetaSpan);
            metaDiv.appendChild(dataSpan);
            card.appendChild(textoP);
            card.appendChild(metaDiv);
           /* card.appendChild(deleteButton);  */

            return card;
        }

        // Função para exibir todas as sugestões (com filtro aplicado)
        function exibirSugestoes() {
            const listaRegistros = document.getElementById('lista-registros');
            
            // Aplicar filtro se necessário
            let sugestoesFiltradas = todasSugestoes;
            if (filtroAtual) {
                sugestoesFiltradas = todasSugestoes.filter(s => s.plataforma === filtroAtual);
            }
            
            // Limpar lista atual
            listaRegistros.innerHTML = '';

            if (sugestoesFiltradas.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.classList.add('empty-state');
                
                if (filtroAtual) {
                    emptyState.textContent = `Nenhuma sugestão encontrada para a plataforma "${filtroAtual}".`;
                } else {
                    emptyState.textContent = 'Nenhuma sugestão registrada ainda. Seja o primeiro a contribuir!';
                }
                
                listaRegistros.appendChild(emptyState);
            } else {
                // Ordenar por data (mais recente primeiro)
                sugestoesFiltradas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                sugestoesFiltradas.forEach(sugestao => {
                    const card = criarCardSugestao(sugestao);
                    listaRegistros.appendChild(card);
                });
            }

            atualizarContador(sugestoesFiltradas);
        }

        // Função para carregar sugestões do Firebase
        async function carregarSugestoes() {
            try {
                const q = query(collection(db, 'sugestoes'), orderBy('timestamp', 'desc'));
                
                // Usar onSnapshot para atualizações em tempo real
                onSnapshot(q, (querySnapshot) => {
                    todasSugestoes = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        todasSugestoes.push({
                            id: doc.id,
                            ...data
                        });
                    });
                    
                    exibirSugestoes();
                    atualizarStatusConexao(true);
                }, (error) => {
                    console.error('Erro ao carregar sugestões:', error);
                    atualizarStatusConexao(false);
                });
                
            } catch (error) {
                console.error('Erro ao configurar listener:', error);
                atualizarStatusConexao(false);
            }
        }

        // Função para adicionar nova sugestão
        async function adicionarSugestao(texto, plataforma, nome) {
            const submitButton = document.getElementById('submitButton');
            const originalText = submitButton.textContent;
            
            try {
                submitButton.disabled = true;
                submitButton.textContent = 'Salvando...';
                
                const agora = new Date();
                
                const novaSugestao = {
                    texto: texto,
                    plataforma: plataforma,
                    nome: nome,
                    timestamp: agora.toISOString(),
                    data: agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
                };

                await addDoc(collection(db, 'sugestoes'), novaSugestao);
                
                // Feedback visual de sucesso
                submitButton.textContent = 'Registrado com sucesso!';
                submitButton.style.backgroundColor = '#38a169';
                
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.style.backgroundColor = '#e53e3e';
                    submitButton.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('Erro ao adicionar sugestão:', error);
                alert('Erro ao salvar sugestão. Verifique sua conexão com a internet.');
                
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        }

        // Função para remover sugestão
        async function removerSugestao(id) {
            if (confirm('Tem certeza que deseja remover esta sugestão?')) {
                try {
                    await deleteDoc(doc(db, 'sugestoes', id));
                } catch (error) {
                    console.error('Erro ao remover sugestão:', error);
                    alert('Erro ao remover sugestão. Verifique sua conexão com a internet.');
                }
            }
        }

        // Função para limpar todos os registros (protegida por senha)
        async function limparTodosRegistros() {
            if (!verificarSenha('limpar todos os registros')) {
                return;
            }
            
            if (confirm('Tem certeza que deseja limpar TODOS os registros? Esta ação não pode ser desfeita.')) {
                try {
                    const button = document.querySelector('.clear-button');
                    const originalText = button.innerHTML;
                    button.innerHTML = '🔄 Limpando...';
                    button.disabled = true;
                    
                    // Buscar todos os documentos
                    const querySnapshot = await getDocs(collection(db, 'sugestoes'));
                    
                    // Deletar cada documento
                    const deletePromises = [];
                    querySnapshot.forEach((document) => {
                        deletePromises.push(deleteDoc(doc(db, 'sugestoes', document.id)));
                    });
                    
                    await Promise.all(deletePromises);
                    
                    // Resetar filtro
                    document.getElementById('filtroPlataforma').value = '';
                    filtroAtual = '';
                    document.getElementById('filtroInfo').classList.remove('ativo');
                    
                    // Feedback visual
                    button.innerHTML = '✅ Todos os registros foram limpos!';
                    button.style.backgroundColor = '#38a169';
                    
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.style.backgroundColor = '#4a5568';
                        button.disabled = false;
                    }, 3000);
                    
                } catch (error) {
                    console.error('Erro ao limpar registros:', error);
                    alert('Erro ao limpar registros. Verifique sua conexão com a internet.');
                    
                    const button = document.querySelector('.clear-button');
                    button.innerHTML = '🔒 Limpar Todos os Registros';
                    button.disabled = false;
                }
            }
        }

        // Função para escapar caracteres especiais no CSV
        function escaparCSV(texto) {
            if (typeof texto !== 'string') {
                texto = String(texto);
            }
            // Se contém vírgula, aspas ou quebra de linha, envolver em aspas
            if (texto.includes(',') || texto.includes('"') || texto.includes('\n') || texto.includes('\r')) {
                // Escapar aspas duplicando-as
                texto = texto.replace(/"/g, '""');
                return `"${texto}"`;
            }
            return texto;
        }

        // Função para exportar dados para Excel (CSV) - protegida por senha
        function exportarParaExcel() {
            if (!verificarSenha('exportar dados para Excel')) {
                return;
            }
            
            // Usar sugestões filtradas se houver filtro ativo
            let sugestoesParaExportar = todasSugestoes;
            if (filtroAtual) {
                sugestoesParaExportar = todasSugestoes.filter(s => s.plataforma === filtroAtual);
            }
            
            if (sugestoesParaExportar.length === 0) {
                const mensagem = filtroAtual ? 
                    `Não há sugestões da plataforma "${filtroAtual}" para exportar!` :
                    'Não há sugestões para exportar!';
                alert(mensagem);
                return;
            }

            // Cabeçalho do CSV
            const cabecalho = ['Data/Hora', 'Nome', 'Plataforma', 'Sugestão/Feedback'];
            
            // Converter dados para formato CSV
            const linhas = [cabecalho.join(',')];
            
            // Ordenar por data (mais antiga primeiro para o Excel)
            const sugestoesOrdenadas = [...sugestoesParaExportar].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            sugestoesOrdenadas.forEach(sugestao => {
                const linha = [
                    escaparCSV(sugestao.data),
                    escaparCSV(sugestao.nome),
                    escaparCSV(sugestao.plataforma),
                    escaparCSV(sugestao.texto)
                ];
                linhas.push(linha.join(','));
            });

            // Criar conteúdo CSV
            const csvContent = '\uFEFF' + linhas.join('\n'); // \uFEFF é o BOM para UTF-8
            
            // Criar blob e fazer download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                
                // Nome do arquivo com data atual e filtro se aplicável
                const agora = new Date();
                const dataFormatada = agora.toISOString().split('T')[0]; // YYYY-MM-DD
                const sufixoFiltro = filtroAtual ? `_${filtroAtual.replace(/\s+/g, '_')}` : '';
                link.setAttribute('download', `sugestoes_${dataFormatada}${sufixoFiltro}.csv`);
                
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Feedback visual
                const button = document.querySelector('.export-button');
                const originalText = button.innerHTML;
                const mensagemSucesso = filtroAtual ? 
                    `✅ ${sugestoesParaExportar.length} registros de "${filtroAtual}" exportados!` :
                    '✅ Exportado com sucesso!';
                
                button.innerHTML = mensagemSucesso;
                button.style.backgroundColor = '#2f855a';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '#38a169';
                }, 3000);
            } else {
                alert('Seu navegador não suporta download automático. Por favor, use um navegador mais recente.');
            }
        }

        // Tornar funções globais para uso nos event handlers
        window.aplicarFiltro = aplicarFiltro;
        window.limparTodosRegistros = limparTodosRegistros;
        window.exportarParaExcel = exportarParaExcel;
        window.removerSugestao = removerSugestao;

        // Event listener para o formulário
        document.getElementById('suggestionForm').addEventListener('submit', function(event) {
            event.preventDefault();

            const sugestaoTexto = document.getElementById('sugestao').value.trim();
            const plataforma = document.getElementById('plataforma').value;
            const nome = document.getElementById('nome').value.trim();

            if (!sugestaoTexto || !plataforma || !nome) {
                alert('Por favor, preencha todos os campos!');
                return;
            }

            // Adicionar nova sugestão
            adicionarSugestao(sugestaoTexto, plataforma, nome);

            // Limpar formulário
            document.getElementById('suggestionForm').reset();
            document.getElementById('sugestao').focus();
        });

        // Validação do campo de nome para evitar e-mails

        const campoNome = document.getElementById('nome');
        const erro = document.getElementById('erro-nome');

        campoNome.addEventListener('input', () => {
        const valor = campoNome.value;
        const regexEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

        if (regexEmail.test(valor)) {
        erro.style.display = 'block'; // Mostra a mensagem de erro
        campoNome.setCustomValidity('Digite apenas o nome, não um e-mail');
        } else {
        erro.style.display = 'none'; // Oculta o erro
        campoNome.setCustomValidity('');
        }
    });

        // Permitir envio com Ctrl+Enter no textarea
        document.getElementById('sugestao').addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && event.ctrlKey) {
                event.preventDefault();
                document.getElementById('suggestionForm').dispatchEvent(new Event('submit'));
            }
        });

        // Carregar sugestões quando a página for carregada
        document.addEventListener('DOMContentLoaded', function() {
            carregarSugestoes();
            document.getElementById('sugestao').focus();
        });