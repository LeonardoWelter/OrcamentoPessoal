/*
 * Copyright (c) Leonardo Welter, 2019.
 * https://github.com/LeonardoWelter
 */

// Classe de entidade despesa que possui os atributos para a instanciação de novas despesas
class Despesa {
    constructor(ano, mes, dia, tipo, descricao, valor) {
        this.ano = ano;
        this.mes = mes;
        this.dia = dia;
        this.tipo = tipo;
        this.descricao = descricao;
        this.valor = valor;
    }
    // Método que verifica se algum campo está vazio.
    validarDados() {
        for (let i in this) {
            if (this[i] == undefined || this[i] == '' || this[i] == null) {
                return false;
            }
        }
        return true;
    }
}

//Classe que faz a "persistência" das despesas no localStorage
class BD {

    // Ao instanciar uma classe BD, é verificado qual o ID que foi utilizado por último na persistência das despesas
    constructor() {
        let id = localStorage.getItem('id');

        if (id === null) {
            localStorage.setItem('id', 0);
        }
    }

    // Retorna o próximo ID disponível para a persistência
    getProximoID() {
        let proximoId = localStorage.getItem('id');
        return parseInt(proximoId) + 1;
    }

    // Persiste o objeto no localStorage
    gravar(d) {
        let id = this.getProximoID();

        localStorage.setItem(id, JSON.stringify(d));

        localStorage.setItem('id', id);
    }

    // Recupera os objetos, em forma de Array, do localStorage
    recuperarRegistros() {

        let despesas = Array();

        let id = localStorage.getItem('id');

        for (let i = 1; i <= id; i++) {
            let despesa = JSON.parse(localStorage.getItem(i));

            if (despesa === null) {
                continue;
            }

            despesa.id = i;
            despesas.push(despesa);
        }

        return despesas;
    }

    // Método responsável por filtrar os objetos persistidos no localStorage para facilitar a localização
    pesquisar(despesa) {
        let despesasFiltradas = Array();

        despesasFiltradas = this.recuperarRegistros()

        if (despesa.ano != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.ano == despesa.ano);
        }

        if (despesa.mes != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.mes == despesa.mes);
        }

        if (despesa.dia != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.dia == despesa.dia);
        }

        if (despesa.tipo != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.tipo == despesa.tipo);
        }

        if (despesa.descricao != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.descricao == despesa.descricao);
        }

        if (despesa.valor != '') {
            despesasFiltradas = despesasFiltradas.filter(d => d.valor == despesa.valor);
        }

        return despesasFiltradas;
    }

    // Método responsável por remover um objeto persistido no localStorage
    remover(id) {
        localStorage.removeItem(id);
    }
}

let bd = new BD();

// Função responsável intermediar o index.html com o app.js,
// recupera os valores dos campos, usa-os para instanciar
// um objeto despesa, valida os valores e os persiste
function cadastrarDespesa() {
    let ano = document.getElementById('ano')
    let mes = document.getElementById('mes')
    let dia = document.getElementById('dia')
    let tipo = document.getElementById('tipo')
    let descricao = document.getElementById('descricao')
    let valor = document.getElementById('valor')

    let despesa = new Despesa(
        ano.value,
        mes.value,
        dia.value,
        tipo.value,
        descricao.value,
        valor.value
    )

    if (despesa.validarDados()) {
        bd.gravar(despesa)
        sucessoGravacao()
        $('#registraDespesa').modal('show');
        limparCampos()
    } else {
        console.log('erro');
        erroGravacao()
        $('#registraDespesa').modal('show');

    }

}

// Função responsável por exibir os objetos persistidos no localStorage
// na página de consulta, criando as colunas e linhas programaticamente
// para exibir o número correto de valores.
// Pode receber como parâmetro um Array e um Boolean, o que significa
// que a lista deve ser filtrada com base nos parâmetros presentes
// no Array recebido.
function carregaListaDespesas(despesas = Array(), filtro = false) {

    if (despesas.length == 0 && filtro == false) {
        despesas = bd.recuperarRegistros();
    }

    let listaDespesas = document.getElementById('listaDespesas');
    listaDespesas.innerHTML = '';

    despesas.forEach(function (d) {
        let linha = listaDespesas.insertRow();

        linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`;
        linha.insertCell(1).innerHTML = converteTipo(d.tipo);
        linha.insertCell(2).innerHTML = d.descricao;
        linha.insertCell(3).innerHTML = d.valor;
        let btn = document.createElement('button');
        btn.className = 'btn btn-danger'
        btn.innerHTML = '<i class="fas fa-times"></i>'
        btn.id = `id_despesa${d.id}`;
        btn.onclick = function () {
            let id = this.id.replace('id_despesa', '');
            bd.remover(id)
            window.location.reload();
        };
        linha.insertCell(4).append(btn);
    });
}

// Função responsável por realizar a chamada da função carregaListaDespesas
// enviando um Array e um Boolean para a filtragem dos objetos persistidos
// conforme input do usuário
function pesquisarDespesa() {
    let ano = document.getElementById('ano').value;
    let mes = document.getElementById('mes').value;
    let dia = document.getElementById('dia').value;
    let tipo = document.getElementById('tipo').value;
    let descricao = document.getElementById('descricao').value;
    let valor = document.getElementById('valor').value;

    let despesa = new Despesa(ano, mes, dia, tipo, descricao, valor)

    let despesas = bd.pesquisar(despesa);

    carregaListaDespesas(despesas, true);
}

// Função responsável por modificar o Modal que é chamado caso a persistência
// do objeto seja bem sucedida
function sucessoGravacao() {
    document.getElementById('registraDespesaTituloClass').className = 'modal-header text-success';
    document.getElementById('registraDespesaTitulo').innerText = 'Registro inserido com sucesso';
    document.getElementById('registraDespesaConteudo').innerText = 'Despesa cadastrada com sucesso';
    document.getElementById('registraDespesaBotao').className = 'btn btn-success';
    document.getElementById('registraDespesaBotao').innerText = 'OK';
}

// Função responsável por modificar o Modal que é chamado caso a persistência
// do objeto resulte em erro
function erroGravacao() {
    document.getElementById('registraDespesaTituloClass').className = "modal-header text-danger";
    document.getElementById('registraDespesaTitulo').innerText = 'Erro na gravação';
    document.getElementById('registraDespesaConteudo').innerText = 'Todos os campos devem ser preenchidos';
    document.getElementById('registraDespesaBotao').className = 'btn btn-danger';
    document.getElementById('registraDespesaBotao').innerText = 'Voltar';
}

// Converte os tipos de gasto dos números enviados via value para
// as categorias definidas pelo select
function converteTipo(t) {
    let tipo = t;

    switch (tipo) {
        case '1':
            tipo = 'Alimentação'
            break;
        case '2':
            tipo = 'Educação'
            break;
        case '3':
            tipo = 'Lazer'
            break;
        case '4':
            tipo = 'Saúde'
            break;
        case '5':
            tipo = 'Transporte'
            break;
    }

    return tipo;
}

// Realiza a limpeza dos campos, retornando-os ao valor padrão
function limparCampos() {
    document.getElementById('ano').value = '';
    document.getElementById('mes').value = '';
    document.getElementById('dia').value = '';
    document.getElementById('tipo').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
}

// Realiza a limpeza dos campos e o reload da página para resetar
// o filtro dos objetos
function resetarPesquisa() {
    limparCampos()
    pesquisarDespesa();
}