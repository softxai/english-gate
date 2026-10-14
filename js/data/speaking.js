/* English Gate · 口语题库（按剑桥 B1 Preliminary / PET 口语考试的四个部分编写）
 *
 * Part 1  问答：考官问个人情况、日常生活、喜好
 * Part 2  看图说话：独自描述一张日常生活的图片，约 1 分钟
 * Part 3  合作讨论：和搭档围绕一个情境和几个选项讨论、给建议、做决定
 * Part 4  延伸讨论：围绕 Part 3 的话题谈自己的喜好、经历和看法
 *
 * 题目和范例答案都是本游戏自己编写的练习题，不是剑桥真题。
 * rel / kw 里的词用于粗略判断"有没有说到点上"：写词根即可，cook 会匹配 cooks / cooked / cooking。
 */
(function () {
  'use strict';
  const EG = window.EG;
  const Q = (id, ph, q, zh, rel, frame, words, sample, target, min) => ({ id: 'p1-' + id, ph, q, zh, rel, frame, words, sample, target: target || 18, min: min || 6 });

  /* ============================ Part 1 ============================ */
  const part1 = [
    // 第一阶段：基本个人信息，回答可以短
    Q('name', 1, "What's your name?", '你叫什么名字？', null, "My name is … / I'm …", ['My name is …', 'People call me …'], 'My name is Li Ming, but my friends call me Leo.', 5, 2),
    Q('live', 1, 'Where do you live?', '你住在哪里？', ['live', 'city', 'town', 'village', 'near', 'from', 'in'], "I live in … It's a … in the … of China.", ['a big city', 'a small town', 'in the north / south / east / west of'], "I live in Hangzhou. It's a big city in the east of China.", 8, 3),
    Q('from', 1, 'Where do you come from?', '你来自哪里？', ['from', 'come', 'live', 'city', 'town', 'china', 'born'], "I come from … It's famous for …", ['come from', 'was born in', 'be famous for'], "I come from Chengdu, a city in the west of China. It's famous for its spicy food.", 8, 3),
    Q('age', 1, 'How old are you?', '你几岁了？', ['year', 'old', 'am', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'twenty', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'], "I'm … years old.", ['… years old', 'My birthday is in …'], "I'm thirteen years old. My birthday is in May.", 4, 1),
    Q('with', 1, 'Who do you live with?', '你和谁住在一起？', ['live', 'with', 'parents', 'family', 'mother', 'father', 'mum', 'dad', 'brother', 'sister', 'grand'], 'I live with my … and my …', ['parents', 'grandparents', 'little brother / sister'], 'I live with my parents and my little sister. My grandparents live near us.', 9, 3),
    Q('study', 1, 'Do you study English at school? Do you like it?', '你在学校学英语吗？喜欢吗？', ['yes', 'study', 'english', 'like', 'lesson', 'learn', 'school', 'teacher', 'because'], 'Yes, I do. I like it because …', ['lessons every day', 'interesting', 'useful', 'a bit difficult'], 'Yes, I do. We have English lessons every day, and I like them because my teacher is funny.', 12, 3),

    // 第二阶段：日常、喜好、经历——要说完整，加上原因或例子
    Q('freetime', 2, 'What do you like doing in your free time?', '你空闲时喜欢做什么？', ['like', 'love', 'enjoy', 'play', 'watch', 'read', 'listen', 'go', 'usually', 'often', 'free', 'hobby', 'favourite', 'keen'],
      'In my free time, I like … because …', ['enjoy + doing', 'be keen on', 'hang out with friends', 'keep fit'],
      "In my free time I really enjoy playing basketball with my friends, because it's exciting and it keeps me fit. I also like reading comics at the weekend."),
    Q('friend', 2, 'Tell us about your best friend.', '说说你最好的朋友。', ['friend', 'he', 'she', 'name', 'call', 'know', 'like', 'together', 'funny', 'kind', 'friendly', 'class'],
      'My best friend is … He / She is … We often … together.', ['friendly', 'funny', 'get on well with', 'have a lot in common'],
      "My best friend is called Wang Lei. He's in my class and he's really funny. We get on well because we both love football, so we often play together after school."),
    Q('subject', 2, "What's your favourite subject at school? Why?", '你最喜欢学校里的哪门课？为什么？', ['subject', 'favourite', 'like', 'maths', 'english', 'science', 'history', 'art', 'music', 'sport', 'because', 'teacher', 'interesting', 'chinese', 'geography', 'physics', 'biology', 'good at'],
      'My favourite subject is … because …', ['be good at', 'interesting', 'do experiments', 'find it easy / difficult'],
      "My favourite subject is science, because we do experiments in class and I find them really interesting. I'm also quite good at it."),
    Q('toschool', 2, 'How do you get to school every day?', '你每天怎么去学校？', ['school', 'bus', 'walk', 'bike', 'car', 'foot', 'subway', 'underground', 'cycle', 'take', 'minutes', 'by', 'drive', 'ride'],
      'I usually go to school by … It takes about … minutes.', ['by bus / bike / underground', 'on foot', 'It takes about …', 'drive me there'],
      'I usually go to school by bike, because I live quite near. It takes about fifteen minutes. But when it rains, my dad drives me there.'),
    Q('lastweekend', 2, 'What did you do last weekend?', '上个周末你做了什么？', ['went', 'played', 'watched', 'visited', 'did', 'stayed', 'was', 'had', 'saw', 'weekend', 'saturday', 'sunday', 'last'],
      'Last weekend I … On Saturday … and on Sunday …', ['went to …', 'visited …', 'stayed at home', '用过去时'],
      'Last weekend I visited my grandparents with my family. On Saturday we had a big dinner together, and on Sunday I did my homework and watched a film.'),
    Q('evening', 2, 'What are you going to do this evening?', '今天晚上你打算做什么？', ['going', 'will', 'evening', 'tonight', 'homework', 'dinner', 'watch', 'after', 'plan', 'want', 'maybe', 'probably'],
      "This evening I'm going to … After that, I'll probably …", ["I'm going to …", "I'll probably …", 'after dinner'],
      "This evening I'm going to do my homework first. After dinner I'll probably watch a football match on TV with my dad, because our favourite team is playing."),
    Q('family', 2, 'Tell us about your family.', '说说你的家人。', ['family', 'people', 'parents', 'mother', 'father', 'mum', 'dad', 'brother', 'sister', 'grand', 'there', 'together', 'only child'],
      'There are … people in my family: … My … is a …', ['There are … people', 'an only child', 'older / younger brother'],
      'There are four people in my family: my parents, my older brother and me. My mum is a nurse and my dad is a driver. We like cooking together at the weekend.'),
    Q('music', 2, 'What kind of music do you like?', '你喜欢什么类型的音乐？', ['music', 'song', 'listen', 'pop', 'rock', 'classical', 'jazz', 'rap', 'singer', 'band', 'like', 'love', 'favourite', 'piano', 'guitar'],
      'I like … music best, because …', ['pop / rock / classical music', 'listen to music on my phone', 'makes me feel relaxed'],
      "I like pop music best, because it makes me feel happy. I usually listen to music on my phone when I'm on the bus, and sometimes I sing along."),
    Q('food', 2, "What's your favourite food? Can you cook it?", '你最喜欢吃什么？你会做吗？', ['food', 'eat', 'like', 'favourite', 'cook', 'delicious', 'noodle', 'rice', 'pizza', 'dumpling', 'fruit', 'meat', 'vegetable', 'chicken', 'fish', 'make', 'tasty', 'spicy'],
      "My favourite food is … because … I can / can't cook it.", ['delicious', 'tasty', 'spicy', 'help my mum make it'],
      "My favourite food is dumplings, because they're delicious. I can't cook them very well, but I sometimes help my grandma make them at the weekend."),
    Q('home', 2, 'Tell us about your home.', '说说你的家（房子）。', ['home', 'house', 'flat', 'apartment', 'live', 'room', 'bedroom', 'kitchen', 'floor', 'big', 'small', 'garden', 'building', 'near', 'comfortable'],
      'I live in a … There are … rooms. My favourite room is … because …', ['a flat on the … floor', 'comfortable', 'my favourite room'],
      "I live in a flat on the fifth floor. It isn't very big, but it's comfortable. There are three bedrooms, and my favourite room is my bedroom because I can relax there."),
    Q('morning', 2, 'What do you usually do in the morning before school?', '上学前的早上你通常做什么？', ['get up', 'wake', 'breakfast', 'morning', 'wash', 'brush', 'dressed', 'leave', 'usually', 'always', 'then', "o'clock", 'early', 'have', 'eat'],
      'I usually get up at … First I … then I … After that …', ['get up', 'have breakfast', 'get dressed', 'leave home', 'First … then … after that'],
      "I usually get up at half past six. First I wash my face and brush my teeth, then I have breakfast with my parents. After that, I leave home at about seven o'clock."),
    Q('films', 2, 'Do you prefer watching films at home or at the cinema? Why?', '你更喜欢在家看电影还是去电影院？为什么？', ['film', 'movie', 'cinema', 'home', 'prefer', 'watch', 'screen', 'because', 'better', 'rather', 'friends', 'comfortable', 'expensive'],
      'I prefer watching films … because … But …', ['I prefer …', 'the screen is bigger', 'more comfortable', 'expensive'],
      "I prefer watching films at the cinema, because the screen is much bigger and the sound is better. But it's quite expensive, so I usually watch films at home."),
    Q('teacher', 2, 'Tell us about a teacher you like.', '说说一位你喜欢的老师。', ['teacher', 'teach', 'he', 'she', 'lesson', 'class', 'kind', 'funny', 'help', 'explain', 'strict', 'like', 'subject'],
      'I really like my … teacher. He / She is … and always …', ['strict but kind', 'explain things clearly', 'make lessons fun'],
      "I really like my maths teacher, Mr Chen. He's strict but very kind, and he always explains things clearly. When I don't understand something, he helps me after class."),
    Q('internet', 2, 'How often do you use the internet? What do you use it for?', '你多久上一次网？用来做什么？', ['internet', 'online', 'phone', 'computer', 'every', 'day', 'often', 'use', 'watch', 'video', 'homework', 'chat', 'game', 'search', 'hour', 'message'],
      'I use the internet … I use it to … and to …', ['every day', 'for about an hour', 'chat with friends', 'look for information'],
      'I use the internet every day, usually for about an hour. I use it to do my homework and to chat with my friends. Sometimes I also watch funny videos.'),
    Q('sports', 2, 'What sports do you like playing or watching?', '你喜欢做或者看什么运动？', ['sport', 'play', 'football', 'basketball', 'badminton', 'swim', 'run', 'tennis', 'watch', 'team', 'match', 'exercise', 'like', 'enjoy', 'good at'],
      'I like playing … because … I also enjoy watching …', ['good exercise', 'be good at', 'watch a match on TV'],
      "I like playing badminton with my classmates after school, because it's good exercise. I also enjoy watching basketball on TV, although I'm not very good at playing it."),
    Q('holiday', 2, 'Where would you like to go on holiday? Why?', '你想去哪里度假？为什么？', ['holiday', 'go', 'visit', 'would', 'like', 'want', 'travel', 'beach', 'sea', 'country', 'city', 'because', 'see', 'mountain', 'trip', 'abroad'],
      "I'd like to go to … because I want to …", ["I'd like to …", "I've never been …", 'go abroad', 'go sightseeing'],
      "I'd like to go to Australia on holiday, because I want to see kangaroos and swim in the sea. I've never been abroad, so it would be really exciting."),
    Q('weather', 2, "What's the weather like where you live? Which season do you like best?", '你住的地方天气怎么样？你最喜欢哪个季节？', ['weather', 'hot', 'cold', 'rain', 'sunny', 'snow', 'summer', 'winter', 'spring', 'autumn', 'warm', 'season', 'wind', 'cool', 'wet', 'dry'],
      "In my city it's … in summer and … in winter. I like … best, because …", ['hot / cold / wet / dry', 'it often rains', 'my favourite season'],
      "In my city it's very hot in summer and quite cold in winter. I like autumn best, because the weather is cool and the trees look beautiful."),
    Q('reading', 2, 'Do you like reading? What do you read?', '你喜欢阅读吗？读些什么？', ['read', 'book', 'story', 'novel', 'comic', 'magazine', 'like', 'enjoy', 'library', 'interesting', 'often'],
      'Yes, I … I usually read … because …', ['adventure stories', 'comics', 'before I go to bed', 'learn new words'],
      'Yes, I love reading. I usually read adventure stories and comics before I go to bed. I think reading is relaxing, and it also helps me learn new words.'),
    Q('birthday', 2, 'Tell us about your last birthday.', '说说你上一次生日。', ['birthday', 'party', 'cake', 'present', 'gift', 'friends', 'family', 'had', 'got', 'gave', 'went', 'ate', 'celebrate', 'was'],
      'My last birthday was in … I had … My parents gave me …', ['had a party', 'gave me a present', '用过去时'],
      'My last birthday was in March. I had a small party at home with my family and two friends. We ate a chocolate cake, and my parents gave me a new bike.'),
    Q('job', 2, 'What job would you like to do in the future?', '你将来想做什么工作？', ['job', 'want', 'would', 'like', 'be', 'become', 'doctor', 'teacher', 'work', 'because', 'future', 'when', 'grow', 'engineer', 'help', 'hope'],
      "I'd like to be a … when I grow up, because …", ["I'd like to be …", 'when I grow up', 'study hard'],
      "I'd like to be a doctor when I grow up, because I want to help sick people. I know I'll have to study hard, but I think it's a very important job."),
    Q('pets', 2, 'Do you have any pets? Would you like one?', '你养宠物吗？想养吗？', ['pet', 'dog', 'cat', 'fish', 'bird', 'rabbit', 'have', 'would', 'like', 'want', 'look after', 'feed', 'cute', 'animal', 'parents'],
      "Yes, I have … / No, but I'd love to have … because …", ["I'd love to have …", 'look after', 'friendly and clever'],
      "No, I don't have any pets, but I'd love to have a dog. I think dogs are friendly and clever. Unfortunately, my mum says our flat is too small."),
    Q('withfriends', 2, 'What do you usually do with your friends?', '你通常和朋友一起做什么？', ['friends', 'play', 'talk', 'go', 'together', 'usually', 'often', 'game', 'shopping', 'football', 'chat', 'weekend', 'park'],
      'My friends and I usually … When … we …', ['hang out', 'at the weekend', 'chat', 'go to the park'],
      'My friends and I usually play football in the park at the weekend. When the weather is bad, we stay at home and play video games or just chat.'),
    Q('town', 2, 'Tell us about the town or city where you live.', '说说你住的城镇或城市。', ['city', 'town', 'live', 'big', 'small', 'people', 'park', 'famous', 'busy', 'quiet', 'there', 'shop', 'river', 'beautiful', 'north', 'south', 'building'],
      "I live in … It's a … city. There are … I like it because …", ['busy and modern', 'quiet', 'old buildings', 'There are lots of …'],
      "I live in Nanjing, which is a big city in the east of China. It's busy and modern, but there are also lots of old buildings and beautiful parks. I really like living there."),
    Q('day', 2, 'Which day of the week do you like best? Why?', '一周里你最喜欢星期几？为什么？', ['day', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'weekend', 'because', 'like', 'best', 'favourite'],
      'I like … best, because …', ["I don't have to …", 'get up early', 'meet my friends'],
      "I like Saturday best, because I don't have to get up early and I can do whatever I want. I usually sleep late and then meet my friends in the afternoon."),
    Q('helphome', 2, 'How do you help at home?', '你在家帮忙做什么家务？', ['help', 'clean', 'wash', 'cook', 'tidy', 'room', 'dishes', 'washing-up', 'rubbish', 'housework', 'bed', 'parents', 'sometimes', 'table', 'make'],
      'I help at home … I … every week and I usually …', ['tidy my room', 'do the washing-up', 'take out the rubbish', 'lay the table'],
      'I help at home quite a lot. I tidy my room every week and I usually do the washing-up after dinner. Sometimes I also help my mum cook at the weekend.'),
    Q('whyenglish', 2, 'Why are you learning English? Is it difficult?', '你为什么学英语？难吗？', ['english', 'learn', 'because', 'difficult', 'easy', 'important', 'useful', 'speak', 'future', 'travel', 'word', 'grammar', 'like'],
      "I'm learning English because … I think … is difficult, but …", ['useful for …', 'travel abroad', 'speaking is difficult', 'learn new words'],
      "I'm learning English because it's useful for travelling and for my future job. I think speaking is quite difficult, but I like learning new words."),
  ];

  /* ============================ Part 2 ============================ */
  const WEAR = ['wear', 'hair', 'glasses', 'shirt', 'dress', 'top', 'cap', 'hat', 'coat', 'jacket', 'red', 'blue', 'green', 'yellow', 'pink', 'white', 'orange', 'purple', 'brown', 'grey', 'tall', 'young', 'old', 'long', 'short', 'dark', 'beard', 'apron'];
  const FEEL = ['happy', 'smile', 'enjoy', 'fun', 'together', 'maybe', 'probably', 'perhaps', 'look', 'seem', 'think', 'guess', 'might', 'must', 'relax', 'excited', 'busy', 'tired'];
  const photos = [
    {
      id: 'p2-kitchen', pic: 'kitchen', shows: 'people cooking at home', zh: '一家人在厨房做饭',
      groups: [
        { n: '地点', kw: ['kitchen', 'home', 'house', 'indoors', 'inside'] },
        { n: '人物', kw: ['family', 'mother', 'mum', 'mom', 'father', 'dad', 'girl', 'daughter', 'parents', 'woman', 'man', 'people', 'child', 'three'] },
        { n: '动作', kw: ['cook', 'make', 'prepare', 'cut', 'chop', 'stir', 'help', 'hold', 'carry'] },
        { n: '物品', kw: ['pot', 'pan', 'vegetable', 'tomato', 'carrot', 'knife', 'salad', 'bowl', 'plate', 'fridge', 'cooker', 'window', 'clock', 'cupboard', 'food', 'dinner', 'lunch', 'meal', 'soup', 'plant'] },
        { n: '外貌衣着', kw: WEAR, generic: 1 }, { n: '感受推测', kw: FEEL, generic: 1 },
      ],
      words: ['stir 搅拌', 'chop / cut 切', 'a pot 锅', 'an apron 围裙', 'a bowl of salad 一碗沙拉', 'the fridge 冰箱'],
      sample: 'In this picture I can see a family in the kitchen. There are three people: a mother, a father and their daughter. The mother is on the left. She is wearing a pink top and a white apron, and she is stirring something in a big pot. In the middle, the father, who is wearing glasses, is cutting carrots and tomatoes. On the right, the girl is holding a bowl of salad. In the background there is a window, a clock and a fridge. They all look happy, so I think they are enjoying cooking dinner together.',
    },
    {
      id: 'p2-picnic', pic: 'picnic', shows: 'friends spending time outdoors', zh: '朋友们在公园野餐',
      groups: [
        { n: '地点', kw: ['park', 'outside', 'outdoors', 'countryside', 'grass', 'lake', 'garden'] },
        { n: '人物', kw: ['friends', 'people', 'four', 'boy', 'girl', 'teenager', 'group', 'man', 'woman', 'student'] },
        { n: '动作', kw: ['picnic', 'sit', 'play', 'eat', 'drink', 'sing', 'talk', 'laugh', 'relax', 'hold', 'listen', 'wave'] },
        { n: '物品', kw: ['guitar', 'blanket', 'basket', 'sandwich', 'fruit', 'apple', 'orange', 'banana', 'dog', 'kite', 'bike', 'bicycle', 'tree', 'juice', 'bottle', 'cloud', 'food', 'pond'] },
        { n: '天气', kw: ['sunny', 'sun', 'warm', 'weather', 'nice', 'fine', 'summer', 'spring', 'sky', 'hot'] },
        { n: '外貌衣着', kw: WEAR, generic: 1 }, { n: '感受推测', kw: FEEL, generic: 1 },
      ],
      words: ['have a picnic 野餐', 'a blanket 垫子', 'play the guitar 弹吉他', 'a basket 篮子', 'a kite 风筝', 'in the background 在背景里'],
      sample: "This picture shows four friends having a picnic in a park. They are sitting on a red and white blanket on the grass. The boy on the left is playing the guitar, and the girl next to him is eating a sandwich. Another girl is holding a drink, and the boy on the right is wearing a green cap. There is a basket, some fruit and a dog near them. In the background I can see trees, a small lake, a bike and a kite in the sky. It's a sunny day, and they look relaxed and happy. I think it's probably the weekend.",
    },
    {
      id: 'p2-classroom', pic: 'classroom', shows: 'people in a classroom', zh: '课堂上',
      groups: [
        { n: '地点', kw: ['classroom', 'school', 'class', 'lesson', 'indoors', 'inside'] },
        { n: '人物', kw: ['teacher', 'student', 'pupil', 'children', 'girl', 'boy', 'woman', 'three', 'classmate', 'people'] },
        { n: '动作', kw: ['teach', 'point', 'listen', 'write', 'raise', 'put up', 'ask', 'answer', 'sit', 'stand', 'learn', 'study', 'read', 'explain'] },
        { n: '物品', kw: ['board', 'whiteboard', 'desk', 'book', 'map', 'clock', 'window', 'bookshelf', 'shelf', 'pen', 'pencil', 'notebook', 'paper', 'tree', 'weekend', 'word'] },
        { n: '外貌衣着', kw: WEAR, generic: 1 }, { n: '感受推测', kw: FEEL.concat(['interested', 'english', 'question', 'know']), generic: 1 },
      ],
      words: ['point at the board 指着白板', 'put his hand up 举手', 'a desk 课桌', 'a bookshelf 书架', 'a map 地图', 'look interested 看起来感兴趣'],
      sample: "In this picture there is a teacher and three students in a classroom. The teacher is standing next to the whiteboard and pointing at it. She is wearing glasses and a green top. On the board I can see the words 'My weekend', so I think it's an English lesson. The students are sitting at their desks. The boy on the left is putting his hand up, maybe because he wants to answer a question. The girl in the middle has long brown hair. On the left there are a map and a bookshelf, and on the right there is a window. The students look interested in the lesson.",
    },
    {
      id: 'p2-market', pic: 'market', shows: 'people shopping for food', zh: '在水果蔬菜市场买东西',
      groups: [
        { n: '地点', kw: ['market', 'street', 'stall', 'shop', 'outside', 'outdoors', 'town', 'city'] },
        { n: '人物', kw: ['woman', 'mother', 'mum', 'boy', 'son', 'child', 'man', 'seller', 'shopkeeper', 'customer', 'farmer', 'people', 'kid'] },
        { n: '动作', kw: ['buy', 'sell', 'shop', 'point', 'pay', 'give', 'hold', 'carry', 'choose', 'stand', 'weigh', 'want', 'ask'] },
        { n: '物品', kw: ['fruit', 'vegetable', 'apple', 'orange', 'banana', 'watermelon', 'melon', 'basket', 'bag', 'money', 'box', 'scales', 'sign', 'building', 'house', 'tomato', 'lettuce', 'cabbage'] },
        { n: '外貌衣着', kw: WEAR, generic: 1 }, { n: '感受推测', kw: FEEL.concat(['fresh', 'healthy', 'hungry']), generic: 1 },
      ],
      words: ['a stall 摊位', 'sell / buy 卖 / 买', 'point at 指着', 'a watermelon 西瓜', 'a basket 篮子', 'a man with a beard 留胡子的男人'],
      sample: 'This picture shows a fruit and vegetable market in a town. On the right there is a stall with a red and white roof. A man with a grey beard is selling fruit. He is wearing a green shirt and an apron, and he is holding a bag of fruit. On the left, a woman with long hair is buying something. She is carrying a basket and giving the man some money. Next to her, a little boy in an orange T-shirt is pointing at a big watermelon. Maybe he wants his mum to buy it. I can also see apples, oranges and bananas. In the background there are some old houses. It looks like a nice sunny day.',
    },
    {
      id: 'p2-beach', pic: 'beach', shows: 'a family on holiday', zh: '一家人在海边',
      groups: [
        { n: '地点', kw: ['beach', 'sea', 'seaside', 'sand', 'coast', 'ocean', 'outside', 'holiday'] },
        { n: '人物', kw: ['family', 'mother', 'mum', 'father', 'dad', 'children', 'kids', 'boy', 'girl', 'parents', 'woman', 'man', 'four', 'people', 'brother', 'sister'] },
        { n: '动作', kw: ['build', 'make', 'play', 'read', 'sit', 'take', 'photo', 'relax', 'stand', 'kneel', 'dig', 'swim', 'sail', 'rest'] },
        { n: '物品', kw: ['sandcastle', 'castle', 'umbrella', 'camera', 'book', 'chair', 'ball', 'bucket', 'spade', 'boat', 'ship', 'bird', 'cloud', 'wave', 'flag', 'shell', 'water'] },
        { n: '天气', kw: ['sunny', 'hot', 'warm', 'weather', 'summer', 'sky', 'fine', 'sun'] },
        { n: '外貌衣着', kw: WEAR, generic: 1 }, { n: '感受推测', kw: FEEL.concat(['vacation']), generic: 1 },
      ],
      words: ['build a sandcastle 堆沙堡', 'an umbrella 遮阳伞', 'take a photo 拍照', 'a bucket 小桶', 'a boat 船', 'be on holiday 在度假'],
      sample: "In this picture I can see a family on the beach. It's a hot, sunny day and the sea is blue. In the middle, two children are building a big sandcastle. The girl is wearing a yellow T-shirt and the boy is wearing a blue cap. On the right, their father is sitting on a chair under a big red and white umbrella, and he is reading a book. On the left, their mother is standing and taking a photo of the children. There is also a beach ball, a bucket and a boat on the sea. I think they are on holiday and they are having a great time.",
    },
    {
      id: 'p2-busstop', pic: 'busstop', shows: 'people travelling in a city', zh: '下雨天在公交车站等车',
      groups: [
        { n: '地点', kw: ['bus stop', 'street', 'city', 'town', 'road', 'outside', 'station'] },
        { n: '人物', kw: ['woman', 'boy', 'man', 'people', 'three', 'passenger', 'student', 'grandfather', 'lady', 'child', 'teenager', 'driver'] },
        { n: '动作', kw: ['wait', 'stand', 'hold', 'carry', 'listen', 'arrive', 'come', 'go', 'use', 'play', 'catch', 'take', 'get on'] },
        { n: '物品', kw: ['bus', 'umbrella', 'bag', 'phone', 'mobile', 'headphones', 'backpack', 'schoolbag', 'building', 'sign', 'window', 'puddle', 'shelter', 'bench', 'light'] },
        { n: '天气', kw: ['rain', 'rainy', 'wet', 'weather', 'grey', 'cloudy', 'cold', 'bad', 'dark', 'storm'] },
        { n: '外貌衣着', kw: WEAR, generic: 1 }, { n: '感受推测', kw: FEEL.concat(['work', 'school', 'late', 'bored', 'home', 'morning', 'evening']), generic: 1 },
      ],
      words: ['wait for the bus 等公交车', 'hold an umbrella 打伞', "it's raining heavily 雨下得很大", 'headphones 耳机', 'a backpack 双肩包', 'arrive 到达'],
      sample: "This picture shows three people waiting at a bus stop in a city. It's raining heavily, so two of them are holding umbrellas. The woman on the left is wearing a yellow coat and carrying a brown bag. I think she is going to work. In the middle there is a boy with red headphones. He is looking at his phone and he has an orange backpack, so he is probably going to school. On the right, an old man is standing under a blue umbrella. A red bus is arriving on the left. In the background there are tall buildings, and some of the windows have lights on.",
    },
    {
      id: 'p2-birthday', pic: 'birthday', shows: 'people celebrating something', zh: '生日派对',
      groups: [
        { n: '地点', kw: ['party', 'home', 'house', 'room', 'indoors', 'inside', 'birthday'] },
        { n: '人物', kw: ['children', 'kids', 'girl', 'boy', 'friends', 'mother', 'mum', 'woman', 'four', 'five', 'people', 'family', 'daughter'] },
        { n: '动作', kw: ['celebrate', 'blow', 'sing', 'clap', 'take', 'photo', 'eat', 'drink', 'sit', 'stand', 'laugh', 'have', 'hold', 'give'] },
        { n: '物品', kw: ['cake', 'candle', 'balloon', 'present', 'gift', 'table', 'drink', 'juice', 'phone', 'flag', 'banner', 'box', 'cookie', 'biscuit', 'plate', 'straw', 'decoration', 'sign'] },
        { n: '外貌衣着', kw: WEAR, generic: 1 }, { n: '感受推测', kw: FEEL.concat(['wish', 'great']), generic: 1 },
      ],
      words: ['blow out the candles 吹蜡烛', 'a party hat 派对帽', 'balloons 气球', 'presents 礼物', 'clap 拍手', 'celebrate 庆祝'],
      sample: "This picture shows a birthday party at home. Four children are sitting behind a table with a pink tablecloth. They are all wearing party hats. In the middle there is a birthday cake with four candles, and the girl in the purple top is blowing them out, so I think it's her birthday. The other children are smiling and clapping. On the right, a woman, probably the girl's mother, is taking a photo with her phone. There are colourful balloons and a 'Happy Birthday' sign on the wall, and I can see some presents on the right. Everyone looks really happy and excited.",
    },
    {
      id: 'p2-bedroom', pic: 'bedroom', shows: 'someone at home in the evening', zh: '女孩在卧室写作业',
      groups: [
        { n: '地点', kw: ['bedroom', 'room', 'home', 'house', 'indoors', 'inside'] },
        { n: '人物', kw: ['girl', 'student', 'teenager', 'she', 'daughter', 'alone', 'child', 'young'] },
        { n: '动作', kw: ['study', 'homework', 'write', 'sit', 'read', 'use', 'work', 'learn', 'sleep', 'lie', 'type', 'revise'] },
        { n: '物品', kw: ['desk', 'laptop', 'computer', 'book', 'lamp', 'bed', 'cat', 'guitar', 'bag', 'backpack', 'schoolbag', 'window', 'poster', 'picture', 'clock', 'shelf', 'bookshelf', 'chair', 'carpet', 'rug', 'curtain', 'pillow', 'floor'] },
        { n: '时间', kw: ['evening', 'night', 'late', 'dark', 'sunset', 'moon', 'star', 'after school', 'tonight', 'afternoon'] },
        { n: '外貌衣着', kw: WEAR, generic: 1 }, { n: '感受推测', kw: FEEL.concat(['hard', 'exam', 'test', 'music', 'quiet', 'tidy', 'comfortable']), generic: 1 },
      ],
      words: ['do her homework 写作业', 'a laptop 笔记本电脑', 'a lamp 台灯', 'posters 海报', 'a bookshelf 书架', 'tidy 整洁'],
      sample: "In this picture a girl is doing her homework in her bedroom. She is sitting at a desk next to the window and writing something. On the desk there is a laptop, a lamp and some books. It's evening, because I can see the moon and the sky is getting dark. On the left there is a bed, and an orange cat is sleeping on it. There are some posters on the wall, and I can also see a guitar, a bookshelf and a green schoolbag on the floor. I think she likes music. Her room looks tidy and comfortable. Maybe she is studying for a test.",
    },
  ];

  /* ============================ Part 3 + Part 4 ============================ */
  const O = (e, w, zh, kw) => ({ e, w, zh, kw });
  const T = (say, sample, focus) => ({ say, sample, focus });
  const F = (id, q, zh, rel, frame, sample) => ({ id, q, zh, rel, frame, sample, target: 24, min: 7 });
  const tasks = [
    {
      id: 'p3-birthday', topic: '生日',
      situation: "A girl wants to do something special for her best friend's birthday. Here are some things she could do. Talk together about the different things she could do, and say which would be best.",
      zh: '一个女孩想为好朋友的生日做点特别的事。和搭档讨论这些选择，说说哪个最好。',
      options: [O('🎂', 'make a cake', '做蛋糕', ['cake', 'bake']), O('🎁', 'buy a present', '买礼物', ['present', 'gift', 'buy']), O('🎉', 'have a party', '办派对', ['party']), O('🎬', 'go to the cinema', '去看电影', ['cinema', 'film', 'movie']), O('🍕', 'go to a restaurant', '去餐厅', ['restaurant', 'pizza', 'meal', 'dinner', 'eat out']), O('📸', 'make a photo album', '做相册', ['photo', 'album', 'picture'])],
      turns: [
        T('Shall I start? I think making a cake is a lovely idea, because it shows that you really care. What do you think?', "Yes, I agree. A home-made cake is special, and it's cheaper than buying one. But it takes a lot of time. What about buying a present?", [0]),
        T("Mm, that's true. And how about having a party at home? Do you think her friend would like that?", "I think a party would be great fun, because all their friends could come. But maybe her parents wouldn't be happy about the noise!", [2]),
        T("I'm not so sure about going to the cinema, because you can't really talk to each other there. Do you agree?", "Yes, you're right. It isn't very special either, because they can go to the cinema any time. A photo album would be more personal, don't you think?", [3]),
        T('OK. So, which one do you think would be the best?', 'I think the party would be the best, because her friend can enjoy it with everyone. And she could make a cake for the party too. Do you agree?', []),
      ],
      part4: [
        F('p4-birthday-1', 'Do you like having big birthday parties? Why, or why not?', '你喜欢办大型生日派对吗？为什么？', ['party', 'birthday', 'like', 'prefer', 'friends', 'because', 'big', 'small', 'fun', 'family', 'enjoy', 'noisy', 'quiet'], 'Yes, I do, because … / Not really. I prefer … because …', 'Not really. I prefer small parties with my family and a few close friends, because I can talk to everyone. Big parties are usually too noisy for me.'),
        F('p4-birthday-2', "What's the best present you have ever received?", '你收到过的最好的礼物是什么？', ['present', 'gift', 'got', 'gave', 'given', 'received', 'best', 'birthday', 'bike', 'phone', 'book', 'parents', 'because', 'was'], "The best present I've ever received was … I got it from … I was … because …", "The best present I've ever received was a bike from my parents. I got it for my tenth birthday, and I was so excited because I had wanted one for a long time."),
        F('p4-birthday-3', 'Is it better to make a present yourself or to buy one? Why?', '礼物是自己做好还是买好？为什么？', ['make', 'buy', 'better', 'present', 'gift', 'because', 'special', 'money', 'time', 'cheap', 'expensive', 'think', 'personal', 'shop'], "I think it's better to … because … However, …", "I think it's better to make a present, because it shows that you spent time thinking about the person. However, if you aren't good at making things, buying something useful is fine too."),
        F('p4-birthday-4', 'How do people usually celebrate birthdays in your country?', '在你的国家人们通常怎么庆祝生日？', ['birthday', 'celebrate', 'cake', 'noodle', 'family', 'eat', 'party', 'people', 'usually', 'china', 'dinner', 'restaurant', 'sing', 'present', 'together'], 'In my country, people usually … We often … because …', 'In China, people usually have a special dinner with their family. We often eat long noodles, because they mean a long life. Young people also like having a cake and going out with friends.'),
      ],
    },
    {
      id: 'p3-trip', topic: '班级出游',
      situation: 'A class is going on a day trip at the end of term, and the students need to choose a place. Here are some places they could go. Talk together about the different places, and say which would be best.',
      zh: '班级期末要去一日游，需要选一个地方。和搭档讨论这些地方，说说哪个最好。',
      options: [O('🏛️', 'a museum', '博物馆', ['museum']), O('🏖️', 'the beach', '海滩', ['beach', 'sea', 'seaside']), O('🦁', 'the zoo', '动物园', ['zoo', 'animal']), O('🎢', 'a theme park', '主题乐园', ['theme park', 'amusement', 'park', 'ride']), O('⛰️', 'the mountains', '爬山', ['mountain', 'hill', 'hiking', 'walk', 'climb']), O('🚜', 'a farm', '农场', ['farm', 'countryside', 'farmer'])],
      turns: [
        T("Let's start with the museum. I think it would be interesting, because we could learn a lot there. What do you think?", "Hmm, I'm not sure. A museum is useful, but some students might find it boring. I think the zoo would be more fun, because everyone loves animals.", [0]),
        T('Good point. And what about the theme park? Would that be a good choice?', "Yes, I think the theme park would be really exciting, and all the students would enjoy it. But the tickets are quite expensive, so maybe it isn't the best idea.", [3]),
        T("I don't think the beach is a good idea, because the weather might be bad and it's far away. Do you agree?", "I agree with you. If it rains, there's nothing to do at the beach. Why don't we think about the mountains? We could go for a walk and have a picnic.", [1]),
        T('All right. So, which place shall we choose?', "I think we should choose the zoo, because it's fun and we can learn something as well. It's also not too expensive. Is that OK with you?", []),
      ],
      part4: [
        F('p4-trip-1', 'Do you enjoy going on school trips? Why?', '你喜欢学校组织的出游吗？为什么？', ['trip', 'school', 'enjoy', 'like', 'love', 'because', 'friends', 'learn', 'visit', 'fun', 'class', 'went', 'museum'], 'Yes, I love them, because … Last year we …', 'Yes, I love school trips, because we can learn outside the classroom and spend time with our friends. Last year we visited a science museum and it was great.'),
        F('p4-trip-2', 'Where did you go on your last trip?', '你上一次旅行去了哪里？', ['went', 'visited', 'trip', 'last', 'stayed', 'saw', 'family', 'days', 'was', 'ate', 'travelled', 'summer', 'holiday'], 'Last … I went to … with … We … It was …', 'Last summer I went to Qingdao with my family. We stayed there for four days. We swam in the sea and ate a lot of seafood. It was really relaxing.'),
        F('p4-trip-3', 'Is it better to travel with friends or with family? Why?', '和朋友旅行好还是和家人旅行好？为什么？', ['travel', 'friends', 'family', 'better', 'because', 'parents', 'think', 'fun', 'prefer', 'together', 'pay', 'plan', 'same'], "I think it's better to travel with … because … But …", "I think it's better to travel with friends, because we like doing the same things. But travelling with family is easier, because my parents plan everything and pay for it!"),
        F('p4-trip-4', 'What do you like to take with you when you travel?', '旅行时你喜欢带什么？', ['take', 'phone', 'camera', 'book', 'bag', 'clothes', 'snack', 'music', 'always', 'because', 'photo', 'travel', 'need', 'journey'], 'I always take … because … I also take …', 'I always take my phone, because I can take photos and listen to music. I also take a good book for the journey, and some snacks in case I get hungry.'),
      ],
    },
    {
      id: 'p3-rainy', topic: '下雨天的活动',
      situation: "A boy's cousin is visiting him this weekend, but it's going to rain all day. Here are some things they could do together. Talk together about the different activities, and say which would be the most fun.",
      zh: '一个男孩的表弟周末来玩，可是要下一整天雨。和搭档讨论这些活动，说说哪个最好玩。',
      options: [O('🎲', 'play board games', '玩桌游', ['board game', 'game', 'chess', 'card']), O('🎬', 'go to the cinema', '去看电影', ['cinema', 'film', 'movie']), O('🍪', 'bake biscuits', '烤饼干', ['bake', 'cook', 'biscuit', 'cookie', 'cake', 'kitchen']), O('🏊', 'go swimming', '去游泳', ['swim', 'pool']), O('🎮', 'play video games', '打电子游戏', ['video game', 'computer game', 'video', 'computer']), O('🛍️', 'go shopping', '去逛街', ['shop', 'shopping', 'mall', 'centre'])],
      turns: [
        T("Shall we start with board games? I think they're fun, and you don't have to go outside in the rain. What's your opinion?", 'I think board games are a good idea, because they can play together and talk at the same time. But they might get bored after an hour or two.', [0]),
        T("Yes, maybe. What about baking biscuits together? Do you think they'd enjoy that?", "That sounds fun! They could make something delicious and then eat it. But they'd need an adult to help them, and the kitchen would get really messy.", [2]),
        T("I don't think playing video games is a good idea, because they wouldn't really talk to each other. Do you agree?", "Well, I'm not sure I agree. Some video games are for two players, so they could play together. But I don't think they should play all day.", [4]),
        T('OK. So, which activity would be the most fun?', "In my opinion, going to the cinema would be the most fun, because they can watch a new film and it doesn't matter if it rains. What do you think?", []),
      ],
      part4: [
        F('p4-rainy-1', 'What do you like doing when the weather is bad?', '天气不好的时候你喜欢做什么？', ['weather', 'bad', 'rain', 'stay', 'home', 'read', 'watch', 'play', 'usually', 'film', 'friend', 'indoors', 'like', 'when'], 'When the weather is bad, I usually … Sometimes I …', 'When the weather is bad, I usually stay at home and read or watch a film. Sometimes I invite a friend to my flat, and we play cards or cook something together.'),
        F('p4-rainy-2', 'Do you prefer doing things indoors or outdoors? Why?', '你更喜欢室内活动还是户外活动？为什么？', ['indoor', 'outdoor', 'prefer', 'outside', 'inside', 'because', 'fresh', 'air', 'sport', 'weather', 'home', 'park', 'like'], 'I prefer … activities, because … At the weekend I like …', 'I prefer outdoor activities, because I sit in a classroom all week. At the weekend I like cycling or playing football in the fresh air. It makes me feel more relaxed.'),
        F('p4-rainy-3', 'How much time do you spend playing video games?', '你花多少时间打电子游戏？', ['game', 'play', 'hour', 'time', 'weekend', 'day', 'homework', 'parents', 'much', 'because', 'only', 'often', 'never', 'spend'], 'I play for about … because … My parents think …', 'Not very much. I only play for about an hour at the weekend, because I have a lot of homework. My parents think too many video games are bad for my eyes.'),
        F('p4-rainy-4', 'Do you often spend time with your cousins or other relatives?', '你经常和表亲或其他亲戚在一起吗？', ['cousin', 'relative', 'family', 'often', 'see', 'visit', 'grand', 'aunt', 'uncle', 'weekend', 'together', 'festival', 'live', 'sometimes'], 'Yes, quite often. / Not very often. My … lives … We usually …', 'Yes, quite often. My cousin lives near us, so we see each other almost every weekend. We usually play basketball together, and at Spring Festival the whole family has dinner together.'),
      ],
    },
    {
      id: 'p3-healthy', topic: '健康生活',
      situation: 'A boy wants to become fitter and healthier. Here are some things he could do. Talk together about the different things he could do, and say which would be best for him.',
      zh: '一个男孩想变得更健康。和搭档讨论他可以做的这些事，说说哪个最适合他。',
      options: [O('🏊', 'go swimming', '去游泳', ['swim', 'pool']), O('🚴', 'cycle to school', '骑车上学', ['cycle', 'bike', 'bicycle', 'ride']), O('🥗', 'eat more fruit and vegetables', '多吃蔬果', ['fruit', 'vegetable', 'salad', 'eat', 'food', 'diet']), O('😴', 'go to bed earlier', '早点睡', ['sleep', 'bed', 'early', 'earlier', 'rest']), O('⚽', 'join a football team', '加入足球队', ['football', 'team', 'sport', 'soccer']), O('📵', 'use his phone less', '少玩手机', ['phone', 'screen', 'mobile', 'less'])],
      turns: [
        T("I'll start. I think swimming is a great way to get fit, because it's good for your whole body. What do you think?", "I agree that swimming is very healthy. But he would need to go to a swimming pool, and that can be expensive. Cycling to school is free, so maybe that's better.", [0]),
        T("That's a good point. And what about eating more fruit and vegetables? Is that important?", "Yes, I think it's really important, because you can't be healthy if you eat junk food every day. It's also easy to do. He could have fruit instead of sweets.", [2]),
        T("I don't think using his phone less would make him much fitter. What do you think?", "I'm not sure. If he uses his phone less, he'll have more time to do sport and he'll probably sleep better too. So I think it would help a little.", [5]),
        T('Right. So, which one would be the best for him?', "I think joining a football team would be the best, because he'd exercise every week and make new friends too. It's more fun than exercising alone. Do you agree?", []),
      ],
      part4: [
        F('p4-healthy-1', 'What do you do to stay healthy?', '你平时怎么保持健康？', ['healthy', 'exercise', 'sport', 'eat', 'sleep', 'walk', 'run', 'play', 'every', 'try', 'fruit', 'vegetable', 'sweets', 'water', 'week'], 'I try to … every day. For example, … I also …', 'I try to do some exercise every day. For example, I walk to school and I play badminton twice a week. I also try not to eat too many sweets.'),
        F('p4-healthy-2', 'Do you think young people do enough exercise these days?', '你觉得现在的年轻人运动量够吗？', ['think', 'young', 'people', 'exercise', 'enough', 'sport', 'phone', 'homework', 'time', 'because', 'school', 'should', 'many', 'computer'], "No, I don't think so, because … I think schools should …", "No, I don't think so. Many young people spend hours on their phones or doing homework, so they don't have time for sport. I think schools should have more PE lessons."),
        F('p4-healthy-3', 'Which is more important: eating well or doing sport? Why?', '吃得健康和做运动哪个更重要？为什么？', ['important', 'eat', 'sport', 'food', 'exercise', 'both', 'because', 'think', 'healthy', 'more', 'if', 'body', 'better'], 'I think … is more important, because … However, …', "I think both are important, but eating well is more important. If you eat a lot of fast food, sport won't help much. However, the best thing is to do both."),
        F('p4-healthy-4', 'Is there a sport you would like to try in the future?', '将来有没有想尝试的运动？', ['sport', 'try', 'would', 'like', 'never', 'want', 'because', 'ski', 'swim', 'tennis', 'exciting', 'future', 'learn', 'looks'], "Yes, I'd really like to try … I've never done it, because … It looks …", "Yes, I'd really like to try skiing. I've never done it, because there isn't much snow where I live. It looks exciting, although I think it might be a bit dangerous."),
      ],
    },
    {
      id: 'p3-club', topic: '课后社团',
      situation: 'A school wants to start a new after-school club for its students. Here are some ideas for the club. Talk together about the different clubs, and say which one the school should start.',
      zh: '学校想开一个新的课后社团。和搭档讨论这些想法，说说学校应该开哪一个。',
      options: [O('🎭', 'a drama club', '戏剧社', ['drama', 'act', 'theatre', 'play']), O('🍳', 'a cooking club', '烹饪社', ['cook', 'cooking', 'food']), O('🤖', 'a robot club', '机器人社', ['robot', 'computer', 'technology', 'coding', 'programming']), O('🎨', 'an art club', '美术社', ['art', 'paint', 'draw']), O('📷', 'a photography club', '摄影社', ['photo', 'photography', 'camera', 'picture']), O('🌱', 'a gardening club', '园艺社', ['garden', 'gardening', 'plant', 'grow', 'flower'])],
      turns: [
        T("OK, let's begin. I think a drama club would be great, because acting helps you feel more confident. What do you think?", "I think it's a good idea for some students, but shy people might not want to join. A cooking club might be more popular, because everybody likes eating!", [0]),
        T("Ha, that's true. What about a robot club? Do you think students would be interested?", 'Yes, definitely. Technology is really important nowadays, so a robot club would be useful for the future. But the school would need to buy expensive equipment.', [2]),
        T("I'm not sure a gardening club is a good idea, because students might think it's boring. Do you agree?", "I don't really agree. Growing plants is relaxing, and it's good to spend time outside after sitting in class all day. But maybe it's better for younger children.", [5]),
        T('OK. So, which club should the school start?', "I think the school should start a cooking club, because cooking is a useful skill and it's fun as well. Everyone could take their food home. What's your opinion?", []),
      ],
      part4: [
        F('p4-club-1', 'Are you in any clubs at school or outside school?', '你参加了校内或校外的社团吗？', ['club', 'join', 'member', 'school', 'team', 'every', 'meet', 'play', 'after', 'because', 'chess', 'music', 'sport', 'class', 'lesson'], "Yes, I'm in the … club. We meet … I joined it because …", "Yes, I'm in the school chess club. We meet every Wednesday after lessons. I joined it last year because my best friend is a member, and now I really enjoy it."),
        F('p4-club-2', 'What new skill would you like to learn?', '你想学什么新技能？', ['learn', 'would', 'like', 'skill', 'play', 'guitar', 'cook', 'swim', 'drive', 'because', 'want', 'how', 'language', 'difficult', 'fun'], "I'd like to learn how to … because … I think it would be …", "I'd like to learn how to play the guitar, because I love music and I want to play my favourite songs. I think it would be difficult at first, but really fun."),
        F('p4-club-3', 'Is it better to learn something in a group or on your own? Why?', '学东西是和大家一起好还是自己学好？为什么？', ['group', 'own', 'alone', 'learn', 'better', 'because', 'help', 'together', 'think', 'friends', 'study', 'prefer', 'fun', 'each other'], "I think it's better to learn …, because … But when …, I prefer …", "I think it's better to learn in a group, because you can help each other and it's more fun. But when I need to remember something, I prefer studying on my own."),
        F('p4-club-4', 'Do you think students have enough free time?', '你觉得学生的空闲时间够吗？', ['student', 'free', 'time', 'enough', 'homework', 'think', 'because', 'school', 'class', 'hobby', 'should', 'busy', 'lot', 'weekend'], "No, I don't think so. Students have … so … I think we should …", "No, I don't think so. In my country students have a lot of homework and extra classes, so there isn't much time for hobbies. I think we should have at least one free afternoon."),
      ],
    },
    {
      id: 'p3-camping', topic: '露营',
      situation: 'Two friends are going camping in the mountains for the weekend. Here are some things they could take with them. Talk together about the different things, and say which would be the most useful.',
      zh: '两个朋友周末要去山里露营。和搭档讨论他们可以带的这些东西，说说哪个最有用。',
      options: [O('🔦', 'a torch', '手电筒', ['torch', 'light', 'flashlight']), O('🗺️', 'a map', '地图', ['map']), O('📷', 'a camera', '相机', ['camera', 'photo', 'picture']), O('🎸', 'a guitar', '吉他', ['guitar', 'music', 'sing']), O('🧥', 'a warm jacket', '厚外套', ['jacket', 'coat', 'warm', 'clothes']), O('🍫', 'some snacks', '零食', ['snack', 'food', 'chocolate', 'eat', 'hungry'])],
      turns: [
        T("Shall I go first? I think a torch is really important, because it's very dark in the mountains at night. What do you think?", "I agree. Without a torch they can't see anything at night, and that could be dangerous. A warm jacket is important too, because it gets cold in the mountains.", [0]),
        T("Yes, you're right. What about a map? Do they really need one?", 'Well, most people use their phones now, but there might not be any signal in the mountains. So I think a map is a good idea, just in case they get lost.', [1]),
        T("I don't think they should take a guitar, because it's heavy and difficult to carry. Do you agree?", 'Yes, I agree with you. It would be nice to sing songs in the evening, but they have to carry everything on their backs. A camera is much lighter.', [3]),
        T('OK. So, which thing would be the most useful?', "I think the torch would be the most useful, because they'll need it every night. The jacket is also important, but they can't do anything in the dark. Do you agree?", []),
      ],
      part4: [
        F('p4-camping-1', 'Have you ever been camping? Would you like to go?', '你露营过吗？想去吗？', ['camping', 'camp', 'tent', 'never', 'been', 'would', 'like', 'love', 'try', 'sleep', 'star', 'friends', 'family', 'went', 'because'], "No, I've never … but I'd love to … I think it would be …", "No, I've never been camping, but I'd love to try it. I think it would be exciting to sleep in a tent and look at the stars. I'd like to go with my friends."),
        F('p4-camping-2', 'Do you prefer spending holidays in the city or in the countryside? Why?', '你更喜欢在城市还是乡下度假？为什么？', ['city', 'countryside', 'prefer', 'holiday', 'because', 'quiet', 'air', 'clean', 'mountain', 'river', 'shop', 'busy', 'nature', 'live', 'like'], 'I prefer … because … I live in … so …', 'I prefer the countryside, because the air is cleaner and it is much quieter than the city. I live in a big city, so I like to see mountains and rivers on holiday.'),
        F('p4-camping-3', 'What do you like doing outdoors?', '你喜欢在户外做什么？', ['outdoor', 'outside', 'like', 'enjoy', 'cycle', 'bike', 'walk', 'run', 'play', 'park', 'football', 'kite', 'river', 'weather', 'when'], 'I like … especially when … I also enjoy …', 'I like cycling along the river near my home, especially in spring when the weather is warm. I also enjoy flying kites with my little brother in the park.'),
        F('p4-camping-4', 'Is it good for young people to spend time in nature? Why?', '年轻人多接触大自然好吗？为什么？', ['nature', 'good', 'young', 'people', 'because', 'screen', 'phone', 'relax', 'learn', 'animal', 'plant', 'healthy', 'outside', 'think', 'fresh'], "Yes, I think it's very good, because … They can also …", 'Yes, I think it is very good for them. Young people spend too much time looking at screens, so being in nature helps them relax. They can also learn about plants and animals.'),
      ],
    },
  ];

  EG.SpeakData = { partner: 'Mia', part1, photos, tasks };
})();
