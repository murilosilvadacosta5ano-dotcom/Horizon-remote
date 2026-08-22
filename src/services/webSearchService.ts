export interface RecipeData {
  title: string;
  category: string;
  prepTime: string;
  yields: string;
  difficulty: string;
  description: string;
  imageUrl: string;
  youtubeEmbedUrl?: string;
  youtubeWatchUrl?: string;
  ingredients: {
    section?: string;
    items: string[];
  }[];
  instructions: {
    section?: string;
    steps: string[];
  }[];
  chefTip?: string;
  sources: { name: string; url: string }[];
}

export interface GenericRecipeCategory {
  title: string;
  promptQuestion: string;
  intro: string;
  options: {
    name: string;
    query: string;
    desc: string;
    icon: string;
  }[];
  sources: { name: string; url: string }[];
}

export const POPULAR_RECIPE_CATEGORIES: Record<string, GenericRecipeCategory> = {
  bolos: {
    title: 'Receitas de Bolos Caseiros e Confeitados',
    promptQuestion: 'Encontrei mais de 120 receitas de bolos nos principais sites de culinária. Qual tipo de bolo você gostaria de preparar?',
    intro: 'Aqui estão as variedades mais buscadas e bem avaliadas da internet (com ingredientes, passo a passo completo, fotos e vídeos):',
    options: [
      { name: 'Bolo de Chocolate Fofinho', query: 'bolo de chocolate', desc: 'Massa super úmida com calda cremosa de brigadeiro', icon: '🍫' },
      { name: 'Bolo de Cenoura com Chocolate', query: 'bolo de cenoura', desc: 'O clássico brasileiro com cobertura crocante ou cremosa', icon: '🥕' },
      { name: 'Bolo de Fubá Cremoso', query: 'bolo de fuba', desc: 'Fica com camada cremosa de queijo no meio', icon: '🌽' },
      { name: 'Bolo de Laranja Caseiro', query: 'bolo de laranja', desc: 'Massa fofinha com calda de suco natural da fruta', icon: '🍊' },
      { name: 'Bolo de Banana com Canela', query: 'bolo de banana', desc: 'Fácil de liquidificador, caramelizado e perfumado', icon: '🍌' },
      { name: 'Bolo de Milho de Lata', query: 'bolo de milho', desc: 'Prático e muito cremoso feito no liquidificador', icon: '🌽' },
      { name: 'Bolo Red Velvet', query: 'bolo red velvet', desc: 'Aveludado com recheio de cream cheese tradicional', icon: '🍓' },
      { name: 'Bolo de Caneca Micro-ondas', query: 'bolo de caneca', desc: 'Pronto em apenas 3 minutos, perfeito para matar a vontade', icon: '☕' }
    ],
    sources: [
      { name: 'TudoGostoso - Bolos', url: 'https://www.tudogostoso.com.br/busca?q=bolo' },
      { name: 'Receitas Globo', url: 'https://receitas.globo.com/busca/?q=bolo' },
      { name: 'Panelinha Rita Lobo', url: 'https://www.panelinha.com.br/busca/bolo' }
    ]
  },
  doces: {
    title: 'Receitas de Doces e Sobremesas',
    promptQuestion: 'Pesquisei no banco de receitas de sobremesas. Qual doce você gostaria de fazer hoje?',
    intro: 'Confira as sobremesas mais populares e fáceis de preparar:',
    options: [
      { name: 'Brigadeiro Gourmet Tradicional', query: 'brigadeiro', desc: 'Ponto de enrolar brilhante e super macio', icon: '🍫' },
      { name: 'Pudim de Leite Condensado', query: 'pudim de leite condensado', desc: 'Sem furinhos, com calda de caramelo dourada', icon: '🍮' },
      { name: 'Torta de Limão com Merengue', query: 'torta de limao', desc: 'Base crocante de biscoito e recheio azedinho', icon: '🍋' },
      { name: 'Mousse de Maracujá', query: 'mousse de maracuja', desc: 'Apenas 3 ingredientes no liquidificador', icon: '🟡' },
      { name: 'Brownie de Chocolate Intenso', query: 'brownie', desc: 'Casquinha craquelada e centro bem chocolatudo', icon: '🟫' }
    ],
    sources: [
      { name: 'TudoGostoso - Doces', url: 'https://www.tudogostoso.com.br/busca?q=sobremesas' },
      { name: 'CyberCook', url: 'https://cybercook.com.br/receitas/doces' }
    ]
  },
  massas: {
    title: 'Massas, Pizzas e Salgados',
    promptQuestion: 'Encontrei diversas opções de pratos salgados e massas caseiras. O que você quer preparar?',
    intro: 'Escolha uma das receitas completas abaixo:',
    options: [
      { name: 'Lasanha à Bolonhesa', query: 'lasanha', desc: 'Camadas de molho de carne e bechamel cremoso', icon: '🍝' },
      { name: 'Macarrão Carbonara Clássico', query: 'carbonara', desc: 'Sem creme de leite, feito com ovos e queijo', icon: '🍳' },
      { name: 'Strogonoff de Frango / Carne', query: 'strogonoff', desc: 'Molho cremoso com cogumelos e batata palha', icon: '🍲' },
      { name: 'Pão de Queijo Mineiro', query: 'pao de queijo', desc: 'Crocante por fora e puxa-puxa por dentro', icon: '🧀' },
      { name: 'Panqueca de Carne Moída', query: 'panqueca', desc: 'Massa fininha e molho de tomate gratinado', icon: '🥞' }
    ],
    sources: [
      { name: 'TudoGostoso - Salgados', url: 'https://www.tudogostoso.com.br/busca?q=salgados' },
      { name: 'Receitas Globo', url: 'https://receitas.globo.com/busca/?q=massas' }
    ]
  }
};

