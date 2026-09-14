import type { Messages } from './en';

export const ptBR: Messages = {
  common: {
    skipToContent: 'Pular para o conteúdo',
    or: 'ou',
    planned: 'Planejado',
    getStarted: 'Começar',
    loading: 'Carregando\u2026',
  },

  nav: {
    identify: 'O que ele identifica',
    goal: 'Nosso objetivo',
    connect: 'Conexões',
    primaryLabel: 'Principal',
    footerLabel: 'Rodapé',
  },

  hero: {
    eyebrow: 'Catálogo de campo',
    title: 'Saiba o que cresce ao seu redor.',
    lede: 'Fotografe qualquer coisa que cresça. O Marka diz o que é e guarda cada achado em um catálogo que pertence a você.',
    primaryCta: 'Comece seu catálogo',
    secondaryCta: 'Veja o que ele identifica',
    subjectsLabel: 'O que o Marka identifica',
  },

  identify: {
    eyebrow: 'O que ele identifica',
    title: 'Aponte para qualquer coisa que cresça.',
    intro:
      'Flores, fungos, árvores: a mesma foto, o mesmo catálogo. O que muda é quanta certeza o Marka pode honestamente oferecer, e ele sempre avisa.',
  },

  subjects: {
    flowers: {
      label: 'Flores',
      headline: 'Flores silvestres e de jardim',
      text: 'Resultados ordenados com as características por trás de cada um: número de pétalas, disposição das folhas e onde você estava ao tirar a foto.',
      caveat: 'Cada resultado mostra sua confiança. Nunca um palpite silencioso.',
    },
    fungi: {
      label: 'Fungos',
      headline: 'Cogumelos e orelhas-de-pau',
      text: 'Identificados como todo o resto, e avisando com clareza quando um resultado não é forte o bastante para confiar. Com fungos, essa costuma ser a resposta honesta.',
      caveat:
        'Nunca colha com base apenas em uma identificação. O Marka é um catálogo, não uma autoridade sobre o que é seguro comer.',
    },
    trees: {
      label: 'Árvores',
      headline: 'Árvores, arbustos e seus frutos',
      text: 'Conferidos quanto ao status de conservação enquanto você registra, para você saber quando algo que cresce perto de você está ameaçado.',
      caveat: 'Status de conservação obtido da Lista Vermelha da IUCN.',
    },
  },

  goal: {
    eyebrow: 'Nosso objetivo',
    title: 'Um registro do que cresce aqui, antes que não cresça mais.',
    body1:
      'A maior parte dos registros de plantas ainda está presa em cadernos e galerias de fotos. O Marka existe para transformar os seus em algo legível: datado, localizado, nomeado e seu para exportar.',
    body2:
      'Catalogar para você mesmo é o ponto. Que o resultado seja também o tipo de registro do qual o trabalho de conservação depende é a razão de termos feito assim.',
  },

  connect: {
    eyebrow: 'Conexões',
    title: 'Feito para se conectar aos registros que já existem.',
    text: 'Já existe uma infraestrutura aberta e funcional de dados de biodiversidade, e o Marka não tem interesse em substituí-la. Estes são os serviços aos quais pretendemos nos conectar, para que seu catálogo nunca fique preso em um só aplicativo.',
    inaturalist: 'Envie uma observação que você aprovou para a comunidade que vai verificá-la.',
    gbif: 'O registro global de ocorrências que pesquisadores realmente consultam. Seus achados podem chegar lá.',
    iucn: 'O status de conservação por trás de cada alerta de espécie ameaçada do Marka.',
    plantnet: 'Uma segunda opinião sobre uma identificação quando a primeira não convence.',
  },

  closing: {
    title: 'Comece pela que está na sua janela.',
    text: 'Um catálogo não precisa começar com uma expedição. Fotografe o que estiver mais perto e veja o que o Marka faz com isso.',
    primaryCta: 'Comece seu catálogo',
    secondaryCta: 'Veja como funciona',
  },

  footer: {
    tagline: 'Um catálogo do que cresce ao seu redor.',
  },

  auth: {
    quote: 'Cada planta que você registra é mais uma coisa conhecida sobre onde você vive.',
    quoteMeta: 'Flores, fungos e árvores',

    signInTitle: 'Bem-vindo de volta',
    signInSubtitle: 'Entre para retomar seu catálogo de onde parou.',
    signInSubmit: 'Entrar',
    newHere: 'Novo por aqui?',
    createAccount: 'Crie uma conta',

    signUpTitle: 'Comece seu catálogo',
    signUpSubtitle:
      'Uma conta, todas as plantas que você registrar. Gratuito enquanto o Marka está sendo feito.',
    signUpSubmit: 'Criar conta',
    haveAccount: 'Já tem uma conta?',
    signInLink: 'Entrar',

    resetTitle: 'Escolha uma nova senha',

    emailLabel: 'E-mail',
    emailPlaceholder: 'voce@exemplo.com',
    passwordLabel: 'Senha',
    passwordHint:
      'Pelo menos 8 caracteres, com uma letra mai\u00fascula, uma min\u00fascula e um n\u00famero.',
    forgotPassword: 'Esqueceu sua senha?',
    forgotTitle: 'Redefina sua senha',
    forgotSubtitle:
      'Digite o endere\u00e7o com que voc\u00ea se cadastrou e enviaremos um c\u00f3digo por e-mail.',
    forgotSubmit: 'Enviar c\u00f3digo',
    newPasswordLabel: 'Nova senha',
    resetSubmit: 'Salvar nova senha',
    resetDone: 'Senha atualizada. Entre com sua nova senha.',
    rememberedIt: 'Lembrou?',
    useDifferentEmail: 'Usar outro endere\u00e7o',
    verifiedNotice: 'E-mail verificado. Entre para continuar.',
    submitting: 'Só um momento…',
    continueWithGoogle: 'Continuar com o Google',
    emailTaken: 'Esse endere\u00e7o j\u00e1 tem uma conta. Entre com ela.',
    notConfirmed: 'Esta conta ainda precisa ser verificada. Enviamos um novo c\u00f3digo.',
    networkError:
      'N\u00e3o conseguimos falar com o servidor. Verifique sua conex\u00e3o e tente de novo.',
    googleUnavailable: 'O login com Google n\u00e3o est\u00e1 configurado nesta vers\u00e3o.',
    googleFailed: 'O login com Google n\u00e3o foi conclu\u00eddo. Tente novamente.',
    completingSignIn: 'Concluindo o login\u2026',
    genericError: 'Algo deu errado. Tente novamente.',
  },

  verify: {
    title: 'Confira seu e-mail',
    sentToLead: 'Enviamos um c\u00f3digo de seis d\u00edgitos para',
    expiry: 'O c\u00f3digo expira em 15 minutos.',
    codeLabel: 'C\u00f3digo de verifica\u00e7\u00e3o',
    submit: 'Verificar e-mail',
    submitting: 'Conferindo\u2026',
    resend: 'Enviar um novo c\u00f3digo',
    resendIn: (seconds: number) => `Voc\u00ea pode pedir um novo c\u00f3digo em ${seconds}s`,
    resent: 'Um novo c\u00f3digo est\u00e1 a caminho.',
    spamHint: 'Nada ainda? Pode estar na sua caixa de spam.',
    wrongAddress: 'Endere\u00e7o errado?',
    startOver: 'Recome\u00e7ar',
    noPendingTitle: 'Nada para verificar',
    noPendingSubtitle:
      'N\u00e3o h\u00e1 nenhum cadastro pendente neste dispositivo. Crie uma conta e enviaremos um c\u00f3digo.',
    codeIncorrect: 'Esse c\u00f3digo n\u00e3o est\u00e1 certo. Confira e tente de novo.',
    codeExpired: 'Esse c\u00f3digo expirou. Pe\u00e7a um novo.',
  },

  app: {
    title: 'Seu cat\u00e1logo',
    subtitle: 'Voc\u00ea entrou. Seus registros de plantas v\u00e3o aparecer aqui.',
    signOut: 'Sair',
    openCatalogue: 'Abrir cat\u00e1logo',
    checking: 'Verificando sua sess\u00e3o\u2026',
    connectionOk: 'Conectado \u00e0 API do Marka.',
    connectionFailed: 'N\u00e3o foi poss\u00edvel acessar a API do Marka.',
  },

  validation: {
    emailRequired: 'Digite seu e-mail.',
    emailInvalid: 'Isso não parece um e-mail. Verifique se há erro de digitação.',
    passwordRequired: 'Digite sua senha.',
    passwordTooShort: 'Use pelo menos 8 caracteres.',
    passwordNeedsLower: 'Adicione uma letra min\u00fascula.',
    passwordNeedsUpper: 'Adicione uma letra mai\u00fascula.',
    passwordNeedsDigit: 'Adicione um n\u00famero.',
    codeRequired: 'Digite o c\u00f3digo de seis d\u00edgitos.',
    codeInvalid: 'O c\u00f3digo tem seis d\u00edgitos.',
  },

  a11y: {
    languageGroup: 'Idioma',
    codeProgress: (filled: number, total: number) =>
      `${filled} de ${total} d\u00edgitos preenchidos`,
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
    switchToDark: 'Mudar para o tema escuro',
    switchToLight: 'Mudar para o tema claro',
    switchToPortuguese: 'Mudar para português',
    switchToEnglish: 'Switch to English',
  },
};
