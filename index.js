// Chave para armazenar dados no localStorage
        const STORAGE_KEY = 'sugestoes_registradas';
        const SENHA_ADMIN = '12345678GCO@';
        let filtroAtual = '';

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

        // Função para salvar dados no localStorage
        function salvarDados(sugestoes) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sugestoes));
        }

        // Função para carregar dados do localStorage
        function carregarDados() {
            const dados = localStorage.getItem(STORAGE_KEY);
            return dados ? JSON.parse(dados) : [];
        }

        // Função para gerar ID único
        function gerarId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        // Função para atualizar contador
        function atualizarContador(sugestoesFiltradas) {
            const contador = document.getElementById('contador');
            const total = sugestoesFiltradas.length;
            const totalGeral = carregarDados().length;
            
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
            card.appendChild(deleteButton);

            return card;
        }

        // Função para exibir todas as sugestões (com filtro aplicado)
        function exibirSugestoes() {
            const todasSugestoes = carregarDados();
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

        // Função para adicionar nova sugestão
        function adicionarSugestao(texto, plataforma, nome) {
            const sugestoes = carregarDados();
            const agora = new Date();
            
            const novaSugestao = {
                id: gerarId(),
                texto: texto,
                plataforma: plataforma,
                nome: nome,
                timestamp: agora.toISOString(),
                data: agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
            };

            sugestoes.push(novaSugestao);
            salvarDados(sugestoes);
            exibirSugestoes();
        }

        // Função para remover sugestão
        function removerSugestao(id) {
            if (confirm('Tem certeza que deseja remover esta sugestão?')) {
                const sugestoes = carregarDados();
                const sugestoesAtualizadas = sugestoes.filter(s => s.id !== id);
                salvarDados(sugestoesAtualizadas);
                exibirSugestoes();
            }
        }

        // Função para limpar todos os registros (protegida por senha)
        function limparTodosRegistros() {
            if (!verificarSenha('limpar todos os registros')) {
                return;
            }
            
            if (confirm('Tem certeza que deseja limpar TODOS os registros? Esta ação não pode ser desfeita.')) {
                localStorage.removeItem(STORAGE_KEY);
                // Resetar filtro
                document.getElementById('filtroPlataforma').value = '';
                filtroAtual = '';
                document.getElementById('filtroInfo').classList.remove('ativo');
                exibirSugestoes();
                
                // Feedback visual
                const button = document.querySelector('.clear-button');
                const originalText = button.innerHTML;
                button.innerHTML = '✅ Todos os registros foram limpos!';
                button.style.backgroundColor = '#38a169';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '#4a5568';
                }, 3000);
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
            
            const todasSugestoes = carregarDados();
            
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

            // Feedback visual de sucesso
            const button = document.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.textContent = 'Registrado com sucesso!';
            button.style.backgroundColor = '#38a169';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '#e53e3e';
            }, 2000);
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
            exibirSugestoes();
            document.getElementById('sugestao').focus();
        });