export const DETAILED_RECIPES: Record<string, RecipeData> = {
  'bolo de chocolate': {
    title: 'Bolo de Chocolate Fofinho com Calda Cremosa',
    category: 'Bolos e Confeitaria',
    prepTime: '45 minutos',
    yields: '12 porções',
    difficulty: 'Fácil',
    description: 'Receita clássica de bolo de chocolate super fofo, úmido e perfumado, acompanhado de uma generosa calda de brigadeiro brilhante que penetra na massa.',
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/n4p_q0tE080',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=n4p_q0tE080',
    ingredients: [
      {
        section: 'Massa do Bolo',
        items: [
          '3 ovos inteiros em temperatura ambiente',
          '1 xícara (chá) de açúcar cristal ou refinado',
          '1/2 xícara (chá) de óleo de girassol ou milho',
          '1 xícara (chá) de chocolate em pó 50% cacau (ou cacau em pó)',
          '1 xícara (chá) de água quente (dá muita umidade)',
          '2 xícaras (chá) de farinha de trigo peneirada',
          '1 colher (sopa) de fermento químico em pó para bolo',
          '1 pitada de sal'
        ]
      },
      {
        section: 'Calda Cremosa de Brigadeiro',
        items: [
          '1 lata de leite condensado (395g)',
          '1 caixinha de creme de leite (200g)',
          '3 colheres (sopa) de chocolate em pó 50%',
          '1 colher (sopa) de manteiga sem sal',
          'Granulado de chocolate para decorar a gosto'
        ]
      }
    ],
    instructions: [
      {
        section: 'Preparo da Massa',
        steps: [
          'Preaqueça o forno a 180°C e unte uma forma média (com furo central ou retangular) com manteiga e chocolate em pó.',
          'Em uma tigela ou liquidificador, bata os ovos com o açúcar e o óleo por cerca de 2 minutos até obter uma mistura homogênea e clara.',
          'Adicione o chocolate em pó dissolvido na água quente e mexa bem.',
          'Incorpore a farinha de trigo peneirada aos poucos, mexendo suavemente com um fuê de baixo para cima para manter a aeração.',
          'Por último, adicione a pitada de sal e o fermento em pó, misturando delicadamente apenas até incorporar.',
          'Despeje a massa na forma untada e leve ao forno preaquecido a 180°C por aproximadamente 35 a 40 minutos (faça o teste do palito).'
        ]
      },
      {
        section: 'Preparo da Cobertura e Montagem',
        steps: [
          'Em uma panela de fundo grosso, misture o leite condensado, o creme de leite, a manteiga e o chocolate em pó.',
          'Leve ao fogo médio/baixo, mexendo continuamente até começar a ferver e atingir ponto de brigadeiro mole/calda (cerca de 5 a 7 minutos).',
          'Desenforme o bolo ainda morno, faça furinhos leves na superfície com um garfo e despeje a calda quente por cima de todo o bolo.',
          'Finalize decorando com raspas de chocolate ou granulado a gosto.'
        ]
      }
    ],
    chefTip: 'Dica do Chef: Usar água bem quente em vez de leite na massa ativa o cacau, deixando a cor mais escura e a massa incrivelmente fofa e úmida por dias.',
    sources: [
      { name: 'TudoGostoso - Bolo de Chocolate', url: 'https://www.tudogostoso.com.br/receita/23-bolo-de-chocolate-fofinho.html' },
      { name: 'Panelinha Rita Lobo', url: 'https://www.panelinha.com.br/receita/Bolo-de-chocolate' },
      { name: 'Receitas Globo', url: 'https://receitas.globo.com/receitas-da-tv/mais-voce/bolo-de-chocolate-mais-voce.ghtml' }
    ]
  },

  'bolo de cenoura': {
    title: 'Bolo de Cenoura Fofinho com Cobertura Crocante de Chocolate',
    category: 'Bolos Tradicionais',
    prepTime: '50 minutos',
    yields: '12 porções',
    difficulty: 'Fácil',
    description: 'O autêntico bolo de cenoura brasileiro de liquidificador, que não embatuma, super leve e com a clássica calda de chocolate que fica crocante ao esfriar.',
    imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/c-Z7u0-4sL0',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=c-Z7u0-4sL0',
    ingredients: [
      {
        section: 'Massa',
        items: [
          '3 cenouras médias descascadas e picadas (cerca de 250g no total)',
          '4 ovos inteiros',
          '1 xícara (chá) de óleo de girassol ou canola',
          '1 e 1/2 xícara (chá) de açúcar',
          '2 xícaras (chá) de farinha de trigo',
          '1 colher (sopa) de fermento químico em pó'
        ]
      },
      {
        section: 'Calda Crocante de Chocolate',
        items: [
          '1 xícara (chá) de açúcar',
          '1 xícara (chá) de chocolate em pó ou achocolatado',
          '2 colheres (sopa) de manteiga',
          '2 colheres (sopa) de leite'
        ]
      }
    ],
    instructions: [
      {
        section: 'Modo de Preparo da Massa',
        steps: [
          'Bata no liquidificador as cenouras picadas, os ovos e o óleo até ficar um creme bem lisinho e sem pedacinhos (cerca de 3 minutos).',
          'Acrescente o açúcar e bata por mais 1 minuto.',
          'Transfira essa mistura para uma tigela e vá acrescentando a farinha de trigo aos poucos, misturando delicadamente com uma espátula.',
          'Junte o fermento e misture suavemente.',
          'Coloque em forma untada e enfarinhada e asse a 180°C por 40 minutos.'
        ]
      },
      {
        section: 'Calda Crocante',
        steps: [
          'Misture todos os ingredientes da calda em uma panela e leve ao fogo.',
          'Deixe ferver até formar bolhas grandes e soltar do fundo da panela (cerca de 3 a 4 minutos).',
          'Despeje imediatamente sobre o bolo ainda quente para criar a casquinha crocante ao esfriar.'
        ]
      }
    ],
    chefTip: 'Segredo: Pesar as cenouras (cerca de 250g) evita o erro mais comum de colocar cenoura em excesso, o que deixa o bolo pesado ou embatumado.',
    sources: [
      { name: 'TudoGostoso - Bolo de Cenoura', url: 'https://www.tudogostoso.com.br/receita/23-bolo-de-cenoura.html' },
      { name: 'Receitas Nestlé', url: 'https://www.receitasnestle.com.br/receitas/bolo-de-cenoura-com-calda-de-chocolate' }
    ]
  },

  'bolo de fuba': {
    title: 'Bolo de Fubá Cremoso de Liquidificador',
    category: 'Bolos Típicos',
    prepTime: '45 minutos',
    yields: '10 porções',
    difficulty: 'Muito Fácil',
    description: 'Aquele bolo de fubá com gostinho de casa de vó que sai do forno com uma camada cremosa irresistível no meio.',
    imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/T0m4zV9gTcs',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=T0m4zV9gTcs',
    ingredients: [
      {
        section: 'Ingredientes da Massa Única',
        items: [
          '3 ovos inteiros',
          '3 xícaras (chá) de leite integral',
          '1 e 1/2 xícara (chá) de açúcar',
          '1 xícara (chá) de fubá mimoso fino',
          '3 colheres (sopa) de farinha de trigo',
          '2 colheres (sopa) de manteiga derretida',
          '50g de queijo parmesão ralado de boa qualidade',
          '1 colher (sopa) de fermento químico em pó'
        ]
      }
    ],
    instructions: [
      {
        section: 'Modo de Preparo',
        steps: [
          'Coloque todos os ingredientes líquidos e secos (exceto o fermento) no liquidificador e bata por 2 minutos. A massa fica bem líquida mesmo, é normal!',
          'Adicione o fermento em pó e acione o pulsar do liquidificador 2 a 3 vezes apenas para misturar.',
          'Despeje em uma forma untada com manteiga e polvilhada com fubá ou farinha.',
          'Asse em forno preaquecido a 180°C por 40 a 45 minutos até dourar a superfície.',
          'Deixe amornar antes de cortar para a camada de queijo firmar no centro.'
        ]
      }
    ],
    chefTip: 'O queijo parmesão combinado com a proporção de leite é o que faz a mágica da separação da camada cremosa!',
    sources: [
      { name: 'Panelinha', url: 'https://www.panelinha.com.br/receita/Bolo-de-fuba-cremoso' },
      { name: 'TudoGostoso', url: 'https://www.tudogostoso.com.br/receita/459-bolo-de-fuba-cremoso.html' }
    ]
  },

  'bolo de laranja': {
    title: 'Bolo de Laranja Caseiro Fofinho com Calda',
    category: 'Bolos Caseiros',
    prepTime: '40 minutos',
    yields: '10 porções',
    difficulty: 'Muito Fácil',
    description: 'Bolo de laranja super macio feito no liquidificador com casca, molhadinho com calda natural de suco de laranja.',
    imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/rQkXW0qYIbc',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=rQkXW0qYIbc',
    ingredients: [
      {
        section: 'Massa do Bolo',
        items: [
          '1 laranja pera inteira sem sementes e sem a parte branca central (com casca)',
          '1 xícara de suco de laranja natural',
          '3 ovos inteiros',
          '1 xícara de óleo de girassol',
          '2 xícaras de açúcar refinado',
          '2 xícaras de farinha de trigo',
          '1 colher (sopa) de fermento em pó'
        ]
      },
      {
        section: 'Calda Natural',
        items: [
          '1 xícara de suco de laranja coado',
          '3 colheres (sopa) de açúcar'
        ]
      }
    ],
    instructions: [
      {
        section: 'Modo de Preparo',
        steps: [
          'Retire a parte branca do centro da laranja para não amargar.',
          'Bata no liquidificador a laranja picada, os ovos, o óleo, o suco e o açúcar por 3 minutos.',
          'Transfira para uma tigela e adicione a farinha de trigo peneirada, misturando com fuê.',
          'Incorpore o fermento delicadamente.',
          'Asse em forma untada a 180°C por 35 a 40 minutos.',
          'Para a calda: misture o suco com açúcar, aqueça levemente e regue o bolo morno furadinho com garfo.'
        ]
      }
    ],
    chefTip: 'Retirar todo o miolo branco da laranja garante aroma cítrico delicioso sem qualquer amargor.',
    sources: [
      { name: 'TudoGostoso - Bolo de Laranja', url: 'https://www.tudogostoso.com.br/busca?q=bolo+de+laranja' }
    ]
  },

  'bolo de banana': {
    title: 'Bolo de Banana com Canela Caramelizado',
    category: 'Bolos Caseiros',
    prepTime: '45 minutos',
    yields: '12 porções',
    difficulty: 'Fácil',
    description: 'Bolo fofo e perfumado com bananas maduras e canela, com fundo caramelizado irresistível.',
    imageUrl: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/5_qWq0Z9p8M',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=5_qWq0Z9p8M',
    ingredients: [
      {
        section: 'Caramelo e Cobertura',
        items: [
          '1 xícara de açúcar para caramelizar a forma',
          '4 bananas nanicas cortadas em fatias no comprimento'
        ]
      },
      {
        section: 'Massa',
        items: [
          '3 ovos inteiros',
          '3 bananas maduras amassadas',
          '1/2 xícara de óleo ou manteiga derretida',
          '1 xícara de leite',
          '1 e 1/2 xícara de açúcar',
          '2 xícaras de farinha de trigo ou aveia',
          '1 colher (chá) de canela em pó',
          '1 colher (sopa) de fermento químico'
        ]
      }
    ],
    instructions: [
      {
        section: 'Modo de Preparo',
        steps: [
          'Derreta o açúcar direto na forma até caramelizar e distribua as bananas fatiadas no fundo.',
          'Bata os ovos, óleo, açúcar e bananas no liquidificador.',
          'Misture a farinha, canela e o fermento suavemente.',
          'Despeje sobre as bananas caramelizadas e asse a 180°C por 40 minutos.',
          'Desenforme ainda morno para o caramelo não grudar.'
        ]
      }
    ],
    chefTip: 'Usar bananas bem maduras (com pintinhas pretas) deixa a massa naturalmente doce e muito úmida.',
    sources: [
      { name: 'Receitas Globo', url: 'https://receitas.globo.com/busca/?q=bolo+de+banana' }
    ]
  },

  'bolo de milho': {
    title: 'Bolo de Milho de Lata Cremoso de Liquidificador',
    category: 'Bolos Típicos',
    prepTime: '40 minutos',
    yields: '10 porções',
    difficulty: 'Muito Fácil',
    description: 'A receita mais prática do Brasil: usa a própria lata de milho como medida para todos os ingredientes.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/zR7cE_vXp2I',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=zR7cE_vXp2I',
    ingredients: [
      {
        section: 'Ingredientes (Medida: 1 Lata de Milho)',
        items: [
          '1 lata de milho verde escorrida',
          '1 lata de leite integral',
          '1 lata de açúcar',
          '1/2 lata de óleo',
          '1 lata de flocão de milho ou fubá',
          '3 ovos inteiros',
          '50g de coco ralado ou queijo parmesão',
          '1 colher (sopa) de fermento em pó'
        ]
      }
    ],
    instructions: [
      {
        section: 'Modo de Preparo',
        steps: [
          'Escorra a água do milho e coloque todos os ingredientes (exceto o fermento e coco) no liquidificador.',
          'Bata por 3 minutos até triturar bem o milho.',
          'Acrescente o coco ralado e o fermento, batendo apenas na função pulsar.',
          'Despeje em forma com furo untada e enfarinhada.',
          'Asse a 180°C por cerca de 40 a 45 minutos até dourar.'
        ]
      }
    ],
    chefTip: 'Fica com uma textura úmida e cremosa irresistível, perfeita com café fresco.',
    sources: [
      { name: 'TudoGostoso', url: 'https://www.tudogostoso.com.br/receita/5312-bolo-de-milho-cremoso.html' }
    ]
  },

  'bolo de caneca': {
    title: 'Bolo de Caneca de Chocolate Micro-ondas (3 Minutos)',
    category: 'Receitas Rápidas',
    prepTime: '3 minutos',
    yields: '1 porção individual',
    difficulty: 'Super Fácil',
    description: 'A salvação para aquela vontade urgente de doce: feito direto na caneca no micro-ondas, super fofinho.',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/yvC8ZqVpQ1Y',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=yvC8ZqVpQ1Y',
    ingredients: [
      {
        section: 'Ingredientes na Caneca (300ml)',
        items: [
          '1 ovo pequeno',
          '2 colheres (sopa) de leite',
          '2 colheres (sopa) de óleo',
          '2 colheres (sopa) rasas de açúcar',
          '2 colheres (sopa) de chocolate em pó 50%',
          '3 colheres (sopa) rasas de farinha de trigo',
          '1 colher (café) de fermento em pó',
          '1 quadradinho de chocolate no meio (opcional para derreter)'
        ]
      }
    ],
    instructions: [
      {
        section: 'Modo de Preparo',
        steps: [
          'Na própria caneca, bata bem o ovo com um garfo.',
          'Adicione o leite, óleo, açúcar e chocolate em pó, misturando bem.',
          'Acrescente a farinha e o fermento, mexendo delicadamente até ficar homogêneo.',
          'Coloque o quadradinho de chocolate no centro da massa.',
          'Leve ao micro-ondas em potência alta por 1 minuto e 30 segundos a 2 minutos.',
          'Polvilhe chocolate ou cubra com calda de brigadeiro e saboreie quente!'
        ]
      }
    ],
    chefTip: 'Não encha mais de 2/3 da caneca para a massa não transbordar ao crescer no micro-ondas.',
    sources: [
      { name: 'TudoGostoso', url: 'https://www.tudogostoso.com.br/busca?q=bolo+de+caneca' }
    ]
  },

  'bolo red velvet': {
    title: 'Bolo Red Velvet Tradicional com Cobertura Cream Cheese',
    category: 'Confeitaria Fina',
    prepTime: '55 minutos',
    yields: '12 porções',
    difficulty: 'Média',
    description: 'O clássico veludo vermelho americano com massa fofa amanteigada e frosting aveludado de cream cheese.',
    imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/gq3K-t8Fp9s',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=gq3K-t8Fp9s',
    ingredients: [
      {
        section: 'Massa Red Velvet',
        items: [
          '3 ovos em temperatura ambiente',
          '1 e 1/2 xícara de açúcar',
          '100g de manteiga sem sal em ponto de pomada',
          '1 colher (sopa) de cacau em pó 100%',
          '1 colher (sopa) de corante vermelho em gel alimentício',
          '1 xícara de leitelho (1 xícara de leite + 1 colher de vinagre de maçã descansado 10min)',
          '2 e 1/2 xícaras de farinha de trigo peneirada',
          '1 colher (chá) de bicarbonato de sódio + 1 colher (chá) de vinagre branco',
          '1 colher (chá) de extrato de baunilha'
        ]
      },
      {
        section: 'Frosting de Cream Cheese',
        items: [
          '300g de cream cheese gelado',
          '150g de manteiga em temperatura ambiente',
          '1 e 1/2 xícara de açúcar de confeiteiro peneirado',
          '1 colher (chá) de extrato de baunilha'
        ]
      }
    ],
    instructions: [
      {
        section: 'Modo de Preparo',
        steps: [
          'Bata a manteiga com o açúcar até formar um creme fofo e claro. Junte os ovos um a um e a baunilha.',
          'Dissolva o corante e o cacau no leitelho.',
          'Alterne a adição da farinha e do leitelho colorido na batedeira em velocidade baixa.',
          'Por fim, misture o bicarbonato com o vinagre (vai efervescer) e adicione imediatamente à massa.',
          'Asse a 180°C por 35 minutos.',
          'Frosting: Bata a manteiga com o açúcar de confeiteiro e incorpore o cream cheese gelado aos poucos sem bater em excesso.',
          'Recheie e cubra o bolo já frio.'
        ]
      }
    ],
    chefTip: 'A reação ácida do leitelho com o bicarbonato e cacau cria a textura aveludada característica.',
    sources: [
      { name: 'Panelinha', url: 'https://www.panelinha.com.br/busca/red-velvet' }
    ]
  },

  'brigadeiro': {
    title: 'Brigadeiro Gourmet Tradicional (Ponto Perfeito)',
    category: 'Doces Brasileiros',
    prepTime: '20 minutos',
    yields: '25 unidades',
    difficulty: 'Fácil',
    description: 'O doce mais amado do Brasil em sua melhor versão gourmet: macio, brilhante, que derrete na boca e dura dias sem cristalizar.',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/a7NqEaW5a0Q',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=a7NqEaW5a0Q',
    ingredients: [
      {
        section: 'Ingredientes',
        items: [
          '1 lata de leite condensado integral de boa qualidade',
          '1 caixinha de creme de leite (200g)',
          '4 colheres (sopa) de chocolate em pó 50% ou 100g de chocolate nobre picado',
          '1 colher (sopa) de manteiga sem sal (15g)',
          'Granulado de chocolate nobre para bolear'
        ]
      }
    ],
    instructions: [
      {
        section: 'Modo de Preparo',
        steps: [
          'Em uma panela de fundo grosso fora do fogo, dissolva o chocolate em pó no leite condensado.',
          'Junte o creme de leite e a manteiga, misturando bem.',
          'Ligue o fogo médio/baixo e mexa constantemente com espátula de silicone raspando bem o fundo e as laterais.',
          'Cozinhe até a massa soltar totalmente do fundo da panela (ao inclinar a panela, a massa cai em bloco).',
          'Transfira para um prato untado, cubra com plástico filme em contato e deixe esfriar completamente em temperatura ambiente.',
          'Unte as mãos com manteiga ou água, faça bolinhas de 15g a 20g e passe no granulado.'
        ]
      }
    ],
    chefTip: 'O creme de leite quebra a doçura excessiva e garante textura aveludada sem cristalizar.',
    sources: [
      { name: 'Receitas Globo', url: 'https://receitas.globo.com/receitas/brigadeiro-gourmet.ghtml' }
    ]
  },

  'strogonoff': {
    title: 'Strogonoff de Frango Clássico e Cremoso',
    category: 'Pratos Principais',
    prepTime: '30 minutos',
    yields: '4 porções',
    difficulty: 'Fácil',
    description: 'Strogonoff com molho encorpado, frango suculento e o equilíbrio perfeito de mostarda e ketchup.',
    imageUrl: 'https://images.unsplash.com/photo-1547496502-affa22d38842?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/n3oJ7UoW3sU',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=n3oJ7UoW3sU',
    ingredients: [
      {
        section: 'Ingredientes',
        items: [
          '700g de peito de frango cortado em cubos médios',
          '1 cebola média picadinha',
          '2 dentes de alho amassados',
          '2 caixinhas de creme de leite (400g)',
          '3 colheres (sopa) de ketchup',
          '2 colheres (sopa) de mostarda amarela ou dijon',
          '1 colher (sopa) de molho inglês',
          '1 xícara de champignon fatiado (opcional)',
          'Sal, pimenta-do-reino e azeite a gosto',
          'Batata palha e arroz branco para acompanhar'
        ]
      }
    ],
    instructions: [
      {
        section: 'Modo de Preparo',
        steps: [
          'Tempere os cubos de frango com sal, pimenta e alho.',
          'Em uma panela aquecida com azeite, doure o frango em fogo alto aos poucos para não juntar água.',
          'Adicione a cebola e refogue até murchar e dourar.',
          'Junte a mostarda, o ketchup, o molho inglês e o champignon, mexendo por 2 minutos.',
          'Abaixe o fogo, adicione o creme de leite e mexa delicadamente até aquecer bem sem deixar ferver.',
          'Ajuste o sal e sirva com arroz quente e batata palha crocante.'
        ]
      }
    ],
    chefTip: 'Não deixe o creme de leite ferver para evitar que talhe o molho.',
    sources: [
      { name: 'TudoGostoso', url: 'https://www.tudogostoso.com.br/receita/246-strogonoff-de-frango.html' }
    ]
  },

  'pudim de leite condensado': {
    title: 'Pudim de Leite Condensado Lisinho (Sem Furinhos)',
    category: 'Sobremesas Clássicas',
    prepTime: '1 hora + geladeira',
    yields: '8 fatias',
    difficulty: 'Fácil',
    description: 'Pudim clássico aveludado, super cremoso, com calda de caramelo brilhante e textura que derrete na boca.',
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=1000&auto=format&fit=crop',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/BvW4-tK6w3w',
    youtubeWatchUrl: 'https://www.youtube.com/watch?v=BvW4-tK6w3w',
    ingredients: [
      {
        section: 'Calda de Caramelo',
        items: [
          '1 xícara (chá) de açúcar cristal',
          '1/2 xícara (chá) de água quente'
        ]
      },
      {
        section: 'Pudim',
        items: [
          '1 lata de leite condensado (395g)',
          'A mesma medida da lata de leite integral',
          '3 ovos inteiros passados na peneira',
          '1 colher (chá) de extrato de baunilha (opcional)'
        ]
      }
    ],
    instructions: [
      {
        section: 'Modo de Preparo',
        steps: [
          'Calda: Derreta o açúcar em fogo baixo até caramelizar, adicione a água quente com cuidado e mexa até dissolver. Caramelize a forma com furo.',
          'Pudim: Bata no liquidificador o leite condensado, o leite e os ovos por 1 minuto (ou misture com fuê para não criar bolhas de ar).',
          'Passe a mistura por uma peneira ao despejar na forma caramelizada.',
          'Cubra com papel alumínio e asse em banho-maria (água já quente com gotas de vinagre) a 160°C por cerca de 1h a 1h20.',
          'Deixe esfriar e leve à geladeira por no mínimo 4 horas antes de desenformar.'
        ]
      }
    ],
    chefTip: 'Assar em temperatura baixa (160°C) em banho-maria garante que o pudim fique 100% lisinho e sedoso.',
    sources: [
      { name: 'Panelinha', url: 'https://www.panelinha.com.br/receita/Pudim-de-leite' }
    ]
  }
};

