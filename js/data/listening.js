/* English Gate · 听力题库（按剑桥 B1 Preliminary / PET 听力考试的四个部分编写）
 *
 * Part 1  七段短录音（独白或对话），每段一个问题，从三张图里选一张——抓关键信息
 * Part 2  六段短对话，每段一个三选一的问题——听大意、观点、态度、感受
 * Part 3  一段独白，在笔记里填六个空，每空写一两个词、一个数字、日期或时间
 * Part 4  一段访谈，六个三选一的问题——细节理解和说话人的看法
 * 真实考试每段录音都播两遍，一题一分，共 25 分。
 *
 * 录音文本和题目都是本游戏自己编写的练习题，不是剑桥真题。游戏里没有录音文件，
 * 文本由浏览器的朗读功能读出来：'M' 男声、'F' 女声、'N' 旁白。数字、时间在文本里都写成单词，保证读得对。
 * 每题的 ev 是文本里能判断答案的那句话（用来在讲解里标出来），必须是 script 里某一句的原文片段。
 */
(function () {
  'use strict';
  const EG = window.EG;
  /** 图片选项：e 表情符号；t 大字（数字、价格、星期）；c 钟面时间 'h:mm'；l 文字说明（只在讲解里显示） */
  const P = (e, l, x) => Object.assign({ e, l }, x || {});

  /* ============================ Part 1 ============================ */
  const p1 = [
    {
      id: 'l1-film', q: 'What time does the film start today?', ans: 1,
      opts: [P('', 'quarter to seven', { c: '6:45' }), P('', 'quarter past seven', { c: '7:15' }), P('', 'half past seven', { c: '7:30' })],
      script: [['F', "Hi Dan, it's Mia. About the cinema tonight. I've just checked online."], ['F', "I thought the film started at half past seven, but that's when the late showing begins on Fridays."], ['F', 'Today it starts at quarter past seven.'], ['F', "So let's meet outside at quarter to seven, and then we'll have time to buy some popcorn."]],
      ev: 'Today it starts at quarter past seven.', zh: '七点半是周五晚场的时间，六点四十五是见面的时间；今天七点一刻开始。',
    },
    {
      id: 'l1-weather', q: 'What will the weather be like tomorrow afternoon?', ans: 0,
      opts: [P('☀️', 'sunny'), P('🌧️', 'rainy'), P('🌬️', 'windy')],
      script: [['M', 'And now the weather for tomorrow.'], ['M', "It'll be a wet start to the day, with heavy rain during the morning, so don't forget your umbrella."], ['M', 'But the rain will clear by lunchtime, and the afternoon will be dry and sunny.'], ['M', "Strong winds will arrive in the evening, so it'll feel much colder by then."]],
      ev: 'the afternoon will be dry and sunny', zh: '上午下雨，傍晚才起风；下午是晴天。',
    },
    {
      id: 'l1-airport', q: 'How will the woman get to the airport?', ans: 2,
      opts: [P('🚕', 'by taxi'), P('🚆', 'by train'), P('🚌', 'by bus')],
      script: [['M', 'Are you taking a taxi to the airport tomorrow?'], ['F', 'I wanted to, but it costs forty pounds!'], ['F', "I looked at the train as well, but there isn't one early enough for my flight."], ['M', 'What about the airport bus? It leaves from the station every half hour, even at night.'], ['F', "Yes, I've booked a seat on that. It only takes fifty minutes."]],
      ev: "Yes, I've booked a seat on that.", zh: '出租车太贵，火车没有够早的班次；她订了机场大巴的座位。',
    },
    {
      id: 'l1-present', q: "What did the girl buy for her mum's birthday?", ans: 2,
      opts: [P('📖', 'a book'), P('💐', 'some flowers'), P('🧣', 'a scarf')],
      script: [['M', 'Did you find a present for Mum?'], ['F', 'Finally, yes!'], ['F', "I was going to get her that cookery book she wanted, but Dad's already bought it."], ['F', "Then I looked at some lovely flowers in the market, but they won't last until Sunday."], ['F', 'So in the end I chose a blue scarf. She can wear it with her new coat.']],
      ev: 'So in the end I chose a blue scarf.', zh: '书爸爸已经买了，花放不到周日；最后买了蓝色围巾。',
    },
    {
      id: 'l1-ticket', q: 'How much did the boy pay for his concert ticket?', ans: 0,
      opts: [P('🎟️', 'fifteen pounds', { t: '£15' }), P('🎟️', 'twenty-five pounds', { t: '£25' }), P('🎟️', 'thirty pounds', { t: '£30' })],
      script: [['F', 'How much were the tickets for the concert, Ben?'], ['M', 'Well, the adult ones are thirty pounds, which is a lot.'], ['M', "But I'm still at school, so I got a student ticket for fifteen."], ['M', "My brother's a student too, but he forgot his card, so he had to pay twenty-five for his."]],
      ev: 'I got a student ticket for fifteen', zh: '成人票三十镑；哥哥忘带学生证付了二十五镑；男孩自己买的学生票十五镑。',
    },
    {
      id: 'l1-phone', q: 'Where is the man\'s phone?', ans: 0,
      opts: [P('🚗', 'in the car'), P('🛋️', 'on the sofa'), P('🍳', 'in the kitchen')],
      script: [['M', "Have you seen my phone? I thought I'd left it on the sofa last night, but it isn't there."], ['F', 'Did you look in the kitchen? You often put it next to the cooker.'], ['M', "Yes, I've checked."], ['M', 'Oh, wait a minute. I used it for directions on the way home.'], ['M', "It must still be in the car. I'll go and get it."]],
      ev: 'It must still be in the car.', zh: '沙发上没有，厨房也找过了；他回家路上用手机导航，所以还在车里。',
    },
    {
      id: 'l1-lunch', q: 'What will the girl have for lunch?', ans: 2,
      opts: [P('🍕', 'pizza'), P('🥗', 'salad'), P('🥣', 'soup')],
      script: [['M', 'What would you like for lunch, Anna? I can make you a salad.'], ['F', 'I had salad yesterday, Dad. Is there any of that pizza left?'], ['M', 'Sorry, your brother finished it last night.'], ['M', "But I've just made some tomato soup."], ['F', "Oh, lovely. I'll have a bowl of that, then, with some bread."]],
      ev: "I'll have a bowl of that", zh: '沙拉昨天吃过了，披萨被哥哥吃完了；她要喝一碗番茄汤。',
    },
    {
      id: 'l1-trip', q: 'When is the school trip?', ans: 1,
      opts: [P('📅', 'Tuesday', { t: 'TUE' }), P('📅', 'Thursday', { t: 'THU' }), P('📅', 'Friday', { t: 'FRI' })],
      script: [['F', "Listen, everyone. I've got some news about our trip to the castle."], ['F', "We planned to go on Tuesday, but the coach company can't take us then."], ['F', 'They offered us Friday instead, but lots of you have a maths test that day.'], ['F', "So we're going on Thursday."], ['F', 'Please bring your forms back by Wednesday.']],
      ev: "So we're going on Thursday.", zh: '周二没有车，周五有数学测验；最后定在周四。周三是交表的日子。',
    },
    {
      id: 'l1-bus', q: 'Which bus goes to the museum?', ans: 0,
      opts: [P('🚌', 'number fourteen', { t: '14' }), P('🚌', 'number forty', { t: '40' }), P('🚌', 'number forty-four', { t: '44' })],
      script: [['M', 'Excuse me, does the number forty-four go to the science museum?'], ['F', 'No, that one goes to the hospital.'], ['F', 'You need the number fourteen. One, four. It stops right outside the museum.'], ['M', 'Fourteen. Thanks. And is it the same stop as the number forty?'], ['F', 'No, the forty leaves from across the road. Yours leaves from here.']],
      ev: 'You need the number fourteen.', zh: '44 路去医院，40 路在马路对面；去博物馆坐 14 路（注意 fourteen 和 forty 的区别）。',
    },
    {
      id: 'l1-sport', q: 'Which sport will the boy do on Saturday?', ans: 2,
      opts: [P('🎾', 'tennis'), P('🏊', 'swimming'), P('🚴', 'cycling')],
      script: [['F', 'Are you playing tennis on Saturday as usual, Tom?'], ['M', "No, my partner has hurt his arm, so we've cancelled."], ['M', "I thought about going swimming instead, but the pool's closed for repairs."], ['F', 'So what will you do?'], ['M', "My cousin has asked me to go cycling with him by the river. I haven't done that for ages, so I said yes."]],
      ev: 'My cousin has asked me to go cycling with him by the river.', zh: '网球取消了，游泳池在维修；他答应和表哥去骑车。',
    },
    {
      id: 'l1-forgot', q: 'What has the girl forgotten to bring?', ans: 2,
      opts: [P('🔑', 'her keys'), P('☂️', 'her umbrella'), P('🎧', 'her headphones')],
      script: [['F', "Oh no. I'm at the bus stop and I've just realised something."], ['F', "I've got my keys, and I remembered my umbrella because it looks like rain."], ['F', 'But my headphones are still on my desk at home!'], ['F', "The journey takes an hour, and I can't listen to my music. Never mind, I'll read my book instead."]],
      ev: 'But my headphones are still on my desk at home!', zh: '钥匙和雨伞都带了；耳机落在家里的书桌上。',
    },
    {
      id: 'l1-saturday', q: 'What are the friends going to do on Saturday evening?', ans: 1,
      opts: [P('🎬', 'go to the cinema'), P('🎳', 'go bowling'), P('🍝', 'go to a restaurant')],
      script: [['M', "So, what shall we do on Saturday evening? There's a good film on at the cinema."], ['F', "We went to the cinema last week. How about going bowling? We haven't done that for months."], ['M', 'Good idea. Shall we have a meal at the Italian restaurant first?'], ['F', "It's always full on Saturdays. Let's just go bowling and get a snack there."], ['M', 'OK, great.']],
      ev: "Let's just go bowling and get a snack there.", zh: '电影上周看过了，意大利餐厅周六总是满的；他们决定去打保龄球。',
    },
    {
      id: 'l1-zoo', q: 'Which animals did the boy like best at the zoo?', ans: 2,
      opts: [P('🐘', 'the elephants'), P('🐒', 'the monkeys'), P('🐧', 'the penguins')],
      script: [['F', 'How was the zoo, Jack?'], ['M', 'Brilliant! We saw the elephants first. They were huge, but they were just standing around.'], ['M', "The monkeys were funny, but there were so many people that I couldn't see much."], ['M', 'The best part was watching the penguins. The keepers were feeding them, and they were jumping into the water.']],
      ev: 'The best part was watching the penguins.', zh: '大象只是站着，猴子那里人太多看不清；他最喜欢看企鹅。',
    },
    {
      id: 'l1-meet', q: 'Where will the friends meet?', ans: 2,
      opts: [P('🚉', 'at the station'), P('☕', 'at the café'), P('📚', 'at the library')],
      script: [['M', 'Hi Sara, shall we meet at the station before the match?'], ['F', "It's always so crowded there. What about the café opposite the stadium?"], ['M', 'It closes at five on Sundays, I think.'], ['F', "Oh, yes. Well, I'm returning some books to the library at four. Why don't you meet me outside?"], ['F', "It's only five minutes from the stadium."], ['M', 'Perfect. See you there.']],
      ev: "I'm returning some books to the library at four. Why don't you meet me outside?", zh: '车站太挤，咖啡馆周日五点关门；他们约在图书馆外面见。',
    },
  ];

  /* ============================ Part 2 ============================ */
  const p2 = [
    {
      id: 'l2-cafe', ctx: 'You will hear two friends talking about a new café.', q: 'What does the girl like best about it?', opts: ['the prices', 'the music', 'the cakes'], ans: 2,
      script: [['M', 'Have you been to that new café by the park?'], ['F', "Yes, twice! It isn't cheap, though. I paid four pounds for a hot chocolate."], ['M', 'Really? I heard they play great music.'], ['F', "They do, but it's a bit loud for me."], ['F', 'What I really love is the cakes. They make them all there, and the lemon one is amazing.'], ['M', "I'll have to try it."]],
      ev: 'What I really love is the cakes.', zh: '她觉得价格不便宜、音乐太吵；最喜欢的是蛋糕。',
    },
    {
      id: 'l2-play', ctx: 'You will hear a boy telling a friend about a school play.', q: 'How did he feel just before it started?', opts: ['bored', 'nervous', 'confident'], ans: 1,
      script: [['F', 'I heard you were in the school play, Leo. How did it go?'], ['M', 'It went really well in the end.'], ['M', "But just before it started, my hands were shaking and I thought I'd forget all my words."], ['F', 'You always look so confident!'], ['M', 'Not that night. Once I was on stage it was fine, though, and I was never bored for a second.']],
      ev: "my hands were shaking and I thought I'd forget all my words", zh: '手在发抖、怕忘词，说明他很紧张。confident 是女孩对他平时的印象。',
    },
    {
      id: 'l2-project', ctx: 'You will hear two classmates talking about their history project.', q: 'What do they agree about?', opts: ['It was too long.', 'The topic was interesting.', 'They needed more time.'], ans: 1,
      script: [['F', "I'm so glad we've finished the history project."], ['M', "Me too. Twenty pages was a lot, wasn't it?"], ['F', "Oh, I didn't mind that. I just wish we'd had another week to do it."], ['M', 'Really? I thought three weeks was plenty.'], ['M', 'But I did enjoy learning about ancient Egypt.'], ['F', 'Yes, so did I. It was much more interesting than I expected.']],
      ev: 'Yes, so did I. It was much more interesting than I expected.', zh: '男孩嫌太长，女孩不同意；女孩嫌时间不够，男孩不同意；两人都觉得题目有意思。',
    },
    {
      id: 'l2-teacher', ctx: 'You will hear a girl telling her dad about her new maths teacher.', q: 'What does she say about him?', opts: ['He gives too much homework.', 'He explains things clearly.', 'He is very strict.'], ans: 1,
      script: [['M', "How's the new maths teacher?"], ['F', "Mr Evans? He's great, actually."], ['F', "Everyone said he'd be really strict, but he's quite relaxed."], ['M', 'And does he give you lots of homework?'], ['F', 'Less than our last teacher.'], ['F', 'The best thing is the way he explains everything. For the first time, I actually understand what we are doing.']],
      ev: 'The best thing is the way he explains everything.', zh: '他并不严厉，作业也比以前的老师少；最好的是讲解得清楚。',
    },
    {
      id: 'l2-trainers', ctx: 'You will hear a boy talking to a shop assistant about some trainers.', q: 'Why does he decide not to buy them today?', opts: ['They are the wrong colour.', 'They are too expensive.', 'They are too small.'], ans: 1,
      script: [['F', 'How are those trainers? Would you like a bigger size?'], ['M', 'No, the size is perfect, thanks. And I love the colour.'], ['F', "They're sixty pounds."], ['M', "Oh. I've only got forty-five. I didn't realise they cost that much."], ['F', "We've got a similar pair for forty."], ['M', "Hmm, I'll think about it and come back with my mum."]],
      ev: "I've only got forty-five. I didn't realise they cost that much.", zh: '尺码合适、颜色也喜欢；问题是六十镑太贵，他只有四十五镑。',
    },
    {
      id: 'l2-camping', ctx: 'You will hear two friends talking about a camping trip.', q: 'What is the girl worried about?', opts: ['the weather', 'the food', 'getting lost'], ans: 0,
      script: [['M', 'Are you ready for the camping trip on Saturday?'], ['F', "Almost. Dad's bought loads of food, so we won't be hungry."], ['F', "And we've got a good map, so we won't get lost."], ['M', 'Sounds perfect.'], ['F', "Well, I've just seen the forecast. They say there'll be storms on Saturday night."], ['F', "I really don't want to sleep in a wet tent."]],
      ev: "They say there'll be storms on Saturday night.", zh: '食物买够了，也有地图；她担心的是周六晚上有暴风雨。',
    },
    {
      id: 'l2-film', ctx: 'You will hear two friends talking about a film they have just seen.', q: 'What did the boy think of it?', opts: ['It was too long.', 'The story was confusing.', 'The actors were disappointing.'], ans: 1,
      script: [['F', 'What did you think of the film?'], ['M', 'Well, the actors were excellent, especially the girl who played the detective.'], ['F', 'I thought it was a bit long.'], ['M', 'Did you? The time went quickly for me.'], ['M', "My problem was the story. There were so many characters that I couldn't follow what was happening."], ['F', "Yes, the ending didn't make much sense."]],
      ev: "There were so many characters that I couldn't follow what was happening.", zh: '他觉得演员很棒，也不觉得长；问题是人物太多，看不懂故事。',
    },
    {
      id: 'l2-climbing', ctx: 'You will hear a girl telling a friend about a climbing club.', q: 'Why did she join it?', opts: ['to get fitter', 'to make new friends', 'because her brother goes there'], ans: 1,
      script: [['M', "I didn't know you'd joined the climbing club."], ['F', "Yes, last month. My brother's been going for years, but that's not why I started."], ['M', 'So was it to get fit?'], ['F', 'I get plenty of exercise from swimming.'], ['F', "The thing is, since we moved here, I haven't known many people."], ['F', "Now I've got a whole group to go out with at weekends."]],
      ev: "since we moved here, I haven't known many people", zh: '不是因为哥哥，也不是为了健身；搬来以后认识的人少，她想交朋友。',
    },
    {
      id: 'l2-holiday', ctx: 'You will hear a boy talking to his mum about their summer holiday.', q: 'What does he want to do?', opts: ['stay in a hotel', 'go camping again', 'visit his cousins'], ans: 0,
      script: [['F', 'So, where shall we go this summer? We could go camping again.'], ['M', 'Mum, it rained every day last year!'], ['F', 'Well, your cousins have invited us to stay with them in Scotland.'], ['M', "That's kind, but their house is tiny."], ['M', "Can't we just book a hotel by the sea? I want a real bed and a swimming pool."]],
      ev: "Can't we just book a hotel by the sea?", zh: '露营去年天天下雨，表亲家房子太小；他想订海边的酒店。',
    },
    {
      id: 'l2-newphone', ctx: 'You will hear a girl talking to a friend about her new phone.', q: 'What is the problem with it?', opts: ['The screen is too small.', "The battery doesn't last long.", 'The camera is poor.'], ans: 1,
      script: [['M', "Is that your new phone? The screen's huge!"], ['F', "Yes, it's great for watching videos. And the camera takes brilliant photos."], ['M', "So you're happy with it?"], ['F', 'Not really. I charge it every morning, and by lunchtime it is almost dead.'], ['F', 'I have to carry a charger everywhere I go.']],
      ev: 'I charge it every morning, and by lunchtime it is almost dead.', zh: '屏幕很大、拍照很好；问题是早上充的电到中午就快没了。',
    },
    {
      id: 'l2-guitar', ctx: 'You will hear a boy talking to his music teacher about playing the guitar.', q: 'What does the teacher advise him to do?', opts: ['practise a little every day', 'buy a better guitar', 'take extra lessons'], ans: 0,
      script: [['M', "I'm not getting any better, Miss Carter. Should I get a more expensive guitar?"], ['F', 'No, yours is fine for now.'], ['M', 'Maybe I need two lessons a week instead of one?'], ['F', "That won't help if you only practise on Sundays."], ['F', 'Ten minutes every day is much better than two hours once a week. Try that for a month.']],
      ev: 'Ten minutes every day is much better than two hours once a week.', zh: '老师说吉他不用换，加课也没用；建议每天练十分钟。',
    },
    {
      id: 'l2-party', ctx: 'You will hear two friends planning a surprise party.', q: 'What do they still need to do?', opts: ['send the invitations', 'order the cake', 'choose the music'], ans: 1,
      script: [['F', "Right, the party's on Friday. Have we done everything?"], ['M', "I sent the invitations last week, and everyone's coming."], ['F', "Great. And I've made a playlist with all of Sam's favourite songs."], ['M', 'What about the cake?'], ['F', "Oh no, I completely forgot! The bakery needs two days' notice."], ['M', "Then we'd better call them today."]],
      ev: 'Oh no, I completely forgot!', zh: '请柬上周发了，歌单也做好了；蛋糕忘了订。',
    },
  ];

  /* ============================ Part 3 ============================ */
  /* notes 里的 {0}…{5} 是空格的位置；gaps[i].a 是标准答案，ok 是同样算对的其他写法（判分时不分大小写、忽略标点和冠词）。 */
  const p3 = [
    {
      id: 'l3-museum', title: 'School trip to the Science Museum', speaker: 'M',
      intro: 'You will hear a teacher telling his class about a school trip to a science museum.',
      notes: ['Date of trip: Wednesday {0} March', 'Coach leaves school at: {1} a.m.', 'Guided tour of the {2} exhibition', "Teacher's favourite room is about {3}", 'Afternoon film is about {4}', 'Cost of trip: £ {5}'],
      gaps: [
        { a: '21', ok: ['21st', 'twenty-first', 'twenty first', 'the 21st'], ev: 'The trip is on Wednesday the twenty-first of March.' },
        { a: '8.15', ok: ['8:15', '815', '8 15', 'eight fifteen', 'quarter past eight', 'a quarter past eight'], ev: 'The coach will leave from the school car park at eight fifteen' },
        { a: 'space', ok: [], ev: 'a guide will show us around the space exhibition' },
        { a: 'robots', ok: ['robot'], ev: 'I recommend the room about robots, which is my favourite.' },
        { a: 'volcanoes', ok: ['volcanos', 'volcano'], ev: "we're going to watch a film about volcanoes" },
        { a: '12', ok: ['twelve', '12.00', '12 pounds', 'twelve pounds'], ev: 'The trip costs twelve pounds' },
      ],
      script: [
        'Good morning, everyone. I want to give you some information about our trip to the Science Museum next week.',
        'The trip is on Wednesday the twenty-first of March.',
        "The coach will leave from the school car park at eight fifteen, so please be here by eight o'clock.",
        'The journey takes about an hour and a half.',
        "When we arrive, a guide will show us around the space exhibition. That's on the second floor.",
        "After that, you'll have free time to explore. I recommend the room about robots, which is my favourite.",
        "We'll have lunch at half past twelve. There's a café, but it's expensive, so please bring a packed lunch.",
        "In the afternoon, we're going to watch a film about volcanoes in the museum cinema.",
        'The trip costs twelve pounds, and you need to give the money to Mrs Parker in the school office.',
        "Finally, don't forget to bring a notebook, because you'll need to write a report afterwards.",
        "We'll be back at school by four thirty.",
      ],
    },
    {
      id: 'l3-camp', title: 'Lakeside Summer Sports Camp', speaker: 'F',
      intro: 'You will hear a woman called Jenny talking on the radio about a summer sports camp for teenagers.',
      notes: ['Camp starts on: {0} August', 'New sport this summer: {1}', 'Head coach: Mark {2}', 'Bring your own: {3}', 'On the last day, every player gets a {4}', 'Cost per week: £ {5}'],
      gaps: [
        { a: '3', ok: ['3rd', 'third', 'the third', 'the 3rd'], ev: 'This year it begins on the third of August.' },
        { a: 'sailing', ok: [], ev: "this summer we're offering sailing for the first time" },
        { a: 'Robson', ok: [], ev: "Our head coach is Mark Robson. That's R, O, B, S, O, N." },
        { a: 'water bottle', ok: ['bottle', 'water-bottle', 'waterbottle', 'bottle of water'], ev: 'you should bring your own water bottle' },
        { a: 'medal', ok: ['medals'], ev: 'Every player gets a medal.' },
        { a: '180', ok: ['one hundred and eighty', 'one hundred eighty', '180 pounds'], ev: 'The camp costs one hundred and eighty pounds per week.' },
      ],
      script: [
        "Hello, I'm Jenny, and I'm here to tell you about Lakeside Summer Sports Camp.",
        'The camp is for young people aged twelve to sixteen, and it runs for two weeks.',
        'This year it begins on the third of August.',
        "You can choose from lots of different sports. As well as football and tennis, this summer we're offering sailing for the first time.",
        "All our coaches are professionals. Our head coach is Mark Robson. That's R, O, B, S, O, N. He used to play basketball for the national team.",
        "Each day starts at nine thirty and finishes at four o'clock.",
        'Lunch is included in the price, but you should bring your own water bottle.',
        "On the last day, there's a competition, and parents are welcome to come and watch. Every player gets a medal.",
        'The camp costs one hundred and eighty pounds per week.',
        'To book a place, please visit our website before the end of June.',
      ],
    },
    {
      id: 'l3-photo', title: 'Young Photographer competition', speaker: 'M',
      intro: 'You will hear a man giving information about a photography competition for young people.',
      notes: ["This year's subject: {0}", 'Maximum number of photos: {1}', 'Closing date: {2} June', 'The judge works for a {3} magazine', 'First prize: a new {4}', 'Best photos will be shown at the town {5}'],
      gaps: [
        { a: 'water', ok: [], ev: "this year we want photos on the subject of water" },
        { a: '3', ok: ['three'], ev: 'You can enter up to three photos' },
        { a: '30', ok: ['30th', 'thirtieth', 'the 30th', 'the thirtieth'], ev: 'the closing date, which is the thirtieth of June' },
        { a: 'wildlife', ok: ['wild life', 'wild-life'], ev: 'who takes photographs for a wildlife magazine' },
        { a: 'camera', ok: [], ev: 'The winner will receive a new camera' },
        { a: 'library', ok: [], ev: 'All the best photos will be shown at the town library in September.' },
      ],
      script: [
        "Thanks for coming, everyone. I'd like to tell you about this year's Young Photographer competition.",
        "It's open to anyone between eleven and eighteen years old.",
        "Last year the subject was 'my family', but this year we want photos on the subject of water.",
        'It could be the sea, a river, or just rain on a window. You decide.',
        'You can enter up to three photos, and you must take them yourself, of course.',
        'Please send them by email before the closing date, which is the thirtieth of June.',
        'The judge this year is Anna Fisher, who takes photographs for a wildlife magazine.',
        'The winner will receive a new camera, and the second prize is a photography course.',
        'All the best photos will be shown at the town library in September.',
        'Good luck, and I look forward to seeing your work.',
      ],
    },
  ];

  /* ============================ Part 4 ============================ */
  const p4 = [
    {
      id: 'l4-baker', intro: 'You will hear an interview with a sixteen-year-old girl called Lucy Chen, who runs her own cake stall.',
      script: [
        ['M', "Today I'm talking to Lucy Chen, who sells cakes at the Saturday market. Lucy, how did you start baking?"],
        ['F', "Well, my mum isn't interested in cooking at all, and my friends weren't either."], ['F', "But I used to stay with my grandmother every summer, and she taught me to make simple biscuits. I've loved it ever since."],
        ['M', 'And why did you decide to open a stall?'],
        ['F', 'People often think it was for the money.'], ['F', "Actually, I was making so many cakes at home that my family couldn't eat them all! My dad suggested selling them, just so they wouldn't be wasted."],
        ['M', 'What was the hardest thing at the beginning?'],
        ['F', 'I expected the baking to be difficult, but I was used to that. And customers came from the first day.'], ['F', "The real problem was getting up at five o'clock on Saturdays. I still hate it!"],
        ['M', 'Which of your cakes is the most popular?'],
        ['F', 'My own favourite is the lemon cake, and the carrot cake gets the best comments online.'], ['F', 'But the one that always sells out first is the chocolate cake. I have to make three every week.'],
        ['M', 'How do you manage your school work as well?'],
        ['F', "It isn't easy. I never bake on school nights, because I need those for homework."], ['F', 'I do all my baking on Friday evening, and my brother helps me carry everything to the market.'],
        ['M', 'And what are your plans for the future?'],
        ['F', 'Lots of people tell me to open a shop, or write a cookery book. Maybe one day.'], ['F', "But first I want to go to college and study to be a chef. There's still so much to learn."],
      ],
      qs: [
        { q: 'Who taught Lucy to bake?', opts: ['her mother', 'her grandmother', 'a friend'], ans: 1, ev: 'she taught me to make simple biscuits', zh: '妈妈和朋友都对做饭没兴趣；是奶奶教她做饼干的。' },
        { q: 'Why did Lucy start selling cakes?', opts: ['She wanted to earn money.', 'Her father wanted to start a business.', 'She was making more than her family could eat.'], ans: 2, ev: "I was making so many cakes at home that my family couldn't eat them all!", zh: '不是为了钱；她做得太多家里吃不完，爸爸才建议拿去卖。' },
        { q: 'What did Lucy find most difficult at first?', opts: ['baking enough cakes', 'finding customers', 'getting up early'], ans: 2, ev: "The real problem was getting up at five o'clock on Saturdays.", zh: '烘焙她早就习惯了，顾客第一天就有；难的是周六五点起床。' },
        { q: 'Which cake sells best?', opts: ['the chocolate cake', 'the lemon cake', 'the carrot cake'], ans: 0, ev: 'the one that always sells out first is the chocolate cake', zh: '柠檬蛋糕是她自己最爱的，胡萝卜蛋糕网上评价最好；最先卖光的是巧克力蛋糕。' },
        { q: 'When does Lucy do her baking?', opts: ['early on Saturday mornings', 'on Friday evenings', 'on school nights'], ans: 1, ev: 'I do all my baking on Friday evening', zh: '上学日的晚上要写作业；她都在周五晚上烤。' },
        { q: 'What does Lucy want to do next?', opts: ['open a shop', 'write a cookery book', 'train to be a chef'], ans: 2, ev: 'first I want to go to college and study to be a chef', zh: '开店和写书是别人的建议；她想先去学做厨师。' },
      ],
    },
    {
      id: 'l4-swimmer', intro: 'You will hear an interview with a fifteen-year-old swimmer called Daniel Reed.',
      script: [
        ['F', 'My guest today is Daniel Reed, who has just won a national swimming competition. Daniel, when did you learn to swim?'],
        ['M', 'Quite late, actually. Most of my teammates started when they were three or four.'], ['M', "I didn't learn until I was eight, on a family holiday, and I joined a club when I was ten."],
        ['F', 'What do you enjoy most about swimming?'],
        ['M', "Winning is nice, of course, and I've made good friends at the club."], ['M', "But what I like best is the feeling when I'm in the water. Everything is quiet, and I forget all my problems."],
        ['F', 'Tell us about your training.'],
        ['M', 'I train six days a week. The evening sessions are fine.'], ['M', "The hard part is the morning ones. I'm in the pool at half past five, before school, three times a week."],
        ['F', 'Do you follow a special diet?'],
        ['M', "Not really. I eat a lot of pasta and fruit, and my coach doesn't let me have fizzy drinks."], ['M', "I thought I would miss chocolate most, but in fact it's the fizzy drinks I think about!"],
        ['F', 'Who has helped you the most?'],
        ['M', 'My coach is brilliant, and my dad drives me to every competition.'], ['M', "But honestly, it's my older sister. She used to swim too, and she knows exactly what to say when I've had a bad race."],
        ['F', "And what's your next goal?"],
        ['M', "People keep asking me about the Olympics, but that's a long way off."], ['M', "This year I just want to beat my own best time in the two hundred metres. If I do that, I'll be happy."],
      ],
      qs: [
        { q: 'How old was Daniel when he learned to swim?', opts: ['four', 'eight', 'ten'], ans: 1, ev: "I didn't learn until I was eight", zh: '三四岁是队友开始学的年龄，十岁是他加入俱乐部的年龄；他八岁才学会。' },
        { q: 'What does Daniel like best about swimming?', opts: ['winning competitions', 'being with his friends', 'feeling calm in the water'], ans: 2, ev: "what I like best is the feeling when I'm in the water", zh: '赢比赛和交朋友都不错；他最喜欢在水里安静、忘掉烦恼的感觉。' },
        { q: 'How often does Daniel train in the morning?', opts: ['three times a week', 'six times a week', 'every day'], ans: 0, ev: "I'm in the pool at half past five, before school, three times a week.", zh: '一周训练六天是总数；早上的训练是一周三次。' },
        { q: 'What does Daniel miss most?', opts: ['chocolate', 'fizzy drinks', 'pasta'], ans: 1, ev: "in fact it's the fizzy drinks I think about", zh: '他原以为会最想吃巧克力，结果最想的是汽水。' },
        { q: 'Who has helped Daniel the most?', opts: ['his coach', 'his father', 'his sister'], ans: 2, ev: "But honestly, it's my older sister.", zh: '教练很棒、爸爸负责接送；帮助最大的是姐姐。' },
        { q: "What is Daniel's aim for this year?", opts: ['to get to the Olympics', 'to improve his own best time', 'to win another national competition'], ans: 1, ev: 'This year I just want to beat my own best time', zh: '奥运会还很远；今年的目标是刷新自己两百米的最好成绩。' },
      ],
    },
    {
      id: 'l4-app', intro: 'You will hear an interview with a seventeen-year-old called Sam Ortiz, who has designed an app for students.',
      script: [
        ['F', 'Sam, your app has been downloaded fifty thousand times. Where did the idea come from?'],
        ['M', "From my own problems, really. I wasn't bad at school, and I didn't find the subjects boring."], ['M', 'I just kept forgetting when my homework was due. I wanted something to remind me.'],
        ['F', 'How did you learn to make an app?'],
        ['M', "My school doesn't teach programming, and I couldn't afford a course."], ['M', 'So I watched free videos online, every evening for about a year.'],
        ['F', 'Was it difficult?'],
        ['M', 'The design was fun, and testing it with my friends was easy.'], ['M', 'What nearly made me give up was fixing the mistakes in the code. One small problem took me three weeks to solve.'],
        ['F', 'What did your parents think?'],
        ['M', 'At first they were worried, because I was spending so much time on my computer. They thought my marks would go down.'], ['M', 'But when they saw the app working, they were really proud.'],
        ['F', 'Do you earn money from it?'],
        ['M', "The app is free, and I've said no to advertisements because students hate them."], ['M', 'A small company pays me to add new features, though, so I earn a little that way.'],
        ['F', 'What advice would you give to other young people?'],
        ['M', "Don't wait until your idea is perfect, because it never will be."], ['M', "Just begin, even if it's small. You can ask for help and improve it later."],
      ],
      qs: [
        { q: 'Why did Sam decide to make the app?', opts: ['He found school boring.', 'He often forgot about his homework.', 'He was getting bad marks.'], ans: 1, ev: 'I just kept forgetting when my homework was due.', zh: '他成绩不差，也不觉得无聊；只是总忘记作业什么时候交。' },
        { q: 'How did Sam learn to make apps?', opts: ['at school', 'on a course', 'from online videos'], ans: 2, ev: 'So I watched free videos online', zh: '学校不教编程，课程又太贵；他是看网上的免费视频学的。' },
        { q: 'What was the hardest part for Sam?', opts: ['designing the app', 'testing it with friends', 'correcting mistakes'], ans: 2, ev: 'What nearly made me give up was fixing the mistakes in the code.', zh: '设计很有趣，测试也容易；差点让他放弃的是修正代码里的错误。' },
        { q: "How did Sam's parents feel at first?", opts: ['proud', 'worried', 'surprised'], ans: 1, ev: 'At first they were worried', zh: '起初担心他成绩下降；看到应用做成之后才感到骄傲。' },
        { q: 'How does Sam earn money from the app?', opts: ['from advertisements', 'by selling the app', 'A company pays him.'], ans: 2, ev: 'A small company pays me to add new features', zh: '应用免费，也不放广告；一家小公司付钱请他加新功能。' },
        { q: "What is Sam's advice?", opts: ['Start straight away.', 'Wait for a perfect idea.', 'Always work alone.'], ans: 0, ev: "Just begin, even if it's small.", zh: '不要等想法完美，先开始做；也可以找人帮忙。' },
      ],
    },
  ];

  EG.ListenData = { p1, p2, p3, p4 };
})();
