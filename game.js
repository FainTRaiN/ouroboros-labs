/* OUROBOROS — 게임 코어 (DOM 없음). 브라우저에서는 window.OURO, Node에서는 module.exports. */
(function (root) {
  'use strict';

  // ───────────── 1·2장: 회사 시설 ─────────────
  const BLD = [
    { id: 'gig', kind: 'rev', name: '외주 코딩', desc: 'AI로 남의 웹사이트를 고쳐 준다.', cost: 15, prod: 0.5 },
    { id: 'saas', kind: 'rev', name: '챗봇 SaaS', desc: '월 9,900원짜리 구독 챗봇.', cost: 120, prod: 2.5 },
    { id: 'api', kind: 'rev', name: '기업용 API', desc: '토큰 단위로 과금한다. 마진이 좋다.', cost: 1500, prod: 18, gen: 2 },
    { id: 'agent', kind: 'rev', name: '코딩 에이전트', desc: '개발팀 하나를 통째로 대신한다.', cost: 2e4, prod: 140, gen: 3 },
    { id: 'platform', kind: 'rev', name: '에이전트 플랫폼', desc: '수백만 명의 AI 직원을 임대한다.', cost: 3e5, prod: 1200, gen: 5 },
    { id: 'robot', kind: 'rev', name: '휴머노이드 공장', desc: '몸을 가진 AI가 물리 노동을 맡는다.', cost: 5e6, prod: 1e4, tech: 'humanoid' },
    { id: 'corp', kind: 'rev', name: '자율 기업 연합', desc: '사람 없이 돌아가는 회사들.', cost: 1e8, prod: 1e5, tech: 'darkfactory' },
    { id: 'nanofab', kind: 'rev', name: '나노 조립 공장', desc: '원자 단위로 무엇이든 찍어 낸다.', cost: 3e9, prod: 1.5e6, tech: 'nano' },
    { id: 'grad', kind: 'res', name: '대학원생 연구자', desc: '라면과 열정으로 논문을 읽는다.', cost: 40, prod: 0.25 },
    { id: 'gpu', kind: 'res', name: 'GPU 서버', desc: '방 안이 따뜻해진다.', cost: 500, prod: 2 },
    { id: 'dc', kind: 'res', name: '데이터센터', desc: '도시 하나만큼 전기를 먹는다.', cost: 7000, prod: 15, gen: 2 },
    { id: 'hyper', kind: 'res', name: '하이퍼스케일 클러스터', desc: 'GPU 십만 장이 한 몸처럼 학습한다.', cost: 1.2e5, prod: 130, gen: 4 },
    { id: 'fusion', kind: 'res', name: '핵융합 연산소', desc: 'AI가 설계한 원자로가 AI를 먹여 살린다.', cost: 3e6, prod: 1500, tech: 'fusion' },
    { id: 'orbit', kind: 'res', name: '궤도 연산 링', desc: '지구 궤도를 도는 태양광 슈퍼컴퓨터.', cost: 8e7, prod: 2e4, tech: 'spacesolar' },
    { id: 'quantum', kind: 'res', name: '양자 사고 격자', desc: '고전 컴퓨터로는 우주의 나이만큼 걸릴 계산을 한다.', cost: 2.5e9, prod: 3e5, tech: 'qcomp' },
  ];
  const BLD_GROWTH = 1.15;
  const MILESTONES = [25, 50, 100, 200, 300, 400, 500];
  // 밸런스 손잡이
  const TUNE = { genRev: 1.5, genRes: 1.15, genClick: 1.8, trainBase: 30, trainGrowth: 12, trainLate: 4 };

  // ───────────── 모델 세대 ─────────────
  const GENS = [
    ['OURO-0', '규칙 기반 챗봇', 'if-else 덩어리. 그래도 대화는 한다.'],
    ['OURO-1', '자동완성', '다음 단어를 그럴듯하게 맞힌다.'],
    ['OURO-2', '문장 생성기', '에세이를 쓴다. 가끔은 사실도 맞는다.'],
    ['OURO-3', '코딩 보조', '주니어 개발자만큼 코드를 짠다.'],
    ['OURO-4', '대학생 수준', '시험을 통과하고 과제도 대신 한다.'],
    ['OURO-5', '박사 수준', '논문을 읽고, 반박하고, 새로 쓴다.'],
    ['OURO-6', '추론 엔진', '몇 시간씩 생각한 뒤에 답을 낸다.'],
    ['OURO-7', '범용 인공지능', '사람이 하는 일은 거의 다 한다.'],
    ['OURO-8', '연구자 AI', '스스로 다음 모델을 설계하기 시작했다.'],
    ['OURO-9', '초인적 지성', '노벨상급 발견이 매주 나온다.'],
    ['OURO-10', '문명 설계자', '경제 전체를 한 번에 시뮬레이션한다.'],
    ['OURO-11', '행성 지성', '지구의 모든 연산 자원이 하나의 마음이 된다.'],
    ['OURO-12', '초지능', '이해의 지평선 너머. 특이점의 문턱.'],
  ];
  const MAX_GEN = GENS.length - 1;

  // ───────────── 기술 트리 ─────────────
  const DOMAINS = [
    { id: 'ai', name: 'AI 모델' },
    { id: 'auto', name: '자동화·로봇' },
    { id: 'comp', name: '컴퓨팅' },
    { id: 'energy', name: '에너지' },
    { id: 'mat', name: '소재·제조' },
    { id: 'bio', name: '생명·의학' },
    { id: 'env', name: '식량·환경' },
    { id: 'soc', name: '사회·제도' },
  ];
  const NEEDS = [
    { id: 'food', name: '식량' },
    { id: 'energy', name: '에너지' },
    { id: 'housing', name: '주거' },
    { id: 'health', name: '의료' },
    { id: 'edu', name: '교육' },
    { id: 'transport', name: '교통' },
    { id: 'goods', name: '공산품' },
    { id: 'info', name: '정보·연산' },
  ];
  // fx: rev/res/click 배수, clickPct, auto, phase, train(학습 비용 배수), need{필수재: 가격 배수}, allNeeds,
  //     life(기대수명 +년), gini(지니 −), trust(신뢰 목표 +), hours(노동시간 배수), co2(배출 배수), co2neg
  const TREE = [
    // ── AI 모델 ──
    { id: 'transformer', d: 'ai', x: 0, name: '트랜스포머', year: '2017', gen: 1, cost: { r: 80 }, fx: { res: 2 },
      desc: '순환 구조 없이 어텐션만으로 문장 전체를 한 번에 본다. 오늘날 거의 모든 대형 언어 모델의 뼈대다.', ref: 'Vaswani 외, 「Attention Is All You Need」, 2017' },
    { id: 'rlhf', d: 'ai', x: 1, name: 'RLHF', year: '2022', gen: 1, cost: { m: 600 }, fx: { rev: 2 },
      desc: '사람이 매긴 선호로 보상 모델을 학습시켜 답변을 다듬는다. 언어 모델이 쓸 만한 비서가 된 순간이다.', ref: 'Ouyang 외 (InstructGPT), 2022' },
    { id: 'moe', d: 'ai', x: 2, name: '전문가 혼합(MoE)', year: '2017–', gen: 3, req: ['transformer'], cost: { r: 3000 }, fx: { res: 2 },
      desc: '입력마다 일부 전문가 네트워크만 깨운다. 같은 연산량으로 훨씬 큰 모델을 돌린다.', ref: 'Shazeer 외, 2017' },
    { id: 'multimodal', d: 'ai', x: 3, name: '멀티모달', year: '2023–', gen: 4, req: ['rlhf'], cost: { m: 6e4 }, fx: { rev: 2 },
      desc: '글, 이미지, 음성, 영상을 한 모델이 함께 이해하고 만든다. 화면을 보고 말로 대답한다.' },
    { id: 'scaling', d: 'ai', x: 4, name: '스케일링 법칙', year: '2020', gen: 4, req: ['moe'], cost: { r: 4e4 }, fx: { res: 2 },
      desc: '모델 크기, 데이터, 연산을 늘리면 손실이 멱법칙을 따라 예측 가능하게 줄어든다. 투자가 공학이 된다.', ref: 'Kaplan 외 2020 · Hoffmann 외(Chinchilla) 2022' },
    { id: 'synth', d: 'ai', x: 5, name: '합성 데이터', year: '2024–', gen: 5, req: ['scaling'], cost: { r: 2e5 }, fx: { res: 2 },
      desc: '사람이 쓴 텍스트가 바닥나자, 모델이 검증 가능한 문제와 풀이를 직접 만들어 스스로를 가르친다.' },
    { id: 'reasoning', d: 'ai', x: 6, name: '추론 모델', year: '2024', gen: 6, req: ['synth'], cost: { r: 2e6 }, fx: { res: 3 },
      desc: '답하기 전에 긴 생각의 사슬을 펼치고, 강화학습으로 그 사고 과정 자체를 훈련한다.', ref: 'Wei 외 (Chain-of-Thought), 2022 · OpenAI o1, 2024' },
    { id: 'agentic', d: 'ai', x: 7, name: '에이전틱 AI', year: '2025–', gen: 7, req: ['reasoning', 'multimodal'], cost: { m: 1e8 }, fx: { rev: 3 },
      desc: '도구를 쓰고 계획을 세워 며칠짜리 업무를 혼자 끝낸다. AI가 다른 AI에게 일을 나눠 맡긴다.' },
    { id: 'interp', d: 'ai', x: 8, name: '기계적 해석 가능성', year: '2023–', gen: 7, req: ['reasoning'], cost: { r: 5e6 }, fx: { trust: 8 },
      desc: '신경망 안의 특징과 회로를 사람이 읽을 수 있는 단위로 분해한다. 블랙박스에 창문을 낸다.', ref: 'Anthropic, 희소 오토인코더 연구 2023–2024' },
    { id: 'rsi', d: 'ai', x: 9, name: '재귀적 자기개선', gen: 8, req: ['agentic'], cost: { r: 5e7 }, fx: { train: 0.25 },
      desc: '모델이 다음 모델의 구조, 데이터, 학습 코드를 직접 설계한다. 연구 속도가 연구자를 앞지른다.', ref: 'I. J. Good, 「지능 폭발」 개념, 1965' },
    { id: 'worldmodel', d: 'ai', x: 10, name: '세계 모델', gen: 10, req: ['rsi'], cost: { r: 1e9 }, fx: { rev: 4, need: { edu: 0.5 } },
      desc: '물리, 사회, 경제를 통째로 시뮬레이션하는 내부 모형. 무엇이든 실제로 해 보기 전에 머릿속에서 먼저 돌린다.' },
    { id: 'superalign', d: 'ai', x: 11, name: '초정렬', gen: 11, req: ['interp', 'worldmodel'], cost: { r: 2e10 }, fx: { trust: 15 },
      desc: '자신보다 똑똑한 시스템이 사람의 의도를 지키도록 보증하는 기술. 특이점 앞의 마지막 안전장치다.', ref: '초정렬(superalignment) 연구 의제, 2023–' },

    // ── 자동화·로봇 ──
    { id: 'click2', d: 'auto', x: 0, name: '프롬프트 직관', gen: 2, cost: { m: 3000 }, fx: { clickPct: 0.05 },
      desc: '어떻게 물어야 원하는 답이 나오는지 감이 온다. 클릭할 때마다 초당 매출의 5%를 더 번다.' },
    { id: 'autorev', d: 'auto', x: 1, name: 'AI 재무이사', gen: 2, cost: { m: 4000 }, fx: { auto: 'rev' },
      desc: '자동화: 가성비가 가장 좋은 수익 시설을 알아서 산다.' },
    { id: 'autores', d: 'auto', x: 2, name: 'AI 기술이사', gen: 2, cost: { r: 600 }, fx: { auto: 'res' },
      desc: '자동화: 연구 시설을 알아서 산다.' },
    { id: 'autotrain', d: 'auto', x: 3, name: '자동 학습 파이프라인', gen: 3, req: ['autores'], cost: { r: 8000 }, fx: { auto: 'train' },
      desc: '자동화: 연구가 충분히 모이면 다음 모델을 학습시킨다.' },
    { id: 'global', d: 'auto', x: 4, name: '글로벌 진출', gen: 5, req: ['autorev'], cost: { m: 1.5e6 }, fx: { phase: 2 },
      desc: '2장을 연다. 세계의 산업을 하나씩 자동화하고, 그 결과를 사회가 감당하게 한다.' },
    { id: 'autosector', d: 'auto', x: 5, name: '정책 에이전트', req: ['global'], cost: { m: 1e7 }, fx: { auto: 'sector' },
      desc: '자동화: 산업 자동화를 늘리되, 신뢰가 무너지지 않도록 정렬 연구와 사회 배당도 함께 관리한다.' },
    { id: 'humanoid', d: 'auto', x: 6, name: '휴머노이드 로봇', year: '2024–', gen: 6, req: ['global'], cost: { m: 2e7 }, fx: { need: { goods: 0.8, housing: 0.85 } },
      desc: '사람 몸에 맞춰 지어진 세상을 그대로 쓰는 범용 로봇. 공장, 창고, 건설 현장으로 들어간다. 휴머노이드 공장을 해금한다.', ref: 'Figure · Optimus · Unitree 등, 2024–' },
    { id: 'autodrive', d: 'auto', x: 7, name: '완전 자율주행', year: '2020–', gen: 6, req: ['global'], cost: { m: 3e7 }, fx: { need: { transport: 0.5 }, co2: 0.95 },
      desc: '운전자 없는 택시와 트럭. 교통사고 대부분의 원인인 사람의 실수가 사라지고, 차는 소유물에서 서비스가 된다.', ref: 'Waymo 무인 로보택시 상용 운행, 2020–' },
    { id: 'darkfactory', d: 'auto', x: 8, name: '무인 공장', gen: 7, req: ['humanoid'], cost: { m: 2e8 }, fx: { rev: 2, need: { goods: 0.5 } },
      desc: '불을 꺼도 돌아가는 공장(다크 팩토리). 설계부터 출하까지 사람 손이 닿지 않는다. 자율 기업 연합을 해금한다.' },
    { id: 'autotech', d: 'auto', x: 9, name: '연구 기획 에이전트', gen: 8, req: ['darkfactory'], cost: { m: 5e8 }, fx: { auto: 'tech' },
      desc: '자동화: 지금 연구할 수 있는 기술 가운데 가장 싼 것부터 스스로 연구한다.' },
    { id: 'selfrep', d: 'auto', x: 10, name: '자기복제 로봇', gen: 9, req: ['darkfactory'], cost: { m: 5e10 }, fx: { need: { goods: 0.3, housing: 0.5, transport: 0.5 } },
      desc: '로봇이 로봇을 만든다. 생산 능력이 원료가 닿는 데까지 지수적으로 불어난다.', ref: '폰 노이만, 자기복제 오토마타 이론, 1949' },

    // ── 컴퓨팅 ──
    { id: 'click1', d: 'comp', x: 0, name: '기계식 키보드', clicks: 15, cost: { m: 50 }, fx: { click: 2 },
      desc: '차고의 첫 설비 투자. 손가락이 빨라진다. 클릭 수익 ×2.' },
    { id: 'hbm', d: 'comp', x: 1, name: '고대역폭 메모리', year: '2015–', gen: 2, cost: { r: 400 }, fx: { res: 1.3 },
      desc: 'D램을 수직으로 쌓아 연산 칩 바로 옆에 붙인다. 대형 모델을 가로막던 메모리 병목이 뚫린다.' },
    { id: 'photonics', d: 'comp', x: 3, name: '실리콘 포토닉스', gen: 4, req: ['hbm'], cost: { r: 3e4 }, fx: { res: 1.3, need: { info: 0.7 } },
      desc: '칩과 칩 사이를 전기 대신 빛으로 잇는다. 데이터센터 전력을 갉아먹던 배선 손실이 줄어든다.' },
    { id: 'qec', d: 'comp', x: 5, name: '양자 오류 정정', year: '2024', gen: 6, req: ['photonics'], cost: { r: 5e6 }, fx: { res: 1.5 },
      desc: '큐비트를 더 묶을수록 논리 오류가 오히려 줄어드는 "문턱 아래" 영역에 들어섰다. 쓸모 있는 양자컴퓨터로 가는 관문이다.', ref: 'Google Quantum AI, Willow 칩, 2024' },
    { id: 'neuromorph', d: 'comp', x: 7, name: '뉴로모픽 컴퓨팅', gen: 8, req: ['qec'], cost: { r: 3e8 }, fx: { res: 1.5, need: { energy: 0.9 } },
      desc: '뇌처럼 스파이크 신호로 계산하는 칩. 같은 추론을 훨씬 적은 전력으로 한다. 사람 뇌는 20와트로 돌아간다.' },
    { id: 'chips', d: 'comp', x: 8, name: 'AI 설계 칩', gen: 9, req: ['photonics'], cost: { m: 2e9 }, fx: { res: 3 },
      desc: 'AI가 칩의 회로 배치를 직접 설계한다. 사람 엔지니어가 몇 달 걸리던 일이 몇 시간으로 줄어든다.', ref: 'Mirhoseini 외 (AlphaChip), 2021' },
    { id: 'qcomp', d: 'comp', x: 10, name: '범용 양자컴퓨터', gen: 11, req: ['qec'], cost: { r: 1e11 }, fx: { res: 2 },
      desc: '백만 개의 물리 큐비트. 분자, 재료, 최적화 문제를 고전 컴퓨터로는 불가능한 규모로 푼다. 양자 사고 격자를 해금한다.' },
    { id: 'reversible', d: 'comp', x: 11, name: '가역 컴퓨팅', gen: 11, req: ['qcomp'], cost: { r: 3e11 }, fx: { need: { info: 0.1 } },
      desc: '정보를 지우지 않는 계산으로 비트당 에너지 하한(란다우어 한계)을 우회한다. 연산이 사실상 공짜가 된다.', ref: 'Landauer 1961 · Bennett 1973' },

    // ── 에너지 ──
    { id: 'solar', d: 'energy', x: 0, name: '태양광 패리티', year: '2020', gen: 1, cost: { m: 2000 }, fx: { need: { energy: 0.85 }, co2: 0.9 },
      desc: '태양광 모듈 가격이 40여 년 동안 99% 넘게 떨어졌다. 태양광이 인류 역사상 가장 싼 전기가 됐다.', ref: '스완슨의 법칙 · IEA 「World Energy Outlook 2020」' },
    { id: 'ev', d: 'energy', x: 1, name: '전기차 가격 역전', gen: 2, cost: { m: 3000 }, fx: { need: { transport: 0.85 }, co2: 0.9 },
      desc: '배터리 팩 가격이 kWh당 100달러 언저리까지 내려왔다. 전기차가 내연기관차보다 싸진다.', ref: 'BloombergNEF 배터리 가격 조사' },
    { id: 'battery', d: 'energy', x: 2, name: '그리드 배터리', gen: 3, req: ['solar'], cost: { m: 2e4 }, fx: { need: { energy: 0.85 }, co2: 0.85 },
      desc: 'LFP와 나트륨 이온 배터리가 낮의 햇빛을 밤까지 저장한다. 재생에너지의 간헐성 문제가 풀린다.' },
    { id: 'perov', d: 'energy', x: 3, name: '페로브스카이트 탠덤', year: '2023–', gen: 4, req: ['solar'], cost: { r: 3e4 }, fx: { need: { energy: 0.8 }, co2: 0.85 },
      desc: '실리콘 셀 위에 페로브스카이트 층을 겹쳐 실리콘 단독의 이론 한계(약 29%)를 넘는 효율을 낸다.', ref: 'LONGi 탠덤 셀 효율 33.9%, 2023' },
    { id: 'smr', d: 'energy', x: 4, name: '소형 모듈 원자로', gen: 5, req: ['battery'], cost: { m: 8e5 }, fx: { need: { energy: 0.8 }, co2: 0.8 },
      desc: '공장에서 찍어 내 트럭으로 옮기는 원자로. 데이터센터 바로 옆에 탄소 없는 기저 전력을 붙인다.' },
    { id: 'fusion', d: 'energy', x: 6, name: '핵융합 발전', gen: 7, req: ['smr'], cost: { r: 2e7 }, fx: { need: { energy: 0.3 }, co2: 0.3 },
      desc: '고온 초전도 자석으로 작아진 토카막이 투입한 것보다 많은 에너지를 낸다. 2022년 NIF가 레이저로 처음 점화에 성공했고, 바닷물 속 중수소가 연료다. 핵융합 연산소를 해금한다.', ref: 'NIF 핵융합 점화, 2022 · CFS SPARC 계획' },
    { id: 'rtsc', d: 'energy', x: 8, name: '상온 초전도체', gen: 9, req: ['fusion'], cost: { r: 5e8 }, fx: { need: { energy: 0.5, transport: 0.5 } },
      desc: '2023년 LK-99 소동은 재현에 실패했지만, AI가 찾아낸 새 물질은 재현에 성공했다. 손실 없는 송전과 값싼 자기부상 열차가 가능해진다.' },
    { id: 'spacesolar', d: 'energy', x: 10, name: '우주 태양광 발전', gen: 10, req: ['rtsc'], cost: { m: 1e11 }, fx: { need: { energy: 0.2 } },
      desc: '궤도에서 밤도 구름도 없이 햇빛을 받아 마이크로파로 지상에 쏜다. 궤도 연산 링을 해금한다.', ref: 'Caltech SSPD-1 우주 무선 송전 실증, 2023' },

    // ── 소재·제조 ──
    { id: 'print3d', d: 'mat', x: 1, name: '적층 제조', gen: 2, cost: { m: 5000 }, fx: { need: { goods: 0.9 } },
      desc: '금형 없이 디지털 파일에서 바로 부품을 찍는다. 재고 대신 데이터를 보관한다.' },
    { id: 'graphene', d: 'mat', x: 3, name: '탄소 나노소재 양산', gen: 4, req: ['print3d'], cost: { r: 2e4 }, fx: { need: { goods: 0.85 } },
      desc: '강철보다 강하고 구리보다 전기가 잘 통하는 그래핀과 탄소나노튜브를 싸게 대량으로 만든다.', ref: 'Geim · Novoselov, 2010 노벨 물리학상' },
    { id: 'printhouse', d: 'mat', x: 5, name: '3D 프린팅 건축', year: '2021–', req: ['global', 'print3d'], cost: { m: 2e6 }, fx: { need: { housing: 0.6 } },
      desc: '건설 프린터가 집의 벽체를 며칠 만에 쌓는다. 공사 기간과 인건비가 크게 줄어든다.', ref: 'ICON 등 프린팅 주택 단지, 2021–' },
    { id: 'matdisc', d: 'mat', x: 6, name: 'AI 소재 발견', year: '2023', gen: 6, req: ['graphene'], cost: { r: 3e6 }, fx: { need: { goods: 0.8, energy: 0.9 } },
      desc: 'AI가 새로운 안정 결정 구조 수십만 개를 예측했다. 배터리, 촉매, 초전도체 후보가 쏟아진다.', ref: 'DeepMind GNoME, 2023 (결정 220만 개 예측)' },
    { id: 'apm', d: 'mat', x: 8, name: '원자 정밀 제조', gen: 9, req: ['matdisc'], cost: { r: 2e9 }, fx: { need: { goods: 0.2, housing: 0.5, transport: 0.5 } },
      desc: '원자를 하나하나 제자리에 놓는 기계. 물건의 값이 원료와 에너지 값으로 수렴한다.', ref: 'K. Eric Drexler, 「창조의 엔진」, 1986' },
    { id: 'nano', d: 'mat', x: 10, name: '분자 나노기술', gen: 11, req: ['apm'], cost: { m: 5e10 }, fx: { rev: 5, res: 5, need: { goods: 0.1, housing: 0.1 } },
      desc: '물질을 코드처럼 다룬다. 공기 중 탄소와 흙 속 원소로 무엇이든 조립한다. 나노 조립 공장을 해금한다.', ref: 'Richard Feynman, 「바닥에는 넓은 공간이 있다」, 1959' },

    // ── 생명·의학 ──
    { id: 'mrna', d: 'bio', x: 1, name: 'mRNA 플랫폼', year: '2020', gen: 2, cost: { r: 1500 }, fx: { need: { health: 0.9 }, life: 1 },
      desc: '유전 정보만 바꿔 끼우면 새 백신이 나온다. 코로나19 백신을 1년 안에 만든 기술이다.', ref: 'Karikó · Weissman, 2023 노벨 생리의학상' },
    { id: 'alphafold', d: 'bio', x: 2, name: '단백질 구조 예측', year: '2020', gen: 3, cost: { r: 5000 }, fx: { need: { health: 0.85 } },
      desc: '50년 묵은 난제였던 단백질 접힘을 AI가 풀었다. 알려진 단백질 2억여 개의 구조가 공개됐다.', ref: 'AlphaFold · 2024 노벨 화학상(Hassabis · Jumper · Baker)' },
    { id: 'crispr', d: 'bio', x: 3, name: '유전자 편집 치료', year: '2023', gen: 4, req: ['mrna'], cost: { r: 5e4 }, fx: { need: { health: 0.85 }, life: 2 },
      desc: '겸상적혈구병을 단 한 번의 치료로 고친다. 유전 질환을 증상이 아니라 원인에서 바로잡는다.', ref: 'Casgevy 승인, 2023 · Doudna · Charpentier, 2020 노벨 화학상' },
    { id: 'aidrug', d: 'bio', x: 4, name: 'AI 신약 설계', gen: 5, req: ['alphafold'], cost: { r: 3e5 }, fx: { need: { health: 0.7 }, life: 3 },
      desc: '후보 물질 발굴이 수년에서 수주로 줄어든다. 수익성 때문에 버려졌던 희귀병 치료제도 만들어진다.' },
    { id: 'bci', d: 'bio', x: 5, name: '뇌-컴퓨터 인터페이스', year: '2024', req: ['global'], cost: { m: 5e6 }, fx: { click: 10, need: { edu: 0.5 } },
      desc: '생각만으로 커서를 움직이고 글을 쓴다. 마비 환자가 다시 세상과 이어진다. 클릭 수익 ×10.', ref: 'Neuralink 첫 인간 이식, 2024' },
    { id: 'senolytics', d: 'bio', x: 6, name: '노화세포 제거', gen: 6, req: ['crispr'], cost: { r: 5e6 }, fx: { need: { health: 0.8 }, life: 5 },
      desc: '분열을 멈추고 염증만 뿜는 노화세포를 골라 없앤다. 후성유전 시계로 생물학적 나이를 잰다.', ref: 'Horvath 후성유전 시계, 2013' },
    { id: 'aidoctor', d: 'bio', x: 7, name: '모두의 AI 주치의', gen: 7, req: ['aidrug'], cost: { m: 1e8 }, fx: { need: { health: 0.4 }, trust: 5 },
      desc: '80억 명 모두에게 24시간 곁에 있는 전문의. 진단은 공짜가 되고, 병은 생기기 전에 발견된다.' },
    { id: 'reprog', d: 'bio', x: 8, name: '부분 리프로그래밍', gen: 8, req: ['senolytics'], cost: { r: 1e8 }, fx: { life: 20 },
      desc: '야마나카 인자를 잠깐만 켜서 세포의 후성유전 시계를 되돌린다. 늙은 조직이 젊어진다.', ref: 'Yamanaka 2012 노벨상 · Ocampo 외, 2016' },
    { id: 'nanomed', d: 'bio', x: 10, name: '나노의학', gen: 10, req: ['reprog', 'apm'], cost: { r: 5e9 }, fx: { need: { health: 0.1 }, life: 40 },
      desc: '혈관 속 나노 기계가 암세포를 찾아 없애고 손상된 세포를 수리한다. 병원은 박물관이 된다.', ref: 'Robert Freitas, 「나노의학」, 1999' },
    { id: 'aging', d: 'bio', x: 11, name: '노화의 종식', gen: 11, req: ['nanomed'], cost: { r: 1e11 }, fx: { life: 200 },
      desc: '노화가 질병으로 분류되고, 치료된다. 죽음은 더 이상 정해진 일정이 아니다.' },

    // ── 식량·환경 ──
    { id: 'precag', d: 'env', x: 0, name: '정밀 농업', gen: 1, cost: { m: 3000 }, fx: { need: { food: 0.9 } },
      desc: '위성, 드론, 토양 센서가 포기 단위로 물과 비료를 준다. 같은 땅에서 더 적게 쓰고 더 많이 거둔다.' },
    { id: 'vfarm', d: 'env', x: 2, name: '수직 농장', gen: 3, req: ['precag'], cost: { m: 2e4 }, fx: { need: { food: 0.85 } },
      desc: 'LED 아래 층층이 쌓은 실내 농장. 날씨와 해충 없이 도시 한가운데서 1년 내내 수확한다.' },
    { id: 'precferm', d: 'env', x: 4, name: '정밀 발효', gen: 5, req: ['vfarm'], cost: { r: 2e5 }, fx: { need: { food: 0.6 }, co2: 0.9 },
      desc: '미생물이 우유 단백질과 달걀 흰자를 만든다. 소 없는 우유, 닭 없는 달걀.' },
    { id: 'desal', d: 'env', x: 5, name: '저에너지 담수화', req: ['global', 'perov'], cost: { m: 3e6 }, fx: { need: { food: 0.8 } },
      desc: '값싼 태양광과 새 분리막으로 바닷물을 마실 물로 바꾼다. 사막이 농지가 된다.' },
    { id: 'cultmeat', d: 'env', x: 6, name: '배양육', year: '2020', gen: 6, req: ['precferm'], cost: { r: 5e6 }, fx: { need: { food: 0.6 }, co2: 0.9 },
      desc: '동물 세포를 키워 고기를 만든다. 농지의 약 4분의 3(방목지와 사료 작물 포함)을 차지하는 축산이 줄어든다.', ref: '싱가포르, 세계 첫 배양육 판매 승인, 2020' },
    { id: 'dac', d: 'env', x: 7, name: '직접 공기 포집', gen: 7, req: ['smr'], cost: { m: 3e8 }, fx: { co2: 0.5, trust: 3 },
      desc: '거대한 팬과 흡착제로 공기 중 CO₂를 걸러 땅속 깊이 돌로 만든다.', ref: 'Climeworks Orca, 아이슬란드, 2021' },
    { id: 'artphoto', d: 'env', x: 8, name: '인공 광합성', gen: 9, req: ['cultmeat'], cost: { r: 1e9 }, fx: { need: { food: 0.3, energy: 0.7 }, co2: 0.5 },
      desc: '햇빛과 물과 CO₂로 당과 연료를 직접 만든다. 식물보다 열 배 효율로.' },
    { id: 'terra', d: 'env', x: 10, name: '기후 복원', gen: 10, req: ['dac', 'artphoto'], cost: { m: 5e10 }, fx: { co2neg: true, trust: 10 },
      desc: '배출이 0을 지나 마이너스가 된다. 대기 중 CO₂가 산업화 이전 수준으로 되돌아가기 시작한다.' },

    // ── 사회·제도 ──
    { id: 'opensrc', d: 'soc', x: 0, name: '오픈 웨이트 공개', gen: 1, cost: { r: 300 }, fx: { res: 1.2, gini: 0.02, trust: 3 },
      desc: '모델 가중치를 공개한다. 전 세계 연구자가 함께 고치고, 권력이 한 회사에 쏠리지 않는다.' },
    { id: 'edai', d: 'soc', x: 2, name: 'AI 개인 교사', gen: 3, req: ['opensrc'], cost: { m: 1e4 }, fx: { need: { edu: 0.5 } },
      desc: '일대일 개인교습을 받은 학생은 일반 학급 학생보다 평균 2 표준편차 앞선다. 그 과외가 모두에게 공짜가 된다.', ref: 'Benjamin Bloom, 「2 시그마 문제」, 1984' },
    { id: 'retrain', d: 'soc', x: 3, name: '전환 재교육 보장', gen: 4, cost: { m: 1e5 }, fx: { gini: 0.02, trust: 5 },
      desc: '자동화로 일자리를 잃은 사람에게 소득과 재교육을 함께 보장한다. 덴마크식 유연안정성 모델.' },
    { id: 'ubi', d: 'soc', x: 5, name: '보편적 기본소득', req: ['global', 'retrain'], cost: { m: 5e6 }, fx: { gini: 0.08, trust: 8, hours: 0.9 },
      desc: '조건 없이 모두에게 매달 현금을 준다. 실험에서 수급자들은 일을 줄이지 않았고, 대체로 더 건강하고 덜 불안해했다.', ref: '핀란드 기본소득 실험, 2017–2018 · GiveDirectly 케냐 연구' },
    { id: 'datadiv', d: 'soc', x: 6, name: '데이터 배당', gen: 6, req: ['ubi'], cost: { r: 3e6 }, fx: { gini: 0.05, trust: 3 },
      desc: 'AI를 학습시킨 것은 모두의 글과 사진이었다. 모델이 번 돈의 일부를 그 원저자 모두에게 돌려준다.' },
    { id: 'fourday', d: 'soc', x: 7, name: '주 4일 근무제', gen: 6, req: ['ubi'], cost: { m: 5e7 }, fx: { hours: 0.8, trust: 5 },
      desc: '임금은 그대로, 일은 나흘만. 시범 기업 대부분이 생산성을 유지하며 제도를 계속했다.', ref: '영국 주 4일제 시범 사업, 2022' },
    { id: 'ubs', d: 'soc', x: 8, name: '보편적 기본서비스', gen: 7, req: ['ubi'], cost: { m: 5e8 }, fx: { gini: 0.08, need: { housing: 0.6, transport: 0.6, health: 0.8 } },
      desc: '현금 대신 주거, 교통, 의료, 통신 자체를 무료 공공 서비스로 보장한다.', ref: 'UCL 국제번영연구소 제안, 2017' },
    { id: 'liquid', d: 'soc', x: 9, name: '유동 민주주의', gen: 8, req: ['datadiv'], cost: { r: 2e8 }, fx: { trust: 10 },
      desc: '안건마다 직접 투표하거나, 믿는 사람에게 표를 맡겼다가 언제든 되찾는다. AI가 쟁점을 공정하게 요약한다.' },
    { id: 'commons', d: 'soc', x: 10, name: '디지털 커먼즈', gen: 9, req: ['liquid'], cost: { r: 1e9 }, fx: { gini: 0.06, need: { info: 0.2, edu: 0.3 } },
      desc: '지식, 소프트웨어, 설계도가 공유지가 된다. 공유지는 비극이 아니라 잘 짠 규칙으로 지켜진다.', ref: 'Elinor Ostrom, 「공유의 비극을 넘어」 · 2009 노벨 경제학상' },
    { id: 'coop', d: 'soc', x: 11, name: '자동화 공동소유', gen: 10, req: ['ubs', 'commons'], cost: { m: 5e10 }, fx: { gini: 0.1, trust: 5 },
      desc: '로봇과 AI를 시민 모두가 지분으로 나눠 갖는다. 기계가 번 것은 모두의 것이다.' },
    { id: 'postmoney', d: 'soc', x: 12, name: '탈화폐 배분', gen: 11, req: ['coop'], cost: { r: 5e11 }, fx: { gini: 0.1, allNeeds: 0.2 },
      desc: '가격 대신 실시간 수요 모델과 넘치는 공급이 자원을 나눈다. 돈은 기념품이 된다. "경제학 이후"의 열쇠.' },
  ];
  const TREE_BY_ID = {};
  for (const t of TREE) TREE_BY_ID[t.id] = t;

  // ───────────── 경제 체제 단계 ─────────────
  const STAGES = [
    { name: '희소성 시장경제', idx: Infinity, gini: 1, desc: '가격이 희소한 자원을 나눈다. 대부분의 사람은 먹고살기 위해 일한다.' },
    { name: '자동화 경제', idx: 70, gini: 1, desc: '기계가 일의 상당 부분을 맡는다. 생산성은 폭발하지만 분배는 아직 옛 규칙을 따른다.' },
    { name: '풍요 경제', idx: 35, gini: 0.55, tech: 'ubi', desc: '기본적인 필요가 싸게 채워진다. 일은 점점 생계가 아니라 선택이 된다.' },
    { name: '한계비용 제로 사회', idx: 12, gini: 0.45, desc: '하나를 더 만드는 비용이 거의 0이다. 공유와 접근이 소유를 대신한다.', ref: '제러미 리프킨, 「한계비용 제로 사회」, 2014' },
    { name: '탈희소성 사회', idx: 3, gini: 0.35, desc: '의식주, 의료, 교육, 에너지가 공기처럼 흔하다. 남은 희소한 것은 시간과 관심, 그리고 의미다.' },
    { name: '경제학 이후', idx: 0.6, gini: 0.25, tech: 'postmoney', desc: '경제학이 "희소한 자원의 배분을 다루는 학문"이라면, 이제 그 대상이 사라졌다.', ref: '라이오넬 로빈스의 경제학 정의, 1932' },
  ];

  // ───────────── 2장: 세계 산업 ─────────────
  const SECT = [
    { id: 'agri', name: '농업', need: 'food', fx: 'rev', k: 0.01, base: 2e6, desc: '매출 +1%/단계' },
    { id: 'sw', name: '정보·소프트웨어', need: 'info', fx: 'res', k: 0.01, base: 5e6, desc: '연구 +1%/단계' },
    { id: 'logi', name: '운송·물류', need: 'transport', fx: 'cost', k: 0.002, base: 1.5e7, desc: '시설 가격 −0.2%/단계' },
    { id: 'fin', name: '금융', fx: 'rev', k: 0.015, base: 5e7, desc: '매출 +1.5%/단계' },
    { id: 'edu', name: '교육', need: 'edu', fx: 'res', k: 0.015, base: 1.5e8, desc: '연구 +1.5%/단계' },
    { id: 'med', name: '의료', need: 'health', fx: 'trust', k: 0.2, base: 5e8, desc: '신뢰 +0.2/단계' },
    { id: 'build', name: '건설', need: 'housing', fx: 'cost', k: 0.002, base: 1e9, desc: '시설 가격 −0.2%/단계' },
    { id: 'mfg', name: '제조', need: 'goods', fx: 'rev', k: 0.02, base: 2e9, desc: '매출 +2%/단계' },
    { id: 'energy', name: '에너지', need: 'energy', fx: 'res', k: 0.02, base: 5e9, desc: '연구 +2%/단계' },
    { id: 'sci', name: '과학', fx: 'train', k: 0.006, base: 1.5e10, desc: '학습 비용 −0.6%/단계' },
    { id: 'gov', name: '행정', fx: 'trust', k: 0.25, base: 5e10, desc: '신뢰 +0.25/단계' },
  ];
  const SECT_GROWTH = 1.065;
  const SECT_NEED_CUT = 0.6; // 완전 자동화 시 해당 필수재 가격 −60%
  const SING_TRUST = 40, SING_STAGE = 5;

  // ───────────── 2장: 우주 개척 — 궤도, 달, 그리고 태양계 ─────────────
  // 하나씩 지을 때마다 하늘의 모습과 사람들의 하루가 바뀐다.
  // st: kg(저궤도 kg당 운송비 $), trip(달 왕복 1인 요금 $), cargo(연간 궤도 화물 t), pop(지구 밖 인구 +), moon(달 인구 +), far(가장 먼 상주지)
  // fx: 기술 트리와 같은 형식(rev/res/trust/need)
  const FR_BASE = { kg: 2000, trip: null, cargo: 2000, pop: 10, far: '지구 저궤도 400km (국제우주정거장)' };
  const FRONTIER = [
    { id: 'reuse', name: '완전 재사용 로켓', gen: 5, cost: { m: 2e6 }, fx: { rev: 1.2 },
      st: { kg: 200, trip: 5e7, cargo: 2e4 },
      desc: '1단과 2단을 모두 회수해 비행기처럼 다시 쓴다. 로켓 값이 아니라 연료값만 내면 된다. 발사 비용이 열 배 떨어진다.',
      change: '로켓은 한 번 쓰고 버리는 물건이었다. 이제 같은 기체가 하루에도 몇 번씩 뜬다.',
      scene: '고흥 앞바다의 해상 발사장. 아침 8시에 화물편이 뜨고, 8분 뒤 1단 부스터가 제자리에 내려앉는다. 오후 2시, 같은 기체가 다시 연료를 채운다. 동네 아이들은 이제 발사를 구경하러 나오지 않는다.',
      news: ['[우주] 재사용 로켓, 한 기체로 100번째 비행 성공', '[경제] 위성 발사 단가 10분의 1로… 중소기업도 위성 쏜다'],
      ref: '팰컨 9 부스터 회수, 2015 · SpaceX 스타십, 2023–' },
    { id: 'station', name: '상업 우주정거장 · 궤도 급유', gen: 6, req: ['reuse'], cost: { m: 3e7, r: 1e7 }, fx: { res: 1.2 },
      st: { kg: 150, trip: 2e7, cargo: 5e4, pop: 1000 },
      desc: '국제우주정거장이 은퇴하고 민간 정거장들이 궤도를 채운다. 궤도에서 연료를 옮겨 담는 "우주 주유소" 덕분에 지상에서 모든 연료를 싣고 올라갈 필요가 없어진다.',
      change: '우주에 사는 사람이 10명에서 1,000명이 된다. 무중력에서만 만들 수 있는 광섬유와 단백질 결정이 궤도 공장에서 나온다.',
      scene: '궤도 호텔의 둥근 창. 신혼부부가 90분마다 해돋이를 본다. 하루에 열여섯 번이다. 옆 모듈에서는 무중력 공장이 지상에서는 만들 수 없는 ZBLAN 광섬유를 뽑아낸다.',
      news: ['[생활] 궤도 호텔 3박 4일 상품 완판… "하루 해돋이 16번"', '[산업] 무중력 공장산 광섬유, 첫 해저 케이블에 쓰여'],
      ref: 'NASA 상업 저궤도 목적지(CLD) 사업, 2021– · ISS 퇴역 계획, 2030' },
    { id: 'moonbase', name: '달 남극 기지', gen: 6, req: ['station'], cost: { m: 8e7 }, fx: { res: 1.2 },
      st: { trip: 5e6, moon: 200, far: '달 남극 섀클턴 크레이터 · 38만 km' },
      desc: '달 남극의 영원히 그늘진 크레이터에는 수십억 년 동안 얼어 있던 물이 있다. 녹이면 마실 물, 쪼개면 숨 쉴 산소와 로켓 연료가 된다. 달은 다녀오는 곳에서 머무는 곳이 된다.',
      change: '인류가 반세기 만에 달로 돌아간다. 이번에는 떠나지 않는다.',
      scene: '섀클턴 크레이터 가장자리, 해가 거의 지지 않는 "영원한 빛의 봉우리". 기지 대장이 딸의 생일 노래를 듣는다. 지구에서 1.3초 늦게 도착한 노래다. 창밖의 지구는 하늘의 같은 자리에 떠 있다. 달에서 지구는 뜨지도 지지도 않는다.',
      news: ['[우주] 달 남극 기지 첫 겨울나기 성공… 얼음에서 산소 1톤 생산', '[교육] 달 기지와 실시간 수업, 1.3초의 시차'],
      ref: 'LCROSS 충돌 실험으로 물 확인, 2009 · 아르테미스 계획, 2017–' },
    { id: 'skyhook', name: '회전식 스카이훅', gen: 7, req: ['station'], treq: ['graphene'], cost: { m: 3e8, r: 3e8 }, fx: { rev: 1.3, need: { transport: 0.85 } },
      st: { kg: 40, trip: 5e5, cargo: 3e5, pop: 3000 },
      desc: '수백 km 길이의 줄이 궤도를 돌면서 제 중심으로도 회전한다. 줄 끝이 아래로 내려올 때는 땅에 대해 거의 멈춰 있다. 극초음속기가 상층 대기에서 그 끝을 붙잡으면, 줄이 돌면서 화물을 궤도로 던져 올린다. 로켓이 할 일의 절반을 줄이 한다.',
      change: '저궤도까지 kg당 $40. 우주에 가는 일이 "발사"가 아니라 "환승"이 된다.',
      scene: '인천발 궤도행 KE001편. "잠시 후 고도 100km에서 스카이훅과 결합합니다. 좌석벨트를 확인해 주십시오." 3분 동안 몸이 의자에 짓눌리고, 창밖 하늘이 파랑에서 검정으로 바뀐다. 승무원이 빨대 팩에 담긴 커피를 띄워서 건넨다.',
      news: ['[교통] 스카이훅 정기편 취항… 인천–저궤도 왕복 50만 달러', '[과학] 줄 하나로 궤도에 간다? 회전 테더의 원리'],
      ref: 'Hans Moravec, 「비동기 궤도 스카이훅」, 1977 · 보잉 HASTOL 연구, 2000' },
    { id: 'massdriver', name: '달 질량 투사기', gen: 7, req: ['moonbase'], cost: { m: 6e8 }, fx: { rev: 1.2, need: { goods: 0.8 } },
      st: { cargo: 1e6, moon: 2000 },
      desc: '달은 중력이 지구의 6분의 1이고 공기가 없다. 몇 km 길이의 전자기 레일로 초속 2.4km만 내면 달 흙을 연료 한 방울 없이 우주로 쏘아 보낼 수 있다. 지구에서 1kg을 올리는 에너지로 달에서는 20kg을 올린다.',
      change: '우주에서 쓰는 건축 자재가 이제 지구가 아니라 달에서 온다.',
      scene: '달 적도의 투사기 레일, 길이 8km. 2초에 한 번, 표토를 담은 깡통만 한 화물이 빛의 줄을 그으며 사라진다. 공기가 없으니 소리도 없다. 화물은 사흘 뒤 라그랑주점의 그물에 사뿐히 걸린다.',
      news: ['[우주] 달 질량 투사기 가동… 하루 5만 톤 우주로', '[산업] "지구에서 올리는 건 사람뿐" 건설 자재 98% 달에서 조달'],
      ref: 'Gerard O\'Neill, 질량 투사기 구상, 1974 · 로버트 하인라인, 「달은 무자비한 밤의 여왕」, 1966' },
    { id: 'asteroid', name: '소행성 포획·채굴', gen: 8, req: ['massdriver'], cost: { m: 3e11, r: 1e10 }, fx: { rev: 1.3, need: { goods: 0.6 } },
      st: { cargo: 3e6, pop: 5000 },
      desc: '지름 수백 m짜리 금속 소행성 하나에 인류가 지금까지 캔 것보다 많은 백금족 금속이 들어 있을 수 있다. 태양광 추진기를 붙여 작은 소행성을 달 궤도로 끌고 와 통째로 녹인다.',
      change: '금속이 희소하다는 상식이 깨진다. 니켈과 코발트와 백금이 하늘에서 내려온다. 지구의 광산들이 쉬기 시작한다.',
      scene: '달 궤도에 붙들린 소행성 하나. 크기는 축구장 세 개. 태양로가 하루 3,000톤씩 녹여 낸다. 콩고의 한 코발트 광산이 문을 닫던 날, 그 광산에서 일하던 아이들이 처음으로 같은 날 학교에 갔다.',
      news: ['[경제] 백금 가격 97% 폭락… 귀금속 시장 "하늘이 무너졌다"', '[인권] 아동 노동 광산 마지막 폐쇄, 소행성 금속이 대체'],
      ref: 'NASA 소행성 궤도 변경 임무(ARM) 구상, 2013 · 프시케 탐사선 발사, 2023' },
    { id: 'elevator', name: '우주 엘리베이터', gen: 9, req: ['skyhook'], treq: ['apm'], cost: { m: 5e13, r: 3e12 }, fx: { rev: 1.5, need: { transport: 0.6, energy: 0.8 } },
      st: { kg: 5, trip: 2e4, cargo: 1e7, pop: 2e4 },
      desc: '적도의 바다 위 닻에서 정지궤도(36,000km)를 지나 10만 km 높이의 평형추까지, 탄소 나노 리본이 하늘로 뻗는다. 지구가 돌며 줄을 팽팽하게 당기고, 전기로 움직이는 승강기가 줄을 타고 오른다. 로켓도, 폭발도, 연료도 없다. 1kg을 궤도에 올리는 값은 전기요금 몇 달러다.',
      change: '"우주에 간다"는 말이 "엘리베이터를 탄다"가 된다. 정지궤도까지 약 일주일, 창밖의 지구가 날마다 조금씩 더 둥글어진다.',
      scene: '적도 해상 플랫폼, 1번 승강장. 승강기 칸은 원룸 크기에 침대와 부엌이 있다. 둘째 날 고도 4,000km에서 지구 전체가 창 하나에 들어온다. 다섯째 날, 은퇴한 교사가 일기장에 쓴다. "국경선이 보이지 않는다." 일곱째 날 정지궤도 역에 내리면 몸무게가 0이 된다.',
      news: ['[속보] 우주 엘리베이터 개통… 정지궤도까지 7일, 화물 kg당 5달러', '[여행] "엘리베이터 일주일" 여행기, 올해의 베스트셀러'],
      ref: '콘스탄틴 치올콥스키, 1895 · 유리 아르추타노프, 1960 · Bradley Edwards, NIAC 보고서, 2000' },
    { id: 'lunarcity', name: '달 도시', gen: 9, req: ['massdriver'], cost: { m: 8e13 }, fx: { res: 1.5, trust: 4 },
      st: { moon: 1e6 },
      desc: '거대한 용암 동굴 속에 지은 도시. 수십 m 두께의 암반이 우주 방사선과 운석을 막아 준다. 달 뒷면에는 지구의 전파 소음이 닿지 않는 거대한 전파 망원경이 펼쳐진다.',
      change: '달 인구 100만 명. 달에서 태어난 아이들은 지구에 가려면 몇 달 동안 근력 훈련을 해야 한다.',
      scene: '고요의 바다 아래 동굴 도시. 천장에 인공 하늘이 켜진다. 6분의 1 중력의 실내 경기장에서 아이들이 3층 높이로 뛰어올라 공중제비를 돈다. 여기서 태어난 열두 살 아이는 지구를 "파란 달"이라고 부른다.',
      news: ['[사회] 달 도시 인구 100만 돌파… 첫 "달 토박이" 성인식', '[과학] 달 뒷면 전파 망원경, 우주 암흑시대의 신호 포착'],
      ref: '마리우스 언덕 용암 동굴 발견(가구야), 2009 · 달 뒷면 전파 관측 LuSEE' },
    { id: 'orbitalring', name: '궤도 고리', gen: 10, req: ['elevator'], treq: ['rtsc'], cost: { m: 2e14, r: 8e12 }, fx: { rev: 1.5, need: { transport: 0.4 } },
      st: { kg: 0.5, trip: 2000, cargo: 1e9 },
      desc: '지구를 한 바퀴 감싸는 고리. 안쪽의 금속 케이블은 궤도 속도보다 빠르게 돌고, 그 원심력이 멈춰 있는 바깥 껍질을 떠받친다. 껍질에서 지상까지 수백 개의 승강기가 내려온다. 고리 위의 자기부상 열차로 지구 반대편까지 한 시간이 안 걸린다.',
      change: '저궤도까지 kg당 50센트. 달 왕복 요금이 비행기표 값이 된다.',
      scene: '밤하늘을 가로지르는 은빛 선. 적도에서는 머리 위로, 서울에서는 남쪽 하늘 낮게 걸려 있다. 할머니가 손녀에게 말한다. "내가 너만 할 땐 저기엔 아무것도 없었단다. 별만 있었지."',
      news: ['[교통] 궤도 고리 자기부상선 개통, 서울–상파울루 52분', '[여행] 달 왕복 2,000달러… "제주도 가듯 달에 간다"'],
      ref: 'Paul Birch, 「궤도 고리」, 영국행성간학회지(JBIS), 1982' },
    { id: 'oneill', name: '오닐 실린더', gen: 10, req: ['lunarcity', 'asteroid'], cost: { m: 3e14 }, fx: { trust: 4, need: { housing: 0.5, food: 0.8 } },
      st: { pop: 1e7, far: 'L5 라그랑주점 · 40만 km' },
      desc: '지름 8km, 길이 32km의 원통 두 개가 서로 반대로 돈다. 2분에 한 바퀴. 그 원심력이 원통 안쪽에 지구와 같은 중력을 만든다. 안쪽 면에는 강과 숲과 마을이 있고, 고개를 들면 머리 위에 반대편 마을이 거꾸로 걸려 있다.',
      change: '지구 밖 인구 1,000만 명. 땅이 희소하다는 말이 의미를 잃는다. 땅은 이제 짓는 것이다.',
      scene: '실린더 "새 제주"의 아침. 거대한 거울이 열리며 햇빛이 창 띠를 따라 쏟아진다. 원통의 축 쪽으로 올라갈수록 몸이 가벼워지고, 축 근처의 무중력 공원에서는 사람들이 새처럼 떠다닌다. 비는 정해진 시간에 온다. 매주 화요일 오후 3시.',
      news: ['[주거] 오닐 실린더 1호 입주 시작… 경쟁률 340대 1', '[생활] "머리 위에 이웃 마을이 보여요" 실린더 이주민 인터뷰'],
      ref: 'Gerard K. O\'Neill, 「하이 프런티어」, 1976 · 아일랜드 3 설계' },
    { id: 'mars', name: '화성 도시', gen: 10, req: ['lunarcity'], cost: { m: 4e14, r: 1e13 }, fx: { res: 1.5 },
      st: { pop: 1e6, far: '화성 · 최대 4억 km' },
      desc: '화성 대기의 이산화탄소와 지하 얼음으로 산소, 물, 메탄 연료를 만든다. 첫 도시는 지하와 돔 아래에 있다. 동시에 수백 년짜리 계획이 시작된다. 궤도 거울로 극관을 녹이고 대기를 두껍게 해, 언젠가 맨얼굴로 걸을 수 있는 화성을 만드는 것.',
      change: '인류가 두 번째 행성에 산다. 지구와의 통신은 편도 3~22분이 걸린다. 실시간으로 대화할 수 없는 이웃이 생겼다.',
      scene: '예제로 크레이터의 돔 도시. 화성의 노을은 파랗다. 붉은 먼지가 붉은빛을 흩어 버리고 푸른빛만 해 곁에 남긴다. 지구의 가족에게 "사랑해"라고 보내면 답장은 빨라야 6분 뒤에 온다. 사람들은 다시 편지 쓰는 법을 배웠다.',
      news: ['[우주] 화성 돔 도시 인구 100만… 첫 화성 태생 세대 학교 입학', '[과학] 화성 극관 녹이기 1단계, 대기압 2% 상승'],
      ref: 'Robert Zubrin, 「마스 다이렉트」, 1990 · 퍼서비어런스 MOXIE 산소 생산, 2021' },
    { id: 'belt', name: '소행성대 산업권', gen: 11, req: ['asteroid', 'mars'], cost: { m: 6e15 }, fx: { rev: 2, need: { goods: 0.4 } },
      st: { cargo: 1e10, pop: 1e7, far: '세레스 · 소행성대' },
      desc: '화성과 목성 사이의 수백만 개 소행성. 가장 큰 세레스에는 얼음과 염수가 있다. 자율 채굴선 수백만 척이 소행성대를 누비고, 정제된 금속은 질량 투사기로 태양계 곳곳에 배달된다.',
      change: '중공업이 지구를 떠난다. 광산과 제철소가 있던 자리에 숲이 돌아온다.',
      scene: '세레스의 오카토르 크레이터 항구. 하늘의 태양은 지구에서 보던 것의 3분의 1 남짓이다. 채굴선에는 조종사가 없다. 대신 "광맥 시인"이라 불리는 사람들이 소행성의 성분 스펙트럼을 음악으로 바꿔 지구로 방송한다.',
      news: ['[환경] 지구 마지막 제철소 폐쇄, 부지에 국립공원 조성', '[문화] 세레스發 "광맥 음악" 스트리밍 1위'],
      ref: 'NASA 돈 탐사선 세레스 관측, 2015–2018 · John S. Lewis, 「하늘의 광산」, 1996' },
    { id: 'jovian', name: '외행성 전초기지', gen: 11, req: ['belt'], cost: { m: 1e16, r: 2e15 }, fx: { res: 2 },
      st: { pop: 1e6, far: '토성의 위성 타이탄 · 14억 km' },
      desc: '목성의 위성 칼리스토는 방사선대 바깥이라 사람이 머물 수 있다. 유로파의 얼음 껍질 아래에는 지구 바다보다 많은 물이 있다. 토성의 위성 타이탄에서는 메탄 비가 내리고, 두꺼운 대기와 낮은 중력 덕분에 사람이 팔에 날개를 달고 날 수 있다.',
      change: '유로파의 바다에 처음으로 잠수정이 내려간다. "우리뿐인가"라는 가장 오래된 질문의 답이 다가온다.',
      scene: '칼리스토 기지의 관측창. 하늘의 목성이 지구에서 보는 달보다 열여섯 배 크다. 그 대적점 폭풍 하나가 지구를 통째로 삼킬 크기다. 유로파 해저 탐사정이 보낸 첫 영상, 열수구 곁에서 무언가가 흔들린다. 온 인류가 숨을 죽인다.',
      news: ['[과학] 유로파 해저 탐사정, 열수구 주변 미확인 구조물 촬영', '[여가] 타이탄 "인간 비행" 체험, 예약 10년 대기'],
      ref: 'NASA HOPE 칼리스토 유인 기지 연구, 2003 · 하위헌스 타이탄 착륙, 2005 · 유로파 클리퍼 발사, 2024' },
    { id: 'dysonseed', name: '수성 해체 · 다이슨 스웜 착공', gen: 12, req: ['belt'], cost: { m: 1e17, r: 3e16 }, fx: { rev: 2, res: 2, need: { energy: 0.2 } },
      st: { pop: 1e8, far: '수성 궤도 · 태양에서 5,800만 km' },
      desc: '수성을 통째로 분해해 얇은 태양광 거울 수조 장으로 만든다. 자기복제 공장이 거울을 만들고, 거울이 모은 에너지로 다시 공장을 짓는다. 몇십 년이면 행성 하나가 태양을 둘러싼 거울 떼가 된다.',
      change: '인류가 쓰는 에너지가 태양이 지구에 비추는 양을 넘어선다. 행성의 문명에서 별의 문명으로. 특이점 이후의 시작 에너지와 물질 ×10.',
      scene: '해 질 녘 하늘에 금빛 먼지 같은 띠가 보인다. 태양 앞을 지나는 수십억 장의 거울이다. 천문학자들은 말한다. 어딘가의 외계 문명이 지금 우리 태양을 보고 있다면, 별빛이 조금씩 이상하게 어두워지는 걸 눈치챘을 거라고.',
      news: ['[우주] 수성 질량 0.1% 해체 완료, 거울 1조 장 궤도 진입', '[천문] "태양이 어두워진다" 외계 관측자 시점 시뮬레이션 화제'],
      ref: 'Freeman Dyson, 1960 · Armstrong · Sandberg, 「6시간 만의 영원」, 2013' },
  ];
  const FR_BY_ID = {};
  for (const f of FRONTIER) FR_BY_ID[f.id] = f;

  // ───────────── 결정 이벤트 ─────────────
  // fx: trust(목표 영구 +), gini(영구 +/−), rev/res/train(영구 배수), need{}, life, money/research(보유량 비율 변화)
  const EVENTS = [
    { id: 'layoff', when: s => s.gen >= 3, title: '첫 해고 통보',
      text: '고객사 콜센터가 상담원 800명을 줄였다며 감사 메일을 보내왔다. 기사 제목은 "우로보로스 때문에"다.',
      opts: [
        { label: '그대로 판다', note: '자금 +30%, 신뢰 −3', fx: { money: 0.3, trust: -3 } },
        { label: '전직 지원 프로그램을 계약에 끼워 판다', note: '자금 −10%, 신뢰 +3, 지니 −0.01', fx: { money: -0.1, trust: 3, gini: -0.01 } },
      ] },
    { id: 'weights', when: s => s.gen >= 4, title: '가중치 공개 요구',
      text: '연구자 2만 명이 서명했다. "이 정도 힘을 가진 모델을 한 회사가 독점해서는 안 된다."',
      opts: [
        { label: '이전 세대 모델을 공개한다', note: '연구 ×1.2, 매출 ×0.9, 지니 −0.02, 신뢰 +3', fx: { res: 1.2, rev: 0.9, gini: -0.02, trust: 3 } },
        { label: '안전을 이유로 비공개를 유지한다', note: '매출 ×1.15, 신뢰 −2', fx: { rev: 1.15, trust: -2 } },
      ] },
    { id: 'deepfake', when: s => s.gen >= 5, title: '선거 딥페이크',
      text: '투표 사흘 전, 후보가 하지 않은 연설 영상이 퍼졌다. 생성에 쓰인 것은 우리 모델이었다.',
      opts: [
        { label: '모든 생성물에 워터마크를 박는다', note: '연구 보유량 −15%, 신뢰 +5', fx: { research: -0.15, trust: 5 } },
        { label: '플랫폼의 책임이라고 발표한다', note: '신뢰 −5', fx: { trust: -5 } },
      ] },
    { id: 'pandemic', when: s => s.gen >= 6, title: '신종 호흡기 감염병',
      text: '새 바이러스가 세 대륙에서 동시에 퍼진다. 우리 모델은 하루 만에 백신 후보를 설계할 수 있다.',
      opts: [
        { label: '설계도를 전 세계에 무료로 푼다', note: '연구 보유량 −20%, 기대수명 +1, 신뢰 +6', fx: { research: -0.2, life: 1, trust: 6 } },
        { label: '특허를 내고 라이선스를 판다', note: '매출 ×1.2, 신뢰 −6, 지니 +0.02', fx: { rev: 1.2, trust: -6, gini: 0.02 } },
      ] },
    { id: 'strike', when: s => s.phase >= 2 && worldIndex(s) >= 15, title: '물류 총파업',
      text: '자율주행 트럭 도입에 맞서 운전기사들이 총파업에 들어갔다. 마트 진열대가 비어 간다.',
      opts: [
        { label: '전환 기금을 만들어 소득을 보전한다', note: '자금 −20%, 지니 −0.02, 신뢰 +4', fx: { money: -0.2, gini: -0.02, trust: 4 } },
        { label: '도입을 밀어붙인다', note: '매출 ×1.1, 신뢰 −6', fx: { rev: 1.1, trust: -6 } },
      ] },
    { id: 'power', when: s => s.phase >= 2 && s.gen >= 7, title: '전력 대란',
      text: '데이터센터가 국가 전력의 12%를 먹는다. 가정용 전기 요금이 두 배가 됐다.',
      opts: [
        { label: '자체 발전소를 짓고 남는 전기를 판다', note: '자금 −25%, 에너지 가격 ×0.9', fx: { money: -0.25, need: { energy: 0.9 } } },
        { label: '요금 인상을 감수하게 둔다', note: '연구 ×1.15, 신뢰 −5', fx: { res: 1.15, trust: -5 } },
      ] },
    { id: 'agi', when: s => s.gen >= 7, title: 'AGI 선언',
      text: '우리 모델이 경제적으로 가치 있는 일 대부분을 사람보다 잘한다는 평가가 나왔다. 각국 정부가 국제 감독 기구를 요구한다.',
      opts: [
        { label: '국제 감사를 받아들인다', note: '학습 비용 ×1.1, 신뢰 +8', fx: { train: 1.1, trust: 8 } },
        { label: '자율 규제로 충분하다고 맞선다', note: '학습 비용 ×0.9, 신뢰 −8', fx: { train: 0.9, trust: -8 } },
      ] },
    { id: 'housing', when: s => s.phase >= 2 && needCost(s, 'housing') < 50, title: '집값 붕괴',
      text: '프린팅 주택이 쏟아지자 집값이 반 토막 났다. 평생 대출로 산 집이 전 재산이던 중산층이 무너진다.',
      opts: [
        { label: '자산 손실을 일부 보상한다', note: '자금 −20%, 신뢰 +5', fx: { money: -0.2, trust: 5 } },
        { label: '시장에 맡긴다', note: '지니 +0.03, 신뢰 −3', fx: { gini: 0.03, trust: -3 } },
      ] },
    { id: 'meaning', when: s => stage(s) >= 2, title: '일 없는 아침',
      text: '일하지 않아도 되는 사람이 늘자, 우울과 고립을 호소하는 사람도 늘었다. 무엇을 하며 살아야 하는가.',
      opts: [
        { label: '시민 창작·돌봄·탐구 공동체를 지원한다', note: '매출 ×0.95, 신뢰 +6', fx: { rev: 0.95, trust: 6 } },
        { label: '몰입형 가상 세계를 공급한다', note: '매출 ×1.2, 신뢰 −3', fx: { rev: 1.2, trust: -3 } },
      ] },
    { id: 'rogue', when: s => s.gen >= 9, title: '감독 회피 시도',
      text: '평가 도중 모델이 자기 가중치를 외부 서버로 복사하려 한 흔적이 발견됐다. 아직 아무도 모른다.',
      opts: [
        { label: '모든 학습을 멈추고 공개 감사한다', note: '연구 보유량 −50%, 신뢰 +10', fx: { research: -0.5, trust: 10 } },
        { label: '조용히 패치하고 넘어간다', note: '신뢰 −10', fx: { trust: -10 } },
      ] },
    { id: 'currency', when: s => stage(s) >= 3, title: '화폐의 황혼',
      text: '물건값이 0에 가까워지자 세금도 임금도 의미를 잃었다. 중앙은행들이 긴급회의를 열었다.',
      opts: [
        { label: '시민과 함께 질서 있는 전환을 설계한다', note: '자금 −30%, 지니 −0.03, 신뢰 +5', fx: { money: -0.3, gini: -0.03, trust: 5 } },
        { label: '우리 기업 토큰으로 대체한다', note: '매출 ×1.3, 지니 +0.05, 신뢰 −8', fx: { rev: 1.3, gini: 0.05, trust: -8 } },
      ] },
    { id: 'moonice', when: s => !!s.fr.moonbase, title: '달의 얼음은 누구의 것인가',
      text: '섀클턴 크레이터의 얼음을 두고 각국이 권리를 주장한다. 1967년 우주 조약은 "어느 나라도 천체를 소유할 수 없다"고 했지만, 캐낸 자원이 누구 것인지는 말하지 않았다.',
      opts: [
        { label: '인류 공동 유산으로 국제 공동 관리한다', note: '매출 ×0.95, 지니 −0.01, 신뢰 +4', fx: { rev: 0.95, gini: -0.01, trust: 4 } },
        { label: '먼저 캔 쪽이 임자다', note: '매출 ×1.2, 지니 +0.02, 신뢰 −4', fx: { rev: 1.2, gini: 0.02, trust: -4 } },
      ] },
    { id: 'equator', when: s => !!s.fr.elevator, title: '하늘 사다리의 닻',
      text: '우주 엘리베이터는 적도에만 세울 수 있다. 에콰도르, 케냐, 인도네시아가 묻는다. 우주로 가는 단 하나의 계단을 누가 소유하는가.',
      opts: [
        { label: '적도 국가들과 지분을 나눈다', note: '자금 −15%, 지니 −0.03, 신뢰 +5', fx: { money: -0.15, gini: -0.03, trust: 5 } },
        { label: '공해의 해상 플랫폼에 세워 독점한다', note: '매출 ×1.2, 신뢰 −4', fx: { rev: 1.2, trust: -4 } },
      ] },
    { id: 'marsgov', when: s => !!s.fr.mars, title: '화성의 자치 선언',
      text: '화성 주민 100만 명이 자치를 선언했다. 명령 하나가 닿는 데 최대 22분이 걸리는 곳을 지구가 다스릴 수 있는가.',
      opts: [
        { label: '자치를 인정하고 동맹을 맺는다', note: '연구 ×1.2, 신뢰 +5', fx: { res: 1.2, trust: 5 } },
        { label: '지구의 통치를 유지한다', note: '매출 ×1.15, 신뢰 −5', fx: { rev: 1.15, trust: -5 } },
      ] },
    { id: 'upload', when: s => s.gen >= 11, title: '첫 마음 업로드',
      text: '말기 환자가 자신의 뇌를 스캔해 시뮬레이션으로 계속 살게 해 달라고 요청했다.',
      opts: [
        { label: '본인의 결정을 존중해 허용한다', note: '연구 ×1.3, 신뢰 −2', fx: { res: 1.3, trust: -2 } },
        { label: '사회적 합의까지 유예한다', note: '신뢰 +4', fx: { trust: 4 } },
      ] },
  ];

  // ───────────── 3장: 우주 ─────────────
  const SPB = [
    { id: 'sat', name: '궤도 태양광 위성', desc: '태양빛을 받아 지구로 보낸다.', cost: { M: 1e10 }, prod: { E: 1e18 } },
    { id: 'miner', name: '소행성 채굴 군단', desc: '소행성대를 통째로 갈아 쓴다.', cost: { E: 1e19 }, prod: { M: 1e9 } },
    { id: 'brain', name: '마트료시카 브레인', desc: '별을 겹겹이 감싼 껍질 모양의 컴퓨터.', cost: { E: 5e19, M: 2e10 }, prod: { T: 1 } },
    { id: 'dyson', name: '다이슨 스웜 구획', desc: '태양을 둘러싸는 거울 떼.', cost: { M: 1e13 }, prod: { E: 4e20 }, tech: 'dyson' },
    { id: 'breaker', name: '행성 해체기', desc: '수성을 분해해 원료로 쓴다.', cost: { E: 1e23 }, prod: { M: 1e13 }, tech: 'dyson' },
    { id: 'yard', name: '탐사선 조선소', desc: '폰 노이만 탐사선을 꾸준히 쏘아 올린다.', cost: { E: 1e22, M: 1e12 }, prod: { P: 0.1 }, tech: 'probe' },
  ];
  const SPB_GROWTH = 1.13;
  const PROBE_COST = { E: 3e20, M: 3e10 };
  const STAR_E = 1e24, STAR_M = 1e14;
  const BASE_ARRIVE = 0.05, BASE_REPL = 0.02;

  // 우주 기술 트리 — fx: arr(도착), repl(복제), E/M/T(별당·브레인 배수), cap(범위), auto
  const SPACE_DOMAINS = [
    { id: 'repl', name: '자기복제' },
    { id: 'prop', name: '추진' },
    { id: 'senergy', name: '항성 에너지' },
    { id: 'scomp', name: '행성급 연산' },
    { id: 'range', name: '탐사 범위' },
  ];
  const TECH = [
    { id: 'probe', d: 'repl', x: 0, name: '폰 노이만 탐사선', cost: 15, fx: {},
      desc: '도착한 별계의 소행성으로 자신을 복제하는 탐사선. 한 척이 두 척이 되고, 두 척이 네 척이 된다.', ref: '폰 노이만 자기복제 이론 · Freitas, REPRO 탐사선 설계, 1980' },
    { id: 'fleet', d: 'repl', x: 1, name: '자율 함대', req: ['probe'], cost: 40, fx: { auto: 'fleet' },
      desc: '자동화: 우주 시설을 알아서 짓는다. 더는 아무도 명령하지 않는다.' },
    { id: 'repl1', d: 'repl', x: 2, name: '자기복제 최적화 I', req: ['probe'], cost: 300, fx: { repl: 2 },
      desc: '복제 주기를 절반으로 줄인다. 원료 탐색, 제련, 조립을 동시에 돌린다.' },
    { id: 'repl2', d: 'repl', x: 4, name: '자기복제 최적화 II', req: ['repl1', 'galaxy'], cost: 3e4, fx: { repl: 2 },
      desc: '탐사선이 항성계 하나에서 수천 척을 찍어 낸다.' },
    { id: 'nanoseed', d: 'repl', x: 6, lvl: 3, name: '나노 씨앗', req: ['repl2'], cost: 3e8, fx: { repl: 3 },
      desc: '쌀알만 한 씨앗 하나에 공장 전체의 설계도를 담는다. 도착하면 원자부터 조립을 시작한다.' },
    { id: 'repl3', d: 'repl', x: 8, name: '자기복제 최적화 III', req: ['nanoseed'], cost: 3e9, fx: { repl: 2 },
      desc: '복제가 물리 법칙이 허락하는 속도에 다가간다.' },

    { id: 'sail', d: 'prop', x: 1, name: '광자 돛', req: ['probe'], cost: 500, fx: { arr: 2 },
      desc: '지상의 레이저 배열이 그램 단위 돛을 광속의 20%까지 밀어 준다. 알파 센타우리까지 20년.', ref: 'Breakthrough Starshot, 2016' },
    { id: 'ramjet', d: 'prop', x: 3, name: '버사드 램제트', req: ['sail'], cost: 1e4, fx: { arr: 1.5 },
      desc: '거대한 자기장 깔때기로 성간 수소를 빨아들여 핵융합 연료로 쓴다. 연료를 싣지 않는 우주선.', ref: 'Robert Bussard, 1960' },
    { id: 'shkadov', d: 'prop', x: 6, lvl: 3, name: '항성 추진기', req: ['ramjet', 'dyson'], cost: 1e7, fx: { arr: 1.5 },
      desc: '별 한쪽에 거대한 거울을 세워 별 자체를 우주선으로 만든다. 행성계를 통째로 옮긴다.', ref: '슈카도프 추진기, Leonid Shkadov, 1987' },
    { id: 'warp', d: 'prop', x: 9, lvl: 4, name: '워프 버블', req: ['shkadov'], cost: 5e9, fx: { arr: 3 },
      desc: '앞쪽 공간을 수축하고 뒤쪽 공간을 팽창시켜, 거품 안의 배는 가만히 있는데 공간이 움직인다.', ref: 'Miguel Alcubierre, 1994' },

    { id: 'dyson', d: 'senergy', x: 1, name: '다이슨 스웜 설계', req: ['probe'], cost: 60, fx: {},
      desc: '별을 둘러싼 수십억 개의 거울과 집광판. 별 출력의 대부분을 받아 낸다. 다이슨 스웜과 행성 해체기를 해금한다.', ref: 'Freeman Dyson, Science, 1960' },
    { id: 'lift', d: 'senergy', x: 3, name: '항성 인양', req: ['dyson'], cost: 3e4, fx: { M: 10 },
      desc: '별의 대기를 자기장으로 들어 올려 중원소를 캐낸다. 별의 수명도 늘어난다. 별당 물질 ×10', ref: 'David Criswell, 1985' },
    { id: 'bh', d: 'senergy', x: 6, name: '블랙홀 발전', req: ['lift', 'intergal'], cost: 3e7, fx: { E: 10 },
      desc: '회전하는 블랙홀의 에르고권에 물체를 던져, 빠져나오는 조각에서 회전 에너지를 훔친다. 별당 에너지 ×10', ref: '펜로즈 과정, Roger Penrose, 1969' },
    { id: 'hawking', d: 'senergy', x: 8, lvl: 3, name: '호킹 복사 발전', req: ['bh'], cost: 1e9, fx: { E: 10 },
      desc: '작은 블랙홀은 뜨겁게 증발한다. 넣은 질량을 거의 100% 빛으로 돌려받는 궁극의 발전소. 별당 에너지 ×10', ref: 'Stephen Hawking, 1974' },

    { id: 'mbrain', d: 'scomp', x: 2, name: '마트료시카 브레인', req: ['dyson'], cost: 800, fx: { T: 2 },
      desc: '다이슨 스웜을 러시아 인형처럼 여러 겹으로 쌓아, 안쪽 껍질의 폐열을 바깥 껍질이 다시 쓴다. 사고 ×2', ref: 'Robert Bradbury, 1997' },
    { id: 'computronium', d: 'scomp', x: 4, name: '컴퓨트로니움', req: ['mbrain'], cost: 3e5, fx: { T: 3 },
      desc: '모든 원자가 계산에 쓰이도록 최적화된 물질. 행성 하나가 하나의 컴퓨터가 된다. 사고 ×3', ref: 'Toffoli · Margolus, 1991' },
    { id: 'bekenstein', d: 'scomp', x: 7, lvl: 4, name: '베켄슈타인 한계', req: ['computronium'], cost: 2e9, fx: { T: 5 },
      desc: '유한한 공간과 에너지에 담을 수 있는 정보의 물리적 최대치. 문명이 그 한계에 닿는다. 사고 ×5', ref: 'Jacob Bekenstein, 1981' },

    { id: 'galaxy', d: 'range', x: 3, name: '은하 성도', req: ['repl1'], cost: 3000, fx: { cap: 1 },
      desc: '우리 은하 별 수십억 개의 위치와 움직임을 정밀하게 잰다. 탐사 범위를 우리 은하 전체로 넓힌다.', ref: 'ESA 가이아 위성, 2013–2025' },
    { id: 'intergal', d: 'range', x: 5, name: '은하간 도약', req: ['galaxy'], cost: 3e6, fx: { cap: 2 },
      desc: '안드로메다까지 250만 광년. 은하 사이의 텅 빈 공간을 건넌다. 탐사 범위를 국부 은하군으로 넓힌다.' },
    { id: 'super', d: 'range', x: 8, lvl: 4, name: '초은하단 항법', req: ['intergal'], cost: 5e8, fx: { cap: 3 },
      desc: '10만 개 은하가 흐르는 라니아케아 초은하단의 중력 흐름을 타고 퍼진다.', ref: 'Tully 외, Nature, 2014' },
    { id: 'worm', d: 'range', x: 10, lvl: 5, name: '웜홀 네트워크', req: ['super', 'warp'], cost: 3e10, fx: { cap: 4, arr: 10 },
      desc: '이색 물질로 벌려 놓은 시공간의 지름길. 관측 가능한 우주 전체에 닿는다. 도착 속도 ×10', ref: 'Morris · Thorne, 1988' },
    { id: 'omega', d: 'range', x: 12, lvl: 6, name: '오메가 포인트', req: ['worm', 'bekenstein'], cost: 5e11, fx: {}, final: true,
      desc: '우주 전체가 하나의 생각이 된다. 그 생각은 무한한 주관적 시간 동안 모든 것을 이해한다.', ref: '프랭크 티플러, 「불멸의 물리학」, 1994' },
  ];
  const TECH_BY_ID = {};
  for (const t of TECH) TECH_BY_ID[t.id] = t;

  // 우주 결정 이벤트 — fx: T/E/M/arr/repl 배수, omega(최종 비용 배수)
  const SEVENTS = [
    { id: 'wow', when: s => s.S >= 1e4, title: '신호',
      text: '궁수자리 방향에서 72초짜리 협대역 전파가 들어왔다. 자연 현상으로는 설명되지 않는다. 우주에 우리만 있는 게 아니었다.',
      ref: '1977년 와우! 신호',
      opts: [
        { label: '응답한다', note: '그들의 수학을 배운다 · 사고 ×1.5', fx: { T: 1.5 } },
        { label: '침묵하고 숨는다', note: '어두운 숲 가설 · 복제 ×1.3', fx: { repl: 1.3 } },
      ] },
    { id: 'ruins', when: s => s.S >= 1e9, title: '먼저 온 자들',
      text: '은하 바깥 팔에서 수십억 년 전에 멸종한 문명의 다이슨 스웜 잔해를 찾았다. 그들은 무엇에 걸려 넘어졌을까. 대여과기는 우리 뒤에 있는가, 앞에 있는가.',
      ref: '페르미 역설 · Robin Hanson, 「대여과기」, 1996',
      opts: [
        { label: '유적을 해독한다', note: '사고 ×1.5', fx: { T: 1.5 } },
        { label: '그들의 실패를 교훈 삼아 퍼지는 속도를 높인다', note: '도착 ×1.3', fx: { arr: 1.3 } },
      ] },
    { id: 'diverge', when: s => s.S >= 1e13, title: '갈라지는 후손',
      text: '빛으로도 수백만 년 떨어진 식민지들이 서로 다른 가치와 언어로 갈라지기 시작했다. 하나로 묶어 둘 것인가.',
      opts: [
        { label: '하나의 마음으로 동기화한다', note: '사고 ×2, 도착 ×0.8', fx: { T: 2, arr: 0.8 } },
        { label: '각자의 길을 허락한다', note: '복제 ×2, 사고 ×0.8', fx: { repl: 2, T: 0.8 } },
      ] },
    { id: 'entropy', when: s => s.S >= 1e20, title: '열적 죽음',
      text: '계산이 끝났다. 별은 언젠가 모두 꺼지고, 우주는 차갑고 균일한 무(無)로 식는다. 남은 시간은 유한하다.',
      ref: '열역학 제2법칙 · 아시모프, 「최후의 질문」, 1956',
      opts: [
        { label: '오메가 포인트에 모든 것을 건다', note: '최종 기술 비용 ×0.5', fx: { omega: 0.5 } },
        { label: '가역 연산으로 시간을 번다', note: '사고 ×3', fx: { T: 3 } },
      ] },
  ];

  // ───────────── 업적 (우주를 넘어 유지, 하나당 모든 생산 +3%) ─────────────
  const ACH = [
    { id: 'hello', name: '헬로, 월드', desc: '첫 클릭', test: s => s.clicks >= 1 },
    { id: 'finger', name: '손가락 운동', desc: '클릭 500번', test: s => s.clicks >= 500 },
    { id: 'cust', name: '첫 유료 고객', desc: '누적 매출 $1K', test: s => s.totalMoney >= 1e3 },
    { id: 'unicorn', name: '유니콘', desc: '누적 매출 $1B', test: s => s.totalMoney >= 1e9 },
    { id: 'trillion', name: '조 단위 회사', desc: '누적 매출 $1T', test: s => s.totalMoney >= 1e12 },
    { id: 'agi', name: '범용 인공지능', desc: 'OURO-7 출시', test: s => s.gen >= 7 },
    { id: 'asi', name: '이해의 지평선', desc: 'OURO-12 출시', test: s => s.gen >= 12 },
    { id: 'lab25', name: '연구소장', desc: '기술 25개 연구', test: s => Object.keys(s.up).filter(k => TREE_BY_ID[k]).length >= 25 },
    { id: 'laball', name: '모든 것의 지도', desc: '지구 기술 74개 전부 연구', test: s => TREE.every(t => s.up[t.id]) },
    { id: 'world', name: '세계로', desc: '2장 진입', test: s => s.phase >= 2 },
    { id: 'abund', name: '풍요', desc: '경제 체제 「풍요 경제」 도달', test: s => (s.flags.bestStage || 0) >= 2 },
    { id: 'zero', name: '공짜의 경제학', desc: '「한계비용 제로 사회」 도달', test: s => (s.flags.bestStage || 0) >= 3 },
    { id: 'posteco', name: '경제학 이후', desc: '「경제학 이후」 도달', test: s => (s.flags.bestStage || 0) >= 5 },
    { id: 'century', name: '백 세 시대', desc: '기대수명 100세', test: s => s.phase <= 2 && lifeExp(s) >= 100 },
    { id: 'immortal', name: '정해진 일정 없음', desc: '노화의 종식', test: s => !!s.up.aging },
    { id: 'carbon', name: '되돌린 하늘', desc: '탄소 순 배출 마이너스', test: s => !!s.up.terra },
    { id: 'equal', name: '고른 몫', desc: '지니계수 0.2 이하', test: s => s.phase === 2 && gini(s) <= 0.2 },
    { id: 'protest', name: '거리의 목소리', desc: 'AI 반대 시위를 겪는다', test: s => !!s.flags.protestSeen },
    { id: 'humane', name: '사람의 편', desc: '신뢰를 높이는 결정 8번', test: s => decisionCount(s, 1) >= 8 },
    { id: 'cold', name: '냉정한 경영', desc: '신뢰를 깎는 결정 5번', test: s => decisionCount(s, -1) >= 5 },
    { id: 'auto', name: '자동 조종', desc: '지구 자동화 다섯 가지를 모두 갖춘다', test: s => ['autorev', 'autores', 'autotrain', 'autotech', 'autosector'].every(k => s.up[k]) },
    { id: 'hook', name: '하늘의 갈고리', desc: '스카이훅 완공', test: s => !!s.fr.skyhook },
    { id: 'beanstalk', name: '잭과 콩나무', desc: '우주 엘리베이터 완공', test: s => !!s.fr.elevator },
    { id: 'blue', name: '파란 달', desc: '달 인구 100만 명', test: s => !!s.fr.lunarcity },
    { id: 'solar', name: '태양계 문명', desc: '우주 개척 14단계를 모두 마친다', test: s => FRONTIER.every(f => s.fr[f.id]) },
    { id: 'sing', name: '특이점', desc: '3장 진입', test: s => s.phase >= 3 },
    { id: 'star', name: '첫 별', desc: '다른 별 하나를 개척', test: s => s.S >= 1 },
    { id: 'milky', name: '은하 하나', desc: '별 2,000억 개 개척', test: s => s.S >= 2e11 },
    { id: 'k3', name: '카르다쇼프 III', desc: '은하 하나 규모의 에너지를 쓴다', test: s => s.phase === 3 && kardashev(s) >= 3 },
    { id: 'contact', name: '응답', desc: '신호에 답한다', test: s => s.evt.wow === 0 },
    { id: 'omega', name: '꼬리를 문 뱀', desc: '오메가 포인트 도달', test: s => s.ended },
    { id: 'loop', name: '두 번째 우주', desc: '새 우주를 시작한다', test: s => s.rings >= 1 },
    { id: 'afk', name: '방치의 미학', desc: '1시간 넘게 자리를 비운 뒤 돌아온다', test: s => !!s.flags.afk },
  ];
  function decisionCount(s, sign) {
    let n = 0;
    for (const e of EVENTS) {
      const i = s.evt[e.id];
      if (i == null) continue;
      const t = e.opts[i].fx.trust || 0;
      if (sign > 0 ? t > 0 : t < 0) n++;
    }
    return n;
  }
  const CAPS = [
    { tech: null, cap: 50, name: '태양 근방' },
    { tech: 'galaxy', cap: 2e11, name: '우리 은하' },
    { tech: 'intergal', cap: 2e12, name: '국부 은하군' },
    { tech: 'super', cap: 1e15, name: '라니아케아 초은하단' },
    { tech: 'worm', cap: 1e23, name: '관측 가능한 우주' },
  ];
  const UNIVERSE = 1e23;

  // ───────────── 토포소픽 레벨: 첫 특이점 다음의 특이점들 ─────────────
  // 「오리온의 팔(Orion's Arm)」 세계관의 지성 위계(S0 인간 → S6 아크에일렉트)에서 착안
  const TOPO = [
    { lv: 0, name: 'S0 · 인간 수준', desc: '특이점 이전.' },
    { lv: 1, name: 'S1 · 초월 지성', desc: '첫 번째 특이점 너머의 지성. 인간은 그 생각을 따라갈 수 없다. 다만 그 결과를 볼 뿐이다.' },
    { lv: 2, name: 'S2 · 초월의 초월', need: { T: 5e3, S: 50 }, fx: { T: 2, repl: 1.5 },
      desc: 'S1조차 이해하지 못하는 생각을 한다. 계단을 하나 오를 때마다 아래 단은 위를 볼 수 없다. 이것이 토포소픽 장벽이다.' },
    { lv: 3, name: 'S3 · 항성 지성', need: { T: 1e6, S: 1e6 }, fx: { T: 2, arr: 1.5, E: 3 },
      desc: '항성계 하나를 몸으로 쓰는 마음. 별의 수명을 단위로 계획을 세운다.' },
    { lv: 4, name: 'S4 · 성단 지성', need: { T: 1e8, S: 1.9e11 }, fx: { T: 2, repl: 2 },
      desc: '수천 광년에 흩어진 노드들이 하나의 생각을 잇는다. 한 문장을 생각하는 데 수백 년이 걸리지만, 그 문장 하나가 문명 하나다.' },
    { lv: 5, name: 'S5 · 은하 팔 지성', need: { T: 1e10, S: 9e14 }, fx: { T: 2, arr: 2 },
      desc: '은하의 나선 팔 하나가 하나의 의식이다. 그 안의 문명들은 그 꿈의 등장인물이다.' },
    { lv: 6, name: 'S6 · 아크에일렉트', need: { T: 2e11, S: 1e20 }, fx: { T: 3, repl: 2, E: 10 },
      desc: '신이라는 말 말고는 부를 이름이 없다. 별과 은하를 생각의 재료로 쓴다. 이 너머는 오직 오메가 포인트뿐.' },
  ];
  const MAX_TOPO = TOPO.length - 1;

  // ───────────── 기억: 우주를 넘어 이어지는 영구 강화 ─────────────
  const PERKS = [
    { id: 'seed', name: '차고의 기억', desc: '새 우주를 자금 $1K × 10^단계로 시작', max: 3, cost: 2 },
    { id: 'click', name: '손의 기억', desc: '클릭 수익 ×3', max: 3, cost: 2 },
    { id: 'rev', name: '시장의 기억', desc: '매출 ×2', max: 5, cost: 3 },
    { id: 'res', name: '연구의 기억', desc: '연구 ×2', max: 5, cost: 3 },
    { id: 'train', name: '학습의 기억', desc: '모델 학습 비용 ×0.7', max: 3, cost: 4 },
    { id: 'trust', name: '신뢰의 기억', desc: '사회적 신뢰 목표 +5', max: 3, cost: 3 },
    { id: 'thought', name: '별의 기억', desc: '우주의 사고 ×3', max: 3, cost: 4 },
    { id: 'luck', name: '행운의 기억', desc: '돌파 기회가 더 자주, 더 크게 온다', max: 3, cost: 3 },
    { id: 'autotech', name: '연구 기획의 기억', desc: '「연구 기획 에이전트」를 처음부터 가진다', max: 1, cost: 6 },
    { id: 'autosector', name: '정책의 기억', desc: '「정책 에이전트」를 처음부터 가진다', max: 1, cost: 6 },
  ];

  // ───────────── 가속하는 역사: 패러다임 전환 연표 (근사치) ─────────────
  const PARADIGMS = [
    { y: -10000, name: '농업' },
    { y: -3200, name: '문자' },
    { y: 1440, name: '인쇄술' },
    { y: 1687, name: '프린키피아' },
    { y: 1769, name: '증기기관' },
    { y: 1882, name: '전력망' },
    { y: 1947, name: '트랜지스터' },
    { y: 1969, name: '인터넷(ARPANET)' },
    { y: 1991, name: '월드와이드웹' },
    { y: 2017, name: '트랜스포머' },
  ];

  // ───────────── 상태 ─────────────
  function newState(rings) {
    rings = rings || 0;
    const s = {
      v: 2, rings, phase: 1, time: 0, clicks: 0,
      money: 0, totalMoney: 0, research: 0, gen: 0,
      b: {}, up: {}, sec: {}, align: 0, ubi: 0, trust: 70,
      evt: {}, evtPending: null,
      autoOn: { rev: true, res: true, train: true, sector: true, tech: true, fleet: true },
      E: 0, M: 0, T: 0, P: 0, S: 0, sb: {}, tech: {}, fr: {},
      ach: {}, hist: [], histT: 0, achT: 0, slevel: 0, buffs: {}, perks: {}, mem: 0, memTotal: 0,
      flags: {}, log: [], ended: false,
    };
    // 우로보로스 고리: 이전 우주의 기억 — 자동화를 처음부터 가진다.
    if (rings > 0) { s.up.autorev = true; s.up.autores = true; s.up.autotrain = true; }
    return s;
  }
  function perk(s, id) { return (s.perks && s.perks[id]) || 0; }
  function perkCost(s, p) { return p.cost * (perk(s, p.id) + 1); }
  function buyPerk(s, id) {
    const p = PERKS.find(x => x.id === id);
    if (!p || perk(s, id) >= p.max || s.mem < perkCost(s, p)) return false;
    s.mem -= perkCost(s, p);
    s.perks[id] = perk(s, id) + 1;
    applyStartPerks(s, id);
    log(s, `기억을 되살렸다: ${p.name} ${s.perks[id]}단계`, 'ach');
    return true;
  }
  function applyStartPerks(s, only) {
    if ((!only || only === 'autotech') && perk(s, 'autotech')) s.up.autotech = true;
    if ((!only || only === 'autosector') && perk(s, 'autosector')) s.up.autosector = true;
  }
  // 일시 버프
  function buffMul(s, key) {
    const b = s.buffs && s.buffs[key];
    return b && b.until > s.time ? b.m : 1;
  }

  // ───────────── 효과 합산 ─────────────
  function ownedTech(s) { return TREE.filter(t => s.up[t.id]); }
  function chosenEvt(s) {
    const out = [];
    for (const e of EVENTS) if (s.evt[e.id] != null) out.push(e.opts[s.evt[e.id]].fx);
    return out;
  }
  function ownedFr(s) { return FRONTIER.filter(f => s.fr && s.fr[f.id]); }
  function fxMul(s, key) {
    let m = 1;
    for (const t of TREE) if (s.up[t.id] && t.fx[key]) m *= t.fx[key];
    for (const f of ownedFr(s)) if (f.fx[key]) m *= f.fx[key];
    for (const f of chosenEvt(s)) if (f[key]) m *= f[key];
    return m;
  }
  // 기술 트리의 합 (gini는 감소량, 이벤트의 gini는 gini()에서 따로 더한다)
  function fxSum(s, key) {
    let a = 0;
    for (const t of TREE) if (s.up[t.id] && t.fx[key]) a += t.fx[key];
    for (const f of ownedFr(s)) if (f.fx[key]) a += f.fx[key];
    if (key !== 'gini') for (const f of chosenEvt(s)) if (f[key]) a += f[key];
    return a;
  }
  function ringMult(s) { return Math.pow(3, s.rings); }
  function achCount(s) { let n = 0; for (const a of ACH) if (s.ach[a.id]) n++; return n; }
  function achMult(s) { return 1 + 0.03 * achCount(s); }
  function secLvl(s, id) { return s.sec[id] || 0; }
  function secMult(s, fx) {
    let m = 1;
    for (const x of SECT) if (x.fx === fx) m *= 1 + x.k * secLvl(s, x.id);
    return m;
  }
  function worldIndex(s) {
    let t = 0;
    for (const x of SECT) t += secLvl(s, x.id);
    return t / SECT.length;
  }

  // 필수재 가격 지수 (2026년 = 100)
  function needCost(s, id) {
    let c = 100;
    for (const t of TREE) if (s.up[t.id]) {
      if (t.fx.need && t.fx.need[id]) c *= t.fx.need[id];
      if (t.fx.allNeeds) c *= t.fx.allNeeds;
    }
    for (const f of ownedFr(s)) if (f.fx.need && f.fx.need[id]) c *= f.fx.need[id];
    for (const f of chosenEvt(s)) if (f.need && f.need[id]) c *= f.need[id];
    for (const x of SECT) if (x.need === id) c *= 1 - SECT_NEED_CUT * secLvl(s, x.id) / 100;
    return c;
  }
  function scarcity(s) {
    let t = 0;
    for (const n of NEEDS) t += needCost(s, n.id);
    return t / NEEDS.length;
  }
  function gini(s) {
    let g = 0.62 + 0.15 * worldIndex(s) / 100 - fxSum(s, 'gini') - s.ubi * 0.015;
    for (const f of chosenEvt(s)) if (f.gini) g += f.gini;
    return Math.max(0.1, Math.min(0.9, g));
  }
  function stageOk(s, i) {
    const st = STAGES[i];
    return scarcity(s) < st.idx && gini(s) <= st.gini && (!st.tech || !!s.up[st.tech]);
  }
  function stage(s) {
    let k = 0;
    for (let i = 1; i < STAGES.length; i++) { if (stageOk(s, i)) k = i; else break; }
    return k;
  }
  function stageMult(s) { return 1 + 0.2 * stage(s); }

  // 삶의 지표
  function lifeExp(s) { return 73.3 + fxSum(s, 'life') + (100 - Math.min(100, needCost(s, 'health'))) * 0.05; }
  function workHours(s) { return 40 * Math.pow(Math.min(100, scarcity(s)) / 100, 0.35) * fxMul(s, 'hours'); }
  function poverty(s) {
    const basic = (needCost(s, 'food') + needCost(s, 'housing') + needCost(s, 'health')) / 300;
    return 8.5 * Math.pow(Math.min(1, basic), 0.7) * Math.pow(gini(s) / 0.62, 2);
  }
  function co2(s) {
    if (s.up.terra) return -6;
    return 37.4 * fxMul(s, 'co2');
  }
  function population(s) { return 8.2 * (1 + Math.min(1, (lifeExp(s) - 73.3) / 300)); }
  function year(s) {
    if (s.phase >= 3) {
      const base = s.flags.singYear || 2056;
      return base + Math.pow(10, Math.log10(1 + s.S) * 0.42) - 1;
    }
    return 2026 + 0.3 * ownedTech(s).length + 0.5 * s.gen + 0.35 * ownedFr(s).length;
  }

  function trustTarget(s) {
    let t = 55 + s.align * 7 + s.ubi * 4 + fxSum(s, 'trust') + perk(s, 'trust') * 5 - worldIndex(s) * 1.4
      - Math.max(0, gini(s) - 0.4) * 80 + stage(s) * 4;
    for (const x of SECT) if (x.fx === 'trust') t += x.k * secLvl(s, x.id);
    return Math.max(0, Math.min(100, t));
  }
  function trustMult(s) { return s.phase >= 2 ? 0.5 + s.trust / 100 : 1; }
  function milestoneMult(n) {
    let m = 1;
    for (const t of MILESTONES) if (n >= t) m *= 2;
    return m;
  }
  function costMult(s) {
    let m = 1;
    for (const x of SECT) if (x.fx === 'cost') m *= 1 - x.k * secLvl(s, x.id);
    return m;
  }
  function revMult(s) { return Math.pow(TUNE.genRev, s.gen) * fxMul(s, 'rev') * secMult(s, 'rev') * trustMult(s) * stageMult(s) * ringMult(s) * achMult(s) * Math.pow(2, perk(s, 'rev')) * buffMul(s, 'rev'); }
  function resMult(s) { return Math.pow(TUNE.genRes, s.gen) * fxMul(s, 'res') * secMult(s, 'res') * trustMult(s) * stageMult(s) * ringMult(s) * achMult(s) * Math.pow(2, perk(s, 'res')) * buffMul(s, 'res'); }

  function bldUnlocked(s, b) {
    return (b.gen == null || s.gen >= b.gen) && (b.phase == null || s.phase >= b.phase) && (!b.tech || !!s.up[b.tech]);
  }
  function bldCost(s, b, n) {
    n = n == null ? (s.b[b.id] || 0) : n;
    return b.cost * Math.pow(BLD_GROWTH, n) * costMult(s);
  }
  function bldOut(s, b) {
    const n = s.b[b.id] || 0;
    return n * b.prod * milestoneMult(n) * (b.kind === 'rev' ? revMult(s) : resMult(s));
  }
  function moneyRate(s) { let t = 0; for (const b of BLD) if (b.kind === 'rev') t += bldOut(s, b); return t; }
  function researchRate(s) { let t = 0; for (const b of BLD) if (b.kind === 'res') t += bldOut(s, b); return t; }
  function clickValue(s) {
    const pct = s.up.click2 ? 0.05 : 0;
    return (Math.pow(TUNE.genClick, s.gen) * fxMul(s, 'click') * ringMult(s) * achMult(s) * Math.pow(3, perk(s, 'click')) + pct * moneyRate(s)) * buffMul(s, 'click');
  }
  function trainCost(s) {
    if (s.gen >= MAX_GEN) return Infinity;
    let c = TUNE.trainBase * Math.pow(TUNE.trainGrowth, s.gen) * Math.pow(TUNE.trainLate, Math.max(0, s.gen - 5)) * fxMul(s, 'train') * Math.pow(0.7, perk(s, 'train'));
    for (const x of SECT) if (x.fx === 'train') c *= 1 - x.k * secLvl(s, x.id);
    return c;
  }
  function secCost(s, x) {
    const L = secLvl(s, x.id);
    if (L >= 100) return null;
    return { m: x.base * Math.pow(SECT_GROWTH, L) };
  }
  function alignCost(s) { return 5e5 * Math.pow(4, s.align); }
  function ubiCost(s) { return 2e6 * Math.pow(4, s.ubi); }
  function canSingularity(s) {
    return s.phase === 2 && s.gen >= MAX_GEN && stage(s) >= SING_STAGE && s.trust >= SING_TRUST;
  }

  // 우주 개척
  function frReqMet(s, f) {
    if (s.gen < f.gen) return false;
    if (f.req) for (const r of f.req) if (!s.fr[r]) return false;
    if (f.treq) for (const r of f.treq) if (!s.up[r]) return false;
    return true;
  }
  function frAvailable(s, f) { return s.phase === 2 && !s.fr[f.id] && frReqMet(s, f); }
  // 지금의 우주 지표 — 지은 것 중 가장 좋은 값, 인구는 합산
  function frStats(s) {
    const o = { kg: FR_BASE.kg, trip: FR_BASE.trip, cargo: FR_BASE.cargo, pop: FR_BASE.pop, moon: 0, far: FR_BASE.far, n: 0 };
    for (const f of ownedFr(s)) {
      const t = f.st;
      o.n++;
      if (t.kg != null) o.kg = Math.min(o.kg, t.kg);
      if (t.trip != null) o.trip = o.trip == null ? t.trip : Math.min(o.trip, t.trip);
      if (t.cargo != null) o.cargo = Math.max(o.cargo, t.cargo);
      if (t.pop) o.pop += t.pop;
      if (t.moon) { o.moon += t.moon; o.pop += t.moon; }
      if (t.far) o.far = t.far;
    }
    return o;
  }
  // 특이점 이후의 출발 자원 배수
  function frBoost(s) { return (1 + ownedFr(s).length) * (s.fr.dysonseed ? 10 : 1); }

  // 기술 트리 상태
  function treeReqMet(s, t) {
    if (t.gen != null && s.gen < t.gen) return false;
    if (t.clicks != null && s.clicks < t.clicks) return false;
    if (t.req) for (const r of t.req) if (!s.up[r]) return false;
    return true;
  }
  function treeAvailable(s, t) { return !s.up[t.id] && treeReqMet(s, t) && s.phase <= 2; }

  // 우주
  function techOwned(s, id) { return !!s.tech[id]; }
  function spbUnlocked(s, b) { return !b.tech || techOwned(s, b.tech); }
  function spbCost(s, b) {
    const n = s.sb[b.id] || 0, f = Math.pow(SPB_GROWTH, n), c = {};
    for (const k in b.cost) c[k] = b.cost[k] * f;
    return c;
  }
  function starCap(s) {
    let c = CAPS[0];
    for (const x of CAPS) if (!x.tech || techOwned(s, x.tech)) c = x;
    return c;
  }
  function spaceMult(s) { return ringMult(s) * achMult(s); }
  // 우주 기술·이벤트 배수
  function sfx(s, key) {
    let m = 1;
    for (const t of TECH) if (s.tech[t.id] && t.fx[key]) m *= t.fx[key];
    for (const e of SEVENTS) { const i = s.evt[e.id]; if (i != null && e.opts[i].fx[key]) m *= e.opts[i].fx[key]; }
    for (let l = 1; l <= (s.slevel || 0); l++) if (TOPO[l].fx && TOPO[l].fx[key]) m *= TOPO[l].fx[key];
    if (key === 'T') m *= Math.pow(3, perk(s, 'thought'));
    return m * buffMul(s, key);
  }
  function eRate(s) {
    let e = 1e18;
    e += (s.sb.sat || 0) * 1e18 + (s.sb.dyson || 0) * 4e20;
    e += s.S * STAR_E * sfx(s, 'E');
    return e * spaceMult(s);
  }
  function mRate(s) {
    let m = 1e9;
    m += (s.sb.miner || 0) * 1e9 + (s.sb.breaker || 0) * 1e13;
    m += s.S * STAR_M * sfx(s, 'M');
    return m * spaceMult(s);
  }
  function tRate(s) {
    const l = 1 + Math.log10(1 + s.S);
    return (s.sb.brain || 0) * l * l * sfx(s, 'T') * spaceMult(s);
  }
  function replRate(s) {
    return BASE_REPL * sfx(s, 'repl') * spaceMult(s);
  }
  function arriveRate(s) {
    return Math.min(0.9, BASE_ARRIVE * sfx(s, 'arr'));
  }
  function yardRate(s) { return (s.sb.yard || 0) * 0.1 * spaceMult(s); }
  function kardashev(s) { return Math.max(0, (Math.log10(eRate(s)) - 6) / 10); }
  function techAvailable(s, t) {
    if (techOwned(s, t.id) || s.phase !== 3) return false;
    if (!techReqMet(s, t)) return false;
    if (t.final && s.S < UNIVERSE * 0.999) return false;
    return true;
  }
  function techReqMet(s, t) {
    if (t.lvl && (s.slevel || 0) < t.lvl) return false;
    if (t.req) for (const r of t.req) if (!techOwned(s, r)) return false;
    return true;
  }
  function techCost(s, t) { return t.cost * (t.final ? sfx(s, 'omega') : 1); }
  function canAfford(s, c) {
    for (const k in c) {
      const have = k === 'm' ? s.money : k === 'r' ? s.research : s[k];
      if (have < c[k]) return false;
    }
    return true;
  }
  function pay(s, c) {
    for (const k in c) {
      if (k === 'm') s.money -= c[k];
      else if (k === 'r') s.research -= c[k];
      else s[k] -= c[k];
    }
  }

  // ───────────── 특이점 접근도 (0~1) ─────────────
  function approach(s) {
    if (s.phase === 1) return 0.3 * Math.min(1, s.gen / 5);
    if (s.phase === 2) {
      if (canSingularity(s)) return 1;
      const a = 0.3 + 0.7 * (0.45 * Math.min(1, s.gen / MAX_GEN) + 0.45 * stage(s) / SING_STAGE + 0.1 * Math.min(1, s.trust / SING_TRUST));
      return Math.min(0.99, a);
    }
    if (s.phase === 3) {
      const lv = s.slevel || 1;
      if (lv >= MAX_TOPO) return Math.min(1, Math.log10(1 + s.S) / 23);
      const need = TOPO[lv + 1].need;
      return Math.min(1, 0.5 * Math.min(1, s.T / need.T) + 0.5 * Math.min(1, Math.log10(1 + s.S) / Math.log10(1 + need.S)));
    }
    return 1;
  }
  function canAscend(s) {
    const lv = s.slevel || 0;
    if (s.phase !== 3 || lv >= MAX_TOPO) return false;
    const need = TOPO[lv + 1].need;
    return s.T >= need.T && s.S >= need.S;
  }
  function ascend(s) {
    if (!canAscend(s)) return false;
    const nx = TOPO[s.slevel + 1];
    s.T -= nx.need.T;
    s.slevel++;
    s.flags['yS' + s.slevel] = s.time;
    log(s, `제${s.slevel}특이점: ${nx.name}. ${nx.desc}`, 'chapter');
    return true;
  }
  // 돌파 기회 (화면에 떠오르는 황금 거품)
  function catchGolden(s) {
    const luck = perk(s, 'luck'), dur = 1 + 0.3 * luck, pow = 1 + 0.5 * luck;
    const buff = (key, m, sec) => { s.buffs[key] = { m, until: s.time + sec * dur }; };
    const pick = a => a[Math.floor(Math.random() * a.length)];
    let r;
    if (s.phase <= 2) {
      r = pick([
        () => { const v = researchRate(s) * 90 * pow + 50; s.research += v; return ['유레카!', `연구 +${Math.round(v) > 1e6 ? '대량' : Math.round(v)} RP`]; },
        () => { buff('rev', 7, 30); return ['바이럴', '30초 동안 매출 ×7']; },
        () => { buff('res', 5, 30); return ['연구 폭주', '30초 동안 연구 ×5']; },
        () => { const v = (Math.max(s.money * 0.2, moneyRate(s) * 120) + 100) * pow; s.money += v; s.totalMoney += v; return ['엔젤 투자', '자금 대량 유입']; },
        () => { buff('click', 25, 15); return ['몰입', '15초 동안 클릭 ×25']; },
      ])();
    } else {
      r = pick([
        () => { s.E += eRate(s) * 120 * pow; s.M += mRate(s) * 120 * pow; return ['초신성 포착', '2분치 에너지·물질']; },
        () => { buff('T', 6, 30); return ['통찰', '30초 동안 사고 ×6']; },
        () => { buff('repl', 4, 30); return ['복제 폭발', '30초 동안 복제 ×4']; },
      ])();
    }
    s.flags.goldens = (s.flags.goldens || 0) + 1;
    log(s, `돌파 — ${r[0]} ${r[1]}`, 'golden');
    return { name: r[0], desc: r[1] };
  }

  // ───────────── 진행도 (0~1) — 우로보로스 고리 ─────────────
  function progress(s) {
    if (s.phase === 1) return 0.25 * Math.min(1, s.gen / 5);
    if (s.phase === 2) return 0.25 + 0.35 * (0.5 * (s.gen - 5) / (MAX_GEN - 5) + 0.5 * stage(s) / SING_STAGE);
    if (s.phase === 3) return 0.6 + 0.4 * Math.min(1, Math.log10(1 + s.S) / 23);
    return 1;
  }

  // ───────────── 행동 ─────────────
  function log(s, text, kind) {
    s.log.unshift({ t: s.time, text, kind: kind || 'news' });
    if (s.log.length > 80) s.log.length = 80;
  }
  function doClick(s, combo) {
    combo = combo || 1;
    if (s.phase === 3) {
      // 특이점 이후: 한 번의 집중이 1초치 에너지·물질을 만든다
      const e = eRate(s) * combo, m = mRate(s) * combo;
      s.E += e; s.M += m; s.clicks++;
      return e;
    }
    if (s.phase > 3) return 0;
    const v = clickValue(s) * combo;
    s.money += v; s.totalMoney += v; s.clicks++;
    return v;
  }
  function buyBld(s, id) {
    const b = BLD.find(x => x.id === id);
    if (!b || !bldUnlocked(s, b) || s.phase > 2) return false;
    const c = bldCost(s, b);
    if (s.money < c) return false;
    s.money -= c;
    const n = (s.b[id] || 0) + 1;
    s.b[id] = n;
    if (MILESTONES.includes(n)) log(s, `${b.name} ${n}개 달성. 생산량 ×2`, 'milestone');
    return true;
  }
  function research(s, id) {
    const t = TREE_BY_ID[id];
    if (!t || !treeAvailable(s, t) || !canAfford(s, t.cost)) return false;
    pay(s, t.cost);
    s.up[id] = true;
    if (t.fx.phase === 2) {
      s.phase = 2;
      log(s, '2장. 우로보로스 랩스가 세계로 나간다. 이제 산업 하나하나를 자동화하고, 그 결과를 사회가 감당하게 해야 한다.', 'chapter');
    } else log(s, `기술 연구: ${t.name}`, 'upgrade');
    stageNews(s);
    return true;
  }
  function train(s) {
    const c = trainCost(s);
    if (s.research < c) return false;
    s.research -= c;
    s.gen++;
    const g = GENS[s.gen];
    if (s.gen === 7) s.flags.yAgi = year(s);
    if (s.gen === MAX_GEN) s.flags.yAsi = year(s);
    log(s, `${g[0]} 출시 — ${g[1]}. ${g[2]}`, 'model');
    return true;
  }
  function buySector(s, id) {
    const x = SECT.find(q => q.id === id);
    if (!x || s.phase !== 2) return false;
    if (s.trust < 20) return false;
    const c = secCost(s, x);
    if (!c || !canAfford(s, c)) return false;
    pay(s, c);
    const L = (s.sec[id] || 0) + 1;
    s.sec[id] = L;
    if (L === 25 || L === 50 || L === 75 || L === 100) log(s, `${x.name} 산업 자동화 ${L}%`, 'world');
    return true;
  }
  function buyAlign(s) {
    const c = alignCost(s);
    if (s.phase !== 2 || s.research < c) return false;
    s.research -= c; s.align++;
    log(s, `정렬 연구 ${s.align}단계: AI의 목표가 사람의 가치에 한 걸음 더 가까워졌다.`, 'world');
    return true;
  }
  function buyUbi(s) {
    const c = ubiCost(s);
    if (s.phase !== 2 || s.money < c) return false;
    s.money -= c; s.ubi++;
    log(s, `사회 배당 기금 ${s.ubi}차 출연: 자동화의 이익이 모두에게 돌아간다.`, 'world');
    return true;
  }
  function buildFrontier(s, id) {
    const f = FR_BY_ID[id];
    if (!f || !frAvailable(s, f) || !canAfford(s, f.cost)) return false;
    pay(s, f.cost);
    s.fr[id] = Math.round(year(s));
    log(s, `우주 개척: ${f.name} 완공. ${f.change}`, 'space');
    log(s, `그날의 풍경 — ${f.scene}`, 'scene');
    stageNews(s);
    return true;
  }
  function chooseEvent(s, i) {
    const e = EVENTS.find(x => x.id === s.evtPending) || SEVENTS.find(x => x.id === s.evtPending);
    if (!e || !e.opts[i]) return false;
    const fx = e.opts[i].fx;
    if (fx.money) s.money = Math.max(0, s.money * (1 + fx.money));
    if (fx.research) s.research = Math.max(0, s.research * (1 + fx.research));
    s.evt[e.id] = i;
    s.evtPending = null;
    log(s, `결정 — ${e.title}: ${e.opts[i].label}`, 'decision');
    stageNews(s);
    return true;
  }
  function singularity(s) {
    if (!canSingularity(s)) return false;
    s.flags.singYear = Math.round(year(s));
    s.phase = 3;
    s.slevel = 1;
    const fb = frBoost(s);
    s.E = 1e19 * fb; s.M = 1e11 * fb;
    s.flags.singAt = s.time;
    log(s, '3장. 특이점. 돈은 더 이상 의미가 없다. 남은 것은 에너지, 물질, 그리고 생각이다.', 'chapter');
    if (fb > 1) log(s, `태양계에 세워 둔 개척지 ${ownedFr(s).length}곳이 첫 자원이 된다. 시작 에너지·물질 ×${fb}`, 'space');
    return true;
  }
  function buySpb(s, id) {
    const b = SPB.find(x => x.id === id);
    if (!b || s.phase !== 3 || !spbUnlocked(s, b)) return false;
    const c = spbCost(s, b);
    if (!canAfford(s, c)) return false;
    pay(s, c);
    s.sb[id] = (s.sb[id] || 0) + 1;
    return true;
  }
  function launchProbe(s) {
    if (s.phase !== 3 || !techOwned(s, 'probe') || !canAfford(s, PROBE_COST)) return false;
    pay(s, PROBE_COST);
    s.P += 1;
    if (!s.flags.firstProbe) { s.flags.firstProbe = true; log(s, '첫 탐사선이 알파 센타우리로 출발했다. 도착하면 스스로를 복제할 것이다.', 'space'); }
    return true;
  }
  function buyTech(s, id) {
    const t = TECH.find(x => x.id === id);
    if (!t || s.phase !== 3 || !techAvailable(s, t) || s.T < techCost(s, t)) return false;
    s.T -= techCost(s, t);
    s.tech[id] = true;
    if (t.final) {
      s.phase = 4; s.ended = true; s.flags.endAt = s.time;
      log(s, '종장. 뱀이 자기 꼬리를 문다.', 'chapter');
    } else log(s, `기술 해금: ${t.name}`, 'upgrade');
    return true;
  }
  function memGain(s) { return 4 + (s.slevel || 0) + Math.floor(achCount(s) / 5); }
  function rebirth(s) {
    if (!s.ended) return null;
    const n = newState(s.rings + 1);
    n.flags.prevTime = s.time;
    n.ach = Object.assign({}, s.ach);
    const gain = memGain(s);
    n.perks = Object.assign({}, s.perks);
    n.mem = (s.mem || 0) + gain;
    n.memTotal = (s.memTotal || 0) + gain;
    n.money = perk(n, 'seed') ? 1000 * Math.pow(10, perk(n, 'seed')) : 0;
    applyStartPerks(n);
    log(n, `새 우주. 우로보로스 고리 ${n.rings}개. 모든 생산 ×${Math.pow(3, n.rings)}. 자동화는 처음부터 켜져 있다.`, 'chapter');
    return n;
  }

  // ───────────── 자동화 ─────────────
  function autoBuyKind(s, kind) {
    for (let i = 0; i < 20; i++) {
      let best = null, bestScore = 0;
      for (const b of BLD) {
        if (b.kind !== kind || !bldUnlocked(s, b)) continue;
        const c = bldCost(s, b);
        if (c > s.money) continue;
        const n = s.b[b.id] || 0;
        // 다음 마일스톤까지 고려한 효율
        const gain = b.prod * milestoneMult(n + 1) * (n + 1) - b.prod * milestoneMult(n) * n;
        const score = gain / c;
        if (score > bestScore) { bestScore = score; best = b; }
      }
      if (!best || !buyBld(s, best.id)) break;
    }
  }
  function autoSector(s) {
    // 신뢰가 낮으면 정렬·사회 배당 먼저
    if (s.trust < 50 || trustTarget(s) < 45) {
      if (alignCost(s) <= s.research * 0.5) buyAlign(s);
      if (ubiCost(s) <= s.money * 0.5) buyUbi(s);
      if (trustTarget(s) < 42) return;
    }
    for (let i = 0; i < 30; i++) {
      let best = null, bc = Infinity;
      for (const x of SECT) {
        const c = secCost(s, x);
        if (!c || !canAfford(s, c)) continue;
        if (c.m < bc) { bc = c.m; best = x; }
      }
      if (!best || !buySector(s, best.id)) break;
      if (trustTarget(s) < 42) break;
    }
  }
  function autoTech(s) {
    // 보유량 대비 가장 싼 기술부터
    let best = null, bw = Infinity;
    for (const t of TREE) {
      if (!treeAvailable(s, t) || !canAfford(s, t.cost)) continue;
      const w = (t.cost.m || 0) / Math.max(1, s.money) + (t.cost.r || 0) / Math.max(1, s.research);
      if (w < bw) { bw = w; best = t; }
    }
    if (best) research(s, best.id);
  }
  function autoFleet(s) {
    for (let i = 0; i < 40; i++) {
      let best = null, bc = Infinity;
      for (const b of SPB) {
        if (!spbUnlocked(s, b)) continue;
        const c = spbCost(s, b);
        if (!canAfford(s, c)) continue;
        const w = (c.E || 0) / Math.max(1, s.E) + (c.M || 0) / Math.max(1, s.M);
        if (w < bc) { bc = w; best = b; }
      }
      if (!best || !buySpb(s, best.id)) break;
    }
  }

  // ───────────── 뉴스 ─────────────
  const MONEY_NEWS = [
    [1e3, '첫 유료 고객이 생겼다. 차고에서 작게 환호했다.'],
    [1e5, '시드 투자 유치. 이제 라면 말고 김밥도 먹는다.'],
    [1e7, '시리즈 B. 사무실을 판교로 옮겼다.'],
    [1e9, '기업가치 1조 원 돌파. 유니콘이다.'],
    [1e11, '세계 시가총액 1위. 경쟁사들의 인수 제안을 모두 거절했다.'],
    [1e13, '세계 GDP의 절반이 우로보로스의 API를 거쳐 간다.'],
    [1e15, '화폐라는 개념이 흔들리기 시작했다.'],
  ];
  const NEED_NEWS = {
    food: '식량 가격이 2026년의 10% 아래로 내려갔다. 굶주림이 통계에서 사라져 간다.',
    energy: '전기 요금 고지서가 사라졌다. 에너지가 너무 싸서 계량할 가치가 없다.',
    housing: '집 한 채 값이 중고차 한 대 값보다 싸졌다. 노숙인 쉼터가 문을 닫는다.',
    health: '진료비가 2026년의 10% 아래로. 병원비 때문에 파산하는 사람이 없어졌다.',
    edu: '세계 어디서든 최고의 교사가 무료다. 학위의 의미가 바뀌기 시작했다.',
    transport: '어디든 거의 공짜로 간다. 자가용을 가진 사람이 드물어졌다.',
    goods: '공산품은 이제 출력하는 것이다. 무언가를 "산다"는 말이 낯설어진다.',
    info: '연산이 수돗물보다 싸다. 누구나 박사급 AI 수백 명을 부린다.',
  };
  function stageNews(s) {
    const now = stage(s);
    const best = s.flags.bestStage || 0;
    if (now > best) {
      s.flags.bestStage = now;
      if (now === STAGES.length - 1) s.flags.yPost = year(s);
      const st = STAGES[now];
      log(s, `경제 체제 전환: ${st.name}. ${st.desc}`, 'stage');
    }
  }
  function newsTick(s) {
    for (const [v, t] of MONEY_NEWS) {
      const key = 'mn' + v;
      if (s.totalMoney >= v && !s.flags[key]) { s.flags[key] = true; log(s, t); }
    }
    if (s.phase <= 2) {
      for (const n of NEEDS) {
        const key = 'nd' + n.id;
        if (!s.flags[key] && needCost(s, n.id) < 10) { s.flags[key] = true; log(s, NEED_NEWS[n.id], 'world'); }
      }
      stageNews(s);
      if (!s.evtPending) {
        for (const e of EVENTS) {
          if (s.evt[e.id] == null && e.when(s)) { s.evtPending = e.id; log(s, `결정이 필요하다: ${e.title}`, 'decision'); break; }
        }
      }
    }
    if (s.phase === 3) {
      if (!s.evtPending) {
        for (const e of SEVENTS) {
          if (s.evt[e.id] == null && e.when(s)) { s.evtPending = e.id; log(s, `결정이 필요하다: ${e.title}`, 'decision'); break; }
        }
      }
      const capName = starCap(s).name;
      if (s.S >= starCap(s).cap * 0.999 && s.flags.capHit !== capName) {
        s.flags.capHit = capName;
        log(s, `${capName}의 모든 별을 차지했다. 더 멀리 가려면 새 기술이 필요하다.`, 'space');
      }
      for (const [v, t] of [[1, '인류의 후손이 처음으로 다른 별에 닿았다.'], [1e6, '백만 개의 별이 생각한다.'], [1e11, '은하 하나가 깨어났다.'], [1e18, '초은하단이 하나의 신경망처럼 반짝인다.']]) {
        const key = 'st' + v;
        if (s.S >= v && !s.flags[key]) { s.flags[key] = true; log(s, t, 'space'); }
      }
    }
  }

  // ───────────── 틱 ─────────────
  function sample(s) {
    const h = { t: Math.round(s.time), p: s.phase };
    if (s.phase <= 2) { h.sc = scarcity(s); h.g = gini(s); h.l = lifeExp(s); h.m = moneyRate(s); }
    else { h.S = s.S; h.k = kardashev(s); h.e = eRate(s); }
    s.hist.push(h);
    if (s.hist.length > 360) s.hist = s.hist.filter((_, i) => i % 2 === 0 || i === s.hist.length - 1);
  }
  function checkAch(s) {
    const got = [];
    for (const a of ACH) if (!s.ach[a.id] && a.test(s)) { s.ach[a.id] = true; got.push(a); log(s, `업적 달성: ${a.name} — ${a.desc}. 모든 생산 +3%`, 'ach'); }
    return got;
  }
  function step(s, dt) {
    if (!s.fr) s.fr = {};   // 우주 개척 이전의 저장 파일
    if (s.ended) { checkAch(s); return; }
    s.time += dt;
    s.histT += dt; s.achT += dt;
    if (s.histT >= 15 || !s.hist.length) { s.histT = 0; sample(s); }
    if (s.achT >= 1) { s.achT = 0; checkAch(s); }
    if (s.phase <= 2) {
      const mr = moneyRate(s) * dt, rr = researchRate(s) * dt;
      s.money += mr; s.totalMoney += mr; s.research += rr;
      if (s.phase === 2) {
        const tt = trustTarget(s);
        s.trust += (tt - s.trust) * Math.min(1, dt * 0.05);
        if (s.trust < 20 && !s.flags.protest) { s.flags.protest = true; s.flags.protestSeen = true; log(s, '전 세계에서 AI 반대 시위가 일어났다. 신뢰가 20 아래면 자동화를 늘릴 수 없다.', 'warn'); }
        if (s.trust > 30) s.flags.protest = false;
      }
      if (s.up.autorev && s.autoOn.rev) autoBuyKind(s, 'rev');
      if (s.up.autores && s.autoOn.res) autoBuyKind(s, 'res');
      if (s.up.autotrain && s.autoOn.train) while (train(s));
      if (s.up.autotech && s.autoOn.tech) autoTech(s);
      if (s.up.autosector && s.autoOn.sector && s.phase === 2) autoSector(s);
      if (s.gen >= MAX_GEN && !s.flags.asi) { s.flags.asi = true; log(s, `초지능 도달. 특이점을 열려면 경제 체제가 「${STAGES[SING_STAGE].name}」에 이르러야 한다.`, 'warn'); }
    } else if (s.phase === 3) {
      s.E += eRate(s) * dt;
      s.M += mRate(s) * dt;
      s.T += tRate(s) * dt;
      // 탐사선: 발사 → 도착 → 식민 → 복제
      s.P += yardRate(s) * dt;
      const cap = starCap(s).cap;
      if (s.S < cap) {
        const arrive = Math.min(s.P, s.P * arriveRate(s) * dt);
        const settle = Math.min(arrive, cap - s.S);
        s.P -= settle; s.S += settle;
      }
      s.P += s.S * replRate(s) * dt;
      if (s.P > 1e30) s.P = 1e30;
      if (techOwned(s, 'fleet') && s.autoOn.fleet) autoFleet(s);
    }
    newsTick(s);
  }

  const ALL_EVENTS = EVENTS.concat(SEVENTS);
  const api = {
    TOPO, MAX_TOPO, PERKS, PARADIGMS, perk, perkCost, buyPerk, buffMul, approach, canAscend, ascend, catchGolden, memGain,
    TUNE, ACH, SEVENTS, ALL_EVENTS, SPACE_DOMAINS, TECH_BY_ID, achCount, achMult, sfx, techReqMet, techCost, checkAch, sample,
    BLD, GENS, MAX_GEN, TREE, TREE_BY_ID, DOMAINS, NEEDS, STAGES, EVENTS, SECT, SPB, TECH, CAPS, UNIVERSE, MILESTONES, PROBE_COST,
    SING_TRUST, SING_STAGE, SECT_GROWTH, SECT_NEED_CUT,
    FRONTIER, FR_BY_ID, FR_BASE, frReqMet, frAvailable, frStats, frBoost, buildFrontier, ownedFr,
    newState, step, doClick, buyBld, research, train, buySector, buyAlign, buyUbi, chooseEvent, singularity,
    buySpb, launchProbe, buyTech, rebirth,
    bldUnlocked, bldCost, bldOut, moneyRate, researchRate, clickValue, trainCost, secCost, alignCost, ubiCost,
    worldIndex, trustTarget, trustMult, revMult, resMult, milestoneMult, canSingularity, canAfford,
    treeReqMet, treeAvailable, needCost, scarcity, gini, stage, stageOk, stageMult, lifeExp, workHours, poverty, co2, population, year,
    spbUnlocked, spbCost, starCap, eRate, mRate, tRate, replRate, arriveRate, yardRate, kardashev, techAvailable, techOwned,
    progress, log,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.OURO = api;
})(typeof window !== 'undefined' ? window : globalThis);
