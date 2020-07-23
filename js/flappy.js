function novoElemento(tagName, className) {
    const element = document.createElement(tagName)
    element.className = className
    return element
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altuta => corpo.style.height = `${altuta}px`
}

function ParDeBarreiras(altuta, abertura, posicao) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.barreiraSuperior = new Barreira(true)
    this.barreiraInferior = new Barreira(false)

    this.elemento.appendChild(this.barreiraSuperior.elemento)
    this.elemento.appendChild(this.barreiraInferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altuta - abertura)
        const alturaInferior = altuta - abertura - alturaSuperior
        this.barreiraSuperior.setAltura(alturaSuperior)
        this.barreiraInferior.setAltura(alturaInferior)
    }

    this.getPosicaoX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setPosicaoX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setPosicaoX(posicao)
}

function Barreiras(altura, largura, abertura, espaco, contarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animacao = () => {
        this.pares.forEach(par => {
            par.setPosicaoX(par.getPosicaoX() - deslocamento)

            // Quando o elemento sair da área de jogo
            if (par.getPosicaoX() < -par.getLargura()) {
                par.setPosicaoX(par.getPosicaoX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            // Contar ponto
            const meio = largura / 2
            const cruzouOMeio = par.getPosicaoX() + deslocamento >= meio && par.getPosicaoX() < meio
            if (cruzouOMeio) contarPonto()
        });
    }
}

function Passaro(alturaJogo) {
    let voando = false
    
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = '../img/passaro.png'

    this.getPosicaoY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setPosicaoY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animacao = () => {
        const novaPosicaoY = this.getPosicaoY() + (voando ? 8 : -5)
        const alturaMaximaDeVoo = alturaJogo - this.elemento.clientHeight
        
        if (novaPosicaoY <= 0) {
            this.setPosicaoY(0)
        } else if (novaPosicaoY >= alturaMaximaDeVoo) {
            this.setPosicaoY(alturaMaximaDeVoo)
        } else {
            this.setPosicaoY(novaPosicaoY)
        }
    }

    this.setPosicaoY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = new novoElemento('span', 'progresso')
    this.atualizarPontos = ponto => {
        this.elemento.innerHTML = ponto
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.barreiraSuperior.elemento
            const inferior = parDeBarreiras.barreiraInferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
        }
    })

    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animacao()
            passaro.animacao()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
                window.onkeypress = () => {
                    window.location.reload()
                }
            }
        },20)
    }
}

new FlappyBird().start()