// =========================================================
// Kaká Limpeza - Loja 08 | Catálogo de produtos
// Depende de PRODUTOS_KAKA (produtos-data.js)
// =========================================================

document.addEventListener('DOMContentLoaded', function () {

  var produtos = (typeof PRODUTOS_KAKA !== 'undefined') ? PRODUTOS_KAKA : [];
  var grid = document.getElementById('catalogoGrid');
  var vazio = document.getElementById('catalogoVazio');
  var contagem = document.getElementById('catalogoContagem');
  var buscaInput = document.getElementById('catalogoBusca');
  var categoriasWrap = document.getElementById('catalogoCategorias');

  if (!grid || !produtos.length) { return; }

  var WHATS_NUMERO = '5519998106055';
  var categoriaAtiva = 'Todos';
  var termoBusca = '';

  // ---------- Monta chips de categoria (na ordem em que aparecem nos dados) ----------
  var categorias = [];
  produtos.forEach(function (p) {
    if (categorias.indexOf(p.categoria) === -1) {
      categorias.push(p.categoria);
    }
  });

  function criarChip(nome, contador) {
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'categoria-chip' + (nome === categoriaAtiva ? ' is-active' : '');
    chip.setAttribute('role', 'tab');
    chip.setAttribute('aria-selected', nome === categoriaAtiva ? 'true' : 'false');
    chip.textContent = nome + ' (' + contador + ')';
    chip.addEventListener('click', function () {
      categoriaAtiva = nome;
      categoriasWrap.querySelectorAll('.categoria-chip').forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');
      render();
    });
    return chip;
  }

  categoriasWrap.appendChild(criarChip('Todos', produtos.length));
  categorias.forEach(function (cat) {
    var total = produtos.filter(function (p) { return p.categoria === cat; }).length;
    categoriasWrap.appendChild(criarChip(cat, total));
  });

  // ---------- Busca ----------
  var buscaTimer = null;
  if (buscaInput) {
    buscaInput.addEventListener('input', function () {
      clearTimeout(buscaTimer);
      var valor = buscaInput.value;
      buscaTimer = setTimeout(function () {
        termoBusca = valor.trim().toLowerCase();
        render();
      }, 150);
    });
  }

  // ---------- Formatação ----------
  function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function linkWhatsapp(nome) {
    var texto = 'Olá, vim pelo site e gostaria de saber mais sobre: ' + nome;
    return 'https://wa.me/' + WHATS_NUMERO + '?text=' + encodeURIComponent(texto);
  }

  var iconeSemFoto = '<svg class="catalogo-card-sem-foto" viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 8V4h6v4"/><path d="M7 8h10l1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/></svg>';

  function criarCard(produto) {
    var card = document.createElement('article');
    card.className = 'catalogo-card';

    card.innerHTML =
      '<div class="catalogo-card-img-wrap"></div>' +
      '<div class="catalogo-card-body">' +
        '<p class="catalogo-card-categoria">' + produto.categoria + '</p>' +
        '<h3 class="catalogo-card-nome">' + produto.nome + '</h3>' +
        '<p class="catalogo-card-preco">' + formatarPreco(produto.valor) + ' <span>/ ' + produto.unidade + '</span></p>' +
        '<a class="btn btn-primary" href="' + linkWhatsapp(produto.nome) + '" target="_blank" rel="noopener" data-produto="' + produto.id + '">Consultar no WhatsApp</a>' +
      '</div>';

    var imgWrap = card.querySelector('.catalogo-card-img-wrap');

    if (produto.foto) {
      var img = document.createElement('img');
      img.src = produto.foto;
      img.alt = produto.nome;
      img.loading = 'lazy';
      img.addEventListener('error', function () {
        imgWrap.innerHTML = iconeSemFoto;
      });
      imgWrap.appendChild(img);
    } else {
      imgWrap.innerHTML = iconeSemFoto;
    }

    return card;
  }

  function render() {
    var filtrados = produtos.filter(function (p) {
      var passaCategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
      var passaBusca = !termoBusca || p.nome.toLowerCase().indexOf(termoBusca) !== -1;
      return passaCategoria && passaBusca;
    });

    grid.innerHTML = '';
    var fragment = document.createDocumentFragment();
    filtrados.forEach(function (p) {
      fragment.appendChild(criarCard(p));
    });
    grid.appendChild(fragment);

    vazio.hidden = filtrados.length > 0;
    contagem.textContent = filtrados.length === produtos.length
      ? filtrados.length + ' produtos disponíveis'
      : filtrados.length + ' de ' + produtos.length + ' produtos';
  }

  render();

  var MOBILE_BREAKPOINT = 768;

  // ---------- Mobile: botão de grade abre/fecha os chips de categoria (comecam recolhidos) ----------
  var filtroToggle = document.getElementById('catalogoFiltroToggle');
  if (filtroToggle && categoriasWrap) {
    filtroToggle.addEventListener('click', function () {
      var aberto = categoriasWrap.classList.toggle('is-open');
      filtroToggle.classList.toggle('is-active', aberto);
      filtroToggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      filtroToggle.setAttribute('aria-label', aberto ? 'Esconder categorias' : 'Mostrar categorias');
    });
  }

  // ---------- Desktop: esconde os chips de categoria ao rolar para baixo, mantendo a busca visível ----------
  if (categoriasWrap) {
    var ultimoScroll = window.scrollY || window.pageYOffset;
    var tickingScroll = false;

    function onScrollToolbar() {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        tickingScroll = false;
        return;
      }

      var scrollAtual = window.scrollY || window.pageYOffset;
      var diferenca = scrollAtual - ultimoScroll;

      if (scrollAtual < 80) {
        categoriasWrap.classList.remove('is-hidden');
      } else if (diferenca > 4) {
        categoriasWrap.classList.add('is-hidden');
      } else if (diferenca < -4) {
        categoriasWrap.classList.remove('is-hidden');
      }

      ultimoScroll = scrollAtual;
      tickingScroll = false;
    }

    window.addEventListener('scroll', function () {
      if (!tickingScroll) {
        window.requestAnimationFrame(onScrollToolbar);
        tickingScroll = true;
      }
    }, { passive: true });
  }
});