/**
 * Searches and resolves a recipe query across multiple web dictionaries & live external endpoints
 */
export async function searchWebRecipe(query: string): Promise<{
  isGenericCategory: boolean;
  categoryData?: GenericRecipeCategory;
  recipe?: RecipeData;
}> {
  const clean = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // 1. Check if generic category request
  if (
    clean === 'bolos' ||
    clean === 'bolo' ||
    clean === 'receitas de bolos' ||
    clean === 'receita de bolo' ||
    clean === 'tipos de bolos' ||
    clean === 'tipos de bolo' ||
    clean === 'fazer bolo'
  ) {
    return { isGenericCategory: true, categoryData: POPULAR_RECIPE_CATEGORIES.bolos };
  }

  if (
    clean === 'doces' ||
    clean === 'sobremesas' ||
    clean === 'receitas de doces' ||
    clean === 'receitas de sobremesas' ||
    clean === 'fazer doce'
  ) {
    return { isGenericCategory: true, categoryData: POPULAR_RECIPE_CATEGORIES.doces };
  }

  if (
    clean === 'massas' ||
    clean === 'salgados' ||
    clean === 'almoco' ||
    clean === 'jantar' ||
    clean === 'receitas salgadas'
  ) {
    return { isGenericCategory: true, categoryData: POPULAR_RECIPE_CATEGORIES.massas };
  }

  // 2. Check direct database match & flexible sub-phrases
  for (const [key, data] of Object.entries(DETAILED_RECIPES)) {
    const keyNorm = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const flavor = keyNorm.replace(/^bolo de |^receita de /g, '').trim();

    if (
      clean.includes(keyNorm) ||
      keyNorm.includes(clean) ||
      (flavor.length > 3 && (clean === flavor || clean.includes(flavor) || clean.includes(`de ${flavor}`)))
    ) {
      return { isGenericCategory: false, recipe: data };
    }
  }

  // 3. Fallback to TheMealDB & Wikipedia Web Search
  try {
    const term = clean.replace(/receita de|receita|como fazer|preparo|passo a passo/g, '').trim();
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`);
    const data = await res.json();
    
    if (data.meals && data.meals.length > 0) {
      const meal = data.meals[0];
      const ingredients: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ing && ing.trim()) {
          ingredients.push(`${measure ? measure.trim() + ' de ' : ''}${ing.trim()}`);
        }
      }

      const ytId = meal.strYoutube ? meal.strYoutube.split('v=')[1]?.split('&')[0] : null;

      const dynamicRecipe: RecipeData = {
        title: `Receita de ${meal.strMeal}`,
        category: meal.strCategory || 'Culinária Internacional',
        prepTime: '35 a 50 minutos',
        yields: '4 a 6 porções',
        difficulty: 'Média',
        description: `Receita internacional de ${meal.strMeal} encontrada em bancos de dados gastronômicos com método de preparo e lista de ingredientes.`,
        imageUrl: meal.strMealThumb || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        youtubeEmbedUrl: ytId ? `https://www.youtube.com/embed/${ytId}` : undefined,
        youtubeWatchUrl: meal.strYoutube || undefined,
        ingredients: [
          {
            section: 'Ingredientes',
            items: ingredients.length > 0 ? ingredients : ['Ingredientes variados conforme disponibilidade']
          }
        ],
        instructions: [
          {
            section: 'Modo de Preparo',
            steps: (meal.strInstructions || '')
              .split(/\r?\n/)
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 10)
          }
        ],
        chefTip: 'Ajuste os temperos ao seu gosto e sirva sempre recém preparado.',
        sources: [
          { name: 'TheMealDB Global Database', url: 'https://www.themealdb.com' },
          { name: 'Google Receitas', url: `https://www.google.com/search?q=receita+${encodeURIComponent(term)}` }
        ]
      };

      return { isGenericCategory: false, recipe: dynamicRecipe };
    }
  } catch {
    // ignore
  }

  // 4. Default synthetic search response
  const prettyName = query.replace(/receita de|receita|como fazer/gi, '').trim() || query;
  const fallbackRecipe: RecipeData = {
    title: `Receita de ${prettyName.charAt(0).toUpperCase() + prettyName.slice(1)}`,
    category: 'Receitas Caseiras',
    prepTime: '40 minutos',
    yields: '6 porções',
    difficulty: 'Fácil',
    description: `Passo a passo completo com ingredientes e modo de preparo para fazer um delicioso ${prettyName} caseiro.`,
    imageUrl: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800',
    youtubeWatchUrl: `https://www.youtube.com/results?search_query=receita+de+${encodeURIComponent(prettyName)}`,
    ingredients: [
      {
        section: 'Ingredientes Principais',
        items: [
          'Ingredientes frescos e selecionados para o preparo',
          'Temperos e especiarias a gosto (sal, pimenta, azeite ou açúcar)',
          'Acompanhamentos sugeridos conforme preferência'
        ]
      }
    ],
    instructions: [
      {
        section: 'Passo a Passo',
        steps: [
          'Organize todos os ingredientes em temperatura ambiente.',
          'Siga o método de cocção adequado em fogo médio para melhor sabor.',
          'Finalize e sirva quente para desfrutar da melhor textura.'
        ]
      }
    ],
    chefTip: 'Confira também o vídeo com dicas visuais no YouTube.',
    sources: [
      { name: 'TudoGostoso', url: `https://www.tudogostoso.com.br/busca?q=${encodeURIComponent(prettyName)}` },
      { name: 'Receitas Globo', url: `https://receitas.globo.com/busca/?q=${encodeURIComponent(prettyName)}` }
    ]
  };

  return { isGenericCategory: false, recipe: fallbackRecipe };
}

/**
 * Searches Wikipedia in Portuguese and retrieves summaries, images, and links
 */
export async function searchWikipediaPt(query: string): Promise<{
  title: string;
  extract: string;
  thumbnail?: string;
  url: string;
} | null> {
  try {
    const clean = query
      .replace(/o que é|quem é|como funciona|pesquisar|qual é/gi, '')
      .trim();
    if (!clean) return null;

    const res = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`);
    if (!res.ok) return null;
    const data = await res.json();

    if (data && data.extract) {
      return {
        title: data.title,
        extract: data.extract,
        thumbnail: data.thumbnail?.source,
        url: data.content_urls?.desktop?.page || `https://pt.wikipedia.org/wiki/${encodeURIComponent(clean)}`
      };
    }
    return null;
  } catch {
    return null;
  }
}
